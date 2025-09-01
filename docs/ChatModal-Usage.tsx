// Example usage of ChatModal in a Best Practice page

import React, { useState } from 'react';
import { ChatModal } from '../components/ui/ChatModal';
import { MessageCircle } from 'lucide-react';

interface BestPracticePageProps {
  category?: string;
  categories?: string[];
}

export function BestPracticePage({ category, categories }: BestPracticePageProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Your best practice content here */}
      <h1 className="text-3xl font-bold mb-6">Best Practices</h1>
      
      {/* Best practices content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Practice cards go here */}
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
        aria-label="Open chat assistant"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="hidden sm:inline">Ask Assistant</span>
      </button>

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        pageContext={category || 'best_practices'}
        categories={categories}
      />
    </div>
  );
}

// Example usage in different contexts:

// 1. General best practices page
// <BestPracticePage />

// 2. Category-specific page
// <BestPracticePage 
//   category="feeding_nutrition" 
//   categories={["feeding_nutrition"]}
// />

// 3. Multi-category page
// <BestPracticePage 
//   category="health_management" 
//   categories={["disease_control", "growth_weight"]}
// />

// You can also integrate it into existing pages by adding the chat button and modal:

export function ExistingPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div>
      {/* Your existing page content */}
      
      {/* Add chat functionality */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full p-3 shadow-lg"
      >
        <MessageCircle className="h-5 w-5" />
      </button>

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        pageContext="current_page_context" // Optional: helps provide relevant context
        categories={["relevant", "categories"]} // Optional: helps filter content
      />
    </div>
  );
}
