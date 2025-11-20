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
import AdminCatalog from "./pages/admin/AdminCatalog";  
import AdminProductList from "./pages/admin/AdminProductList";
import AdminOrdersPage from "./pages/admin/AdminOrderPage";

import ProductListPage from "./components/ProductListPage";
import ProductPage from "./components/ProductPage";

import BillingPage from "./pages/BillingPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";

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

        {/* Billing Page */}
        <Route path="/billing" element={<BillingPage />} />
        
        {/* Order Success Page */}
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />


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
          <Route path="catalog" element={<AdminCatalog />} />
          <Route path="products" element={<AdminProductList />} />
          <Route path="orders" element={<AdminOrdersPage />} />

        </Route>
        {/* ProducList */}
          <Route path="/products/:gender/:categorySlug" element={<ProductListPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
         
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
