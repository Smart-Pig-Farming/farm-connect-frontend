import { type ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useGetCurrentUserQuery } from "@/store/api/authApi";
import { setUser, logout } from "@/store/slices/authSlice";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isChecking, setIsChecking] = useState(true);

  // Query to verify authentication via HttpOnly cookies
  const {
    data: currentUserData,
    isLoading,
    isSuccess,
    isError,
  } = useGetCurrentUserQuery();

  useEffect(() => {
    if (isSuccess && currentUserData?.success) {
      // User is authenticated, update Redux state
      dispatch(setUser(currentUserData.data));
      setIsChecking(false);
    } else if (isError) {
      // Authentication failed, clear any stale state
      console.log("Authentication failed, clearing state and redirecting");
      dispatch(logout());
      setIsChecking(false);
    }
  }, [isSuccess, isError, currentUserData, dispatch]);

  console.log("ProtectedRoute check:", {
    hasUser: !!user,
    isLoading,
    isSuccess,
    isError,
    isChecking,
    location: location.pathname,
  });

  // Show loading while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If authentication check failed or no user, redirect to signin
  if (isError || !user) {
    console.log("Redirecting to signin from:", location.pathname);
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
