import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShoppingCart,
  ChevronDown,
  Shirt,
  Handbag,
  Watch,
  Sparkles,
  Footprints,
  Dumbbell,
} from "lucide-react";

export default function Navbar() {
  const { name, email, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const [openMen, setOpenMen] = useState(false);
  const [openWomen, setOpenWomen] = useState(false);

  const displayName =
    name?.toUpperCase() || (email ? email.split("@")[0].toUpperCase() : "");

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
      ? "bg-white/90 backdrop-blur-lg shadow-md"
      : "bg-white/10 backdrop-blur-xl");

  const ProductLink = ({ to, Icon, label, closeAll }) => (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/90 transition-all cursor-pointer group"
      onClick={() => {
        closeAll?.();
      }}
    >
      <Icon className="h-5 w-5 text-gray-600 group-hover:text-indigo-600" />
      <span className="text-sm font-medium text-gray-800 group-hover:text-indigo-700">
        {label}
      </span>
    </Link>
  );

  const closeAllMenus = () => {
    setOpenMen(false);
    setOpenWomen(false);
    setOpenMobile(false);
  };

  return (
    <header className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* NAVBAR */}
        <nav className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            E-Commerce
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8">
            {/* MEN MEGAMENU (click to open) */}
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
                <div className="absolute top-full mt-3 w-[500px] p-4 rounded-2xl bg-white/70 backdrop-blur-2xl shadow-xl border border-white/40 animate-mega z-[999]">
                  <h3 className="px-2 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Men&apos;s Categories
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <ProductLink
                      to="/products/men/shoes"
                      Icon={Footprints}
                      label="Shoes"
                      closeAll={closeAllMenus}
                    />
                    <ProductLink
                      to="/products/men/clothing"
                      Icon={Shirt}
                      label="Clothing"
                      closeAll={closeAllMenus}
                    />
                    <ProductLink
                      to="/products/men/bags"
                      Icon={Handbag}
                      label="Bags"
                      closeAll={closeAllMenus}
                    />
                    <ProductLink
                      to="/products/men/accessories"
                      Icon={Sparkles}
                      label="Accessories"
                      closeAll={closeAllMenus}
                    />
                    <ProductLink
                      to="/products/men/watches"
                      Icon={Watch}
                      label="Watches"
                      closeAll={closeAllMenus}
                    />
                    <ProductLink
                      to="/products/men/sportswear"
                      Icon={Dumbbell}
                      label="Sportswear"
                      closeAll={closeAllMenus}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* WOMEN MEGAMENU (click to open) */}
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
                <div className="absolute top-full mt-3 w-[500px] p-4 rounded-2xl bg-white/70 backdrop-blur-2xl shadow-xl border border-white/40 animate-mega z-[999]">
                  <h3 className="px-2 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Women&apos;s Categories
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <ProductLink
                      to="/products/women/shoes"
                      Icon={Footprints}
                      label="Shoes"
                      closeAll={closeAllMenus}
                    />
                    <ProductLink
                      to="/products/women/clothing"
                      Icon={Shirt}
                      label="Clothing"
                      closeAll={closeAllMenus}
                    />
                    <ProductLink
                      to="/products/women/bags"
                      Icon={Handbag}
                      label="Bags"
                      closeAll={closeAllMenus}
                    />
                    <ProductLink
                      to="/products/women/accessories"
                      Icon={Sparkles}
                      label="Accessories"
                      closeAll={closeAllMenus}
                    />
                    <ProductLink
                      to="/products/women/watches"
                      Icon={Watch}
                      label="Watches"
                      closeAll={closeAllMenus}
                    />
                    <ProductLink
                      to="/products/women/beauty"
                      Icon={Sparkles}
                      label="Beauty"
                      closeAll={closeAllMenus}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="flex items-center gap-1 text-gray-800 hover:text-indigo-600"
            >
              <ShoppingCart className="h-5 w-5" />
              Cart
            </Link>

            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <>
                <Link
                  to="/signin"
                  className="text-sm font-medium hover:text-indigo-600"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <span className="text-sm font-medium text-gray-700">
                  Hello,{" "}
                  <span className="font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
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

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 text-gray-700"
            onClick={() => setOpenMobile((v) => !v)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor">
              <path strokeWidth="2" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}
