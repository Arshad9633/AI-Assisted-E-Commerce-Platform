import { createContext, useContext, useEffect, useState } from "react";
import axiosAuth from "../api/axiosAuth";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();

  // Initialize from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart_items") || "[]");
    } catch {
      return [];
    }
  });

  /* -------------------------------------------------------
     HELPER: Save cart everywhere (state + localStorage + DB)
  --------------------------------------------------------- */
  const syncEverywhere = async (items) => {
    setCartItems(items);
    localStorage.setItem("cart_items", JSON.stringify(items));

    if (isAuthenticated) {
      try {
        await axiosAuth.put("/cart", { items });
      } catch (err) {
        console.error("Cart DB update failed:", err);
      }
    }
  };

  /* -------------------------------------------------------
     1) MERGE GUEST CART → DB CART ON LOGIN
  --------------------------------------------------------- */
  useEffect(() => {
  if (!isAuthenticated) return;

  async function loadAndMergeCart() {
    try {
      const guestCart =
        JSON.parse(localStorage.getItem("cart_items") || "[]") || [];

      // Load DB cart
      const { data } = await axiosAuth.get("/cart");
      const dbItems = data.items || [];

      let merged = [...dbItems];

      // Prevent merge-doubling by merging only once
      if (guestCart.length > 0) {
        guestCart.forEach((g) => {
          const found = merged.find((i) => i.productId === g.productId);
          if (found) {
            found.quantity += g.quantity;
          } else {
            merged.push(g);
          }
        });
      }

      // Save merged cart everywhere
      await syncEverywhere(merged);

      // Reset guest cart so it doesn't re-merge on refresh
      localStorage.setItem("cart_items", JSON.stringify([]));

    } catch (err) {
      console.error("Cart merge on login failed:", err);
    }
  }

  loadAndMergeCart();
}, [isAuthenticated]);


  /* -------------------------------------------------------
     2) ADD TO CART
  --------------------------------------------------------- */
  const addToCart = async (product) => {
    const updated = [...cartItems];
    const existing = updated.find((i) => i.productId === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      updated.push({
        productId: product.id,
        title: product.title,
        image: product.image || product.images?.[0] || "",
        price: product.price,
        quantity: 1,
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
     4) UPDATE QUANTITY
  --------------------------------------------------------- */
  const updateQuantity = async (productId, newQty) => {
    const updated = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity: newQty } : item
    );
    await syncEverywhere(updated);
  };

  /* -------------------------------------------------------
     5) CLEAR CART (order placed or user clicks clear)
  --------------------------------------------------------- */
  const clearCart = async () => {
    await syncEverywhere([]);

    if (isAuthenticated) {
      try {
        await axiosAuth.delete("/cart");
      } catch (err) {
        console.error("DB clear failed:", err);
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
