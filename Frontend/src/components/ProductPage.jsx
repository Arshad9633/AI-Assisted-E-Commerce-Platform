import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import { ShoppingCart, Star, Plus, Minus, Heart, Truck } from "lucide-react";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export default function ProductPage() {
  const { slug } = useParams();             // ✅ only slug here
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  // 🔹 Load ONE product by slug
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    axios
      .get(`/api/products/${slug}`)
      .then((res) => {
        const p = res.data;
        setProduct(p);
        setSelectedImage(p.images?.[0]?.url ?? null);

        const stock = p.stock ?? 0;
        if (stock <= 0) {
          setQty(1);
        } else if (qty > stock) {
          setQty(stock);
        }
      })
      .catch((err) => {
        console.error("Failed to load product", err);
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [slug]); // ✅ depends only on slug

  const safeStock = typeof product?.stock === "number" ? product.stock : 0;
  const isOutOfStock = safeStock <= 0;

  const handleDecreaseQty = () => {
    setQty((prev) => Math.max(1, prev - 1));
  };

  const handleIncreaseQty = () => {
    setQty((prev) => {
      if (!safeStock || safeStock <= 0) return prev + 1;

      if (prev >= safeStock) {
        toast.error(`Only ${safeStock} in stock.`);
        return safeStock;
      }
      return prev + 1;
    });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("This product is out of stock.");
      return;
    }

    if (qty > safeStock) {
      toast.error(`Only ${safeStock} available.`);
      setQty(safeStock);
      return;
    }

    const item = {
      id: product.id,
      title: product.title,
      price: product.price,
      currency: product.currency,
      description: product.description,
      image: selectedImage,
      quantity: qty,
      stock: safeStock,
    };

    addToCart(item);
    toast.success("Added to cart");
    navigate("/cart");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-28 max-w-6xl mx-auto px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-gray-100 rounded-3xl" />
            <div className="h-6 w-3/5 bg-gray-100 rounded" />
            <div className="h-4 w-1/3 bg-gray-100 rounded" />
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="pt-28 text-center text-gray-600">
          Product not found.
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="pt-24 pb-16 bg-[#e6f0ff]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* IMAGE GALLERY */}
            <section className="lg:col-span-7">
              <div className="rounded-3xl overflow-hidden shadow-2xl bg-white">
                <div className="relative product-img-transition">
                  <img
                    src={selectedImage}
                    alt={product.title}
                    className="w-full h-[560px] object-cover"
                    loading="lazy"
                  />

                  <div className="absolute top-6 left-6 flex gap-3">
                    {product.badges?.map((b, i) => (
                      <span
                        key={i}
                        className="bg-indigo-600/90 text-white text-xs font-medium px-3 py-1 rounded-full shadow"
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  <style>{`
                    .product-img-transition img {
                      transition: transform 450ms cubic-bezier(.2,.9,.3,1);
                    }
                    .product-img-transition img:hover {
                      transform: scale(1.02);
                    }
                  `}</style>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 overflow-x-auto pb-2">
                {product.images?.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img.url)}
                    className={`flex-shrink-0 w-28 h-20 rounded-xl overflow-hidden border transition-all focus:outline-none ${
                      selectedImage === img.url
                        ? "ring-2 ring-indigo-300 border-transparent"
                        : "border-gray-100 hover:scale-105"
                    }`}
                    aria-label={`Select image ${idx + 1}`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </section>

            {/* DETAILS */}
            <aside className="lg:col-span-5">
              <div className="sticky top-28">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  {product.title}
                </h1>

                <div className="mt-3 flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 text-yellow-400">
                    <Star className="w-5 h-5" />
                    <span className="font-medium">
                      {product.rating ?? "4.8"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    • {product.reviewsCount ?? 128} reviews
                  </div>
                </div>

                <p className="mt-4 text-gray-700 text-lg leading-relaxed">
                  {product.description}
                </p>

                <div className="mt-6 flex items-end justify-between gap-6">
                  <div>
                    <div className="text-sm text-gray-500">Price</div>
                    <div className="text-3xl font-extrabold text-gray-900">
                      {product.currency ?? "€"}
                      {product.price}
                    </div>
                    {product.oldPrice && (
                      <div className="text-sm text-gray-500 line-through">
                        {product.currency ?? "€"}
                        {product.oldPrice}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 text-right">
                    <div className="text-xs text-gray-500">Availability</div>
                    <div
                      className={`text-sm font-medium ${
                        isOutOfStock ? "text-red-500" : "text-green-600"
                      }`}
                    >
                      {isOutOfStock
                        ? "Out of stock"
                        : `In stock (${safeStock})`}
                    </div>
                  </div>
                </div>

                {/* OPTIONS + ACTIONS */}
                <div className="mt-6 border rounded-2xl bg-white p-4 shadow-sm">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Colors (optional) */}
                    {product.colors && (
                      <div>
                        <div className="text-sm text-gray-500 mb-2">
                          Color
                        </div>
                        <div className="flex items-center gap-3">
                          {product.colors.map((c) => (
                            <button
                              key={c.name}
                              className="w-10 h-10 rounded-full border-2 flex items-center justify-center focus:outline-none"
                              style={{ backgroundColor: c.value }}
                              aria-label={c.name}
                              onClick={() => {
                                setSelectedImage(c.image ?? selectedImage);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Qty + Buttons */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 border rounded-full px-3 py-1">
                        <button
                          onClick={handleDecreaseQty}
                          className="p-2 rounded-full hover:bg-gray-100"
                          aria-label="Decrease quantity"
                          disabled={isOutOfStock}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="w-12 text-center font-medium">
                          {isOutOfStock ? 0 : qty}
                        </div>
                        <button
                          onClick={handleIncreaseQty}
                          className="p-2 rounded-full hover:bg-gray-100"
                          aria-label="Increase quantity"
                          disabled={isOutOfStock}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleAddToCart}
                          disabled={isOutOfStock}
                          className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl font-semibold shadow-lg transition ${
                            isOutOfStock
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white"
                          }`}
                        >
                          <ShoppingCart className="w-5 h-5" />
                          {isOutOfStock ? "Out of stock" : "Add to cart"}
                        </button>

                        <button
                          onClick={() => toast("Added to wishlist")}
                          className="p-3 rounded-xl border hover:bg-gray-50"
                          aria-label="Add to wishlist"
                        >
                          <Heart className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BENEFITS ROW */}
                <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-indigo-600 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Fast shipping
                      </div>
                      <div className="text-xs">Delivered in 2–4 days</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-1">🔒</div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Secure payment
                      </div>
                      <div className="text-xs">Encrypted checkout</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-1">✅</div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Quality assured
                      </div>
                      <div className="text-xs">2-year warranty</div>
                    </div>
                  </div>
                </div>

                {/* TABS */}
                <div className="mt-8 bg-white border rounded-2xl p-4">
                  <div className="flex gap-3">
                    <TabButton
                      active={activeTab === "details"}
                      onClick={() => setActiveTab("details")}
                    >
                      Description
                    </TabButton>
                    <TabButton
                      active={activeTab === "specs"}
                      onClick={() => setActiveTab("specs")}
                    >
                      Specs
                    </TabButton>
                    <TabButton
                      active={activeTab === "reviews"}
                      onClick={() => setActiveTab("reviews")}
                    >
                      Reviews
                    </TabButton>
                  </div>

                  <div className="mt-4">
                    {activeTab === "details" && (
                      <div className="prose max-w-none text-gray-700">
                        {product.longDescription ?? product.description}
                      </div>
                    )}

                    {activeTab === "specs" && (
                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                        {product.specs &&
                          Object.entries(product.specs).map(([k, v]) => (
                            <div
                              key={k}
                              className="flex justify-between border-b py-2"
                            >
                              <span className="text-gray-500">{k}</span>
                              <span className="font-medium">{v}</span>
                            </div>
                          ))}
                      </div>
                    )}

                    {activeTab === "reviews" && (
                      <div className="space-y-4">
                        {(product.reviews || []).length === 0 && (
                          <div className="text-gray-500">
                            No reviews yet.
                          </div>
                        )}

                        {(product.reviews || []).map((r, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">{r.name}</div>
                              <div className="text-sm text-gray-500">
                                {r.date}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star
                                  key={idx}
                                  className={`w-4 h-4 ${
                                    idx < r.rating
                                      ? "text-yellow-400"
                                      : "text-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-sm text-gray-700">
                              {r.comment}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <footer className="py-10 border-t border-gray-200 bg-white/60">
        <div className="max-w-7xl mx-auto px-4 text-sm text-gray-600">
          © {new Date().getFullYear()} • E-Commerce
        </div>
      </footer>
    </>
  );
}

function TabButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
        active
          ? "bg-indigo-600 text-white shadow"
          : "text-gray-600 bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}
