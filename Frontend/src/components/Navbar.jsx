import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChevronDown, ShoppingCart } from "lucide-react";
import axios from "axios";

export default function Navbar() {
  const { name, email, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const [openMen, setOpenMen] = useState(false);
  const [openWomen, setOpenWomen] = useState(false);

  const [categories, setCategories] = useState([]);

  const menCategories = categories.filter((c) => c.gender === "MEN");
  const womenCategories = categories.filter((c) => c.gender === "WOMEN");

  const displayName =
    name?.toUpperCase() || (email ? email.split("@")[0].toUpperCase() : "");

  // Fetch categories for navbar
  useEffect(() => {
  axios
    .get("/api/catalog/categories")
    .then((res) => {
      console.log("CATEGORIES:", res.data);
      setCategories(res.data);
    })
    .catch((err) => {
      console.error("CATEGORY ERROR:", err);
      setCategories([]); // Prevent crash
    });
}, []);


  // Detect scroll for navbar background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
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
      ? "bg-white/90 backdrop-blur-lg shadow-md"
      : "bg-white/10 backdrop-blur-xl");

  const closeAllMenus = () => {
    setOpenMobile(false);
    setOpenMen(false);
    setOpenWomen(false);
  };

  // Convert category to URL slug
  const toSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

  return (
    <header className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={closeAllMenus}
            className="
              text-3xl font-serif tracking-tight
              bg-gradient-to-r from-indigo-700 to-purple-700
              bg-clip-text text-transparent
              transition-all duration-300
              hover:scale-105 hover:opacity-90
            "
          >
            B & M
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">

            {/* MEN */}
            <div className="relative">
              <button
                className="flex items-center gap-1 text-sm font-medium text-gray-800 hover:text-indigo-600"
                onClick={() => {
                  setOpenMen((v) => !v);
                  setOpenWomen(false);
                }}
              >
                Men <ChevronDown className="h-4 w-4" />
              </button>

              {openMen && (
                <div className="absolute top-full mt-3 w-64 p-4 rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl border border-white/40 z-[999]">
                  <h3 className="px-2 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Men's Categories
                  </h3>

                  <div className="space-y-1">
                    {menCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/products/men/${toSlug(cat.name)}`}
                        className="block px-3 py-2 rounded-lg text-sm text-gray-800 hover:bg-indigo-50"
                        onClick={closeAllMenus}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* WOMEN */}
            <div className="relative">
              <button
                className="flex items-center gap-1 text-sm font-medium text-gray-800 hover:text-indigo-600"
                onClick={() => {
                  setOpenWomen((v) => !v);
                  setOpenMen(false);
                }}
              >
                Women <ChevronDown className="h-4 w-4" />
              </button>

              {openWomen && (
                <div className="absolute top-full mt-3 w-64 p-4 rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl border border-white/40 z-[999]">
                  <h3 className="px-2 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Women’s Categories
                  </h3>

                  <div className="space-y-1">
                    {womenCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/products/women/${toSlug(cat.name)}`}
                        className="block px-3 py-2 rounded-lg text-sm text-gray-800 hover:bg-indigo-50"
                        onClick={closeAllMenus}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="flex items-center gap-2 text-gray-800 hover:text-indigo-600"
              onClick={closeAllMenus}
            >
              <ShoppingCart className="h-5 w-5" /> Cart
            </Link>

            {/* Auth */}
            {!isAuthenticated ? (
              <>
                <Link
                  to="/signin"
                  className="text-sm font-medium hover:text-indigo-600"
                  onClick={closeAllMenus}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow"
                  onClick={closeAllMenus}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <span className="text-sm font-medium text-gray-700">
                  Hello,
                  <span className="font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ml-1">
                    {displayName}
                  </span>
                </span>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 hover:bg-gray-200"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 text-gray-700"
            onClick={() => setOpenMobile((v) => !v)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor">
              <path strokeWidth="2" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        {openMobile && (
          <div className="md:hidden border-t border-gray-200 bg-white/90 backdrop-blur pb-3">
            <div className="pt-2 space-y-1">

              {/* MEN */}
              <button
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                onClick={() => {
                  setOpenMen((v) => !v);
                  setOpenWomen(false);
                }}
              >
                Men
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openMen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openMen && (
                <div className="pl-4 pb-2 space-y-1">
                  {menCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products/men/${toSlug(cat.name)}`}
                      className="block px-3 py-2 rounded-lg text-sm text-gray-800 hover:bg-gray-100"
                      onClick={closeAllMenus}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* WOMEN */}
              <button
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                onClick={() => {
                  setOpenWomen((v) => !v);
                  setOpenMen(false);
                }}
              >
                Women
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openWomen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openWomen && (
                <div className="pl-4 pb-2 space-y-1">
                  {womenCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products/women/${toSlug(cat.name)}`}
                      className="block px-3 py-2 rounded-lg text-sm text-gray-800 hover:bg-gray-100"
                      onClick={closeAllMenus}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                onClick={closeAllMenus}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
              >
                <ShoppingCart className="h-5 w-5" />
                Cart
              </Link>

              {/* Auth */}
              {!isAuthenticated ? (
                <div className="flex gap-2 px-3 pt-2">
                  <Link
                    to="/signin"
                    className="flex-1 text-center rounded-full border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                    onClick={closeAllMenus}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="flex-1 text-center rounded-full bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    onClick={closeAllMenus}
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="px-3 pt-2 space-y-1">
                  <p className="text-xs text-gray-600">
                    Logged in as{" "}
                    <span className="font-semibold text-gray-900">
                      {displayName}
                    </span>
                  </p>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeAllMenus();
                    }}
                    className="w-full rounded-full bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
