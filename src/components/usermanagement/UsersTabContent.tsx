import { useState } from "react";
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
} from "lucide-react";

// Types
interface User {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  isVerified: boolean;
  isLocked: boolean;
  lastLogin: string | null;
  createdAt: string;
}

type FilterStatus = "all" | "active" | "locked" | "unverified";
type FilterRole =
  | "all"
  | "Administrator"
  | "Veterinarian"
  | "Government Official"
  | "Farmer";

interface UsersTabContentProps {
  users: User[];
  onCreateUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onLockUnlockUser: (user: User) => void;
  onResendEmail: (user: User) => void;
}

export function UsersTabContent({
  users,
  onCreateUser,
  onEditUser,
  onDeleteUser,
  onLockUnlockUser,
  onResendEmail,
}: UsersTabContentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterRole, setFilterRole] = useState<FilterRole>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Filter users based on search term, status, and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.isVerified && !user.isLocked) ||
      (filterStatus === "locked" && user.isLocked) ||
      (filterStatus === "unverified" && !user.isVerified);

    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const getStatusBadge = (user: User) => {
    if (!user.isVerified) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
          Unverified
        </span>
      );
    }
    if (user.isLocked) {
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

  return (
    <div className="p-3 sm:p-6 w-full min-w-0">
      {/* Users Header Actions */}
      <div className="flex flex-col gap-4 mb-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full text-sm break-words"
              />
            </div>

            {/* Filter */}
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
              <option value="Administrator">Administrator</option>
              <option value="Veterinarian">Veterinarian</option>
              <option value="Government Official">Government Official</option>
              <option value="Farmer">Farmer</option>
            </select>
          </div>

          <button
            onClick={onCreateUser}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center text-sm break-words"
          >
            <UserPlus className="w-4 h-4 flex-shrink-0" />
            <span className="break-words">Create User</span>
          </button>
        </div>
      </div>

      {/* Users Table - Desktop */}
      <div className="hidden xl:block overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0 w-1/4 break-words">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0 w-1/6 break-words">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0 w-1/8 break-words">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0 w-1/6 break-words">
                  Last Login
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0 w-1/6 break-words">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0 w-1/6 break-words">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 min-w-0 w-1/4">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate break-words">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate break-all">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 min-w-0 w-1/6">
                      <span className="text-sm text-gray-900 truncate block break-words">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 min-w-0 w-1/8">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-4 py-4 min-w-0 w-1/6">
                      <span className="text-sm text-gray-500 truncate block break-words">
                        {user.lastLogin || "Never"}
                      </span>
                    </td>
                    <td className="px-4 py-4 min-w-0 w-1/6">
                      <span className="text-sm text-gray-500 truncate block break-words">
                        {user.createdAt}
                      </span>
                    </td>
                    <td className="px-4 py-4 min-w-0 w-1/6">
                      <div className="flex items-center justify-end gap-1">
                        {!user.isVerified && (
                          <button
                            className="text-blue-600 hover:text-blue-900 hover:cursor-pointer p-1 rounded hover:bg-blue-50"
                            title="Resend Verification Email"
                            onClick={() => onResendEmail(user)}
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          className={`hover:cursor-pointer p-1 rounded ${
                            user.isLocked
                              ? "text-green-600 hover:text-green-900 hover:bg-green-50"
                              : "text-red-600 hover:text-red-900 hover:bg-red-50"
                          }`}
                          title={user.isLocked ? "Unlock User" : "Lock User"}
                          onClick={() => onLockUnlockUser(user)}
                        >
                          {user.isLocked ? (
                            <Unlock className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 hover:cursor-pointer p-1 rounded hover:bg-gray-50"
                          title="Edit User"
                          onClick={() => onEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 hover:cursor-pointer p-1 rounded hover:bg-red-50"
                          title="Delete User"
                          onClick={() => onDeleteUser(user)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                      <p className="text-sm break-words">
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

      {/* Users Table - Tablet (Simplified) */}
      <div className="hidden md:block xl:hidden overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0 w-1/2 break-words">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0 w-1/4 break-words">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0 w-1/4 break-words">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 min-w-0 w-1/2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 truncate">
                          {user.role} • Created {user.createdAt}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 min-w-0 w-1/4">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-4 py-4 min-w-0 w-1/4">
                      <div className="flex items-center justify-end gap-1">
                        {!user.isVerified && (
                          <button
                            className="text-blue-600 hover:text-blue-900 hover:cursor-pointer p-2 rounded-lg hover:bg-blue-50"
                            title="Resend Verification Email"
                            onClick={() => onResendEmail(user)}
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          className={`hover:cursor-pointer p-2 rounded-lg ${
                            user.isLocked
                              ? "text-green-600 hover:text-green-900 hover:bg-green-50"
                              : "text-red-600 hover:text-red-900 hover:bg-red-50"
                          }`}
                          title={user.isLocked ? "Unlock User" : "Lock User"}
                          onClick={() => onLockUnlockUser(user)}
                        >
                          {user.isLocked ? (
                            <Unlock className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 hover:cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                          title="Edit User"
                          onClick={() => onEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 hover:cursor-pointer p-2 rounded-lg hover:bg-red-50"
                          title="Delete User"
                          onClick={() => onDeleteUser(user)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-500 break-all w-full">
                    {user.email}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 break-words w-full">
                    {user.role}
                  </p>
                </div>
                <div className="flex-shrink-0">{getStatusBadge(user)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4 w-full">
                <div className="min-w-0 w-full">
                  <span className="text-gray-500 text-xs break-words">
                    Last Login:
                  </span>
                  <p className="text-gray-900 break-words w-full">
                    {user.lastLogin || "Never"}
                  </p>
                </div>
                <div className="min-w-0 w-full">
                  <span className="text-gray-500 text-xs break-words">
                    Created:
                  </span>
                  <p className="text-gray-900 break-words w-full">
                    {user.createdAt}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2 pt-3 border-t border-gray-100 w-full">
                {!user.isVerified && (
                  <button
                    className="text-blue-600 hover:text-blue-900 hover:cursor-pointer p-2 rounded-lg hover:bg-blue-50"
                    title="Resend Verification Email"
                    onClick={() => onResendEmail(user)}
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                )}
                <button
                  className={`hover:cursor-pointer p-2 rounded-lg flex-shrink-0 ${
                    user.isLocked
                      ? "text-green-600 hover:text-green-900 hover:bg-green-50"
                      : "text-red-600 hover:text-red-900 hover:bg-red-50"
                  }`}
                  title={user.isLocked ? "Unlock User" : "Lock User"}
                  onClick={() => onLockUnlockUser(user)}
                >
                  {user.isLocked ? (
                    <Unlock className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </button>
                <button
                  className="text-gray-600 hover:text-gray-900 hover:cursor-pointer p-2 rounded-lg hover:bg-gray-50"
                  title="Edit User"
                  onClick={() => onEditUser(user)}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  className="text-red-600 hover:text-red-900 hover:cursor-pointer p-2 rounded-lg hover:bg-red-50"
                  title="Delete User"
                  onClick={() => onDeleteUser(user)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 w-full">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-900 break-words">
              No users found
            </p>
            <p className="text-sm text-gray-500 break-words">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating your first user."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredUsers.length > 0 && (
        <div className="flex flex-col gap-4 mt-6 w-full">
          {/* Results info and per-page selector */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-700 text-center sm:text-left order-2 sm:order-1 break-words">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 order-1 sm:order-2"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="hidden lg:flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and pages around current
                  const isFirstOrLast = page === 1 || page === totalPages;
                  const isAroundCurrent = Math.abs(page - currentPage) <= 1;
                  return isFirstOrLast || isAroundCurrent;
                })
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && (
                        <span className="px-2 py-1 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`hover:cursor-pointer px-3 py-1 rounded-lg text-sm ${
                          currentPage === page
                            ? "bg-orange-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}
            </div>

            {/* Mobile & Tablet page indicator */}
            <div className="lg:hidden px-3 py-1 text-sm text-gray-700">
              {currentPage} / {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
