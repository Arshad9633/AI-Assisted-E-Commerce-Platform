import { createContext, useContext, useState, useCallback } from "react";
// import http from "../lib/http"; // later

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });

  const loadCart = useCallback(async (userId) => {
    // Later: const { data } = await http.get(`/api/cart`);
    // Server knows user from the JWT; no need to pass userId explicitly.
    // For now, fake it:
    setCart({ items: [] });
  }, []);

  const addToCart = useCallback(async (userId, productId) => {
    // Later: await http.post(`/api/cart/items`, { productId, qty: 1 })
    setCart(prev => ({
      ...prev,
      items: [...prev.items, { productId, title: `Product #${productId}`, qty: 1 }],
    }));
  }, []);

  return (
    <CartCtx.Provider value={{ cart, loadCart, addToCart }}>
      {children}
    </CartCtx.Provider>
  );
}
