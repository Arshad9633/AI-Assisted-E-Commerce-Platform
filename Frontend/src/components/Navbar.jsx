import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const navClass =
    "fixed inset-x-0 top-0 z-50 transition-all " +
    (scrolled
      ? "bg-white/80 backdrop-blur-md shadow-sm"
      : "bg-white/10 backdrop-blur-xl");

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className="text-sm font-medium text-gray-700 hover:text-indigo-600"
      onClick={() => setOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <header className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="h-16 flex items-center justify-between">
          {/* Brand */}
          <Link
            to="/"
            className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            onClick={() => setOpen(false)}
          >
            E-Commerce 
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {!user && (
              <>
                <NavLink to="/signin">Sign In</NavLink>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}

            {user && (
              <>
                <span className="text-sm text-gray-700">
                  Hello, <span className="font-semibold">{user.name}</span>
                </span>

                {user.roles?.includes("USER") && (
                  <>
                    <NavLink to="/profile">Profile</NavLink>
                    <NavLink to="/cart">Cart</NavLink>
                  </>
                )}

                {user.roles?.includes("ADMIN") && (
                  <NavLink to="/admin">Admin Panel</NavLink>
                )}

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {/* simple hamburger */}
            <svg width="24" height="24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </nav>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-3 border-t border-gray-200 pt-3">
              {!user && (
                <>
                  <NavLink to="/signin">Sign In</NavLink>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className="inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {user && (
                <>
                  <div className="text-sm text-gray-700">
                    Hello, <span className="font-semibold">{user.name}</span>
                  </div>

                  {user.roles?.includes("USER") && (
                    <>
                      <NavLink to="/profile">Profile</NavLink>
                      <NavLink to="/cart">Cart</NavLink>
                    </>
                  )}

                  {user.roles?.includes("ADMIN") && (
                    <NavLink to="/admin">Admin Panel</NavLink>
                  )}

                  <button
                    onClick={handleLogout}
                    className="inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
