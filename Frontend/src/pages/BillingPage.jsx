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

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = subtotal > 99 ? 0 : 4.99;
  const tax = subtotal * 0.10;
  const total = subtotal + tax + shipping;

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [cartItems, navigate]);

  const [submitting, setSubmitting] = useState(false);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);

  const [form, setForm] = useState({
    fullName: name || "",
    email: email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    notes: "",
    deliveryMethod: "standard",
    paymentMethod: "card",
  });

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyPromo = () => {
    if (promo === "SAVE10") {
      setDiscount(0.10 * subtotal);
      toast.success("Promo applied!");
    } else {
      toast.error("Invalid promo code.");
    }
  };

  const handlePlaceOrder = async () => {
    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "postalCode",
      "country",
    ];

    for (const field of requiredFields) {
      if (!form[field].trim()) {
        toast.error(`Please fill in ${field}.`);
        return;
      }
    }

    const payload = {
      ...form,
      discount,
      shipping,
      tax,
      total,
      items: cartItems,
    };

    try {
      setSubmitting(true);
      const res = await http.post("/orders", payload);
      toast.success("Order placed successfully!");
      clearCart();
      navigate("/order-success");
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto mt-28 px-4 pb-20">
        <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
        <p className="text-gray-600 mt-1">
          Complete your order details and finish your purchase.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
          {/* LEFT — Billing Details */}
          <div className="lg:col-span-2 space-y-8">

            {/* Billing Form */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">Billing Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" name="fullName" value={form.fullName} onChange={onChange} />
                <Input label="Email" name="email" value={form.email} onChange={onChange} type="email" />
                <Input label="Phone" type="number" name="phone" value={form.phone} onChange={onChange} />
                <Input label="Country" name="country" value={form.country} onChange={onChange} />
              </div>

              <Input label="Address" name="address" className="mt-4" value={form.address} onChange={onChange} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <Input label="City" name="city" value={form.city} onChange={onChange} />
                <Input label="Postal Code" type="number" name="postalCode" value={form.postalCode} onChange={onChange} />
              </div>
            </div>

            {/* Delivery Method */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">Delivery Options</h2>

              <RadioOption
                label="Standard Delivery (3–5 days)"
                value="standard"
                current={form.deliveryMethod}
                onClick={() => setForm((p) => ({ ...p, deliveryMethod: "standard" }))}
              />

              <RadioOption
                label="Express Delivery (1–2 days) + €5"
                value="express"
                current={form.deliveryMethod}
                onClick={() => setForm((p) => ({ ...p, deliveryMethod: "express" }))}
              />

              <RadioOption
                label="Pickup Point (Free)"
                value="pickup"
                current={form.deliveryMethod}
                onClick={() => setForm((p) => ({ ...p, deliveryMethod: "pickup" }))}
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

              <RadioOption
                label="Credit/Debit Card"
                value="card"
                current={form.paymentMethod}
                onClick={() => setForm((p) => ({ ...p, paymentMethod: "card" }))}
              />

              <RadioOption
                label="Cash on Delivery"
                value="cod"
                current={form.paymentMethod}
                onClick={() => setForm((p) => ({ ...p, paymentMethod: "cod" }))}
              />

              <RadioOption
                label="PayPal"
                value="paypal"
                current={form.paymentMethod}
                onClick={() => setForm((p) => ({ ...p, paymentMethod: "paypal" }))}
              />
            </div>

            {/* Additional Notes */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">Order Notes</h2>
              <textarea
                name="notes"
                value={form.notes}
                onChange={onChange}
                className="w-full rounded-lg border p-3 h-24"
                placeholder="Special delivery instructions (optional)"
              ></textarea>
            </div>
          </div>

          {/* RIGHT — Order Summary */}
          <div className="bg-white p-6 rounded-xl shadow h-fit">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-indigo-600">
                    €{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Promo Code */}
            <div className="mt-6">
              <label className="text-sm font-medium">Promo Code</label>
              <div className="flex gap-2 mt-1">
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder="Enter code"
                />
                <button
                  onClick={applyPromo}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Price Calculation */}
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>€{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `€${shipping}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>-€{discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between text-lg font-semibold mt-6">
              <span>Total</span>
              <span className="text-indigo-600">
                €{(total - discount).toFixed(2)}
              </span>
            </div>

            {/* Place Order Button */}
            <button
              className={`w-full mt-6 rounded-full px-6 py-3 text-white font-semibold
                bg-gradient-to-r from-indigo-600 to-purple-600 shadow
              ${submitting ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`}
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

/* INPUT COMPONENT */
function Input({ label, name, value, onChange, type, className }) {
  // Force numeric-only for phone and postalCode
  const isNumericField = name === "phone" || name === "postalCode";

  const handleChange = (e) => {
    let val = e.target.value;

    // Prevent negative, decimals, scientific notation
    if (isNumericField) {
      val = val.replace(/[^\d]/g, "");  // keep digits only
    }

    onChange({
      target: { name, value: val }
    });
  };

  return (
    <div className={className}>
      <label className="block text-gray-700 text-sm font-medium mb-1">
        {label}
      </label>

      <input
        type={isNumericField ? "text" : type || "text"}  // text but restricted
        name={name}
        value={value}
        onChange={handleChange}
        inputMode={isNumericField ? "numeric" : "text"}  // mobile numeric keypad
        maxLength={isNumericField ? 12 : undefined}      // optional limit
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  );
}


/* RADIO BUTTON COMPONENT */
function RadioOption({ label, value, current, onClick }) {
  const active = current === value;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 p-3 border rounded-xl mb-2 ${
        active ? "border-indigo-600 bg-indigo-50" : "border-gray-300"
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full border ${
          active ? "bg-indigo-600 border-indigo-600" : "border-gray-400"
        }`}
      ></span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
