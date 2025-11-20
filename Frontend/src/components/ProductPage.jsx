import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import { ShoppingCart, Star, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);

    axios
      .get(`/api/products/${slug}`)
      .then((res) => {
        setProduct(res.data);
        setSelectedImage(res.data.images?.[0]?.url);
      })
      .catch(() => setProduct(null));
  }, [slug]);

  if (!product) {
    return (
      <div className="pt-20 text-center text-gray-600">
        Loading product…
      </div>
    );
  }

  /* ADD TO CART HANDLER */
  const handleAddToCart = () => {
    const item = {
      id: product.id,
      title: product.title,
      price: product.price,
      currency: product.currency,
      description: product.description,
      image: selectedImage,
      quantity: qty,
    };

    addToCart(item);
    toast.success("Added to cart!");

    navigate("/cart");
  };

  return (
    <>
      <Navbar />

      <div className="pt-28 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* LEFT IMAGE */}
          <div>
            <img
              src={selectedImage}
              alt={product.title}
              className="rounded-2xl shadow-xl w-full object-cover"
            />

            <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
              {product.images?.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-24 h-24 rounded-xl object-cover cursor-pointer border ${
                    selectedImage === img.url
                      ? "ring-2 ring-indigo-600"
                      : "hover:ring-2 hover:ring-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT DETAILS */}
          <div>
            <h1 className="text-4xl font-semibold text-gray-900">
              {product.title}
            </h1>

            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
              {product.description}
            </p>

            {/* PRICE */}
            <p className="mt-8 text-4xl font-bold text-gray-900">
              {product.currency ?? "€"}
              {product.price}
            </p>

            {/* QUANTITY SELECTOR */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-3 border rounded-full px-4 py-2">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="text-lg font-semibold">{qty}</span>

                <button
                  onClick={() => setQty(qty + 1)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* ADD TO CART BUTTON */}
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-medium shadow-md transition"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
            </div>

            {/* FEATURES */}
            <ul className="mt-10 space-y-3 text-gray-700 text-lg">
              <li>✔ High-quality material</li>
              <li>✔ Premium design</li>
              <li>✔ Fast delivery</li>
            </ul>

            {/* ICON ROW */}
            <div className="mt-12 flex gap-12 text-gray-700">
              <div className="text-center">
                <div className="text-3xl">🚚</div>
                <p>Fast Shipping</p>
              </div>
              <div className="text-center">
                <div className="text-3xl">📦</div>
                <p>Secure Packaging</p>
              </div>
              <div className="text-center">
                <div className="text-3xl">⭐</div>
                <p>5-Star Quality</p>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS */}
        <div className="mt-20 max-w-4xl">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Customer Reviews
          </h2>

          <Review
            name="Sophia L."
            rating={5}
            text="Amazing quality and perfect fit. Looks even better in person!"
          />
          <Review
            name="Mark T."
            rating={4}
            text="Stylish jacket and fast delivery. Highly recommended!"
          />
          <Review
            name="Emma R."
            rating={5}
            text="Bought this as a gift. He loved it. Superb material!"
          />
        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-10 border-t border-gray-200 bg-white/60 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-sm text-gray-600">
          © {new Date().getFullYear()} 🛒 E-Commerce
        </div>
      </footer>
    </>
  );
}

/* --- REVIEW COMPONENTS --- */

function Review({ name, rating, text }) {
  return (
    <div className="bg-white shadow rounded-xl p-6 mb-4">
      <div className="flex items-center gap-3 mb-2">
        <strong className="text-gray-900">{name}</strong>
        <Rating count={rating} />
      </div>
      <p className="text-gray-700">{text}</p>
    </div>
  );
}

function Rating({ count }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < count ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}
