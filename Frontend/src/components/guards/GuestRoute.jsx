import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ADMIN_BASE, USER_BASE } from "../../config/routes";

const targetFor = (user) =>
  user?.roles?.includes("ADMIN") ? ADMIN_BASE : USER_BASE;

export default function GuestRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to={targetFor(user)} replace /> : children;
}
