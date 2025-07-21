import { X, Shield, Users, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: {
    id: number;
    name: string;
    description: string;
    userCount: number;
    permissions: string[];
  } | null;
}

export function RoleDetailsModal({
  isOpen,
  onClose,
  role,
}: RoleDetailsModalProps) {
  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg flex-shrink-0">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="bg-white/20 p-2 rounded-lg">
              <Shield className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold break-words">
                {role.name}
              </div>
              <div className="text-orange-100 text-sm font-normal break-words">
                Role Details
              </div>
            </div>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-6 flex-1 overflow-hidden flex flex-col">
          {/* Role Info Section */}
          <div className="space-y-4 flex-shrink-0">
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Description
              </h3>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg break-words">
                {role.description || "No description provided"}
              </p>
            </div>

            {/* User Count */}
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-blue-700">
                  Assigned Users
                </div>
                <div className="text-lg font-bold text-blue-900">
                  {role.userCount} {role.userCount === 1 ? "user" : "users"}
                </div>
              </div>
            </div>

            {/* Permissions Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                Permissions ({role.permissions.length})
              </h3>
              {role.permissions.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Eye className="h-3 w-3" />
                  <span>Scroll to view all</span>
                </div>
              )}
            </div>
          </div>

          {/* Permissions List - Scrollable */}
          <div className="flex-1 overflow-hidden">
            {role.permissions.length > 0 ? (
              <div className="h-full overflow-y-auto pr-2 space-y-2 max-h-64">
                {role.permissions.map((permission, index) => {
                  const [action, resource] = permission.split(":");
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                    >
                      {/* Permission Icon */}
                      <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg flex-shrink-0">
                        <Shield className="h-4 w-4 text-white" />
                      </div>

                      {/* Permission Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium break-words">
                            {action}
                          </span>
                          <span className="text-gray-400 text-sm">:</span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium break-words">
                            {resource}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 break-words">
                          Can {action.toLowerCase()} {resource.toLowerCase()} in
                          the system
                        </div>
                      </div>

                      {/* Permission Number */}
                      <div className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-full flex-shrink-0">
                        #{index + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Shield className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm font-medium">No permissions assigned</p>
                <p className="text-xs text-center">
                  This role doesn't have any permissions yet
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-200 flex-shrink-0">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
