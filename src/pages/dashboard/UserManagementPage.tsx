import { useState } from "react";
import { Users, Shield, Settings } from "lucide-react";
import {
  RoleFormModal,
  UsersTabContent,
} from "../../components/usermanagement";
import { PermissionsTabContainer } from "../../components/usermanagement/PermissionsTabContainer";
import { RolesTabContainer } from "../../components/usermanagement/RolesTabContainer";

// Types for roles and permissions
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

  // Modal states for roles
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showEditRole, setShowEditRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleCreateRole = (roleData: {
    name: string;
    description: string;
  }) => {
    console.log("Creating role:", roleData);
    setShowCreateRole(false);
  };

  const handleUpdateRole = (roleData: {
    name: string;
    description: string;
  }) => {
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
        {activeTab === "users" && <UsersTabContent />}

        {/* Roles Tab Content */}
        {activeTab === "roles" && <RolesTabContainer />}

        {/* Permissions Tab Content */}
        {activeTab === "permissions" && <PermissionsTabContainer />}
      </div>

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
    </div>
  );
}
