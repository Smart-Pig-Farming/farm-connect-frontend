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
  const getTagStyles = (tag: Tag, isSelected: boolean) => {
    if (isSelected) {
      return "bg-orange-500 text-white border-orange-500 shadow-md";
    }

    switch (tag.color) {
      case "blue":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
      case "green":
        return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
      case "red":
        return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
      case "yellow":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100";
      case "purple":
        return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100";
      case "pink":
        return "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100";
      case "orange":
        return "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
    }
  };

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTag === tag.name;
          return (
            <button
              key={tag.name}
              onClick={() => onTagSelect(tag.name)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-200 cursor-pointer ${getTagStyles(
                tag,
                isSelected
              )} ${isSelected ? "scale-105" : "hover:scale-102"}`}
            >
              <span>{tag.name}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-white/60 text-gray-600"
                }`}
              >
                {tag.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
