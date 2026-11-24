import ProductCard from "@/components/site/ProductCard";

export default function ProductGrid({ products = [], columns = 4 }) {
  const gridClass =
    columns === 3
      ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div className={gridClass}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}