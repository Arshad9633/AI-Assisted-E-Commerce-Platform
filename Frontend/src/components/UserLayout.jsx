import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { USER_BASE } from "../config/routes";

export default function UserLayout() {
  const { email, logout } = useAuth();
  const navigate = useNavigate();

  const link = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm ${isActive ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to={USER_BASE} className="text-lg font-semibold">ShopMate</Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">{email}</span>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto max-w-6xl px-4 pb-3 flex gap-2">
          <NavLink to={USER_BASE} end className={link}>Dashboard</NavLink>
          <NavLink to={`${USER_BASE}/orders`} className={link}>Orders</NavLink>
          <NavLink to={`${USER_BASE}/profile`} className={link}>Profile</NavLink>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
