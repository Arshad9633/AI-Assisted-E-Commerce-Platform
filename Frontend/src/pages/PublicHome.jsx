import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import HeroSlider from "../components/HeroSlider";
import { useProducts } from "../hooks/useProducts";
import { ShoppingCart, Truck, ShieldCheck } from "lucide-react";

export default function PublicHome() {
  const { data, loading, error } = useProducts({
    page: 0,
    limit: 12,
    sort: "createdAt:desc",
  });

  // Latest products (for cards + slider)
  const rawProducts = data?.content || [];

  // For grid cards
  const products = rawProducts.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.discountPrice ?? p.price,
    currency: p.currency || "EUR",
    image: p.images?.[0]?.url || "/placeholder.png",
    badge: p.discountPrice ? "Sale" : undefined,
    maxQty: p.stock ?? 99,
  }));

  // For hero slider: pass original backend objects
  const latestForSlider = rawProducts.slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 md:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                From must-haves to little treats, add them to your basket and
                we’ll bring them to you fast.
              </h1>

              <p className="mt-4 text-gray-600 text-base md:text-lg leading-relaxed">
                Browse a curated feed of products. Sign in for personalized
                picks and a smoother checkout.
              </p>

              <ul className="mt-5 space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-indigo-600" />
                  Easy add-to-basket
                </li>
                <li className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-indigo-600" />
                  Fast, reliable delivery
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  Secure payments
                </li>
              </ul>

              <div className="mt-6 flex gap-3">
                <Link
                  to="/signup"
                  className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                >
                  Get Started
                </Link>
                <Link
                  to="/signin"
                  className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-indigo-700 bg-white/70 hover:bg-white shadow-sm ring-1 ring-inset ring-indigo-200"
                >
                  Sign In
                </Link>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                No account yet? Create one in seconds.
              </p>
            </div>

            {/* Updated hero slider with latest products */}
            <HeroSlider products={latestForSlider} />
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
            Featured Products
          </h2>

          {loading && <p className="text-gray-500">Loading…</p>}

          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && products.length === 0 && (
            <p className="text-gray-600">No products yet.</p>
          )}

          {!loading && !error && products.length > 0 && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <li
                  key={p.id}
                  className="bg-white p-4 rounded-xl shadow ring-1 ring-gray-200 flex flex-col"
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-40 w-full object-cover rounded-md"
                  />
                  <h3 className="mt-2 font-semibold">{p.title}</h3>
                  {p.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                  <span className="mt-1 block font-bold">
                    {formatCurrency(p.price, p.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <footer className="py-10 border-t border-gray-200 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-gray-600">
          © {new Date().getFullYear()} 🛒 E-Commerce
        </div>
      </footer>
    </div>
  );
}

function formatCurrency(value, currency = "EUR", locale = navigator.language || "en-US") {
  if (value == null) return "";
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
      value
    );
  } catch {
    return `${value} ${currency}`;
  }
}
