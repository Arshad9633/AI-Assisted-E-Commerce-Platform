import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ADMIN_BASE } from "../../config/routes";

export default function GuestRoute({ children }) {
  const { isAuthenticated, roles } = useAuth();

  if (isAuthenticated) {
    if (roles?.includes("ADMIN")) {
      return <Navigate to={ADMIN_BASE} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
