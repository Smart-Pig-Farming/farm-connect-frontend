import { useState } from "react";
import {
  Edit3,
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
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { PasswordChangeModal } from "@/components/profile/password-change-modal";
import { ProfileEditModal } from "@/components/profile/profile-edit-modal";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  useChangePasswordMutation,
  useUpdateProfileMutation,
} from "@/store/api/authApi";
import { setCredentials } from "@/store/slices/authSlice";
import type { User } from "@/types";
import { toast } from "sonner";

// Mock level data - simplified based on actual use case
const levelData = {
  1: { name: "Amateur", minPoints: 0, maxPoints: 99 },
  2: { name: "Knight", minPoints: 100, maxPoints: 199 },
  3: { name: "Expert", minPoints: 200, maxPoints: Infinity },
};

export function ProfilePage() {
  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();

  // Use real user data from auth store
  const currentUser: User = user!;

  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const currentLevel =
    levelData[currentUser.level_id as keyof typeof levelData] || levelData[1];
  const currentPoints = currentUser.points || 0;

  // Calculate progress percentage for current level
  const progressPercentage =
    currentLevel.name === "Expert"
      ? 100 // Expert is max level
      : ((currentPoints - currentLevel.minPoints) /
          (currentLevel.maxPoints - currentLevel.minPoints)) *
        100;

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async (data: {
    firstname: string;
    lastname: string;
    email: string;
    province: string;
    district: string;
    sector: string;
  }) => {
    try {
      const result = await updateProfile(data).unwrap();

      // Update user data in store with the response from backend
      if (result.data?.user && token) {
        dispatch(
          setCredentials({
            user: result.data.user,
            token: token,
          })
        );
      }

      toast.success("Profile updated successfully", {
        description: "Your profile information has been updated.",
      });

      setIsEditing(false);
    } catch (error: unknown) {
      console.error("Profile update error:", error);

      let errorMessage = "Failed to update profile. Please try again.";

      if (error && typeof error === "object" && "data" in error) {
        const errorData = error as { data?: { error?: string } };
        if (errorData.data?.error) {
          errorMessage = errorData.data.error;
        }
      }

      toast.error("Profile update failed", {
        description: errorMessage,
      });
    }
  };

  const handlePasswordChange = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      await changePassword({
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.newPassword, // Frontend already validates this
      }).unwrap();

      toast.success("Password changed successfully", {
        description: "Your password has been updated.",
      });

      setShowChangePassword(false);
    } catch (error: unknown) {
      console.error("Password change error:", error);

      let errorMessage = "Failed to change password. Please try again.";

      if (error && typeof error === "object" && "data" in error) {
        const errorData = error as { data?: { error?: string } };
        if (errorData.data?.error) {
          errorMessage = errorData.data.error;
        }
      }

      toast.error("Password change failed", {
        description: errorMessage,
      });
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-2 sm:p-4 md:p-6 overflow-x-hidden">
      <div className="container mx-auto max-w-6xl">
        <Card className="overflow-hidden shadow-2xl border-0 bg-white/80 backdrop-blur-sm w-full">
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

            <div className="relative z-10 flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 sm:gap-6">
              {/* Avatar and Basic Info */}
              <div className="w-full lg:flex-1 flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="relative flex-shrink-0">
                  <Avatar
                    fallback={`${currentUser.firstname} ${currentUser.lastname}`}
                    className="border-4 border-white/40 shadow-2xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-lg w-16 h-16 sm:w-20 sm:h-20"
                  />
                  {currentUser.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-3 border-white shadow-lg">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 drop-shadow-sm break-words">
                    {currentUser.firstname} {currentUser.lastname}
                  </h1>
                  <p className="text-white/90 font-semibold text-base sm:text-lg mb-3 drop-shadow-sm">
                    {currentUser.role}
                  </p>

                  {/* Inline level display with member info */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {/* Compact Level Badge */}
                    <div
                      className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md text-xs sm:text-sm font-medium ${
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
                      <span className="whitespace-nowrap">
                        {currentLevel.name}
                      </span>
                      <span className="bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                        {currentPoints} pts
                      </span>
                    </div>

                    {currentUser.created_at && (
                      <span className="text-white/80 text-xs sm:text-sm flex items-center gap-1 bg-white/15 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-sm shadow-md border border-white/20">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="whitespace-nowrap text-xs sm:text-sm">
                          <span className="hidden sm:inline">
                            Member since{" "}
                          </span>
                          <span className="sm:hidden">Since </span>
                          {formatDate(currentUser.created_at)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Compact Progress Section */}
              <div className="w-full lg:w-80 xl:w-72 bg-white/15 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/20 shadow-lg lg:flex-shrink-0">
                {currentLevel.name !== "Expert" ? (
                  <div className="space-y-2">
                    <div className="text-center">
                      <div className="text-white/90 text-xs lg:text-sm font-medium mb-1">
                        <span className="hidden sm:inline">Progress to </span>
                        <span className="sm:hidden">To </span>
                        {
                          levelData[
                            Math.min(
                              currentUser.level_id! + 1,
                              3
                            ) as keyof typeof levelData
                          ]?.name
                        }
                      </div>
                      <div className="text-white font-bold text-xs sm:text-sm lg:text-base">
                        {currentLevel.maxPoints - currentPoints + 1}
                        <span className="hidden sm:inline"> points to go</span>
                        <span className="sm:hidden"> pts to go</span>
                      </div>
                    </div>
                    <div className="h-2 lg:h-3 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(progressPercentage, 8)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs lg:text-sm text-white/60">
                      <span>{currentLevel.minPoints}</span>
                      <span>{currentLevel.maxPoints}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-yellow-200 text-sm lg:text-base font-bold mb-1">
                      Expert Level
                    </div>
                    <div className="text-white/80 text-xs lg:text-sm">
                      Maximum level achieved!
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
              {/* Personal Information Section - Takes more space */}
              <div className="xl:col-span-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <div className="bg-orange-500 p-1.5 sm:p-2 rounded-lg">
                      <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <span className="text-base sm:text-xl">
                      Personal Information
                    </span>
                  </h2>
                  <Button
                    onClick={handleEditToggle}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md self-start sm:self-auto"
                    size="sm"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    <span className="text-sm">Edit</span>
                  </Button>
                </div>

                {/* View Mode */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-orange-50 p-3 sm:p-4 rounded-xl border border-orange-100">
                      <Label className="text-sm font-medium text-orange-700 mb-1 block">
                        First Name
                      </Label>
                      <p className="text-base sm:text-lg font-medium text-gray-900 break-words">
                        {currentUser.firstname}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-3 sm:p-4 rounded-xl border border-orange-100">
                      <Label className="text-sm font-medium text-orange-700 mb-1 block">
                        Last Name
                      </Label>
                      <p className="text-base sm:text-lg font-medium text-gray-900 break-words">
                        {currentUser.lastname}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-100">
                    <Label className="text-sm font-medium text-blue-700 mb-2 block">
                      Email
                    </Label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                        <span className="text-sm sm:text-lg font-medium text-gray-900 break-all">
                          {currentUser.email}
                        </span>
                      </div>
                      {currentUser.is_verified && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 self-start sm:self-auto">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100">
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      Organization
                    </Label>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 flex-shrink-0" />
                      <span className="text-sm sm:text-lg font-medium text-gray-900 break-words">
                        {currentUser.organization}
                      </span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-3 sm:p-4 rounded-xl border border-emerald-100">
                    <Label className="text-sm font-medium text-emerald-700 mb-2 block">
                      Location
                    </Label>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-lg font-medium text-gray-900 break-words">
                        {currentUser.sector}, {currentUser.district},{" "}
                        {currentUser.province}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Points earning guide */}
                <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                  <h3 className="text-xs sm:text-sm font-medium text-orange-800 mb-3 flex items-center gap-2">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                    How to Earn Points
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
                    <div className="text-center p-2 bg-white/60 rounded-lg">
                      <div className="text-green-600 font-bold text-sm">+5</div>
                      <div className="text-gray-700 text-xs">New Post</div>
                    </div>
                    <div className="text-center p-2 bg-white/60 rounded-lg">
                      <div className="text-blue-600 font-bold text-sm">+3</div>
                      <div className="text-gray-700 text-xs">Reply</div>
                    </div>
                    <div className="text-center p-2 bg-white/60 rounded-lg">
                      <div className="text-yellow-600 font-bold text-sm">
                        +1
                      </div>
                      <div className="text-gray-700 text-xs">Reaction</div>
                    </div>
                    <div className="text-center p-2 bg-white/60 rounded-lg">
                      <div className="text-red-600 font-bold text-sm">-5</div>
                      <div className="text-gray-700 text-xs">Violation</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Security Section */}
              <div className="xl:col-span-1">
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                    <div className="bg-blue-500 p-1.5 sm:p-2 rounded-lg">
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <span className="text-base sm:text-lg">Security</span>
                  </h2>

                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-100">
                      <h3 className="font-medium text-blue-800 mb-2 text-xs sm:text-sm">
                        Password
                      </h3>
                      <Button
                        onClick={() => setShowChangePassword(true)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm"
                        size="sm"
                      >
                        Change Password
                      </Button>
                    </div>

                    <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100">
                      <h3 className="font-medium text-slate-800 mb-3 text-xs sm:text-sm">
                        Account Status
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              currentUser.is_verified
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span
                            className={`break-words ${
                              currentUser.is_verified
                                ? "text-green-700"
                                : "text-red-600"
                            }`}
                          >
                            Email{" "}
                            {currentUser.is_verified
                              ? "verified"
                              : "not verified"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              !currentUser.is_locked
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span
                            className={`break-words ${
                              !currentUser.is_locked
                                ? "text-green-700"
                                : "text-red-600"
                            }`}
                          >
                            Account{" "}
                            {currentUser.is_locked ? "locked" : "active"}
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
          isLoading={isChangingPassword}
        />

        {/* Profile Edit Modal */}
        <ProfileEditModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSubmit={handleSaveProfile}
          isLoading={isUpdatingProfile}
          initialData={{
            firstname: currentUser.firstname,
            lastname: currentUser.lastname,
            email: currentUser.email,
            province: currentUser.province || "",
            district: currentUser.district || "",
            sector: currentUser.sector || "",
          }}
        />
      </div>
    </div>
  );
}
