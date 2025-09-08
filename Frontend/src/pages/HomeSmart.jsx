// src/pages/HomeSmart.jsx
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useRecs } from "../hooks/useRecs";
import PublicHome from "./PublicHome";

export default function HomeSmart() {
  const { user } = useAuth();

  // Guest view
  if (!user) return <PublicHome />;

  // Signed-in view
  return <HomePersonalized />;
}

function HomePersonalized() {
  const { user } = useAuth();
  const { loadCart, cart, addToCart } = useCart();
  const { recs, loadRecs } = useRecs();

  useEffect(() => {
    // scope data to this user
    loadCart(user.id);
    loadRecs(user.id);
  }, [user?.id, loadCart, loadRecs]);

  const isAdmin = user?.roles?.includes("ADMIN");

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Welcome back, {user.name}</h1>
        {isAdmin && (
          <a href="/admin" className="underline">Go to Admin</a>
        )}
      </header>

      <section>
        <h2 className="text-xl font-medium mb-3">Your recommendations</h2>
        {!recs?.length ? (
          <p>Loading recommendations…</p>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recs.map(p => (
              <li key={p.id} className="border rounded-xl p-4">
                <h3 className="font-medium">{p.title}</h3>
                <p className="text-sm opacity-80">{p.subtitle}</p>
                <button
                  className="mt-3 border rounded-lg px-3 py-1"
                  onClick={() => addToCart(user.id, p.id)}
                >
                  Add to cart
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-medium mb-3">Your cart</h2>
        {!cart?.items?.length ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul className="space-y-2">
            {cart.items.map(item => (
              <li key={item.productId} className="flex justify-between border rounded-lg p-3">
                <span>{item.title}</span>
                <span>x{item.qty}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
