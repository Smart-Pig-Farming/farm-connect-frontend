import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const token = useAppSelector((state) => state.auth.token);

  // Check if user is authenticated by verifying auth state and token
  if (!isAuthenticated || !token) {
    // Redirect to signin with return url
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
