import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  getAdminProducts,
} from "../../api/adminCatalog";
import { useSearchParams } from "react-router-dom";
import { uploadImage } from "../../api/upload";

const GENDERS = ["MEN", "WOMEN"];
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function AdminCatalog() {
  const [params] = useSearchParams();
  const editId = params.get("edit");

  /* --------------------
      CATEGORY STATE
  -------------------- */
  const [categories, setCategories] = useState([]);
  const [catName, setCatName] = useState("");
  const [catGender, setCatGender] = useState("MEN");
  const [editingCategory, setEditingCategory] = useState(null);
  const [catLoading, setCatLoading] = useState(false);

  /* --------------------
      PRODUCT STATE
  -------------------- */
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [productGender, setProductGender] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(false);

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const filteredCategories = useMemo(() => {
    if (!productGender) return categories;
    return categories.filter((c) => c.gender === productGender);
  }, [categories, productGender]);

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

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch {
      toast.error("Failed to load categories");
    }
  }

  useEffect(() => {
    async function loadEditProduct() {
      if (!editId) return;
      try {
        const all = await getAdminProducts();
        const product = all.find((p) => p.id === editId);
        if (product) {
          setEditingProduct(product.id);
          setProductGender(product.categoryGender || "");
          setProductCategoryId(product.categoryId || "");
          setTitle(product.title || "");
          setSlug(product.slug || "");
          setDescription(product.description || "");
          setPrice(product.price ?? "");
          setDiscountPrice(product.discountPrice ?? "");
          setCurrency(product.currency || "EUR");
          setStock(product.stock ?? "");
          setStatus(product.status || "PUBLISHED");
          setExistingImages(product.images || []);
          setNewImages([]);
        }
      } catch {
        toast.error("Failed to load product");
      }
    }
    loadEditProduct();
  }, [editId]);

  async function handleCreateCategory(e) {
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
        toast.success("Category added");
      }

      setCatName("");
    } catch {
      toast.error("Operation failed");
    } finally {
      setCatLoading(false);
    }
  }

  async function handleCreateProduct(e) {
    e.preventDefault();

    if (!productCategoryId) return toast.error("Choose a category");
    if (!title.trim()) return toast.error("Product title required");

    for (const file of newImages) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds 10 MB limit`);
        return;
      }
    }

    try {
      setProductLoading(true);

      let uploadedDtos = [];
      if (newImages.length > 0) {
        const urls = await Promise.all(newImages.map((f) => uploadImage(f)));
        uploadedDtos = urls.map((url) => ({ url, alt: title }));
      }

      const finalImages = [...(existingImages || []), ...uploadedDtos];

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
        images: finalImages,
        tags: [],
      };

      if (editingProduct) {
        await updateProduct(editingProduct, payload);
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product created");
      }

      resetProductForm();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save product";
      toast.error(msg);
    } finally {
      setProductLoading(false);
    }
  }

  function resetProductForm() {
    setEditingProduct(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setPrice("");
    setDiscountPrice("");
    setStock("");
    setProductGender("");
    setProductCategoryId("");
    setExistingImages([]);
    setNewImages([]);
  }

  /* --------------------
        RENDER UI
  -------------------- */
  return (
    <div className="space-y-10">
      
      {/* PAGE HEADER */}
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Catalog Management
        </h1>
        <p className="text-gray-600">
          Manage categories, add products, and update inventory.
        </p>
      </header>

      {/* MAIN GRID */}
      <div className="grid md:grid-cols-2 gap-10">

        {/* LEFT PANEL: CATEGORY FORM */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

          <h2 className="text-xl font-semibold mb-6">
            {editingCategory ? "Edit Category" : "Create Category"}
          </h2>

          {/* CATEGORY FORM */}
          <form className="space-y-5" onSubmit={handleCreateCategory}>
            
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 font-medium">
                Category Name
              </label>
              <input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500"
                placeholder="e.g., T-Shirts"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-700 font-medium">Gender</label>
              <select
                value={catGender}
                onChange={(e) => setCatGender(e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm"
              >
                {GENDERS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>

            <button
              disabled={catLoading}
              className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
            >
              {editingCategory ? "Update Category" : "Create Category"}
            </button>
          </form>

          {/* CATEGORY LIST */}
          <div className="mt-8">
            <h3 className="text-sm text-gray-600 font-semibold mb-3">
              Categories
            </h3>

            <ul className="space-y-2">
              {categories.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border text-sm"
                >
                  <div>
                    <span className="font-medium">{c.name}</span>
                    <span className="ml-2 text-gray-500 text-xs">{c.gender}</span>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setEditingCategory(c.id);
                        setCatName(c.name);
                        setCatGender(c.gender);
                      }}
                      className="text-blue-600 hover:underline text-xs"
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
                      className="text-red-600 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* RIGHT PANEL: PRODUCT FORM */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

          <h2 className="text-xl font-semibold mb-6">
            {editingProduct ? "Edit Product" : "Create Product"}
          </h2>

          {/* PRODUCT FORM */}
          <form className="space-y-6" onSubmit={handleCreateProduct}>

            {/* GENDER */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 font-medium">Gender</label>
              <select
                value={productGender}
                onChange={(e) => {
                  setProductGender(e.target.value);
                  setProductCategoryId("");
                }}
                className="mt-1 rounded-lg border-gray-300 shadow-sm"
              >
                <option value="">All</option>
                {GENDERS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* CATEGORY */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 font-medium">Category</label>
              <select
                value={productCategoryId}
                onChange={(e) => setProductCategoryId(e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm"
              >
                <option value="">Select...</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.gender})
                  </option>
                ))}
              </select>
            </div>

            {/* TITLE */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 font-medium">Title</label>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm"
                placeholder="e.g., Cotton Hoodie"
              />
            </div>

            {/* SLUG */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 font-medium">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm"
                placeholder="cotton-hoodie"
              />
            </div>

            {/* DESCRIPTION */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 font-medium">
                Description
              </label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 rounded-lg border-gray-300 shadow-sm"
                placeholder="Short description of the product..."
              />
            </div>

            {/* PRICE + DISCOUNT */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 rounded-lg border-gray-300 shadow-sm"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Discount Price
                </label>
                <input
                  type="number"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  className="mt-1 rounded-lg border-gray-300 shadow-sm"
                />
              </div>
            </div>

            {/* CURRENCY + STOCK + STATUS */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Currency
                </label>
                <input
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1 rounded-lg border-gray-300 shadow-sm"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Stock
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="mt-1 rounded-lg border-gray-300 shadow-sm"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 rounded-lg border-gray-300 shadow-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* IMAGES */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Product Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNewImages([...e.target.files])}
                className="mt-2 rounded-lg border-gray-300 shadow-sm bg-white"
              />

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">
                    Existing images:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {existingImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt={img.alt}
                        className="h-20 w-full rounded-lg object-cover border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Preview New Images */}
              {newImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">New images:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {newImages.map((file, idx) => (
                      <img
                        key={idx}
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="h-20 w-full rounded-lg object-cover border"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* BUTTON */}
            <button
              disabled={productLoading}
              className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
            >
              {editingProduct ? "Update Product" : "Add Product"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
