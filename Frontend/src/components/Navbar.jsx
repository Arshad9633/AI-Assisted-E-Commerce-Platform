import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShoppingCart } from "lucide-react";

export default function Navbar() {
  const { name, email, roles, isAuthenticated, logout } = useAuth();
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

  const displayName = (name || (email ? email.split("@")[0] : "")).toUpperCase();

  const navClass =
    "fixed inset-x-0 top-0 z-50 transition-all " +
    (scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-white/10 backdrop-blur-xl");

  const NavLink = ({ to, children, className = "" }) => (
    <Link
      to={to}
      className={`text-sm font-medium text-gray-700 hover:text-indigo-600 ${className}`}
      onClick={() => setOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <header className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="h-16 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            E-Commerce
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">

            {/* Guest */}
            {!isAuthenticated && (
              <>
                <NavLink to="/signin">Sign In</NavLink>

                <Link
                  to="/signup"
                  className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white 
                             bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Logged-in */}
            {isAuthenticated && (
              <>
                {/* Username (gradient) */}
                <span className="text-sm text-gray-800 flex items-center gap-1">
                  Hello,
                  <span
                    className="font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 
                               bg-clip-text text-transparent uppercase tracking-wide"
                  >
                    {displayName}
                  </span>
                </span>

                {/* Cart */}
                <NavLink to="/cart" className="flex items-center gap-1">
                  <ShoppingCart className="h-5 w-5 text-gray-700 hover:text-indigo-600" />
                  Cart
                </NavLink>

                {/* Admin Panel */}
                {roles?.includes("ADMIN") && (
                  <NavLink to="/home/admin">Admin Panel</NavLink>
                )}

                {/* Logout (gradient button) */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold 
                             bg-gradient-to-r from-red-500 to-pink-500 text-white shadow 
                             hover:from-red-600 hover:to-pink-600 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(!open)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-3 border-t border-gray-200 pt-3">

              {/* Guest */}
              {!isAuthenticated && (
                <>
                  <NavLink to="/signin">Sign In</NavLink>

                  <Link
                    to="/signup"
                    className="inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-semibold 
                               text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {/* Logged-in */}
              {isAuthenticated && (
                <>
                  {/* Username */}
                  <span className="text-sm text-gray-800 flex items-center gap-1">
                    Hello,
                    <span
                      className="font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 
                                 bg-clip-text text-transparent uppercase tracking-wide"
                    >
                      {displayName}
                    </span>
                  </span>

                  <NavLink to="/cart" className="flex items-center gap-1">
                    <ShoppingCart className="h-5 w-5" />
                    Cart
                  </NavLink>

                  {roles?.includes("ADMIN") && <NavLink to="/home/admin">Admin Panel</NavLink>}

                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold 
                               bg-gradient-to-r from-red-500 to-pink-500 text-white shadow 
                               hover:from-red-600 hover:to-pink-600 transition"
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
