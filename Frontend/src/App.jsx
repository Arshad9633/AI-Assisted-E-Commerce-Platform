import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import PrivateRoute from "./components/guards/PrivateRoute";
import RoleProtectedRoute from "./components/guards/RoleProtectedRoute";
import GuestRoute from "./components/guards/GuestRoute";

import PublicHome from "./pages/PublicHome";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import CartPage from "./pages/CartPage";

import AdminLayout from "./components/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminUsers from "./pages/admin/AdminUsers";

import { ADMIN_BASE } from "./config/routes";

export default function App() {
  return (
    <>
      <Toaster position="top-center" />

      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<PublicHome />} />

        {/* Guest-only routes */}
        <Route
          path="/signin"
          element={
            <GuestRoute>
              <SignIn />
            </GuestRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <GuestRoute>
              <SignUp />
            </GuestRoute>
          }
        />

        {/* Cart Page */}
        <Route path="/cart" element={<CartPage />} />

        {/* Admin */}
        <Route
          path={ADMIN_BASE}
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
