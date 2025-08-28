import { Navigate } from "react-router-dom";
import { getUser } from "../lib/auth";

export default function RoleProtectedRoute({ allowedRoles, children }) {
  const user = getUser();

  // If no user or no roles, redirect to login
  if (!user || !user.roles) {
    return <Navigate to="/signin" replace />;
  }

  // Check if user's roles intersect with allowed roles
  const hasAccess = user.roles.some(role => allowedRoles.includes(role));

  return hasAccess ? children : <Navigate to="/dashboard" replace />;
}
