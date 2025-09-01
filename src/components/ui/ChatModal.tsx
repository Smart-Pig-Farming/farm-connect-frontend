import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Send,
  MessageCircle,
  User,
  Bot,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { MessageText } from "./MessageText";

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  context?: {
    sources: Array<{
      id: number;
      title: string;
      description: string;
      categories: string[];
      relevanceScore: number;
      readCount?: number;
    }>;
    totalSources: number;
  };
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageContext?: string;
  categories?: string[];
}

export function ChatModal({
  isOpen,
  onClose,
  pageContext,
  categories,
}: ChatModalProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(
    new Set()
  );
  const [selectedSource, setSelectedSource] = useState<{
    id: number;
    title: string;
    description: string;
    categories: string[];
    relevanceScore: number;
    readCount?: number;
  } | null>(null);

  const loadWelcomeMessage = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (pageContext) params.append("pageContext", pageContext);
      if (categories?.length) params.append("categories", categories.join(","));

      const response = await fetch(`/api/chat/welcome?${params}`);
      const data = await response.json();

      if (data.success && data.message) {
        setMessages([
          {
            ...data.message,
            timestamp: new Date(data.message.timestamp),
          },
        ]);
      } else {
        // Fallback welcome message
        setMessages([
          {
            id: "welcome",
            text: "Hello! I'm here to help you with pig farming best practices. What would you like to know?",
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to load welcome message:", error);
      // Fallback welcome message
      setMessages([
        {
          id: "welcome",
          text: "Hello! I'm here to help you with pig farming best practices. What would you like to know?",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [pageContext, categories]);

  // Load welcome message when modal opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadWelcomeMessage();
    }
  }, [isOpen, messages.length, loadWelcomeMessage]);

  // Helper function to toggle source expansion
  const toggleSourceExpansion = (messageId: string) => {
    setExpandedSources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Helper function to format category names
  const formatCategoryName = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (!isOpen) return null;

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputText,
          conversationHistory: messages.map((msg) => ({
            id: msg.id,
            text: msg.text,
            isUser: msg.isUser,
            timestamp: msg.timestamp.toISOString(),
          })),
          pageContext,
          categories,
        }),
      });

      const data = await response.json();

      if (data.success && data.message) {
        const botMessage: ChatMessage = {
          ...data.message,
          timestamp: new Date(data.message.timestamp),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        setError(data.error || "Failed to get response");
        // Add error message to chat
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setError("Failed to send message. Please try again.");
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm experiencing connection issues. Please check your internet connection and try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Farm Assistant
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Ask about best practices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors duration-200 hover:cursor-pointer"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-500 dark:text-slate-400">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!message.isUser && (
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.isUser
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white"
                    }`}
                  >
                    <MessageText
                      text={message.text}
                      className={
                        message.isUser
                          ? "text-white"
                          : "text-gray-900 dark:text-white"
                      }
                    />
                    {message.context && message.context.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-600">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-gray-600 dark:text-slate-400">
                            Sources ({message.context.totalSources}):
                          </p>
                          {message.context.sources.length > 2 && (
                            <button
                              onClick={() => toggleSourceExpansion(message.id)}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors hover:cursor-pointer"
                            >
                              {expandedSources.has(message.id) ? (
                                <>
                                  Show less <ChevronUp className="h-3 w-3" />
                                </>
                              ) : (
                                <>
                                  Show all <ChevronDown className="h-3 w-3" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {(expandedSources.has(message.id)
                            ? message.context.sources
                            : message.context.sources.slice(0, 2)
                          ).map((source) => (
                            <div
                              key={source.id}
                              className="bg-gray-50 dark:bg-slate-600/50 rounded-lg p-3 border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600/70 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">
                                    {source.title}
                                  </p>
                                  {source.description && (
                                    <p
                                      className="text-xs text-gray-600 dark:text-slate-400 mb-2 overflow-hidden"
                                      style={{
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                      }}
                                    >
                                      {source.description.length > 100
                                        ? `${source.description.substring(
                                            0,
                                            100
                                          )}...`
                                        : source.description}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {source.categories &&
                                        source.categories.length > 0 && (
                                          <div className="flex flex-wrap gap-1">
                                            {source.categories
                                              .slice(0, 2)
                                              .map((category) => (
                                                <span
                                                  key={category}
                                                  className="inline-block px-1.5 py-0.5 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-md"
                                                >
                                                  {formatCategoryName(category)}
                                                </span>
                                              ))}
                                            {source.categories.length > 2 && (
                                              <span className="text-xs text-gray-500 dark:text-slate-400">
                                                +{source.categories.length - 2}{" "}
                                                more
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      {source.relevanceScore > 5 && (
                                        <span className="inline-block px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md">
                                          High match
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                                      {source.readCount !== undefined && (
                                        <span>{source.readCount} reads</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedSource(source);
                                  }}
                                  className="flex-shrink-0 p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded mr-1 hover:cursor-pointer"
                                  title="View source details"
                                >
                                  <MessageCircle className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => {
                                    // Navigate to best practice detail page
                                    navigate(`/dashboard/best-practices/${source.id}`);
                                    onClose(); // Close the chat modal
                                  }}
                                  className="flex-shrink-0 p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded hover:cursor-pointer"
                                  title="View full best practice"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {!expandedSources.has(message.id) &&
                            message.context.totalSources > 2 && (
                              <p className="text-xs text-gray-500 dark:text-slate-500 italic">
                                ... and {message.context.totalSources - 2} more
                                sources
                              </p>
                            )}
                        </div>
                      </div>
                    )}
                    <span
                      className={`text-xs mt-2 block ${
                        message.isUser
                          ? "text-orange-100"
                          : "text-gray-500 dark:text-slate-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {message.isUser && (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-200 dark:border-slate-700">
          <div className="flex gap-3 items-end">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about pig farming practices..."
              className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-colors duration-200"
              rows={2}
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-slate-600 dark:disabled:to-slate-700 text-white rounded-xl px-6 py-3 min-w-[3rem] h-[3.5rem] transition-all duration-200 flex items-center justify-center hover:cursor-pointer disabled:cursor-not-allowed hover:shadow-lg"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-3">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Source Detail Modal */}
      {selectedSource && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Source Details
              </h3>
              <button
                onClick={() => setSelectedSource(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors hover:cursor-pointer"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {selectedSource.title}
              </h4>

              {selectedSource.description && (
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                  {selectedSource.description}
                </p>
              )}

              {selectedSource.categories &&
                selectedSource.categories.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Categories:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSource.categories.map((category) => (
                        <span
                          key={category}
                          className="inline-block px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-md"
                        >
                          {formatCategoryName(category)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 mb-4">
                <span>
                  Relevance:{" "}
                  {Math.round(selectedSource.relevanceScore * 10) / 10}
                </span>
                {selectedSource.readCount !== undefined && (
                  <span>{selectedSource.readCount} reads</span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex gap-2">
              <button
                onClick={() => {
                  navigate(`/dashboard/best-practices/${selectedSource.id}`);
                  setSelectedSource(null);
                  onClose(); // Close the chat modal
                }}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 hover:cursor-pointer"
              >
                <ExternalLink className="h-4 w-4" />
                View Full Article
              </button>
              <button
                onClick={() => setSelectedSource(null)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition-colors hover:cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
