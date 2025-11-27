import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import { Search, Sliders, ChevronDown } from "lucide-react";
import http from "../lib/http";

export default function ProductListPage() {
  const { gender, categorySlug } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [activeFilters, setActiveFilters] = useState([]);

  // slug -> Title ("accessories" -> "Accessories")
  const toTitleCase = (text) =>
    text ? text.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

  const categoryName = useMemo(
    () => toTitleCase(categorySlug),
    [categorySlug]
  );

  // 🔹 Fetch products for gender + category using /api/products/filter
  useEffect(() => {
    setLoading(true);
    setError(null);

    // if route params missing, just show empty state
    if (!gender || !categoryName) {
      setProducts([]);
      setLoading(false);
      return;
    }

    http
      .get("/products/by-category", {
        params: {
          gender: gender.toUpperCase(), // MEN / WOMEN
          category: categoryName,       // e.g. "Bag" (from slug "bag")
        },
      })
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data) ? data : [];
        setProducts(list);
      })
      .catch((err) => {
        console.error("PRODUCT LIST ERROR:", err);
        setError(
          err?.response?.data?.message ??
            "Failed to load products. Please try again."
        );
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [gender, categoryName]);



  // Filtering + sorting on client
  const filtered = useMemo(() => {
    let list = products.slice();

    // Search
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // Price range
    list = list.filter((p) => {
      const price = Number(p.price ?? 0);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Active filters (by tags)
    if (activeFilters.length) {
      list = list.filter((p) =>
        activeFilters.every((f) => (p.tags || []).includes(f))
      );
    }

    // Sort
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "newest")
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return list;
  }, [products, query, sort, priceRange, activeFilters]);

  const uniqueTags = useMemo(() => {
    const s = new Set();
    products.forEach((p) => (p.tags || []).forEach((t) => s.add(t)));
    return Array.from(s).slice(0, 8);
  }, [products]);

  return (
    <div className="min-h-screen bg-blue-50 pt-28 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Header / Search / Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="relative z-20">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, e.g. 'jacket'"
                className="pl-10 pr-4 py-3 w-full rounded-xl border shadow-sm focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 text-sm text-gray-600">
              <Sliders className="w-4 h-4" />
              <span>Refine</span>
            </div>

            <div className="bg-white border rounded-xl px-3 py-2 text-sm flex items-center gap-2">
              <span className="text-gray-500">Showing</span>
              <strong>{filtered.length}</strong>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Optional tag filters (chips) */}
        {uniqueTags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 text-xs">
            {uniqueTags.map((tag) => {
              const active = activeFilters.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => {
                    setActiveFilters((prev) =>
                      active
                        ? prev.filter((t) => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                  className={`px-3 py-1 rounded-full border ${
                    active
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse border rounded-lg p-4">
                <div className="h-40 bg-gray-100 rounded-md" />
                <div className="h-4 bg-gray-100 mt-3 rounded w-3/4" />
                <div className="h-4 bg-gray-100 mt-2 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No products matching your search/filters.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.slug}`}
                className="block bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
              >
                <div className="relative h-56">
                  <img
                    src={p.images?.[0]?.url ?? p.images?.[0]}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  {p.badge && (
                    <div className="absolute top-3 left-3 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                      {p.badge}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {p.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {p.brand}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm font-medium">
                      {p.currency ?? "€"}
                      {p.price}
                    </div>
                    <div className="text-xs text-green-600">
                      {p.stock > 0 ? "In stock" : "Out"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="py-10 border-t border-gray-200 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 text-sm text-gray-600">
          © {new Date().getFullYear()} • E-Commerce
        </div>
      </footer>
    </div>
  );
}
