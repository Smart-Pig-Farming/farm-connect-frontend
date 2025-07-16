import { User } from "lucide-react";
import { UnderDevelopment } from "@/components/ui/under-development";

export function ProfilePage() {
  return (
    <UnderDevelopment
      title="Profile Management"
      description="Personalize your FarmConnect experience with comprehensive profile settings, preferences, and account management tools designed for modern pig farmers."
      icon={User}
      comingSoonFeatures={[
        "Personal profile customization",
        "Account security settings",
        "Notification preferences",
        "Farm information management",
        "Integration settings",
        "Privacy controls",
      ]}
    />
  );
}
