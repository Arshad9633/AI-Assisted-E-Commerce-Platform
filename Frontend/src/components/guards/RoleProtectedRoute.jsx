import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RoleProtectedRoute({ allowedRoles = [], children }) {
  const { isAuthenticated, hasAnyRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (!hasAnyRole(allowedRoles)) {
    // Non-admin users should be sent back home
    return <Navigate to="/" replace />;
  }

  // Allow nested routes
  return children ?? <Outlet />;
}
