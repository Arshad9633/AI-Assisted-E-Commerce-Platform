import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getCategories,
  getAdminProduct,
  updateProduct,
} from "../../api/adminCatalog";

import { uploadImage } from "../../api/upload";
import { ADMIN_BASE } from "../../config/routes";

import AdminNavbar from "../../components/AdminNavBar";

const GENDERS = ["MEN", "WOMEN"];
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);

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

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const filteredCategories = useMemo(() => {
    if (!productGender) return categories;
    return categories.filter((c) => c.gender === productGender);
  }, [categories, productGender]);

  const handleTitleChange = (value) => {
    setTitle(value);
    if (!slug) {
      const generated = value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  // Load categories and existing product
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [cats, product] = await Promise.all([
          getCategories(),
          getAdminProduct(id),
        ]);

        setCategories(cats || []);

        setTitle(product.title || "");
        setSlug(product.slug || "");
        setDescription(product.description || "");
        setPrice(product.price ?? "");
        setDiscountPrice(product.discountPrice ?? "");
        setCurrency(product.currency || "EUR");
        setStock(product.stock ?? "");
        setStatus(product.status || "PUBLISHED");
        setProductGender(product.categoryGender || "");
        setProductCategoryId(product.categoryId || "");
        setExistingImages(product.images || []);
        setNewImages([]);
      } catch (err) {
        console.error("Load product failed", err);
        toast.error("Failed to load product");
        navigate(`${ADMIN_BASE}/products`);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!productCategoryId) return toast.error("Choose a category");
    if (!title.trim()) return toast.error("Product title required");

    for (const file of newImages) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds 10MB limit`);
        return;
      }
    }

    try {
      setSaving(true);

      let uploadedDtos = [];
      if (newImages.length > 0) {
        const urls = await Promise.all(newImages.map((f) => uploadImage(f)));
        uploadedDtos = urls.map((url) => ({ url, alt: title }));
      }

      const finalImages = [...existingImages, ...uploadedDtos];

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

      await updateProduct(id, payload);
      toast.success("Product updated");

      navigate(`${ADMIN_BASE}/products`);
    } catch (err) {
      console.error("Update failed", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save product"
      );
    } finally {
      setSaving(false);
    }
  }

  // ---------- Helper UI small components ----------
  const FieldLabel = ({ children, optional }) => (
    <label className="block text-sm font-medium text-gray-700">
      {children} {optional && <span className="text-gray-400 text-xs">({optional})</span>}
    </label>
  );

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="p-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border text-gray-600">
            Loading product…
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />

      <main className="p-6 max-w-[1300px] mx-auto">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Edit product</h1>
            <p className="text-sm text-gray-600 mt-1">
              Change details, pricing, stock and images for the product.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`${ADMIN_BASE}/products`)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
            >
              Back to products
            </button>

            <button
              form="product-form"
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </header>

        {/* Grid: main form (left) + preview/sidebar (right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main column */}
          <section className="md:col-span-8">
            <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Card: Basic info */}
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <FieldLabel>Title</FieldLabel>
                    <input
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500"
                      placeholder="e.g., Cotton Hoodie"
                    />
                  </div>

                  <div>
                    <FieldLabel>Slug <span className="text-xs text-gray-400">auto-generated</span></FieldLabel>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500"
                      placeholder="cotton-hoodie"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500"
                    placeholder="Short description of the product..."
                  />
                </div>
              </div>

              {/* Card: Pricing & inventory */}
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <FieldLabel>Price</FieldLabel>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <FieldLabel>Discount price <span className="text-xs text-gray-400">(optional)</span></FieldLabel>
                    <input
                      type="number"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <FieldLabel>Currency</FieldLabel>
                    <input
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <FieldLabel>Stock</FieldLabel>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <FieldLabel>Status</FieldLabel>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <FieldLabel>Gender</FieldLabel>
                    <select
                      value={productGender}
                      onChange={(e) => {
                        setProductGender(e.target.value);
                        setProductCategoryId("");
                      }}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500"
                    >
                      <option value="">All</option>
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Card: Category selection */}
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <FieldLabel>Category</FieldLabel>
                <select
                  value={productCategoryId}
                  onChange={(e) => setProductCategoryId(e.target.value)}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:ring-indigo-500"
                >
                  <option value="">Select a category</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.gender}
                    </option>
                  ))}
                </select>
              </div>

              {/* Card: Images (main column) */}
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <FieldLabel>Product images <span className="text-xs text-gray-400">(you can upload multiple)</span></FieldLabel>

                <div className="mt-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setNewImages([...e.target.files])}
                    className="block w-full text-sm text-gray-600"
                  />
                </div>

                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-2">Existing images</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {existingImages.map((img, idx) => (
                        <div key={idx} className="relative rounded-md overflow-hidden border">
                          <img src={img.url} alt={img.alt || ""} className="w-full h-28 object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New image previews */}
                {newImages.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-2">New images (preview)</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {newImages.map((file, idx) => (
                        <div key={idx} className="relative rounded-md overflow-hidden border">
                          <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-28 object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </section>

          {/* Sidebar / preview */}
          <aside className="md:col-span-4 space-y-4">
            {/* Preview card */}
            <div className="sticky top-24 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                  {existingImages[0] ? (
                    <img src={existingImages[0].url} alt={existingImages[0].alt || ""} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                  )}
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-900">{title || "Untitled product"}</div>
                  <div className="text-xs text-gray-500 mt-1">{productCategoryId ? `${productCategoryId}` : "No category"}</div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-700">
                <div><span className="font-medium">Price:</span> {price ? `${price} ${currency}` : "—"}</div>
                <div className="mt-1"><span className="font-medium">Stock:</span> {stock ?? "—"}</div>
                <div className="mt-1"><span className="font-medium">Status:</span> <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-100">{status}</span></div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate(`${ADMIN_BASE}/products`)}
                  className="flex-1 py-2 rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={() => document.getElementById("product-form").dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))}
                  disabled={saving}
                  className="flex-1 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            {/* Small help panel */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm text-gray-600 shadow-sm">
              <div className="font-medium text-gray-900 mb-2">Tip</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use clear, short titles for better searchability.</li>
                <li>Slug is auto-generated from title but you can edit it.</li>
                <li>Upload high-resolution images; they’ll be optimized on upload.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
