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
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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

  // Images: existing (from backend) + new files (to be uploaded)
  const [existingImages, setExistingImages] = useState([]); // [{ url, alt }]
  const [newImages, setNewImages] = useState([]); // File[]

  /* --------------------
        FILTER CATS
  -------------------- */
  const filteredCategories = useMemo(() => {
    if (!productGender) return categories;
    return categories.filter((c) => c.gender === productGender);
  }, [categories, productGender]);

  /* --------------------
        SLUG GENERATION
  -------------------- */
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

  /* --------------------
        INITIAL LOAD
  -------------------- */
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

  /* --------------------
     LOAD PRODUCT FOR EDIT
  -------------------- */
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

          // product.images is [{ url, alt }]
          setExistingImages(product.images || []);
          setNewImages([]);
        }
      } catch {
        toast.error("Failed to load product");
      }
    }

    loadEditProduct();
  }, [editId]);

  /* --------------------
     CATEGORY CREATE/EDIT
  -------------------- */
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

  /* --------------------
     PRODUCT CREATE/EDIT
  -------------------- */
  async function handleCreateProduct(e) {
    e.preventDefault();

    if (!productCategoryId) return toast.error("Choose a category");
    if (!title.trim()) return toast.error("Product title is required");

    // Frontend size check (10MB per file)
    for (const file of newImages) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds 10 MB limit`);
        return;
      }
    }

    try {
      setProductLoading(true);

      // 1) Upload new images to backend → Cloudinary
      let uploadedDtos = [];
      if (newImages.length > 0) {
        const urls = await Promise.all(
          newImages.map((file) => uploadImage(file))
        );
        uploadedDtos = urls.map((url) => ({
          url,
          alt: title,
        }));
      }

      // 2) Combine old + new images
      const finalImages = [...(existingImages || []), ...uploadedDtos];

      // 3) Build payload for product create/update
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
        RENDER PAGE
  -------------------- */
  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold text-gray-900">Catalog Management</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* --------------------
            CATEGORY SECTION
        -------------------- */}
        <section className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingCategory ? "Edit Category" : "Add Category"}
          </h2>

          <form className="space-y-4" onSubmit={handleCreateCategory}>
            <div>
              <label className="text-sm font-medium">Category Name</label>
              <input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Gender</label>
              <select
                value={catGender}
                onChange={(e) => setCatGender(e.target.value)}
                className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
              >
                {GENDERS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>

            <button
              disabled={catLoading}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {editingCategory ? "Update Category" : "Create Category"}
            </button>
          </form>

          {/* CATEGORY LIST */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Existing Categories
            </h3>

            <ul className="space-y-1 text-sm">
              {categories.map((c) => (
                <li key={c.id} className="flex justify-between items-center">
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

        {/* --------------------
            PRODUCT FORM
        -------------------- */}
        <section className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? "Edit Product" : "Add Product"}
          </h2>

          <form className="space-y-4" onSubmit={handleCreateProduct}>
            {/* Gender */}
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

            {/* Category */}
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

            {/* Title */}
            <div>
              <label className="text-sm font-medium">Title</label>
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="text-sm font-medium">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
              />
            </div>

            {/* Price + Discount */}
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

            {/* Currency + Stock + Status */}
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

            {/* Image Upload */}
            <div>
              <label className="text-sm font-medium">Product Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setNewImages([...e.target.files])}
                className="w-full mt-2 rounded-md border-gray-300 shadow-sm bg-white"
              />

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">
                    Existing images (already saved):
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {existingImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt={img.alt || "product image"}
                        className="h-20 w-full object-cover rounded-md border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Preview */}
              {newImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">
                    New images (will be uploaded on save):
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {newImages.map((file, idx) => (
                      <img
                        key={idx}
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="h-20 w-full object-cover rounded-md border"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              disabled={productLoading}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {editingProduct ? "Update Product" : "Create Product"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
