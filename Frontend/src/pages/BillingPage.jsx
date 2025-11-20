// src/pages/BillingPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import http from "../lib/http";
import toast from "react-hot-toast";

export default function BillingPage() {
  const { isAuthenticated, name, email } = useAuth();
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  // If user somehow reaches /billing without auth, bounce them to signin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin", { replace: true, state: { redirectTo: "/billing" } });
    }
  }, [isAuthenticated, navigate]);

  // If cart is empty, send them back to cart
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [cartItems, navigate]);

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: name || "",
    email: email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    // Simple required field check
    for (const [key, value] of Object.entries(form)) {
      if (!value || String(value).trim() === "") {
        toast.error("Please fill all billing fields.");
        return;
      }
    }

    const payload = {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      postalCode: form.postalCode,
      country: form.country,
      items: cartItems.map((item) => ({
        productId: item.id,
        title: item.title,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    try {
      setSubmitting(true);
      const res = await http.post("/orders", payload);
      console.log("ORDER CREATED:", res.data);

      toast.success("Order placed successfully!");
      clearCart();
      navigate("/order-success");
    } catch (err) {
      console.error("PLACE ORDER ERROR", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to place order.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto mt-28 px-4 pb-16">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Billing Details
        </h1>
        <p className="text-gray-600 mt-2">Complete your order below.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
          {/* LEFT — Billing Form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Billing Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={onChange}
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
              />
              <InputField
                label="Phone Number"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={onChange}
              />
              <InputField
                label="Country"
                name="country"
                value={form.country}
                onChange={onChange}
              />
            </div>

            <InputField
              label="Address"
              name="address"
              value={form.address}
              onChange={onChange}
              className="mt-4"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <InputField
                label="City"
                name="city"
                value={form.city}
                onChange={onChange}
              />
              <InputField
                label="Postal Code"
                name="postalCode"
                value={form.postalCode}
                onChange={onChange}
              />
            </div>
          </div>

          {/* RIGHT — Order Summary */}
          <div className="bg-white p-6 rounded-xl shadow h-fit">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-gray-500 text-sm">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-indigo-600">
                    €{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-lg font-semibold mt-6">
              <span>Total</span>
              <span className="text-indigo-600">€{total.toFixed(2)}</span>
            </div>

            <button
              className={`w-full mt-6 rounded-full px-6 py-3 text-white font-semibold
                bg-gradient-to-r from-indigo-600 to-purple-600 shadow
                ${
                  submitting
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:opacity-90"
                }`}
              onClick={handlePlaceOrder}
              disabled={submitting}
            >
              {submitting ? "Placing order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* Reusable Input Component */
function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  className = "",
}) {
  return (
    <div className={className}>
      <label className="block text-gray-700 text-sm font-medium mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  );
}
