import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/guards/PrivateRoute";
import RoleProtectedRoute from "./components/guards/RoleProtectedRoute";
import GuestRoute from "./components/guards/GuestRoute";

import AdminLayout from "./components/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminUsers from "./pages/admin/AdminUsers";

import UserLayout from "./components/UserLayout";
import UserHome from "./pages/user/UserHome";

import HomeSmart from "./pages/HomeSmart";
import PublicHome from "./pages/PublicHome";

import { ADMIN_BASE, USER_BASE } from "./config/routes";

// NOTE: These three pages are your existing ones.
// Keep your implementations.
// If you haven’t made them yet, create simple placeholders.
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        
        <Toaster position="top-center" />
      

        <Routes>
          {/* Smart Home at "/", - guests: PublicHome, - signed-in users: personalized home */}
          <Route path="/" element={<HomeSmart />} />

          {/* Auth (guest-only) */}
          <Route path="/signin" element={<GuestRoute><SignIn /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><SignUp /></GuestRoute>} />


          {/* Auth */}
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          
            <Route
              path={USER_BASE}
              element={
                <PrivateRoute>
                  <UserLayout />
                </PrivateRoute>
              }
            >
            <Route index element={<UserHome />} />
                  {/* add more user pages here */}
                  {/* <Route path="orders" element={<UserOrders />} /> */}
                  {/* <Route path="profile" element={<UserProfile />} /> */}
            </Route>

          {/* User dashboard (needs auth) */}
          <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Admin area (layout + nested routes) */}
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

          {/* 404 → sign in */}
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
