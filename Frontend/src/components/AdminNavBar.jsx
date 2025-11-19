import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ADMIN_BASE } from "../config/routes";

export default function AdminNavBar() {
  const { email, roles, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const isAdmin = roles?.includes("ADMIN");
  if (!isAuthenticated || !isAdmin) return null;

  const baseStyle =
    "px-3 py-2 rounded-md text-sm font-medium outline-none focus:ring-2 focus:ring-white/40";
  const activeStyle = "bg-gray-900 text-white";
  const inactiveStyle = "text-gray-200 hover:bg-gray-700 hover:text-white";

  const doLogout = () => {
    logout();
    navigate("/signin", { replace: true });
  };

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          
          {/* LEFT — Logo + Mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              className="sm:hidden p-2 rounded-md hover:bg-gray-700"
              onClick={() => setOpen((v) => !v)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link to={ADMIN_BASE} className="text-lg font-bold">
              Admin Panel
            </Link>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden sm:flex items-center gap-2">

            <NavLink
              to={ADMIN_BASE}
              end
              className={({ isActive }) => 
                `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to={`${ADMIN_BASE}/users`}
              className={({ isActive }) => 
                `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
              }
            >
              Users
            </NavLink>

            {/* ⭐ Catalog (Add categories, etc.) */}
            <NavLink
              to={`${ADMIN_BASE}/catalog`}
              className={({ isActive }) => 
                `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
              }
            >
              Catalog
            </NavLink>

            {/* ⭐ NEW PRODUCTS PAGE */}
            <NavLink
              to={`${ADMIN_BASE}/products`}
              className={({ isActive }) =>
                `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
              }
            >
              Products
            </NavLink>

            <NavLink
              to={`${ADMIN_BASE}/settings`}
              className={({ isActive }) => 
                `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
              }
            >
              Settings
            </NavLink>
          </div>

          {/* RIGHT — Email + Logout */}
          <div className="hidden sm:flex items-center gap-3">
            {email && (
              <span className="text-xs text-gray-300">{email}</span>
            )}
            <button
              onClick={doLogout}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="sm:hidden border-t border-gray-700">
          <div className="space-y-1 p-3">

            <NavLink
              to={ADMIN_BASE}
              end
              className={({ isActive }) =>
                `block ${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to={`${ADMIN_BASE}/users`}
              className={({ isActive }) =>
                `block ${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
              }
            >
              Users
            </NavLink>

            <NavLink
              to={`${ADMIN_BASE}/catalog`}
              className={({ isActive }) =>
                `block ${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
              }
            >
              Catalog
            </NavLink>

            {/* ⭐ NEW PRODUCTS PAGE in mobile menu */}
            <NavLink
              to={`${ADMIN_BASE}/products`}
              className={({ isActive }) =>
                `block ${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
              }
            >
              Products
            </NavLink>

            <NavLink
              to={`${ADMIN_BASE}/settings`}
              className={({ isActive }) =>
                `block ${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
              }
            >
              Settings
            </NavLink>

            <button
              onClick={doLogout}
              className="w-full rounded-md bg-red-600 px-3 py-2 text-sm font-medium hover:bg-red-700 mt-2"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
