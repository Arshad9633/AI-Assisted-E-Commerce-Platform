import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getAdminProducts, deleteProduct } from "../../api/adminCatalog";
import { ADMIN_BASE } from "../../config/routes";

export default function AdminProductList() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getAdminProducts();
      setProducts(data);
    } catch {
      toast.error("Failed to load products");
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Products</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase border-b">
            <tr>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="py-3 px-4">{p.title}</td>
                <td className="py-3 px-4">{p.price} {p.currency}</td>
                <td className="py-3 px-4">{p.categoryName}</td>
                <td className="py-3 px-4">{p.status}</td>

                <td className="py-3 px-4 flex gap-3 text-xs">

                  {/* ⭐ EDIT BUTTON → Navigate to catalog edit */}
                  <button
                    onClick={() => navigate(`${ADMIN_BASE}/catalog?edit=${p.id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>

                  {/* DELETE PRODUCT */}
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
