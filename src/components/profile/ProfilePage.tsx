import { useState } from "react";
import {
  Edit3,
  Save,
  X,
  Shield,
  MapPin,
  Mail,
  User as UserIcon,
  Star,
  Calendar,
  CheckCircle,
  Building2,
  Crown,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { LocationSelector } from "@/components/ui/location-selector";
import { PasswordChangeModal } from "./password-change-modal";
import { useAppSelector } from "@/store/hooks";

// Extended User interface to match database
interface ExtendedUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  role: string;
  permissions: string[];
  organization?: string;
  province?: string;
  district?: string;
  sector?: string;
  points?: number;
  level_id?: number;
  is_verified?: boolean;
  is_locked?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Mock level data - simplified based on actual use case
const levelData = {
  1: { name: "Amateur", minPoints: 0, maxPoints: 99 },
  2: { name: "Knight", minPoints: 100, maxPoints: 199 },
  3: { name: "Expert", minPoints: 200, maxPoints: Infinity },
};

export function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);

  // Mock extended user data - this would be fetched from API
  const extendedUser: ExtendedUser = {
    ...user!,
    organization: "Valley",
    province: "North",
    district: "Gicumbi",
    sector: "Bwisige",
    points: 150,
    level_id: 2,
    is_verified: true,
    is_locked: false,
    created_at: "2025-07-18T14:32:47.982+02",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    firstname: extendedUser.firstname,
    lastname: extendedUser.lastname,
    email: extendedUser.email,
    province: extendedUser.province || "",
    district: extendedUser.district || "",
    sector: extendedUser.sector || "",
  });

  const currentLevel =
    levelData[extendedUser.level_id as keyof typeof levelData] || levelData[1];
  const currentPoints = extendedUser.points || 0;

  // Calculate progress percentage for current level
  const progressPercentage =
    currentLevel.name === "Expert"
      ? 100 // Expert is max level
      : ((currentPoints - currentLevel.minPoints) /
          (currentLevel.maxPoints - currentLevel.minPoints)) *
        100;

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form to original values when canceling
      setPersonalInfo({
        firstname: extendedUser.firstname,
        lastname: extendedUser.lastname,
        email: extendedUser.email,
        province: extendedUser.province || "",
        district: extendedUser.district || "",
        sector: extendedUser.sector || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = () => {
    // Here you would dispatch an action to update the user profile
    console.log("Saving profile:", personalInfo);
    setIsEditing(false);
    // TODO: Implement API call
  };

  const handlePasswordChange = (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    // Here you would dispatch an action to change password
    console.log("Changing password:", {
      currentPassword: "[HIDDEN]",
      newPassword: "[HIDDEN]",
    });
    setShowChangePassword(false);
    // TODO: Implement API call with data.currentPassword and data.newPassword
  };

  const handleLocationChange = (location: {
    province: string;
    district: string;
    sector: string;
  }) => {
    setPersonalInfo((prev) => ({
      ...prev,
      ...location,
    }));
  };

  const formatDate = (dateString: string) => {
    // Handle the format "2025-07-18T14:32:47.982+02" by creating a proper ISO string
    let isoString = dateString;

    // If the timezone offset doesn't have a colon (like +02 instead of +02:00), add it
    if (dateString.match(/[+-]\d{2}$/)) {
      isoString = dateString + ":00";
    }

    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      // Fallback: try to parse just the date part
      const datePart = dateString.split("T")[0];
      return new Date(datePart).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-4 md:p-6">
      <div className="container mx-auto max-w-6xl">
        <Card className="overflow-hidden shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          {/* Header Section with User Identity and Gamification */}
          <CardHeader className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white relative overflow-hidden">
            {/* Enhanced Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="relative z-10 flex flex-col xl:flex-row gap-6 items-start">
              {/* Avatar and Basic Info */}
              <div className="flex items-start gap-6 flex-1">
                <div className="relative">
                  <Avatar
                    size="xl"
                    fallback={`${extendedUser.firstname} ${extendedUser.lastname}`}
                    className="border-4 border-white/40 shadow-2xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-lg"
                  />
                  {extendedUser.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-3 border-white shadow-lg">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold mb-2 drop-shadow-sm">
                    {extendedUser.firstname} {extendedUser.lastname}
                  </h1>
                  <p className="text-white/90 font-semibold text-lg mb-3 drop-shadow-sm">
                    {extendedUser.role}
                  </p>

                  {/* Inline level display with member info */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Compact Level Badge */}
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full shadow-md text-sm font-medium ${
                        currentLevel.name === "Amateur"
                          ? "bg-slate-400/90"
                          : currentLevel.name === "Knight"
                          ? "bg-blue-500/90"
                          : "bg-yellow-500/90"
                      } text-white`}
                    >
                      {currentLevel.name === "Amateur" && (
                        <Star className="h-3 w-3" />
                      )}
                      {currentLevel.name === "Knight" && (
                        <Shield className="h-3 w-3" />
                      )}
                      {currentLevel.name === "Expert" && (
                        <Crown className="h-3 w-3" />
                      )}
                      <span>{currentLevel.name}</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                        {currentPoints} pts
                      </span>
                    </div>

                    {extendedUser.created_at && (
                      <span className="text-white/80 text-sm flex items-center gap-1 bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-md border border-white/20">
                        <Calendar className="h-3 w-3" />
                        Member since {formatDate(extendedUser.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Compact Progress Section */}
              <div className="w-full xl:w-64 bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg">
                {currentLevel.name !== "Expert" ? (
                  <div className="space-y-2">
                    <div className="text-center">
                      <div className="text-white/90 text-xs font-medium mb-1">
                        Progress to{" "}
                        {
                          levelData[
                            Math.min(
                              extendedUser.level_id! + 1,
                              3
                            ) as keyof typeof levelData
                          ]?.name
                        }
                      </div>
                      <div className="text-white font-bold text-sm">
                        {currentLevel.maxPoints - currentPoints + 1} points to
                        go
                      </div>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(progressPercentage, 8)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-white/60">
                      <span>{currentLevel.minPoints}</span>
                      <span>{currentLevel.maxPoints}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-yellow-200 text-sm font-bold mb-1">
                      Expert Level
                    </div>
                    <div className="text-white/80 text-xs">
                      Maximum level achieved!
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            <div className="grid xl:grid-cols-4 gap-6">
              {/* Personal Information Section - Takes more space */}
              <div className="xl:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                    Personal Information
                  </h2>
                  {!isEditing ? (
                    <Button
                      onClick={handleEditToggle}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md"
                      size="sm"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md"
                        size="sm"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        onClick={handleEditToggle}
                        variant="outline"
                        className="border-gray-300 hover:bg-gray-50"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {!isEditing ? (
                  /* Cleaner View Mode */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <Label className="text-sm font-medium text-orange-700 mb-1 block">
                          First Name
                        </Label>
                        <p className="text-lg font-medium text-gray-900">
                          {extendedUser.firstname}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <Label className="text-sm font-medium text-orange-700 mb-1 block">
                          Last Name
                        </Label>
                        <p className="text-lg font-medium text-gray-900">
                          {extendedUser.lastname}
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <Label className="text-sm font-medium text-blue-700 mb-2 block">
                        Email
                      </Label>
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <span className="text-lg font-medium text-gray-900">
                          {extendedUser.email}
                        </span>
                        {extendedUser.is_verified && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <Label className="text-sm font-medium text-slate-700 mb-2 block">
                        Organization
                      </Label>
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-slate-500" />
                        <span className="text-lg font-medium text-gray-900">
                          {extendedUser.organization}
                        </span>
                      </div>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <Label className="text-sm font-medium text-emerald-700 mb-2 block">
                        Location
                      </Label>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-emerald-500" />
                        <span className="text-lg font-medium text-gray-900">
                          {extendedUser.sector}, {extendedUser.district},{" "}
                          {extendedUser.province}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Simplified Edit Mode */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="firstname"
                          className="text-sm font-medium text-gray-700"
                        >
                          First Name
                        </Label>
                        <Input
                          id="firstname"
                          value={personalInfo.firstname}
                          onChange={(e) =>
                            setPersonalInfo((prev) => ({
                              ...prev,
                              firstname: e.target.value,
                            }))
                          }
                          className="focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="lastname"
                          className="text-sm font-medium text-gray-700"
                        >
                          Last Name
                        </Label>
                        <Input
                          id="lastname"
                          value={personalInfo.lastname}
                          onChange={(e) =>
                            setPersonalInfo((prev) => ({
                              ...prev,
                              lastname: e.target.value,
                            }))
                          }
                          className="focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) =>
                          setPersonalInfo((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <Label className="text-sm font-medium text-slate-700 mb-2 block">
                        Organization
                      </Label>
                      <div className="flex items-center gap-3 text-slate-600">
                        <Building2 className="h-5 w-5" />
                        <span>{extendedUser.organization} (Read-only)</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Location
                      </Label>
                      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                        <LocationSelector
                          province={personalInfo.province}
                          district={personalInfo.district}
                          sector={personalInfo.sector}
                          onLocationChange={handleLocationChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Points earning guide moved to bottom */}
                {!isEditing && (
                  <div className="mt-8 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                    <h3 className="text-sm font-medium text-orange-800 mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      How to Earn Points
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="text-center p-2 bg-white/60 rounded-lg">
                        <div className="text-green-600 font-bold">+5</div>
                        <div className="text-gray-700">New Post</div>
                      </div>
                      <div className="text-center p-2 bg-white/60 rounded-lg">
                        <div className="text-blue-600 font-bold">+3</div>
                        <div className="text-gray-700">Reply</div>
                      </div>
                      <div className="text-center p-2 bg-white/60 rounded-lg">
                        <div className="text-yellow-600 font-bold">+1</div>
                        <div className="text-gray-700">Reaction</div>
                      </div>
                      <div className="text-center p-2 bg-white/60 rounded-lg">
                        <div className="text-red-600 font-bold">-5</div>
                        <div className="text-gray-700">Violation</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Compact Security Section */}
              <div className="xl:col-span-1">
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    Security
                  </h2>

                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <h3 className="font-medium text-blue-800 mb-2 text-sm">
                        Password
                      </h3>
                      <Button
                        onClick={() => setShowChangePassword(true)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm"
                        size="sm"
                      >
                        Change Password
                      </Button>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h3 className="font-medium text-slate-800 mb-3 text-sm">
                        Account Status
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              extendedUser.is_verified
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span
                            className={
                              extendedUser.is_verified
                                ? "text-green-700"
                                : "text-red-600"
                            }
                          >
                            Email{" "}
                            {extendedUser.is_verified
                              ? "verified"
                              : "not verified"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              !extendedUser.is_locked
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span
                            className={
                              !extendedUser.is_locked
                                ? "text-green-700"
                                : "text-red-600"
                            }
                          >
                            Account{" "}
                            {extendedUser.is_locked ? "locked" : "active"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Change Modal */}
        <PasswordChangeModal
          isOpen={showChangePassword}
          onClose={() => setShowChangePassword(false)}
          onSubmit={handlePasswordChange}
        />
      </div>
    </div>
  );
}
