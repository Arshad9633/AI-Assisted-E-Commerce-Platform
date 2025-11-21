import { createContext, useContext, useEffect, useState } from "react";
import axiosAuth from "../api/axiosAuth";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart_items") || "[]");
    } catch {
      return [];
    }
  });

  /* Load from DB after login */
  useEffect(() => {
    if (!isAuthenticated) return;

    async function load() {
      try {
        const { data } = await axiosAuth.get("/cart");
        const items = data.items || [];

        setCartItems(items);
        localStorage.setItem("cart_items", JSON.stringify(items));
      } catch (e) {
        console.error("DB Load Cart Error:", e);
      }
    }

    load();
  }, [isAuthenticated]);


  /* Sync both local + DB */
  const sync = async (items) => {
    setCartItems(items);
    localStorage.setItem("cart_items", JSON.stringify(items));

    if (isAuthenticated) {
      try {
        await axiosAuth.put("/cart", { items });
      } catch (e) {
        console.error("DB Cart Update Error:", e);
      }
    }
  };


  /* Add To Cart (FIXED PRODUCT ID) */
  const addToCart = async (product) => {
    let updated = [...cartItems];

    const existing = updated.find(i => i.productId === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      updated.push({
        productId: product.id,       // FIXED
        title: product.title,
        image: product.image || product.images?.[0] || "",   // FIXED IMAGE
        price: product.price,
        quantity: 1,
      });
    }

    await sync(updated);
  };


  /* Remove item (FIXED KEY) */
  const removeFromCart = async (productId) => {
    const updated = cartItems.filter(i => i.productId !== productId);
    await sync(updated);
  };


  /* Update quantity */
  const updateQuantity = async (productId, qty) => {
    const updated = cartItems.map(i =>
      i.productId === productId ? { ...i, quantity: qty } : i
    );
    await sync(updated);
  };


  /* Clear cart */
  const clearCart = async () => {
    await sync([]);
    if (isAuthenticated) {
      try {
        await axiosAuth.delete("/cart");
      } catch (e) {
        console.error("DB Clear Error:", e);
      }
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
