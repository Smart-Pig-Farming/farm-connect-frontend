import { useState } from "react";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  Search,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Mail,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useToggleUserLockMutation,
  useResendUserCredentialsMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  type User,
} from "../../store/api/userApi";
import { useGetRolesQuery } from "../../store/api/rolesApi";
import { UserFormModal } from "./UserFormModal";
import { ConfirmationModal } from "./ConfirmationModal";

type FilterStatus = "all" | "active" | "locked" | "unverified";
type FilterRole = string; // Make this dynamic instead of hardcoded

export function UsersTabContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterRole, setFilterRole] = useState<FilterRole>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [userModal, setUserModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    user?: User | null;
  }>({
    isOpen: false,
    mode: "create",
    user: null,
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null,
  });

  // API queries and mutations
  const { data, isLoading, error } = useGetUsersQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    status: filterStatus,
    role: filterRole !== "all" ? filterRole : undefined,
  });
  const users = data?.data || [];
  const pagination = data?.pagination;

  const { data: rolesData } = useGetRolesQuery();
  const availableRoles = rolesData || [];
  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();
  const [toggleUserLock] = useToggleUserLockMutation();
  const [resendUserCredentials, { isLoading: isResendingCredentials }] =
    useResendUserCredentialsMutation();
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (status: FilterStatus) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (role: FilterRole) => {
    setFilterRole(role);
    setCurrentPage(1);
  };

  // Since we're using server-side filtering, no need for client-side filtering
  const paginatedUsers = users;
  const totalPages = pagination?.totalPages || 0;

  const getStatusBadge = (user: User) => {
    if (!user.is_verified) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
          Unverified
        </span>
      );
    }
    if (user.is_locked) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
          Locked
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
        Active
      </span>
    );
  };

  // Modal handlers
  const handleCreateUser = () => {
    setUserModal({
      isOpen: true,
      mode: "create",
      user: null,
    });
  };

  const handleEditUser = (user: User) => {
    setUserModal({
      isOpen: true,
      mode: "edit",
      user: user,
    });
  };

  const handleDeleteUser = (user: User) => {
    setDeleteModal({
      isOpen: true,
      user: user,
    });
  };

  const handleLockUnlockUser = async (user: User) => {
    try {
      const result = await toggleUserLock(user.id).unwrap();
      // The API returns the updated user data
      const updatedUser = result.data;
      const action = updatedUser.is_locked ? "locked" : "unlocked";
      toast.success(`User ${action}`, {
        description: `User "${user.firstname} ${user.lastname}" has been ${action}.`,
      });
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { error?: string } }).data?.error
          : "An unexpected error occurred.";
      toast.error("Failed to update user", {
        description: errorMessage,
      });
    }
  };

  const handleResendEmail = async (user: User) => {
    try {
      await resendUserCredentials(user.id).unwrap();
      toast.success("Credentials resent successfully", {
        description: `New login credentials have been sent to ${user.email}.`,
      });
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { error?: string } }).data?.error
          : "An unexpected error occurred.";
      toast.error("Failed to resend credentials", {
        description: errorMessage,
      });
    }
  };

  // Modal submit handler
  const handleUserSubmit = async (data: {
    firstname: string;
    lastname: string;
    email: string;
    password?: string;
    confirmPassword?: string;
    farmName: string;
    province: string;
    district: string;
    sector: string;
    role: string;
  }) => {
    try {
      if (userModal.mode === "create") {
        // Map role name to role_id (based on database roles)
        const roleIdMap: { [key: string]: number } = {
          farmer: 1,
          admin: 2,
          vet: 3,
          govt: 4,
        };

        const createUserData = {
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          username: data.email.split("@")[0], // Generate username from email
          organization: data.farmName,
          province: data.province,
          district: data.district,
          sector: data.sector,
          role_id: roleIdMap[data.role] || 1, // Default to farmer
        };

        const result = await createUser(createUserData).unwrap();

        // Check if email was sent (based on backend response)
        const emailStatus = result.warning
          ? "Credentials need to be sent manually"
          : "credentials sent via email";

        toast.success("User created successfully", {
          description: `User "${data.firstname} ${data.lastname}" has been created and ${emailStatus}.`,
        });

        // Show warning if email failed
        if (result.warning) {
          toast.warning("Email delivery failed", {
            description: result.warning,
          });
        }
      } else if (userModal.mode === "edit" && userModal.user) {
        // Map role name to role_id for edit mode
        const roleIdMap: { [key: string]: number } = {
          farmer: 1,
          admin: 2,
          vet: 3,
          govt: 4,
        };

        const updateUserData = {
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          username: data.email.split("@")[0], // Generate username from email
          organization: data.farmName,
          province: data.province,
          district: data.district,
          sector: data.sector,
          role_id: roleIdMap[data.role] || 1, // Default to farmer
        };

        await updateUser({
          id: userModal.user.id,
          data: updateUserData,
        }).unwrap();

        toast.success("User updated successfully", {
          description: `User "${data.firstname} ${data.lastname}" has been updated.`,
        });
      }

      setUserModal({ isOpen: false, mode: "create", user: null });
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { error?: string } }).data?.error
          : "An unexpected error occurred.";
      toast.error(`Failed to ${userModal.mode} user`, {
        description: errorMessage,
      });
    }
  };
  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return;

    try {
      await deleteUser(deleteModal.user.id).unwrap();
      toast.success("User deleted", {
        description: `User "${deleteModal.user.firstname} ${deleteModal.user.lastname}" has been deleted.`,
      });
      setDeleteModal({ isOpen: false, user: null });
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: { error?: string } }).data?.error
          : "An unexpected error occurred.";
      toast.error("Failed to delete user", {
        description: errorMessage,
      });
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="p-6 w-full min-w-0">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p className="text-gray-600">Loading users...</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-12 w-12 text-orange-500" />
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    const errorMsg =
      (error as { data?: { error?: string } })?.data?.error ||
      "Failed to load users";

    return (
      <div className="p-6 w-full min-w-0">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p className="text-gray-600">Error loading users</p>
        </div>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{errorMsg}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-3 sm:p-6 w-full min-w-0">
        {/* Users Header Actions */}
        <div className="flex flex-col gap-4 mb-6 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            <div>
              <h2 className="text-xl font-semibold">User Management</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage system users and their permissions
              </p>
            </div>
            <button
              onClick={handleCreateUser}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center text-sm"
            >
              <UserPlus className="w-4 h-4 flex-shrink-0" />
              <span>Create User</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full text-sm"
                style={{ outline: "none" }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) =>
                handleFilterChange(e.target.value as FilterStatus)
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full sm:w-auto text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="locked">Locked</option>
              <option value="unverified">Unverified</option>
            </select>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) =>
                handleRoleFilterChange(e.target.value as FilterRole)
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full sm:w-auto text-sm"
            >
              <option value="all">All Roles</option>
              {availableRoles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Users Table - Desktop */}
        <div className="hidden xl:block overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.firstname} {user.lastname}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-900 truncate block">
                          {user.role?.name || "No Role"}
                        </span>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(user)}</td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-500 truncate block">
                          {user.organization || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-500 truncate block">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {!user.is_verified && (
                            <button
                              className={`p-1 rounded hover:bg-blue-50 ${
                                isResendingCredentials
                                  ? "text-blue-400 cursor-not-allowed"
                                  : "text-blue-600 hover:text-blue-900 hover:cursor-pointer"
                              }`}
                              title="Resend Verification Email"
                              onClick={() => handleResendEmail(user)}
                              disabled={isResendingCredentials}
                            >
                              {isResendingCredentials ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Mail className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {user.role?.name !== "admin" && (
                            <button
                              className={`hover:cursor-pointer p-1 rounded ${
                                user.is_locked
                                  ? "text-green-600 hover:text-green-900 hover:bg-green-50"
                                  : "text-red-600 hover:text-red-900 hover:bg-red-50"
                              }`}
                              title={
                                user.is_locked ? "Unlock User" : "Lock User"
                              }
                              onClick={() => handleLockUnlockUser(user)}
                            >
                              {user.is_locked ? (
                                <Unlock className="w-4 h-4" />
                              ) : (
                                <Lock className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            className="text-gray-600 hover:text-gray-900 hover:cursor-pointer p-1 rounded hover:bg-gray-50"
                            title="Edit User"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {user.role?.name !== "admin" && (
                            <button
                              className={`p-1 rounded hover:bg-red-50 ${
                                isDeletingUser
                                  ? "text-red-400 cursor-not-allowed"
                                  : "text-red-600 hover:text-red-900 hover:cursor-pointer"
                              }`}
                              title="Delete User"
                              onClick={() => handleDeleteUser(user)}
                              disabled={isDeletingUser}
                            >
                              {isDeletingUser ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No users found</p>
                        <p className="text-sm">
                          {searchTerm || filterStatus !== "all"
                            ? "Try adjusting your search or filter criteria."
                            : "Get started by creating your first user."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Table - Tablet */}
        <div className="hidden md:block xl:hidden overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.firstname} {user.lastname}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 truncate">
                            {user.role?.name || "No Role"} • Created{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(user)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {!user.is_verified && (
                            <button
                              className={`p-2 rounded-lg hover:bg-blue-50 ${
                                isResendingCredentials
                                  ? "text-blue-400 cursor-not-allowed"
                                  : "text-blue-600 hover:text-blue-900 hover:cursor-pointer"
                              }`}
                              title="Resend Verification Email"
                              onClick={() => handleResendEmail(user)}
                              disabled={isResendingCredentials}
                            >
                              {isResendingCredentials ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Mail className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {user.role?.name !== "admin" && (
                            <button
                              className={`hover:cursor-pointer p-2 rounded-lg ${
                                user.is_locked
                                  ? "text-green-600 hover:text-green-900 hover:bg-green-50"
                                  : "text-red-600 hover:text-red-900 hover:bg-red-50"
                              }`}
                              title={
                                user.is_locked ? "Unlock User" : "Lock User"
                              }
                              onClick={() => handleLockUnlockUser(user)}
                            >
                              {user.is_locked ? (
                                <Unlock className="w-4 h-4" />
                              ) : (
                                <Lock className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            className="text-gray-600 hover:text-gray-900 hover:cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                            title="Edit User"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {user.role?.name !== "admin" && (
                            <button
                              className={`p-2 rounded-lg hover:bg-red-50 ${
                                isDeletingUser
                                  ? "text-red-400 cursor-not-allowed"
                                  : "text-red-600 hover:text-red-900 hover:cursor-pointer"
                              }`}
                              title="Delete User"
                              onClick={() => handleDeleteUser(user)}
                              disabled={isDeletingUser}
                            >
                              {isDeletingUser ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No users found</p>
                        <p className="text-sm">
                          {searchTerm || filterStatus !== "all"
                            ? "Try adjusting your search or filter criteria."
                            : "Get started by creating your first user."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Cards - Mobile */}
        <div className="md:hidden space-y-4 w-full">
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm w-full min-w-0"
              >
                <div className="flex justify-between items-start mb-3 w-full">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="text-sm font-medium text-gray-900 break-words w-full">
                      {user.firstname} {user.lastname}
                    </h3>
                    <p className="text-sm text-gray-500 break-all w-full">
                      {user.email}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 break-words w-full">
                      {user.role?.name || "No Role"}
                    </p>
                  </div>
                  <div className="flex-shrink-0">{getStatusBadge(user)}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4 w-full">
                  <div className="min-w-0 w-full">
                    <span className="text-gray-500 text-xs">Organization:</span>
                    <div className="text-gray-900 break-words">
                      {user.organization || "N/A"}
                    </div>
                  </div>
                  <div className="min-w-0 w-full">
                    <span className="text-gray-500 text-xs">Created:</span>
                    <div className="text-gray-900 break-words">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2 pt-3 border-t border-gray-100 w-full">
                  {!user.is_verified && (
                    <button
                      className={`border px-3 py-1 rounded text-sm flex items-center gap-1 ${
                        isResendingCredentials
                          ? "text-blue-400 border-blue-400 cursor-not-allowed"
                          : "text-blue-600 border-blue-600 hover:bg-blue-50"
                      }`}
                      onClick={() => handleResendEmail(user)}
                      disabled={isResendingCredentials}
                    >
                      {isResendingCredentials ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-3 h-3" />
                          Resend Email
                        </>
                      )}
                    </button>
                  )}
                  {user.role?.name !== "admin" && (
                    <button
                      className={`border px-3 py-1 rounded text-sm flex items-center gap-1 ${
                        user.is_locked
                          ? "text-green-600 border-green-600 hover:bg-green-50"
                          : "text-red-600 border-red-600 hover:bg-red-50"
                      }`}
                      onClick={() => handleLockUnlockUser(user)}
                    >
                      {user.is_locked ? (
                        <>
                          <Unlock className="w-3 h-3" />
                          Unlock
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          Lock
                        </>
                      )}
                    </button>
                  )}
                  <button
                    className="text-orange-600 border border-orange-600 px-3 py-1 rounded text-sm hover:bg-orange-50 flex items-center gap-1"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  {user.role?.name !== "admin" && (
                    <button
                      className={`border px-3 py-1 rounded text-sm flex items-center gap-1 ${
                        isDeletingUser
                          ? "text-red-400 border-red-400 cursor-not-allowed"
                          : "text-red-600 border-red-600 hover:bg-red-50"
                      }`}
                      onClick={() => handleDeleteUser(user)}
                      disabled={isDeletingUser}
                    >
                      {isDeletingUser ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 w-full">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm text-gray-500">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first user."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.totalCount > 0 && (
          <div className="flex flex-col gap-4 mt-6 w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, pagination.totalCount)} of{" "}
                {pagination.totalCount} users
              </div>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={!pagination?.hasPreviousPage}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, index, pages) => (
                      <div key={page} className="flex items-center gap-1">
                        {index > 0 && pages[index - 1] !== page - 1 && (
                          <span className="text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm border rounded-lg ${
                            currentPage === page
                              ? "bg-orange-600 text-white border-orange-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={!pagination?.hasNextPage}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Form Modal */}
      {userModal.isOpen && (
        <UserFormModal
          isOpen={userModal.isOpen}
          onClose={() =>
            setUserModal({ isOpen: false, mode: "create", user: null })
          }
          onSubmit={handleUserSubmit}
          user={userModal.user}
          mode={userModal.mode}
          isLoading={
            userModal.mode === "create" ? isCreatingUser : isUpdatingUser
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.user && (
        <ConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, user: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete User"
          message={`Are you sure you want to delete "${deleteModal.user.firstname} ${deleteModal.user.lastname}"? This action cannot be undone.`}
          confirmText="Delete"
        />
      )}
    </>
  );
}
