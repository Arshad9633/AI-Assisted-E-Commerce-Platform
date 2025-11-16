import ProductCard from "./ProductCard";

export default function FeaturedProducts({ products, onAddToCart, onDelete }) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          onAddToCart={onAddToCart}
          onDelete={onDelete}
        />
      ))}
      {!products?.length && (
        <li className="col-span-full rounded-2xl bg-white/70 p-6 ring-1 ring-gray-200 text-gray-500">
          No products yet.
        </li>
      )}
    </ul>
  );
}
