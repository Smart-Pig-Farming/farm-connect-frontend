import React from "react";

interface MessageTextProps {
  text: string;
  className?: string;
}

export function MessageText({ text, className = "" }: MessageTextProps) {
  // Enhanced markdown parser for common formatting
  const formatText = (content: string) => {
    // First, let's split the content into paragraphs
    const paragraphs = content.split("\n\n").filter((p) => p.trim());

    return paragraphs.map((paragraph, paragraphIndex) => {
      // Check if this paragraph contains bullet points
      if (paragraph.includes("\n* ") || paragraph.startsWith("* ")) {
        const lines = paragraph.split("\n");
        const listItems: React.ReactNode[] = [];
        let currentContent: string[] = [];

        lines.forEach((line, lineIndex) => {
          if (line.trim().startsWith("* ")) {
            // If we have accumulated content, add it as text
            if (currentContent.length > 0) {
              listItems.push(
                <div key={`text-${lineIndex}`} className="mb-2">
                  {formatInlineText(currentContent.join("\n"))}
                </div>
              );
              currentContent = [];
            }
            // Add the bullet point
            listItems.push(
              <div
                key={`bullet-${lineIndex}`}
                className="flex items-start gap-2 mb-1"
              >
                <span className="text-orange-500 mt-1 text-xs font-bold">
                  •
                </span>
                <span className="flex-1">
                  {formatInlineText(line.trim().slice(2))}
                </span>
              </div>
            );
          } else if (line.trim()) {
            currentContent.push(line);
          }
        });

        // Add any remaining content
        if (currentContent.length > 0) {
          listItems.push(
            <div key="remaining" className="mb-2">
              {formatInlineText(currentContent.join("\n"))}
            </div>
          );
        }

        return (
          <div key={paragraphIndex} className="mb-4">
            {listItems}
          </div>
        );
      } else {
        // Regular paragraph - process inline formatting
        return (
          <div key={paragraphIndex} className="mb-3">
            {formatInlineText(paragraph)}
          </div>
        );
      }
    });
  };

  // Function to handle inline text formatting (bold, etc.)
  const formatInlineText = (text: string) => {
    // Split by bold markers (**text**)
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        const boldText = part.slice(2, -2);
        return (
          <strong
            key={index}
            className="font-semibold text-orange-600 dark:text-orange-400"
          >
            {boldText}
          </strong>
        );
      }

      // Handle line breaks within inline text
      return part.split("\n").map((line, lineIndex, array) => (
        <span key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < array.length - 1 && <br />}
        </span>
      ));
    });
  };

  return (
    <div className={`text-sm leading-relaxed ${className}`}>
      {formatText(text)}
    </div>
  );
}
