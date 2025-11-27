import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getAdminProducts, deleteProduct } from "../../api/adminCatalog";
import { Search } from "lucide-react";

export default function AdminProductList() {
  const navigate = useNavigate();

  const [page, setPage] = useState(0); // current page (0-based)
  const PAGE_SIZE = 6;

  const [items, setItems] = useState([]);   // items for current view
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const searchTimeout = useRef(null);

  const isSearching = search.trim().length > 0;

  /* -----------------------------
   * 1) Normal mode: backend paging
   * ----------------------------- */
  useEffect(() => {
    if (isSearching) return; // when searching, don't load page-by-page

    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, isSearching]);

  async function load(p = 0) {
    try {
      const res = await getAdminProducts(p, PAGE_SIZE);

      if (Array.isArray(res)) {
        // backend returns full array
        setItems(res);
        setTotalPages(Math.max(1, Math.ceil(res.length / PAGE_SIZE)));
      } else {
        // backend returns { items, totalPages }
        setItems(res.items || []);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
      toast.error("Failed to load products");
    }
  }

  /* ---------------------------------------
   * 2) Helper: fetch ALL pages then merge
   * --------------------------------------- */
  async function fetchAllPagesAndMerge() {
    try {
      const first = await getAdminProducts(0, PAGE_SIZE);

      if (Array.isArray(first)) {
        return first;
      }

      const pages = first.totalPages || 1;
      const promises = [];

      for (let i = 0; i < pages; i++) {
        if (i === 0) {
          promises.push(Promise.resolve(first));
        } else {
          promises.push(getAdminProducts(i, PAGE_SIZE));
        }
      }

      const results = await Promise.all(promises);
      const allItems = results.flatMap((r) =>
        Array.isArray(r) ? r : r.items || []
      );

      return allItems;
    } catch (err) {
      console.error("Failed to fetch all pages:", err);
      throw err;
    }
  }

  /* ---------------------------------------
   * 3) Search effect (debounced, client-side)
   * --------------------------------------- */
  useEffect(() => {
    // clear old timer
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
      searchTimeout.current = null;
    }

    // if search is empty -> let the other effect handle normal paging
    if (!isSearching) {
      return;
    }

    // debounce
    searchTimeout.current = setTimeout(async () => {
      try {
        const all = await fetchAllPagesAndMerge();

        if (!all || all.length === 0) {
          setItems([]);
          setTotalPages(1);
          setPage(0);
          return;
        }

        const q = search.toLowerCase().trim();
        const matched = all.filter((p) => {
          const txt = `${p.title || ""} ${p.slug || ""} ${
            p.categoryName || ""
          }`.toLowerCase();
          return txt.includes(q);
        });

        setItems(matched);
        setTotalPages(Math.max(1, Math.ceil(matched.length / PAGE_SIZE)));
        setPage(0);
      } catch (err) {
        console.error("Search failed:", err);
        toast.error("Search failed");
      }
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
        searchTimeout.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, isSearching]);

  /* ---------------------------------------
   * 4) View for current page
   * --------------------------------------- */
  const start = page * PAGE_SIZE;

  const pagedView = isSearching
    ? items.slice(start, start + PAGE_SIZE) // client-side pagination in search
    : items;                                // backend already paged

  /* ---------------------------------------
   * 5) Delete handler
   * --------------------------------------- */
  const onDelete = async (id) => {
    if (!confirm("Delete this product?")) return;

    try {
      await deleteProduct(id);

      if (isSearching) {
        // in search mode, just update client list & pagination
        setItems((prev) => {
          const filtered = prev.filter((x) => x.id !== id);
          const newTotalPages = Math.max(
            1,
            Math.ceil(filtered.length / PAGE_SIZE)
          );
          setTotalPages(newTotalPages);
          setPage((p) => Math.min(p, newTotalPages - 1));
          return filtered;
        });
      } else {
        // normal mode: reload current page from server
        load(page);
      }

      toast.success("Deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Delete failed");
    }
  };

  /* ---------------------------------------
   * RENDER
   * --------------------------------------- */
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      {/* HEADER */}
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
              setPage(0);
            }}
            className="pl-10 w-full rounded-xl border-gray-300 shadow-sm"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-50 text-gray-800">
            <tr>
              <th className="py-3 px-4 text-left">Title</th>
              <th className="py-3 px-4 text-left">Price</th>
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-left">Stock</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {pagedView.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="py-3 px-4">{p.title}</td>
                <td className="py-3 px-4">
                  {p.price} {p.currency}
                </td>
                <td className="py-3 px-4">{p.categoryName}</td>
                <td className="py-3 px-4">{p.stock ?? "-"}</td>
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
                      navigate(`/home/admin/products/${p.id}/edit`)
                    }
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>

                    <button
                      onClick={() => onDelete(p.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                </td>
              </tr>
            ))}

            {pagedView.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">
                  No matching products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:bg-gray-200 disabled:text-gray-500"
        >
          Prev
        </button>

        <p className="text-gray-600 text-sm">
          Page <b>{page + 1}</b> of <b>{totalPages}</b>
        </p>

        <button
          onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
          disabled={page + 1 >= totalPages}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:bg-gray-200 disabled:text-gray-500"
        >
          Next
        </button>
      </div>
    </div>
  );
}
