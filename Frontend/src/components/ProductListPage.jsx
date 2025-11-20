import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";


export default function ProductListPage() {
  const { gender, categorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Convert slug back to normal text e.g. "women-bags" -> "Women Bags"
  const toTitleCase = (text) =>
    text
      ? text.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "";

  useEffect(() => {
    // guard: ensure params exist
    if (!gender || !categorySlug) {
      setProducts([]);
      setCategoryName(toTitleCase(categorySlug));
      return;
    }

    const humanCategory = toTitleCase(categorySlug);
    setCategoryName(humanCategory);

    // Prepare params: send categorySlug explicitly (backend expects categorySlug)
    // Also include fallback "category" to be compatible with older backend endpoints.
    const params = {
      gender: gender.toUpperCase(), // MEN / WOMEN
      categorySlug: categorySlug,   // primary param expected by backend
      // category: humanCategory,    // optional fallback if backend expects "category"
    };

    setLoading(true);
    setError(null);

    axios
      .get("/api/products/filter", { params })
      .then((res) => {
        // expecting an array of products
        setProducts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        // better error logging to inspect HTTP status/body
        console.error(
          "PRODUCT FETCH ERROR:",
          err?.response?.status,
          err?.response?.data ?? err?.message
        );
        setProducts([]);
        setError(
          err?.response?.data?.message ??
            (err?.response ? `Error ${err.response.status}` : err.message)
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [gender, categorySlug]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Navbar />
      <h1 className="text-2xl font-semibold mb-4">
        {gender ? gender.toUpperCase() : ""} — {categoryName}
      </h1>

      {loading ? (
        <p>Loading products…</p>
      ) : error ? (
        <p className="text-red-600">Error loading products: {error}</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link
              to={`/product/${p.slug}`}
              key={p.id}
              className="border rounded-lg p-3 shadow-sm hover:shadow-md transition block"
            >
              <img
                src={p.images?.[0]?.url ?? p.images?.[0]}
                alt={p.title}
                className="h-40 object-cover rounded-md w-full"
              />
              <h2 className="mt-2 text-sm font-medium">{p.title}</h2>
              <p className="text-sm text-gray-600">
                {p.currency ?? "$"}
                {p.price}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
