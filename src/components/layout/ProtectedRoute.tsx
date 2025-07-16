import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();

  // TODO: Replace with actual authentication check
  // For now, we'll assume user is authenticated
  // In a real app, you'd check authentication state from your store/context
  const isAuthenticated = true; // This should come from your auth state

  if (!isAuthenticated) {
    // Redirect to signin with return url
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
