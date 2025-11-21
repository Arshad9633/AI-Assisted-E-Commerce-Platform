import { createContext, useContext, useEffect, useState } from "react";
import axiosAuth from "../api/axiosAuth";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();

  /* -------------------------------------------------------
     0) INITIALIZE CART (localStorage only)
  --------------------------------------------------------- */
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart_items") || "[]");
    } catch {
      return [];
    }
  });

  /* -------------------------------------------------------
     Save to state + localStorage + DB (if logged in)
  --------------------------------------------------------- */
  const syncEverywhere = async (items) => {
    setCartItems(items);
    localStorage.setItem("cart_items", JSON.stringify(items));

    if (isAuthenticated) {
      try {
        await axiosAuth.put("/cart", { items });
      } catch (err) {
        console.error("❌ Cart DB update failed:", err);
      }
    }
  };

  /* -------------------------------------------------------
     1) MERGE GUEST CART → DB CART AFTER LOGIN
  --------------------------------------------------------- */
  useEffect(() => {
    if (!isAuthenticated) return;

    async function mergeCarts() {
      try {
        const guestCart =
          JSON.parse(localStorage.getItem("cart_items") || "[]") || [];

        // Load DB cart
        const { data } = await axiosAuth.get("/cart");
        const dbItems = data.items || [];

        // Merge rule: match by productId
        const merged = [...dbItems];

        guestCart.forEach((g) => {
          const existing = merged.find((i) => i.productId === g.productId);
          if (existing) {
            existing.quantity += g.quantity; // combine quantities
          } else {
            merged.push(g);
          }
        });

        await syncEverywhere(merged);

        // Clear guest data so it doesn't re-merge
        localStorage.setItem("cart_items", "[]");
      } catch (err) {
        console.error("❌ Merge cart failed:", err);
      }
    }

    mergeCarts();
  }, [isAuthenticated]);

  /* -------------------------------------------------------
     2) ADD TO CART (fixed quantity logic)
  --------------------------------------------------------- */
  const addToCart = async (product) => {
    const updated = [...cartItems];

    // Use productId consistently
    const existing = updated.find((i) => i.productId === product.id);

    if (existing) {
      // Add multiple quantities properly
      existing.quantity += (product.quantity || 1);
    } else {
      updated.push({
        productId: product.id,
        title: product.title,
        image: product.image,
        price: product.price,
        quantity: product.quantity || 1,
      });
    }

    await syncEverywhere(updated);
  };

  /* -------------------------------------------------------
     3) REMOVE ITEM
  --------------------------------------------------------- */
  const removeFromCart = async (productId) => {
    const updated = cartItems.filter((i) => i.productId !== productId);
    await syncEverywhere(updated);
  };

  /* -------------------------------------------------------
     4) UPDATE QUANTITY (safe)
  --------------------------------------------------------- */
  const updateQuantity = async (productId, newQty) => {
    const updated = cartItems.map((i) =>
      i.productId === productId ? { ...i, quantity: newQty } : i
    );
    await syncEverywhere(updated);
  };

  /* -------------------------------------------------------
     5) CLEAR CART
  --------------------------------------------------------- */
  const clearCart = async () => {
    await syncEverywhere([]);

    if (isAuthenticated) {
      try {
        await axiosAuth.delete("/cart");
      } catch (err) {
        console.error("❌ Failed to clear DB cart:", err);
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
