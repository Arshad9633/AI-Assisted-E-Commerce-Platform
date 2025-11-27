import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ChevronDown, ShoppingCart, Bell, Check } from "lucide-react";
import axiosAuth from "../api/axiosAuth";
import http from "../api/http";

export default function Navbar() {
  const { name, email, isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const [openMen, setOpenMen] = useState(false);
  const [openWomen, setOpenWomen] = useState(false);

  // ---------------------
  // Notifications
  // ---------------------
  const [notifications, setNotifications] = useState([]);
  const [openNoti, setOpenNoti] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await axiosAuth.get("/notifications"); // -> GET /api/notifications
      const list = Array.isArray(res.data) ? res.data : [];
      setNotifications(list);
    } catch (err) {
      console.error("NOTIFICATION ERROR:", err);
    }
  };

  const markAllRead = async () => {
    if (!isAuthenticated) return;
    try {
      await axiosAuth.post("/notifications/read"); // -> POST /api/notifications/read
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("MARK READ ERROR:", err);
    }
  };

  const clearAllNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      await axiosAuth.delete("/notifications/clear"); // -> DELETE /api/notifications
      setNotifications([]);                     // clear UI immediately
    } catch (err) {
      console.error("CLEAR NOTIFICATIONS ERROR:", err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const toggleNotifications = () => {
    setOpenNoti((v) => !v);
    setOpenMen(false);
    setOpenWomen(false);
  };

  // ---------------------
  // Categories
  // ---------------------
  const [categories, setCategories] = useState([]);
  const menCategories = Array.isArray(categories)
  ? categories.filter((c) => c.gender === "MEN")
  : [];

  const womenCategories = Array.isArray(categories)
    ? categories.filter((c) => c.gender === "WOMEN")
    : [];
  const cartCount = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  const displayName =
    name?.toUpperCase() || (email ? email.split("@")[0].toUpperCase() : "");

  // Fetch categories
  useEffect(() => {
    http
      .get("/catalog/categories") // baseURL already ends with /api
      .then((res) => {
        const data = res.data;

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
          ? data.content
          : [];

        setCategories(list);
      })
      .catch((err) => {
        console.error("CATEGORIES ERROR:", err);
        setCategories([]);
      });
  }, []);

  // Scroll detection
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
    setOpenNoti(false);
  };

  const toSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

  return (
    <header className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={closeAllMenus}
            className="text-3xl font-serif tracking-tight
              bg-gradient-to-r from-indigo-700 to-purple-700
              bg-clip-text text-transparent transition-all duration-300
              hover:scale-105 hover:opacity-90"
          >
            B & M
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {/* MEN */}
            <div className="relative">
              <button
                className="flex items-center gap-1 text-sm font-medium text-gray-800 hover:text-indigo-600"
                onClick={() => {
                  setOpenMen((v) => !v);
                  setOpenWomen(false);
                  setOpenNoti(false);
                }}
              >
                Men <ChevronDown className="h-4 w-4" />
              </button>

              {openMen && (
                <Dropdown>
                  {menCategories.map((cat) => (
                    <DropdownItem
                      key={cat.id}
                      to={`/products/men/${toSlug(cat.name)}`}
                      label={cat.name}
                      close={closeAllMenus}
                    />
                  ))}
                </Dropdown>
              )}
            </div>

            {/* WOMEN */}
            <div className="relative">
              <button
                className="flex items-center gap-1 text-sm font-medium text-gray-800 hover:text-indigo-600"
                onClick={() => {
                  setOpenWomen((v) => !v);
                  setOpenMen(false);
                  setOpenNoti(false);
                }}
              >
                Women <ChevronDown className="h-4 w-4" />
              </button>

              {openWomen && (
                <Dropdown>
                  {womenCategories.map((cat) => (
                    <DropdownItem
                      key={cat.id}
                      to={`/products/women/${toSlug(cat.name)}`}
                      label={cat.name}
                      close={closeAllMenus}
                    />
                  ))}
                </Dropdown>
              )}
            </div>

            {/* NOTIFICATIONS (desktop) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className="relative p-1 text-gray-800 hover:text-indigo-600"
                >
                  <Bell className="h-6 w-6" />

                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {openNoti && (
                  <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-indigo-100 z-[999] p-3">
                    <NotificationPanel
                      notifications={notifications}
                      unreadCount={unreadCount}
                      onMarkAllRead={markAllRead}
                      onClearAll={clearAllNotifications}
                    />
                  </div>
                )}
              </div>
            )}

            {/* CART */}
            <Link
              to="/cart"
              onClick={closeAllMenus}
              className="relative flex items-center gap-2 text-gray-800 hover:text-indigo-600"
            >
              <ShoppingCart className="h-5 w-5" />

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 rounded-full bg-indigo-600 text-white text-xs px-2 py-0.5">
                  {cartCount}
                </span>
              )}

              Cart
            </Link>

            {/* AUTH */}
            {!isAuthenticated ? (
              <>
                <NavLink to="/signin" label="Sign In" />
                <PrimaryButton to="/signup" label="Sign Up" />
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

          {/* Mobile: notification + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className="relative p-1 text-gray-800 hover:text-indigo-600"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {openNoti && (
                  <div className="absolute right-0 mt-3 w-80 max-w-[90vw] bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-indigo-100 z-[999] p-3">
                    <NotificationPanel
                      notifications={notifications}
                      unreadCount={unreadCount}
                      onMarkAllRead={markAllRead}
                      onClearAll={clearAllNotifications}
                    />
                  </div>
                )}
              </div>
            )}

            <button
              className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
              onClick={() => {
                setOpenMobile((v) => !v);
                setOpenMen(false);
                setOpenWomen(false);
                // don't auto-close notifications here; user can close them manually
              }}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor">
                <path strokeWidth="2" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </nav>

        {/* MOBILE MENU */}
        {openMobile && (
          <div className="md:hidden border-t border-gray-200 bg-white/90 backdrop-blur pb-3">
            <div className="pt-2 space-y-1">
              {/* MEN (mobile) */}
              <button
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                onClick={() => {
                  setOpenMen((v) => !v);
                  setOpenWomen(false);
                  setOpenNoti(false);
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

              {/* WOMEN (mobile) */}
              <button
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                onClick={() => {
                  setOpenWomen((v) => !v);
                  setOpenMen(false);
                  setOpenNoti(false);
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

              {/* CART (mobile) */}
              <Link
                to="/cart"
                onClick={closeAllMenus}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute left-6 top-1 rounded-full bg-indigo-600 text-white text-xs px-2 py-0.5">
                    {cartCount}
                  </span>
                )}
                Cart
              </Link>

              {/* AUTH (mobile) */}
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

/* Shared notification panel for desktop + mobile */
function NotificationPanel({
  notifications,
  unreadCount,
  onMarkAllRead,
  onClearAll,
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
            Activity
          </p>
          <h4 className="text-sm font-bold text-gray-800">Notifications</h4>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-[11px] px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[11px] px-2 py-1 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 && (
        <p className="text-sm text-gray-500 py-4 text-center">
          You’re all caught up ✨
        </p>
      )}

      <div className="max-h-64 overflow-y-auto space-y-2 mt-1">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-2 p-3 rounded-xl border text-sm ${
              n.read
                ? "bg-gray-50 border-gray-200"
                : "bg-indigo-50 border-indigo-200"
            }`}
          >
            <div
              className={`mt-1 h-2 w-2 rounded-full ${
                n.read ? "bg-gray-300" : "bg-indigo-500"
              }`}
            />
            <div className="flex-1">
              <p className="text-gray-800">{n.message}</p>
              <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" />
                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* Small reusable components */
function Dropdown({ children }) {
  return (
    <div className="absolute top-full mt-3 w-64 p-4 rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl border border-white/40 z-[999]">
      {children}
    </div>
  );
}

function DropdownItem({ to, label, close }) {
  return (
    <Link
      to={to}
      className="block px-3 py-2 rounded-lg text-sm text-gray-800 hover:bg-indigo-50"
      onClick={close}
    >
      {label}
    </Link>
  );
}

function NavLink({ to, label }) {
  return (
    <Link to={to} className="text-sm font-medium hover:text-indigo-600">
      {label}
    </Link>
  );
}

function PrimaryButton({ to, label }) {
  return (
    <Link
      to={to}
      className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow"
    >
      {label}
    </Link>
  );
}
