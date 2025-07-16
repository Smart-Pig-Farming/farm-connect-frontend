import { BookOpen } from "lucide-react";
import { UnderDevelopment } from "@/components/ui/under-development";

export function BestPracticesPage() {
  return (
    <UnderDevelopment
      title="Best Practices Library"
      description="Access a comprehensive collection of proven pig farming best practices, expert-curated guides, and innovative techniques to optimize your farm's productivity and animal welfare."
      icon={BookOpen}
      comingSoonFeatures={[
        "Expert-curated practice guides",
        "Interactive tutorials and videos",
        "Community-submitted practices",
        "Practice rating and reviews",
        "Searchable knowledge base",
        "Offline access to guides",
      ]}
    />
  );
}
