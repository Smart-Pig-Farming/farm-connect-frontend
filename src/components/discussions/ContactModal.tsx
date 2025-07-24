import { useState } from "react";
import { X, Copy, Check, User, MapPin, Mail, Phone } from "lucide-react";

interface Author {
  id: string;
  firstname: string;
  lastname: string;
  avatar: string | null;
  level_id: number;
  points: number;
  location: string;
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  author: Author;
  postTitle: string;
}

export function ContactModal({
  isOpen,
  onClose,
  author,
  postTitle,
}: ContactModalProps) {
  const [copiedItems, setCopiedItems] = useState<{ [key: string]: boolean }>(
    {}
  );

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedItems((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const fullName = `${author.firstname} ${author.lastname}`;
  const mockEmail = `${author.firstname.toLowerCase()}.${author.lastname.toLowerCase()}@farmconnect.com`;
  const mockPhone = `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${
    Math.floor(Math.random() * 9000) + 1000
  }`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Contact</h2>
            <p className="text-sm text-gray-600 mt-1">
              Market Listing: {postTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Section */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {fullName}
              </h3>
              <div className="flex items-center gap-1 text-gray-600 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{author.location}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {author.points} points • Level {author.level_id}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-lg mb-4">
              Contact Information
            </h4>

            {/* Name */}
            <div className="group">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Full Name
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 group-hover:border-gray-300 transition-colors">
                <User className="h-4 w-4 text-gray-500" />
                <span className="flex-1 text-gray-900">{fullName}</span>
                <button
                  onClick={() => copyToClipboard(fullName, "name")}
                  className="p-1.5 hover:bg-gray-200 rounded-md transition-colors duration-200"
                >
                  {copiedItems.name ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="group">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Email
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 group-hover:border-gray-300 transition-colors">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="flex-1 text-gray-900">{mockEmail}</span>
                <button
                  onClick={() => copyToClipboard(mockEmail, "email")}
                  className="p-1.5 hover:bg-gray-200 rounded-md transition-colors duration-200"
                >
                  {copiedItems.email ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Phone */}
            <div className="group">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Phone
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 group-hover:border-gray-300 transition-colors">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="flex-1 text-gray-900">{mockPhone}</span>
                <button
                  onClick={() => copyToClipboard(mockPhone, "phone")}
                  className="p-1.5 hover:bg-gray-200 rounded-md transition-colors duration-200"
                >
                  {copiedItems.phone ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Location */}
            <div className="group">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Location
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 group-hover:border-gray-300 transition-colors">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="flex-1 text-gray-900">{author.location}</span>
                <button
                  onClick={() => copyToClipboard(author.location, "location")}
                  className="p-1.5 hover:bg-gray-200 rounded-md transition-colors duration-200"
                >
                  {copiedItems.location ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-sm text-emerald-800">
              <strong>Note:</strong> Please be respectful when contacting
              people. All communications should be related to the market
              listing.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
