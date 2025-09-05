import { MessageCircle } from "lucide-react";

interface FloatingChatButtonProps {
  onClick: () => void;
}

export function FloatingChatButton({ onClick }: FloatingChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 hover:cursor-pointer flex items-center justify-center group"
    >
      <MessageCircle className="h-6 w-6 transition-transform duration-200 group-hover:scale-105" />

      {/* Subtle pulse animation ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 animate-pulse opacity-10"></div>

      {/* Tooltip */}
      <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 dark:bg-slate-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        Ask a question
        <div className="absolute top-1/2 left-full w-0 h-0 border-l-4 border-l-gray-900 dark:border-l-slate-700 border-t-4 border-t-transparent border-b-4 border-b-transparent transform -translate-y-1/2"></div>
      </div>
    </button>
  );
}
