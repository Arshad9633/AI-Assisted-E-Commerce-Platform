import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RoleProtectedRoute({ allowedRoles = [], children }) {
  const { isAuthenticated, hasAnyRole } = useAuth();
  const location = useLocation();

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  // Logged in but does NOT have required roles
  if (!hasAnyRole(allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  // All OK → allow access
  return children ?? <Outlet />;
}
