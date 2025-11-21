import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

export default function ProductCard({
  product,
  onDelete,
  className = "",
}) {
  const navigate = useNavigate();

  const goToProduct = () => {
    if (!product.slug) return;
    navigate(`/product/${product.slug}`);
  };

  return (
    <li
      className={`group rounded-2xl bg-white/80 backdrop-blur ring-1 ring-gray-200 p-4 hover:shadow-md transition ${className}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
        {product.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-indigo-600/90 px-2.5 py-0.5 text-xs font-semibold text-white">
            {product.badge}
          </span>
        )}

        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>

      {/* Title */}
      <h3 className="mt-3 font-semibold text-gray-900 line-clamp-1">
        {product.title}
      </h3>

      {/* Description */}
      {product.description && (
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {product.description}
        </p>
      )}

      {/* Price */}
      <p className="mt-2 font-bold text-gray-900">
        {product.currency === "EUR"
          ? `€${product.price}`
          : `${product.price} ${product.currency}`}
      </p>

      {/* View Product */}
      <button
        onClick={goToProduct}
        className="mt-4 w-full rounded-full border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
      >
        View Product
      </button>

      {/* Optional Delete for Admin */}
      {onDelete && (
        <button
          onClick={() => onDelete(product.id)}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" />
          Delete Product
        </button>
      )}
    </li>
  );
}
