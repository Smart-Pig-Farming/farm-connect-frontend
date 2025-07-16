import { Users } from "lucide-react";
import { UnderDevelopment } from "@/components/ui/under-development";

export function UserManagementPage() {
  return (
    <UnderDevelopment
      title="User Management System"
      description="Comprehensive user management tools for administrators to control access, manage permissions, and monitor user activity across the FarmConnect platform."
      icon={Users}
      comingSoonFeatures={[
        "User role and permission management",
        "Bulk user import/export tools",
        "Advanced user analytics",
        "Activity monitoring dashboard",
        "Automated user onboarding",
        "Security audit logs",
      ]}
    />
  );
}
