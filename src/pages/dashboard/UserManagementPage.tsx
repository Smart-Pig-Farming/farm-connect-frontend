import { useState } from "react";
import {
  Users,
  Shield,
  Settings,
  AlertTriangle,
  Lock,
  Unlock,
  Mail,
} from "lucide-react";
import {
  UserFormModal,
  ConfirmationModal,
  RoleFormModal,
  UsersTabContent,
  RolesTabContent,
} from "../../components/usermanagement";
import { PermissionsTabContainer } from "../../components/usermanagement/PermissionsTabContainer";

// Mock data for demonstration
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
  permissions: string[];
  userCount: number;
}

interface Permission {
  id: number;
  name: string;
  action: string;
  resource: string;
  description: string;
}

// Form data types
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

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

const mockUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1-555-0123",
    role: "Admin",
    status: "active",
    isVerified: true,
    isLocked: false,
    lastLogin: "2024-02-15T10:30:00Z",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    phone: "+1-555-0124",
    role: "Farm Manager",
    status: "active",
    isVerified: true,
    isLocked: false,
    lastLogin: "2024-02-14T15:45:00Z",
    createdAt: "2024-01-20",
  },
  {
    id: 3,
    name: "Bob Wilson",
    firstName: "Bob",
    lastName: "Wilson",
    email: "bob@example.com",
    phone: "+1-555-0125",
    role: "Farm Worker",
    status: "pending",
    isVerified: false,
    isLocked: false,
    lastLogin: null,
    createdAt: "2024-02-01",
  },
];

const mockRoles: Role[] = [
  {
    id: 1,
    name: "Admin",
    description: "Full system access with all permissions",
    permissions: ["create:users", "read:users", "update:users", "delete:users"],
    userCount: 1,
  },
  {
    id: 2,
    name: "Farm Manager",
    description: "Manage farm operations and limited user access",
    permissions: ["read:users", "create:livestock", "read:livestock"],
    userCount: 1,
  },
  {
    id: 3,
    name: "Farm Worker",
    description: "Basic access to view and update livestock data",
    permissions: ["read:livestock", "update:livestock"],
    userCount: 1,
  },
];

const mockPermissions: Permission[] = [
  {
    id: 1,
    name: "Create Users",
    action: "create",
    resource: "users",
    description: "Create new users in the system",
  },
  {
    id: 2,
    name: "Read Users",
    action: "read",
    resource: "users",
    description: "View user information",
  },
  {
    id: 3,
    name: "Update Users",
    action: "update",
    resource: "users",
    description: "Modify user information",
  },
];

export default function UserManagementPage() {
  // State for active tab
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "permissions">(
    "users"
  );

  // Modal states
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showEditRole, setShowEditRole] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [showResendEmailConfirm, setShowResendEmailConfirm] = useState(false);

  // Selected items for editing/deleting
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // State for users data
  const [users, setUsers] = useState<User[]>(mockUsers);

  // Event handlers
  const handleCreateUser = (userData: UserFormData) => {
    const newUser: User = {
      id: users.length + 1,
      name: `${userData.firstname} ${userData.lastname}`,
      firstName: userData.firstname,
      lastName: userData.lastname,
      email: userData.email,
      phone: "",
      role: userData.role,
      status: "pending",
      isVerified: false,
      isLocked: false,
      lastLogin: null,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setUsers([...users, newUser]);
    setShowCreateUser(false);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditUser(true);
  };

  const handleUpdateUser = (userData: UserFormData) => {
    if (selectedUser) {
      const updatedUsers = users.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              name: `${userData.firstname} ${userData.lastname}`,
              firstName: userData.firstname,
              lastName: userData.lastname,
              email: userData.email,
              role: userData.role,
            }
          : user
      );
      setUsers(updatedUsers);
      setShowEditUser(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter((user) => user.id !== selectedUser.id));
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
      const updatedUsers = users.map((user) =>
        user.id === selectedUser.id
          ? { ...user, isLocked: !user.isLocked }
          : user
      );
      setUsers(updatedUsers);
      setShowLockConfirm(false);
      setSelectedUser(null);
    }
  };

  const handleResendEmail = (user: User) => {
    setSelectedUser(user);
    setShowResendEmailConfirm(true);
  };

  const confirmResendEmail = () => {
    // In a real app, this would trigger an email resend
    console.log("Resending verification email to:", selectedUser?.email);
    setShowResendEmailConfirm(false);
    setSelectedUser(null);
  };

  const handleCreateRole = (roleData: RoleFormData) => {
    console.log("Creating role:", roleData);
    setShowCreateRole(false);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowEditRole(true);
  };

  const handleUpdateRole = (roleData: RoleFormData) => {
    console.log("Updating role:", roleData);
    setShowEditRole(false);
    setSelectedRole(null);
  };

  return (
    <div className="p-3 sm:p-6 w-full min-w-0 max-w-full overflow-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 break-words">
          User Management
        </h1>
        <p className="text-sm sm:text-base text-gray-600 break-words">
          Manage users, roles, and permissions for your farm management system
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        {/* Desktop Tabs */}
        <nav className="hidden sm:flex space-x-8">
          <button
            onClick={() => setActiveTab("users")}
            className={`py-2 px-1 border-b-2 font-medium text-sm hover:cursor-pointer flex items-center gap-2 ${
              activeTab === "users"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="break-words">Users</span>
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`py-2 px-1 border-b-2 font-medium text-sm hover:cursor-pointer flex items-center gap-2 ${
              activeTab === "roles"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="break-words">Roles</span>
          </button>
          <button
            onClick={() => setActiveTab("permissions")}
            className={`py-2 px-1 border-b-2 font-medium text-sm hover:cursor-pointer flex items-center gap-2 ${
              activeTab === "permissions"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="break-words">Permissions</span>
          </button>
        </nav>

        {/* Mobile Tabs */}
        <div className="sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as typeof activeTab)}
            className="block w-full py-2 pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-md"
          >
            <option value="users">Users</option>
            <option value="roles">Roles</option>
            <option value="permissions">Permissions</option>
          </select>
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full min-w-0">
        {/* Users Tab Content */}
        {activeTab === "users" && (
          <UsersTabContent
            users={users}
            onCreateUser={() => setShowCreateUser(true)}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onLockUnlockUser={handleLockUnlockUser}
            onResendEmail={handleResendEmail}
          />
        )}

        {/* Roles Tab Content */}
        {activeTab === "roles" && (
          <RolesTabContent
            roles={mockRoles}
            onCreateRole={() => setShowCreateRole(true)}
            onEditRole={handleEditRole}
          />
        )}

        {/* Permissions Tab Content */}
        {activeTab === "permissions" && <PermissionsTabContainer />}
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
        mode="edit"
        user={selectedUser}
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
        mode="edit"
        role={selectedRole}
        availablePermissions={mockPermissions}
      />

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
      />

      <ConfirmationModal
        isOpen={showLockConfirm}
        onClose={() => setShowLockConfirm(false)}
        onConfirm={confirmLockUnlockUser}
        title={selectedUser?.isLocked ? "Unlock User" : "Lock User"}
        message={`Are you sure you want to ${
          selectedUser?.isLocked ? "unlock" : "lock"
        } ${selectedUser?.name}?`}
        confirmText={selectedUser?.isLocked ? "Unlock" : "Lock"}
        confirmButtonClass={
          selectedUser?.isLocked
            ? "bg-green-600 hover:bg-green-700"
            : "bg-red-600 hover:bg-red-700"
        }
        icon={
          selectedUser?.isLocked ? (
            <Unlock className="w-6 h-6 text-green-600" />
          ) : (
            <Lock className="w-6 h-6 text-red-600" />
          )
        }
      />

      <ConfirmationModal
        isOpen={showResendEmailConfirm}
        onClose={() => setShowResendEmailConfirm(false)}
        onConfirm={confirmResendEmail}
        title="Resend Verification Email"
        message={`Are you sure you want to resend the verification email to ${selectedUser?.email}?`}
        confirmText="Resend Email"
        confirmButtonClass="bg-blue-600 hover:bg-blue-700"
        icon={<Mail className="w-6 h-6 text-blue-600" />}
      />
    </div>
  );
}
