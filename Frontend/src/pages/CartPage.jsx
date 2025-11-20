import { useCallback } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";


export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const decrease = useCallback(
    (item) => {
      const newQty = item.quantity - 1;
      if (newQty <= 0) removeFromCart(item.id);
      else updateQuantity(item.id, newQty);
    },
    [removeFromCart, updateQuantity]
  );

  const increase = useCallback(
    (item) => updateQuantity(item.id, item.quantity + 1),
    [updateQuantity]
  );

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear the cart?"))
      clearCart();
  };

   const handleProceed = () => {
    if (cartItems.length === 0) return;

    if (!isAuthenticated) {
      window.alert("Please sign in to proceed to checkout.");
      return;
    }

    navigate("/billing"); 
  };

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto mt-24 px-4 pb-16">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center">
            <p className="text-gray-600 text-lg">Your cart is empty.</p>
          </div>
        ) : (
          <>
            {/* ITEMS */}
            <div className="space-y-5">
              {cartItems.map((item) => {
                const subtotal = item.price * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-white p-4 rounded-xl shadow"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-20 w-20 rounded-lg object-cover"
                    />

                    <div className="flex-1">
                      <h2 className="font-semibold text-gray-900">{item.title}</h2>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="mt-1 flex items-baseline gap-3">
                        <span className="font-bold text-indigo-600">
                          €{item.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">
                          · subtotal: €{subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                        onClick={() => decrease(item)}
                      >
                        -
                      </button>

                      <span className="px-3 font-medium">{item.quantity}</span>

                      <button
                        className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                        onClick={() => increase(item)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="p-2 rounded-full hover:bg-red-100 text-red-500"
                      onClick={() => {
                        if (window.confirm(`Remove "${item.title}"?`))
                          removeFromCart(item.id);
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* TOTAL + ACTIONS */}
            <div className="mt-8 bg-white p-6 rounded-xl shadow">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-indigo-600">€{total.toFixed(2)}</span>
              </div>

              <button
                className="w-full mt-6 rounded-full px-6 py-3 text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 shadow hover:opacity-90"
                onClick={handleProceed}
              >
                Proceed to Checkout
              </button>

              <button
                className="w-full mt-3 rounded-full px-6 py-3 text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200"
                onClick={handleClearCart}
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
