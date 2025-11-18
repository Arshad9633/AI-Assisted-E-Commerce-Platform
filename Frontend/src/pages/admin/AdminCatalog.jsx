import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/adminCatalog";

const GENDERS = ["MEN", "WOMEN"];
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export default function AdminCatalog() {
  // CATEGORY STATE
  const [categories, setCategories] = useState([]);
  const [catName, setCatName] = useState("");
  const [catGender, setCatGender] = useState("MEN");
  const [catLoading, setCatLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // PRODUCT STATE
  const [productGender, setProductGender] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [productLoading, setProductLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // PRODUCT LIST
  const [adminProducts, setAdminProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!productGender) return categories;
    return categories.filter((c) => c.gender === productGender);
  }, [categories, productGender]);

  // Auto slug
  const handleTitleChange = (v) => {
    setTitle(v);
    if (!slug) {
      setSlug(
        v
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    async function load() {
      try {
        setProductsLoading(true);
        const [cats, products] = await Promise.all([
          getCategories(),
          getAdminProducts(),
        ]);
        setCategories(cats);
        setAdminProducts(products);
      } catch (e) {
        toast.error("Failed to load catalog");
      } finally {
        setProductsLoading(false);
      }
    }
    load();
  }, []);

  // CATEGORY: CREATE + UPDATE
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return toast.error("Category name required");

    try {
      setCatLoading(true);

      if (editingCategory) {
        const updated = await updateCategory(editingCategory, {
          name: catName.trim(),
          gender: catGender,
        });

        setCategories((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );

        setEditingCategory(null);
        toast.success("Category updated");
      } else {
        const newCat = await createCategory({
          name: catName.trim(),
          gender: catGender,
        });
        setCategories((prev) => [...prev, newCat]);
        toast.success("Category created");
      }

      setCatName("");
    } catch {
      toast.error("Operation failed");
    } finally {
      setCatLoading(false);
    }
  };

  // PRODUCT: CREATE + UPDATE
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!productCategoryId) return toast.error("Choose a category");
    if (!title.trim()) return toast.error("Product title is required");

    const payload = {
      title,
      slug,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      currency,
      stock: stock ? Number(stock) : 0,
      status,
      category: productCategoryId,
      images: [],
      tags: [],
    };

    try {
      setProductLoading(true);

      if (editingProduct) {
        const updated = await updateProduct(editingProduct, payload);

        setAdminProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );

        setEditingProduct(null);
        toast.success("Product updated");
      } else {
        const created = await createProduct(payload);
        setAdminProducts((prev) => [created, ...prev]);
        toast.success("Product created");
      }

      // Reset form
      setTitle("");
      setSlug("");
      setDescription("");
      setPrice("");
      setDiscountPrice("");
      setStock("");
      setProductGender("");
      setProductCategoryId("");
    } catch {
      toast.error("Failed to save product");
    } finally {
      setProductLoading(false);
    }
  };

  // LOAD PRODUCT INTO FORM FOR EDITING
  const loadProductForEdit = (p) => {
    setEditingProduct(p.id);
    setTitle(p.title);
    setSlug(p.slug);
    setDescription(p.description);
    setPrice(p.price);
    setDiscountPrice(p.discountPrice || "");
    setCurrency(p.currency);
    setStock(p.stock);
    setStatus(p.status);
    setProductGender(p.categoryGender);
    setProductCategoryId(p.categoryId);
  };

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold text-gray-900">Catalog Management</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* CATEGORY SECTION */}
        <section className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingCategory ? "Edit Category" : "Add Category"}
          </h2>

          <form className="space-y-4" onSubmit={handleCreateCategory}>
            <div>
              <label className="text-sm font-medium">Category Name</label>
              <input
                className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Gender</label>
              <select
                className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
                value={catGender}
                onChange={(e) => setCatGender(e.target.value)}
              >
                {GENDERS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>

            <button
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
              disabled={catLoading}
            >
              {editingCategory ? "Update Category" : "Create Category"}
            </button>
          </form>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Existing Categories
            </h3>

            <ul className="space-y-1 text-sm">
              {categories.map((c) => (
                <li
                  key={c.id}
                  className="flex justify-between items-center py-1"
                >
                  <div>
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {c.gender}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setEditingCategory(c.id);
                        setCatName(c.name);
                        setCatGender(c.gender);
                      }}
                      className="text-blue-600 text-xs hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      onClick={async () => {
                        if (!confirm("Delete this category?")) return;
                        await deleteCategory(c.id);
                        setCategories((prev) =>
                          prev.filter((x) => x.id !== c.id)
                        );
                        toast.success("Category deleted");
                      }}
                      className="text-red-600 text-xs hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* PRODUCT SECTION */}
        <section className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? "Edit Product" : "Add Product"}
          </h2>

          <form className="space-y-4" onSubmit={handleCreateProduct}>
            <div>
              <label className="text-sm font-medium">Gender</label>
              <select
                value={productGender}
                onChange={(e) => {
                  setProductGender(e.target.value);
                  setProductCategoryId("");
                }}
                className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
              >
                <option value="">All</option>
                {GENDERS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={productCategoryId}
                onChange={(e) => setProductCategoryId(e.target.value)}
                className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
              >
                <option value="">Select...</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.gender})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Title</label>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Discount Price</label>
                <input
                  type="number"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Currency</label>
                <input
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Stock</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
              disabled={productLoading}
            >
              {editingProduct ? "Update Product" : "Create Product"}
            </button>
          </form>
        </section>
      </div>

      {/* PRODUCT LIST */}
      <section className="bg-white p-6 rounded-xl shadow border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">
          Latest Products{" "}
          {productsLoading && (
            <span className="text-xs text-gray-500">(Loading...)</span>
          )}
        </h2>

        {adminProducts.length === 0 ? (
          <p className="text-gray-500">No products yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase border-b">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {adminProducts.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-3 px-4">{p.title}</td>
                    <td className="py-3 px-4 text-gray-500">{p.slug}</td>
                    <td className="py-3 px-4">
                      {p.price} {p.currency}
                    </td>
                    <td className="py-3 px-4">{p.status}</td>
                    <td className="py-3 px-4">{p.categoryName}</td>
                    <td className="py-3 px-4">{p.categoryGender || "-"}</td>

                    <td className="py-3 px-4 flex gap-3 text-xs">

                      {/* EDIT PRODUCT */}
                      <button
                        onClick={() => loadProductForEdit(p)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>

                      {/* DELETE PRODUCT */}
                      <button
                        onClick={async () => {
                          if (!confirm("Delete this product?")) return;
                          await deleteProduct(p.id);
                          setAdminProducts((prev) =>
                            prev.filter((x) => x.id !== p.id)
                          );
                          toast.success("Product deleted");
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
        )}
      </section>
    </div>
  );
}
