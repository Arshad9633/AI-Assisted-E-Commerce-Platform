import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ADMIN_BASE } from "../config/routes";

export default function AdminNavBar() {
  const { email, roles, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const isAdmin = roles?.includes("ADMIN");
  if (!isAuthenticated || !isAdmin) return null;

  const linkBase =
    "px-3 py-2 rounded-md text-sm font-medium outline-none focus:ring-2 focus:ring-white/50";
  const linkActive = "bg-gray-900 text-white";
  const linkInactive = "text-gray-200 hover:bg-gray-700 hover:text-white";

  const doLogout = () => {
    logout();
    navigate("/signin", { replace: true });
  };

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Left: Brand + mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              className="sm:hidden p-2 rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-white/50"
              onClick={() => setOpen(v => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
              aria-controls="admin-mobile-menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to={ADMIN_BASE} className="text-lg font-semibold">
              Admin Panel
            </Link>
          </div>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-2">
            <NavLink
              to={ADMIN_BASE}
              end
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to={`${ADMIN_BASE}/users`}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Users
            </NavLink>
            <NavLink
              to={`${ADMIN_BASE}/settings`}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Settings
            </NavLink>
          </div>

          {/* Right: email + logout */}
          <div className="hidden sm:flex items-center gap-3">
            {email && <span className="text-xs text-gray-300">{email}</span>}
            <button
              onClick={doLogout}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium hover:bg-red-700 focus:ring-2 focus:ring-white/50"
              title="Sign out"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div id="admin-mobile-menu" className="sm:hidden border-t border-gray-700">
          <div className="space-y-1 p-3">
            <NavLink
              to={ADMIN_BASE}
              end
              className={({ isActive }) =>
                `block ${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to={`${ADMIN_BASE}/users`}
              className={({ isActive }) =>
                `block ${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Users
            </NavLink>
            <NavLink
              to={`${ADMIN_BASE}/settings`}
              className={({ isActive }) =>
                `block ${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Settings
            </NavLink>

            <div className="pt-2">
              <button
                onClick={doLogout}
                className="w-full rounded-md bg-red-600 px-3 py-2 text-sm font-medium hover:bg-red-700 focus:ring-2 focus:ring-white/50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
