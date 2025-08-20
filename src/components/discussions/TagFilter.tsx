interface Tag {
  name: string;
  count: number;
  color: string;
}

interface TagFilterProps {
  tags: Tag[];
  selectedTag: string;
  onTagSelect: (tag: string) => void;
}

export function TagFilter({ tags, selectedTag, onTagSelect }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTag === tag.name;
        return (
          <button
            key={tag.name}
            onClick={() => onTagSelect(tag.name)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-1 ${
              isSelected
                ? "bg-orange-500 text-white shadow-md hover:bg-orange-600"
                : "bg-white/90 text-gray-700 border border-gray-200/60 hover:bg-gray-50 hover:border-gray-300/60 hover:shadow-sm"
            }`}
          >
            <span className="capitalize">{tag.name}</span>
            <span
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                isSelected
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {tag.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
