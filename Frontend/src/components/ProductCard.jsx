import { useState } from "react";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";

export default function ProductCard({ 
    product, 
    onAddToCart, 
    onDelete, 
    className = "",
}) {
    const [quantity, setQuantity] = useState(1);
    const maxQuantity = product.stock || 99;

    const dec = () => setQuantity(q => Math.max(1, q - 1));
    const inc = () => setQuantity(q => Math.min(maxQuantity, q + 1));

    return (
    <li
      className={`group rounded-2xl bg-white/80 backdrop-blur ring-1 ring-gray-200 p-4 hover:shadow-md transition ${className}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
        {product.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-indigo-600/90 px-2.5 py-1 text-xs font-medium text-white">
            {product.badge}
          </span>
        )}

        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />

        {/* Delete (admin/public optional) */}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(product.id)}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 ring-1 ring-gray-300 shadow hover:bg-white"
            aria-label={`Remove ${product.title}`}
          >
            <Trash2 className="h-4 w-4 text-gray-700" />
          </button>
        )}
      </div>

      {/* Info */}
      <h3 className="mt-3 font-semibold text-gray-900 line-clamp-1">
        {product.title}
      </h3>
      {product.description && (
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {product.description}
        </p>
      )}

      {/* Price + qty + CTA */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-base font-semibold text-gray-900">
          {formatCurrency(product.price, product.currency || "EUR")}
        </span>

        <div className="flex items-center gap-2">
          {/* Qty stepper */}
          <div className="flex items-center rounded-full ring-1 ring-gray-300">
            <button type="button" onClick={dec} className="p-1.5 hover:bg-gray-50" aria-label="Decrease">
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              value={qty}
              onChange={(e) => {
                const v = Math.max(1, Math.min(+e.target.value || 1, maxQty));
                setQty(v);
              }}
              className="w-12 border-0 bg-transparent text-center text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min={1}
              max={maxQty}
            />
            <button type="button" onClick={inc} className="p-1.5 hover:bg-gray-50" aria-label="Increase">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Add to basket */}
          <button
            type="button"
            onClick={() => onAddToCart?.(product, qty)}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </li>
  );
}

// tiny currency helper local to this file
function formatCurrency(value, currency = "EUR", locale = navigator.language || "en-US") {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}
