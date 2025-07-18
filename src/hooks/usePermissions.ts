import { useAppSelector } from "@/store/hooks";

/**
 * Hook to check user permissions
 */
export function usePermissions() {
  const user = useAppSelector((state) => state.auth.user);
  const permissions = user?.permissions || [];

  /**
   * Check if user has a specific permission
   * @param permission Permission string in format "ACTION:RESOURCE" (e.g., "MANAGE:USERS")
   * @returns boolean indicating if user has the permission
   */
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  /**
   * Check if user has any of the specified permissions
   * @param permissionList Array of permission strings
   * @returns boolean indicating if user has at least one of the permissions
   */
  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some((permission) =>
      permissions.includes(permission)
    );
  };

  /**
   * Check if user has all of the specified permissions
   * @param permissionList Array of permission strings
   * @returns boolean indicating if user has all the permissions
   */
  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every((permission) =>
      permissions.includes(permission)
    );
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
