import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getAdminProducts, deleteProduct } from "../../api/adminCatalog";
import { ADMIN_BASE } from "../../config/routes";
import { Search } from "lucide-react";

export default function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  // Pagination state (frontend)
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getAdminProducts();
      console.log("📡 API response (admin products):", data);

      // ✅ Handle both: array OR { items: [...] }
      const items = Array.isArray(data) ? data : data.items || [];
      setProducts(items);
    } catch (err) {
      console.error("Failed to load products:", err);
      toast.error("Failed to load products");
    }
  }

  /* -----------------------------
        SEARCH FILTER
  ----------------------------- */
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;

    return products.filter((p) =>
      `${p.title ?? ""} ${p.categoryName ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [products, search]);

  /* -----------------------------
        PAGINATION CALCULATION
  ----------------------------- */
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE) || 1;

  const paginatedProducts = useMemo(() => {
    const safePage = Math.min(page, totalPages); // avoid overflow
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page, totalPages]);

  const goNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const goPrev = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      {/* HEADER + SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // reset page on search
            }}
            className="pl-10 w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-50 text-gray-800">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Title</th>
              <th className="py-3 px-4 text-left font-semibold">Price</th>
              <th className="py-3 px-4 text-left font-semibold">Category</th>
              <th className="py-3 px-4 text-left font-semibold">Status</th>
              <th className="py-3 px-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {paginatedProducts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition">
                <td className="py-3 px-4">{p.title}</td>
                <td className="py-3 px-4">
                  {p.price} {p.currency}
                </td>
                <td className="py-3 px-4">{p.categoryName}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      p.status === "PUBLISHED"
                        ? "bg-green-100 text-green-700"
                        : p.status === "DRAFT"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>

                <td className="py-3 px-4 text-center flex gap-4 justify-center text-sm">
                  <button
                    onClick={() =>
                      navigate(`${ADMIN_BASE}/catalog?edit=${p.id}`)
                    }
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    onClick={async () => {
                      if (!confirm("Delete this product?")) return;
                      await deleteProduct(p.id);
                      setProducts((prev) =>
                        prev.filter((x) => x.id !== p.id)
                      );
                      toast.success("Deleted");
                    }}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {paginatedProducts.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 text-center text-gray-500 text-sm"
                >
                  No matching products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION BAR */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={goPrev}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg ${
              page === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            Prev
          </button>

          <p className="text-gray-600 text-sm">
            Page <span className="font-semibold">{page}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </p>

          <button
            onClick={goNext}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg ${
              page === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
