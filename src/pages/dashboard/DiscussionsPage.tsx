import { MessageSquare } from "lucide-react";
import { UnderDevelopment } from "@/components/ui/under-development";

export function DiscussionsPage() {
  return (
    <UnderDevelopment
      title="Community Discussions"
      description="Connect with fellow pig farmers, share experiences, and get expert advice on farming challenges. Our discussion platform will foster a vibrant community of knowledge sharing."
      icon={MessageSquare}
      comingSoonFeatures={[
        "Real-time messaging and discussions",
        "Expert Q&A sessions",
        "Topic-based discussion threads",
        "Private messaging system",
        "Discussion moderation tools",
        "Mobile-friendly chat interface",
      ]}
    />
  );
}
