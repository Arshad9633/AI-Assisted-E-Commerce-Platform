import { createContext, useContext, useEffect, useState } from "react";
import axiosAuth from "../api/axiosAuth";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const STORAGE_KEY = "cart_items";

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();

  /* -------------------------------------------------------
     0) INITIALIZE CART (from localStorage, guest only)
  --------------------------------------------------------- */
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  /* -------------------------------------------------------
     Save to state + localStorage (guest) + DB (if logged in)
  --------------------------------------------------------- */
  const syncEverywhere = async (items) => {
    // Always update React state
    setCartItems(items);

    // Only persist to localStorage when NOT authenticated (guest cart)
    if (!isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    // Only persist to DB when authenticated
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
        (runs when user becomes authenticated)
  --------------------------------------------------------- */
  useEffect(() => {
    if (!isAuthenticated) return;

    async function mergeCarts() {
      try {
        // Guest cart from localStorage (only valid from pre-login session)
        const guestCart =
          JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") || [];

        // Load DB cart
        const { data } = await axiosAuth.get("/cart");
        const dbItems = data.items || [];

        // Start from DB items
        const merged = [...dbItems];

        // Merge rule: match by productId, add quantities
        guestCart.forEach((g) => {
          const existing = merged.find((i) => i.productId === g.productId);
          if (existing) {
            existing.quantity += g.quantity;
          } else {
            merged.push(g);
          }
        });

        // Sync to state + DB (but NOT to localStorage anymore)
        await syncEverywhere(merged);

        // Clear guest data so it doesn't re-merge on future reloads
        localStorage.setItem(STORAGE_KEY, "[]");
      } catch (err) {
        console.error("❌ Merge cart failed:", err);
      }
    }

    mergeCarts();
  }, [isAuthenticated]); // only runs when auth state changes

  /* -------------------------------------------------------
     2) ADD TO CART (respect stock if provided)
  --------------------------------------------------------- */
  const addToCart = async (product) => {
    const updated = [...cartItems];
    const existing = updated.find((i) => i.productId === product.id);

    const desiredQty = product.quantity || 1;
    const maxStock = product.stock ?? Infinity;

    if (existing) {
      const newQty = Math.min(existing.quantity + desiredQty, maxStock);
      existing.quantity = newQty;
    } else {
      updated.push({
        productId: product.id,
        title: product.title,
        image: product.image,
        price: product.price,
        quantity: Math.min(desiredQty, maxStock),
        // optional: carry stock info into cart item if you want
        stock: product.stock,
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
     4) UPDATE QUANTITY (safe, respect stock)
  --------------------------------------------------------- */
  const updateQuantity = async (productId, newQty) => {
    const updated = cartItems.map((i) => {
      if (i.productId === productId) {
        const maxStock = i.stock ?? i.maxStock ?? Infinity;
        return { ...i, quantity: Math.min(newQty, maxStock) };
      }
      return i;
    });

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
