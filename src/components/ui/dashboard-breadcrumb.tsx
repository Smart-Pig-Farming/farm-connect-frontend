import { useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  href?: string;
}

export function DashboardBreadcrumb() {
  const location = useLocation();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { name: "Dashboard", href: "/dashboard" },
    ];

    if (pathSegments.length > 1) {
      const page = pathSegments[1];
      const pageNames: Record<string, string> = {
        overview: "Overview",
        "best-practices": "Best Practices",
        discussions: "Discussions",
        settings: "Settings",
        users: "User Management",
        profile: "Profile",
      };

      if (pageNames[page]) {
        breadcrumbs.push({ name: pageNames[page] });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <div className="flex items-center space-x-2 text-sm">
        <Home className="w-4 h-4 text-gray-500" />
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            )}
            <span
              className={`
                ${
                  index === breadcrumbs.length - 1
                    ? "text-gray-900 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }
              `}
            >
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </nav>
  );
}
