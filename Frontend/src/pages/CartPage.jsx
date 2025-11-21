import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const total = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  const decrease = useCallback(
    (item) => {
      const newQty = item.quantity - 1;
      if (newQty <= 0) {
        removeFromCart(item.productId);
      } else {
        updateQuantity(item.productId, newQty);
      }
    },
    [removeFromCart, updateQuantity]
  );

  const increase = useCallback(
    (item) => {
      updateQuantity(item.productId, item.quantity + 1);
    },
    [updateQuantity]
  );

  const handleClear = () => {
    if (window.confirm("Clear cart?")) {
      clearCart();
    }
  };

  const handleProceed = () => {
    if (cartItems.length === 0) return;

    if (!isAuthenticated) {
      toast.error("Please sign in to proceed");
      return;
    }

    navigate("/billing");
  };

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto mt-24 px-4 pb-16">
        <h1 className="text-3xl font-extrabold mb-6">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center">
            Your cart is empty.
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {cartItems.map((item) => {
                const subtotal = item.price * item.quantity;

                return (
                  <div
                    key={item.productId}
                    className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-20 w-20 rounded object-cover"
                    />

                    <div className="flex-1">
                      <h2 className="font-semibold">{item.title}</h2>
                      <div className="mt-1 flex gap-3">
                        <span className="font-bold text-indigo-600">
                          €{item.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">
                          subtotal: €{subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <div className="flex gap-2">
                        <button
                          onClick={() => decrease(item)}
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          -
                        </button>

                        <span className="px-3 font-medium">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => increase(item)}
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="text-red-500 p-2 rounded-full hover:bg-red-100"
                        onClick={() => {
                          if (window.confirm("Remove item?")) {
                            removeFromCart(item.productId);
                          }
                        }}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 bg-white p-6 rounded-xl shadow">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-indigo-600">€{total.toFixed(2)}</span>
              </div>

              <button
                onClick={handleProceed}
                className="w-full mt-6 rounded-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={handleClear}
                className="w-full mt-3 rounded-full px-6 py-3 bg-gray-100 hover:bg-gray-200 font-semibold"
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
