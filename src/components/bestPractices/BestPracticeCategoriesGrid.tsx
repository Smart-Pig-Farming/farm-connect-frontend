import React from "react";
import { useGetBestPracticeCategoriesQuery } from "@/store/api/bestPracticesApi";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";

interface Props {
  onSelect?: (key: string) => void;
  active?: string | null;
}

export const BestPracticeCategoriesGrid: React.FC<Props> = ({
  onSelect,
  active,
}) => {
  const { data, error, isLoading, isFetching } =
    useGetBestPracticeCategoriesQuery();

  React.useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error as unknown));
    }
  }, [error]);

  if (isLoading)
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Loading categories...
      </div>
    );
  if (!data)
    return (
      <div className="p-4 text-sm text-muted-foreground">No categories</div>
    );

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {data.categories.map((cat) => {
        const isActive = active === cat.key;
        return (
          <button
            key={cat.key}
            onClick={() => onSelect?.(cat.key)}
            className={`border rounded-xl p-4 text-left transition bg-white/70 dark:bg-neutral-900 hover:shadow-sm ${
              isActive ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className="font-semibold mb-1">{cat.label}</div>
            <div className="text-xs text-muted-foreground">
              {cat.count} practice{cat.count === 1 ? "" : "s"}
            </div>
            {isFetching && isActive && (
              <div className="text-[10px] mt-1 text-primary animate-pulse">
                Refreshing...
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BestPracticeCategoriesGrid;
