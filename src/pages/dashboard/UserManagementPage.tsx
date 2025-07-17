import { useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Settings,
  Search,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Mail,
  Plus,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Database,
} from "lucide-react";
import {
  UserFormModal,
  ConfirmationModal,
  RoleFormModal,
  ActionFormModal,
  ResourceFormModal,
  PermissionFormModal,
} from "@/components/usermanagement";

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

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
}

interface Action {
  id: number;
  name: string;
  description: string;
}

interface Resource {
  id: number;
  name: string;
  description: string;
}

interface Permission {
  id: number;
  action: string;
  resource: string;
  name: string; // Action:Resource format
  description: string;
}

type FilterStatus = "all" | "active" | "locked" | "unverified";
type FilterRole =
  | "all"
  | "Administrator"
  | "Veterinarian"
  | "Government Official"
  | "Farmer";

interface UserFormData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  farmName: string;
  province: string;
  district: string;
  sector: string;
  role: string;
}

export function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "permissions">(
    "users"
  );
  const [permissionsSubTab, setPermissionsSubTab] = useState<
    "permissions" | "actions" | "resources"
  >("permissions");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showEditRole, setShowEditRole] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showCreateAction, setShowCreateAction] = useState(false);
  const [showEditAction, setShowEditAction] = useState(false);
  const [showCreateResource, setShowCreateResource] = useState(false);
  const [showEditResource, setShowEditResource] = useState(false);
  const [showCreatePermission, setShowCreatePermission] = useState(false);
  const [showEditPermission, setShowEditPermission] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [showResendEmailConfirm, setShowResendEmailConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterRole, setFilterRole] = useState<FilterRole>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Mock data - this would come from your API
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@vetclinic.com",
      phone: "+250788123456",
      role: "Veterinarian",
      status: "active",
      isVerified: true,
      isLocked: false,
      lastLogin: "2025-07-16",
      createdAt: "2025-07-01",
    },
    {
      id: 2,
      name: "John Agricultural Officer",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@agriculture.gov",
      phone: "+250788234567",
      role: "Government Official",
      status: "active",
      isVerified: true,
      isLocked: false,
      lastLogin: "2025-07-15",
      createdAt: "2025-06-15",
    },
    {
      id: 3,
      name: "Mary Farm Inspector",
      firstName: "Mary",
      lastName: "Smith",
      email: "mary.smith@agriculture.gov",
      phone: "+250788345678",
      role: "Government Official",
      status: "unverified",
      isVerified: false,
      isLocked: false,
      lastLogin: null,
      createdAt: "2025-07-16",
    },
  ]);

  // Handle form submissions
  const handleCreateUser = (data: UserFormData) => {
    // Here you would call your API to create the user
    console.log("Creating user:", data);

    // Create new user object
    const newUser: User = {
      id: Math.max(...users.map((u) => u.id)) + 1, // Simple ID generation
      name: `${data.firstname} ${data.lastname}`,
      firstName: data.firstname,
      lastName: data.lastname,
      email: data.email,
      phone: "", // Would need to be added to the form
      role: data.role,
      status: "active",
      isVerified: false, // New users start unverified
      isLocked: false,
      lastLogin: null,
      createdAt: new Date().toISOString().split("T")[0],
    };

    // Add the new user to state
    setUsers((prevUsers) => [...prevUsers, newUser]);
    setShowCreateUser(false);
  };

  const handleUpdateUser = (data: UserFormData) => {
    // Here you would call your API to update the user
    console.log("Updating user:", selectedUser?.id, data);

    if (selectedUser) {
      // Update the user in state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                name: `${data.firstname} ${data.lastname}`,
                firstName: data.firstname,
                lastName: data.lastname,
                email: data.email,
                role: data.role,
                // Keep existing phone, status, isLocked, etc.
              }
            : user
        )
      );
    }

    setShowEditUser(false);
    setSelectedUser(null);
  };

  // User action handlers
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditUser(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      // Here you would call your API to delete the user
      console.log("Deleting user:", selectedUser.id);

      // Remove the user from local state
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== selectedUser.id)
      );

      // Close the modal and clear selected user
      setShowDeleteConfirm(false);
      setSelectedUser(null);
    }
  };

  const handleLockUnlockUser = (user: User) => {
    setSelectedUser(user);
    setShowLockConfirm(true);
  };

  const confirmLockUnlockUser = () => {
    if (selectedUser) {
      // Here you would call your API to lock/unlock the user
      console.log(
        `${selectedUser.isLocked ? "Unlocking" : "Locking"} user:`,
        selectedUser.id
      );

      // Update the user in local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id
            ? { ...user, isLocked: !user.isLocked }
            : user
        )
      );

      // Close the modal and clear selected user
      setShowLockConfirm(false);
      setSelectedUser(null);
    }
  };

  const handleResendEmail = (user: User) => {
    setSelectedUser(user);
    setShowResendEmailConfirm(true);
  };

  const confirmResendEmail = () => {
    if (selectedUser) {
      // Here you would call your API to resend verification email
      console.log("Resending verification email to:", selectedUser.email);
      // You could show a toast notification here

      // Close the modal and clear selected user
      setShowResendEmailConfirm(false);
      setSelectedUser(null);
    }
  };

  // Role action handlers
  const handleCreateRole = (data: {
    name: string;
    description: string;
    permissions: string[];
  }) => {
    // Here you would call your API to create the role
    console.log("Creating role:", data);

    // For now, just close the modal
    setShowCreateRole(false);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowEditRole(true);
  };

  const handleUpdateRole = (data: {
    name: string;
    description: string;
    permissions: string[];
  }) => {
    // Here you would call your API to update the role
    console.log("Updating role:", selectedRole?.id, data);

    // Close the modal and clear selected role
    setShowEditRole(false);
    setSelectedRole(null);
  };

  // Action handlers
  const handleCreateAction = (data: { name: string; description: string }) => {
    // Here you would call your API to create the action
    console.log("Creating action:", data);
    setShowCreateAction(false);
  };

  const handleEditAction = (action: Action) => {
    setSelectedAction(action);
    setShowEditAction(true);
  };

  const handleUpdateAction = (data: { name: string; description: string }) => {
    // Here you would call your API to update the action
    console.log("Updating action:", selectedAction?.id, data);
    setShowEditAction(false);
    setSelectedAction(null);
  };

  // Resource handlers
  const handleCreateResource = (data: {
    name: string;
    description: string;
  }) => {
    // Here you would call your API to create the resource
    console.log("Creating resource:", data);
    setShowCreateResource(false);
  };

  const handleEditResource = (resource: Resource) => {
    setSelectedResource(resource);
    setShowEditResource(true);
  };

  const handleUpdateResource = (data: {
    name: string;
    description: string;
  }) => {
    // Here you would call your API to update the resource
    console.log("Updating resource:", selectedResource?.id, data);
    setShowEditResource(false);
    setSelectedResource(null);
  };

  // Permission handlers
  const handleCreatePermission = (data: {
    action: string;
    resource: string;
    description: string;
  }) => {
    // Here you would call your API to create the permission
    console.log("Creating permission:", data);
    setShowCreatePermission(false);
  };

  const handleEditPermission = (permission: Permission) => {
    setSelectedPermission(permission);
    setShowEditPermission(true);
  };

  const handleUpdatePermission = (data: {
    action: string;
    resource: string;
    description: string;
  }) => {
    // Here you would call your API to update the permission
    console.log("Updating permission:", selectedPermission?.id, data);
    setShowEditPermission(false);
    setSelectedPermission(null);
  };

  // Filter and paginate users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.isVerified && !user.isLocked) ||
      (filterStatus === "locked" && user.isLocked) ||
      (filterStatus === "unverified" && !user.isVerified);

    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: FilterStatus) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (value: FilterRole) => {
    setFilterRole(value);
    setCurrentPage(1);
  };

  const mockRoles: Role[] = [
    {
      id: 1,
      name: "Administrator",
      description: "Full system access and user management",
      userCount: 2,
      permissions: [
        "manage:users",
        "manage:roles",
        "access:system",
        "manage:content",
      ],
    },
    {
      id: 2,
      name: "Veterinarian",
      description: "Veterinary expertise and advisory access",
      userCount: 15,
      permissions: [
        "create:content",
        "moderate:content",
        "moderate:discussions",
      ],
    },
    {
      id: 3,
      name: "Government Official",
      description: "Government oversight and regulation access",
      userCount: 8,
      permissions: ["review:content", "verify:users", "review:compliance"],
    },
    {
      id: 4,
      name: "Farmer",
      description: "Basic farming platform access",
      userCount: 1250,
      permissions: [
        "read:content",
        "participate:discussions",
        "manage:profile",
      ],
    },
  ];

  const mockActions: Action[] = [
    { id: 1, name: "create", description: "Create new items" },
    { id: 2, name: "read", description: "View items" },
    { id: 3, name: "update", description: "Modify existing items" },
    { id: 4, name: "delete", description: "Remove items" },
    { id: 5, name: "manage", description: "Full management access" },
    { id: 6, name: "moderate", description: "Moderate content or discussions" },
    { id: 7, name: "verify", description: "Verify or approve items" },
    { id: 8, name: "review", description: "Review items for compliance" },
    { id: 9, name: "participate", description: "Participate in activities" },
    { id: 10, name: "access", description: "Access or use items" },
  ];

  const mockResources: Resource[] = [
    { id: 1, name: "users", description: "User accounts and profiles" },
    { id: 2, name: "roles", description: "System roles and permissions" },
    { id: 3, name: "content", description: "Platform content and articles" },
    {
      id: 4,
      name: "discussions",
      description: "Forum discussions and comments",
    },
    { id: 5, name: "system", description: "System settings and configuration" },
    { id: 6, name: "profile", description: "Personal user profile" },
    { id: 7, name: "compliance", description: "Compliance and audit data" },
    { id: 8, name: "reports", description: "System reports and analytics" },
    { id: 9, name: "notifications", description: "System notifications" },
    { id: 10, name: "farm", description: "Farm data and management" },
  ];

  const mockPermissions: Permission[] = [
    {
      id: 1,
      action: "manage",
      resource: "users",
      name: "manage:users",
      description: "Full user management including create, edit, and delete",
    },
    {
      id: 2,
      action: "manage",
      resource: "roles",
      name: "manage:roles",
      description: "Manage roles and assign permissions",
    },
    {
      id: 3,
      action: "access",
      resource: "system",
      name: "access:system",
      description: "Access system configuration and settings",
    },
    {
      id: 4,
      action: "manage",
      resource: "content",
      name: "manage:content",
      description: "Full content management access",
    },
    {
      id: 5,
      action: "create",
      resource: "content",
      name: "create:content",
      description: "Create new content and articles",
    },
    {
      id: 6,
      action: "moderate",
      resource: "content",
      name: "moderate:content",
      description: "Moderate user-generated content",
    },
    {
      id: 7,
      action: "moderate",
      resource: "discussions",
      name: "moderate:discussions",
      description: "Moderate forum discussions and comments",
    },
    {
      id: 8,
      action: "review",
      resource: "content",
      name: "review:content",
      description: "Review content for compliance and accuracy",
    },
    {
      id: 9,
      action: "verify",
      resource: "users",
      name: "verify:users",
      description: "Verify user credentials and accounts",
    },
    {
      id: 10,
      action: "review",
      resource: "compliance",
      name: "review:compliance",
      description: "Perform compliance audits and reviews",
    },
    {
      id: 11,
      action: "read",
      resource: "content",
      name: "read:content",
      description: "View platform content and articles",
    },
    {
      id: 12,
      action: "participate",
      resource: "discussions",
      name: "participate:discussions",
      description: "Participate in forum discussions",
    },
    {
      id: 13,
      action: "manage",
      resource: "profile",
      name: "manage:profile",
      description: "Manage own profile and settings",
    },
  ];

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
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-6 sm:mb-8 w-full">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 break-words">
            User Management System
          </h1>
          <p className="text-sm sm:text-base text-gray-600 break-words">
            Manage users, roles, and permissions across the FarmConnect platform
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 w-full">
          <div className="border-b border-gray-200 w-full">
            {/* Desktop Tab Navigation */}
            <nav className="hidden sm:flex space-x-8 px-3 sm:px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab("users")}
                className={`py-4 px-1 border-b-2 font-medium text-sm hover:cursor-pointer whitespace-nowrap ${
                  activeTab === "users"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Users ({filteredUsers.length})
              </button>
              <button
                onClick={() => setActiveTab("roles")}
                className={`py-4 px-1 border-b-2 font-medium text-sm hover:cursor-pointer whitespace-nowrap ${
                  activeTab === "roles"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Roles ({mockRoles.length})
              </button>
              <button
                onClick={() => setActiveTab("permissions")}
                className={`py-4 px-1 border-b-2 font-medium text-sm hover:cursor-pointer whitespace-nowrap ${
                  activeTab === "permissions"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Permissions ({mockPermissions.length})
              </button>
            </nav>

            {/* Mobile Tab Navigation */}
            <div className="sm:hidden p-3 w-full">
              <select
                value={activeTab}
                onChange={(e) =>
                  setActiveTab(
                    e.target.value as "users" | "roles" | "permissions"
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-sm"
              >
                <option value="users">👥 Users ({filteredUsers.length})</option>
                <option value="roles">🛡️ Roles ({mockRoles.length})</option>
                <option value="permissions">
                  ⚙️ Permissions ({mockPermissions.length})
                </option>
              </select>
            </div>
          </div>

          {/* Users Tab Content */}
          {activeTab === "users" && (
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
                      <option value="Government Official">
                        Government Official
                      </option>
                      <option value="Farmer">Farmer</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setShowCreateUser(true)}
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
                                    onClick={() => handleResendEmail(user)}
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
                                  title={
                                    user.isLocked ? "Unlock User" : "Lock User"
                                  }
                                  onClick={() => handleLockUnlockUser(user)}
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
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-900 hover:cursor-pointer p-1 rounded hover:bg-red-50"
                                  title="Delete User"
                                  onClick={() => handleDeleteUser(user)}
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
                              <p className="text-lg font-medium">
                                No users found
                              </p>
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
                                    onClick={() => handleResendEmail(user)}
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
                                  title={
                                    user.isLocked ? "Unlock User" : "Lock User"
                                  }
                                  onClick={() => handleLockUnlockUser(user)}
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
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-900 hover:cursor-pointer p-2 rounded-lg hover:bg-red-50"
                                  title="Delete User"
                                  onClick={() => handleDeleteUser(user)}
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
                              <p className="text-lg font-medium">
                                No users found
                              </p>
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
                        <div className="flex-shrink-0">
                          {getStatusBadge(user)}
                        </div>
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
                            onClick={() => handleResendEmail(user)}
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
                          onClick={() => handleLockUnlockUser(user)}
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
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 hover:cursor-pointer p-2 rounded-lg hover:bg-red-50"
                          title="Delete User"
                          onClick={() => handleDeleteUser(user)}
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
                          const isFirstOrLast =
                            page === 1 || page === totalPages;
                          const isAroundCurrent =
                            Math.abs(page - currentPage) <= 1;
                          return isFirstOrLast || isAroundCurrent;
                        })
                        .map((page, index, array) => {
                          const showEllipsis =
                            index > 0 && page - array[index - 1] > 1;
                          return (
                            <div key={page} className="flex items-center">
                              {showEllipsis && (
                                <span className="px-2 py-1 text-gray-500">
                                  ...
                                </span>
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
          )}

          {/* Roles Tab Content */}
          {activeTab === "roles" && (
            <div className="p-3 sm:p-6 w-full min-w-0">
              {/* Roles Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold break-words">
                    Role Management
                  </h2>
                  <p className="text-sm text-gray-600 mt-1 break-words">
                    Manage system roles and their permissions
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateRole(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center break-words"
                >
                  <Plus className="w-4 h-4" />
                  <span className="break-words">Create Role</span>
                </button>
              </div>

              {/* Roles Grid - Desktop & Tablet */}
              <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockRoles.map((role) => (
                  <div
                    key={role.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900 flex-1 break-words">
                          {role.name}
                        </h3>
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full break-words">
                          {role.userCount} users
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 break-words">
                        {role.description}
                      </p>
                    </div>

                    <div className="mb-4">
                      <span className="text-sm text-gray-500 block mb-2 break-words">
                        Permissions ({role.permissions.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions
                          .slice(0, 3)
                          .map((permission, index) => {
                            const [action, resource] = permission.split(":");
                            return (
                              <div
                                key={index}
                                className="flex items-center gap-1 bg-gray-50 rounded px-2 py-1"
                              >
                                <span className="text-xs bg-green-100 text-green-800 px-1 rounded break-words">
                                  {action}
                                </span>
                                <span className="text-xs text-gray-400">:</span>
                                <span className="text-xs bg-purple-100 text-purple-800 px-1 rounded break-words">
                                  {resource}
                                </span>
                              </div>
                            );
                          })}
                        {role.permissions.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded break-words">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditRole(role)}
                        className="flex-1 text-sm text-orange-600 border border-orange-600 px-3 py-2 rounded hover:bg-orange-50 hover:cursor-pointer transition-colors break-words"
                      >
                        <span className="break-words">Edit Role</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Roles List - Mobile */}
              <div className="md:hidden space-y-4 w-full">
                {mockRoles.map((role) => (
                  <div
                    key={role.id}
                    className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm w-full min-w-0"
                  >
                    {/* Role Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-lg font-medium text-gray-900 break-words">
                          {role.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 break-words">
                          {role.description}
                        </p>
                      </div>
                      <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full break-words">
                        {role.userCount} users
                      </span>
                    </div>

                    {/* Permissions Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Permissions
                        </span>
                        <span className="text-xs text-gray-500">
                          {role.permissions.length} total
                        </span>
                      </div>

                      {/* First 2 permissions for mobile */}
                      <div className="space-y-1">
                        {role.permissions
                          .slice(0, 2)
                          .map((permission, index) => {
                            const [action, resource] = permission.split(":");
                            return (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm"
                              >
                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium break-words">
                                  {action}
                                </span>
                                <span className="text-gray-400">:</span>
                                <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs font-medium break-words">
                                  {resource}
                                </span>
                              </div>
                            );
                          })}
                        {role.permissions.length > 2 && (
                          <div className="text-center py-1">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded break-words">
                              +{role.permissions.length - 2} more permissions
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleEditRole(role)}
                        className="w-full text-sm text-orange-600 border border-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 hover:cursor-pointer transition-colors flex items-center justify-center gap-2 break-words"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="break-words">Edit Role</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {mockRoles.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-900 break-words">
                    No roles found
                  </p>
                  <p className="text-sm text-gray-500 mb-4 break-words">
                    Get started by creating your first role.
                  </p>
                  <button
                    onClick={() => setShowCreateRole(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center gap-2 mx-auto break-words"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="break-words">Create Role</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Permissions Tab Content */}
          {activeTab === "permissions" && (
            <div className="p-3 sm:p-6 w-full min-w-0">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 break-words">
                  Permission Management
                </h2>
                <p className="text-sm sm:text-base text-gray-600 break-words">
                  Manage actions, resources, and granular permissions using
                  Action:Resource combinations
                </p>
              </div>

              {/* Permissions Sub-tabs */}
              <div className="border-b border-gray-200 mb-6">
                {/* Desktop Sub-tabs */}
                <nav className="hidden sm:flex space-x-8">
                  <button
                    onClick={() => setPermissionsSubTab("permissions")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm hover:cursor-pointer flex items-center gap-2 ${
                      permissionsSubTab === "permissions"
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Permissions ({mockPermissions.length})
                  </button>
                  <button
                    onClick={() => setPermissionsSubTab("actions")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm hover:cursor-pointer flex items-center gap-2 ${
                      permissionsSubTab === "actions"
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    Actions ({mockActions.length})
                  </button>
                  <button
                    onClick={() => setPermissionsSubTab("resources")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm hover:cursor-pointer flex items-center gap-2 ${
                      permissionsSubTab === "resources"
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Database className="w-4 h-4" />
                    Resources ({mockResources.length})
                  </button>
                </nav>

                {/* Mobile Sub-tabs Dropdown */}
                <div className="sm:hidden">
                  <select
                    value={permissionsSubTab}
                    onChange={(e) =>
                      setPermissionsSubTab(
                        e.target.value as
                          | "permissions"
                          | "actions"
                          | "resources"
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                  >
                    <option value="permissions">
                      🛡️ Permissions ({mockPermissions.length})
                    </option>
                    <option value="actions">
                      ⚡ Actions ({mockActions.length})
                    </option>
                    <option value="resources">
                      🗂️ Resources ({mockResources.length})
                    </option>
                  </select>
                </div>
              </div>

              {/* Permissions List */}
              {permissionsSubTab === "permissions" && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-lg font-medium">System Permissions</h3>
                    <button
                      onClick={() => setShowCreatePermission(true)}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <Plus className="w-4 h-4" />
                      Create Permission
                    </button>
                  </div>

                  {/* Desktop/Tablet Permissions List */}
                  <div className="hidden md:block space-y-4">
                    {mockPermissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded truncate">
                              {permission.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 break-words">
                            {permission.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                          <button
                            onClick={() => handleEditPermission(permission)}
                            className="text-orange-600 hover:text-orange-700 hover:cursor-pointer text-sm px-3 py-1 rounded hover:bg-orange-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-700 hover:cursor-pointer text-sm px-3 py-1 rounded hover:bg-red-50 transition-colors">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile Permissions List */}
                  <div className="md:hidden space-y-4 w-full">
                    {mockPermissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm w-full min-w-0"
                      >
                        <div className="flex-1 min-w-0 mb-3">
                          <div className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block mb-2 truncate">
                            {permission.name}
                          </div>
                          <p className="text-sm text-gray-600 break-words">
                            {permission.description}
                          </p>
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => handleEditPermission(permission)}
                            className="flex-1 text-orange-600 hover:text-orange-700 hover:cursor-pointer text-sm py-2 px-3 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors text-center"
                          >
                            Edit
                          </button>
                          <button className="flex-1 text-red-600 hover:text-red-700 hover:cursor-pointer text-sm py-2 px-3 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-center">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Empty State for Permissions */}
                  {mockPermissions.length === 0 && (
                    <div className="text-center py-12">
                      <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900">
                        No permissions found
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Create your first permission to get started.
                      </p>
                      <button
                        onClick={() => setShowCreatePermission(true)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center gap-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Create Permission
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Actions List */}
              {permissionsSubTab === "actions" && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-lg font-medium break-words">
                      System Actions
                    </h3>
                    <button
                      onClick={() => setShowCreateAction(true)}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center break-words"
                    >
                      <Plus className="w-4 h-4" />
                      Create Action
                    </button>
                  </div>

                  {/* Actions Grid - Responsive */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockActions.map((action) => (
                      <div
                        key={action.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-md font-semibold text-gray-800 truncate pr-2">
                            {action.name}
                          </h4>
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => handleEditAction(action)}
                              className="text-gray-400 hover:text-orange-600 p-1"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 break-words">
                          {action.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Empty State for Actions */}
                  {mockActions.length === 0 && (
                    <div className="text-center py-12">
                      <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900">
                        No actions found
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Create your first action to get started.
                      </p>
                      <button
                        onClick={() => setShowCreateAction(true)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center gap-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Create Action
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Resources List */}
              {permissionsSubTab === "resources" && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-lg font-medium break-words">
                      System Resources
                    </h3>
                    <button
                      onClick={() => setShowCreateResource(true)}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center break-words"
                    >
                      <Plus className="w-4 h-4" />
                      Create Resource
                    </button>
                  </div>

                  {/* Resources Grid - Responsive */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockResources.map((resource) => (
                      <div
                        key={resource.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-md font-semibold text-gray-800 truncate pr-2">
                            {resource.name}
                          </h4>
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => handleEditResource(resource)}
                              className="text-gray-400 hover:text-orange-600 p-1"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 break-words">
                          {resource.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Empty State for Resources */}
                  {mockResources.length === 0 && (
                    <div className="text-center py-12">
                      <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900">
                        No resources found
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Create your first resource to get started.
                      </p>
                      <button
                        onClick={() => setShowCreateResource(true)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:cursor-pointer flex items-center gap-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        Create Resource
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Form Modals */}
        <UserFormModal
          isOpen={showCreateUser}
          onClose={() => setShowCreateUser(false)}
          onSubmit={handleCreateUser}
          mode="create"
        />

        <UserFormModal
          isOpen={showEditUser}
          onClose={() => setShowEditUser(false)}
          onSubmit={handleUpdateUser}
          user={selectedUser}
          mode="edit"
        />

        {/* Role Form Modals */}
        <RoleFormModal
          isOpen={showCreateRole}
          onClose={() => setShowCreateRole(false)}
          onSubmit={handleCreateRole}
          mode="create"
          availablePermissions={mockPermissions}
        />

        <RoleFormModal
          isOpen={showEditRole}
          onClose={() => setShowEditRole(false)}
          onSubmit={handleUpdateRole}
          role={selectedRole}
          mode="edit"
          availablePermissions={mockPermissions}
        />

        {/* Action Form Modals */}
        <ActionFormModal
          isOpen={showCreateAction}
          onClose={() => setShowCreateAction(false)}
          onSubmit={handleCreateAction}
          mode="create"
        />

        <ActionFormModal
          isOpen={showEditAction}
          onClose={() => setShowEditAction(false)}
          onSubmit={handleUpdateAction}
          action={selectedAction}
          mode="edit"
        />

        {/* Resource Form Modals */}
        <ResourceFormModal
          isOpen={showCreateResource}
          onClose={() => setShowCreateResource(false)}
          onSubmit={handleCreateResource}
          mode="create"
        />

        <ResourceFormModal
          isOpen={showEditResource}
          onClose={() => setShowEditResource(false)}
          onSubmit={handleUpdateResource}
          resource={selectedResource}
          mode="edit"
        />

        {/* Permission Form Modals */}
        <PermissionFormModal
          isOpen={showCreatePermission}
          onClose={() => setShowCreatePermission(false)}
          onSubmit={handleCreatePermission}
          mode="create"
          availableActions={mockActions}
          availableResources={mockResources}
        />

        <PermissionFormModal
          isOpen={showEditPermission}
          onClose={() => setShowEditPermission(false)}
          onSubmit={handleUpdatePermission}
          permission={selectedPermission}
          mode="edit"
          availableActions={mockActions}
          availableResources={mockResources}
        />

        {/* Confirmation Modals */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDeleteUser}
          title="Delete User"
          message={`Are you sure you want to delete ${selectedUser?.firstName} ${selectedUser?.lastName}? This action cannot be undone.`}
          confirmText="Delete User"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          iconBgClass="bg-red-100"
        />

        <ConfirmationModal
          isOpen={showLockConfirm}
          onClose={() => setShowLockConfirm(false)}
          onConfirm={confirmLockUnlockUser}
          title={`${selectedUser?.isLocked ? "Unlock" : "Lock"} User`}
          message={`Are you sure you want to ${
            selectedUser?.isLocked ? "unlock" : "lock"
          } ${selectedUser?.firstName} ${selectedUser?.lastName}?`}
          confirmText={`${selectedUser?.isLocked ? "Unlock" : "Lock"} User`}
          confirmButtonClass={
            selectedUser?.isLocked
              ? "bg-green-600 hover:bg-green-700"
              : "bg-yellow-600 hover:bg-yellow-700"
          }
          icon={
            selectedUser?.isLocked ? (
              <Unlock className="h-6 w-6 text-green-600" />
            ) : (
              <Lock className="h-6 w-6 text-yellow-600" />
            )
          }
          iconBgClass={
            selectedUser?.isLocked ? "bg-green-100" : "bg-yellow-100"
          }
          extraMessage={
            !selectedUser?.isLocked
              ? "This user will not be able to access their account until unlocked."
              : undefined
          }
        />

        <ConfirmationModal
          isOpen={showResendEmailConfirm}
          onClose={() => setShowResendEmailConfirm(false)}
          onConfirm={confirmResendEmail}
          title="Resend Verification Email"
          message={`Are you sure you want to resend the verification email to ${selectedUser?.firstName} ${selectedUser?.lastName}?`}
          confirmText="Resend Email"
          confirmButtonClass="bg-blue-600 hover:bg-blue-700"
          icon={<Mail className="h-6 w-6 text-blue-600" />}
          iconBgClass="bg-blue-100"
          extraMessage={`A new verification email will be sent to ${selectedUser?.email}`}
        />
      </div>
    </div>
  );
}
