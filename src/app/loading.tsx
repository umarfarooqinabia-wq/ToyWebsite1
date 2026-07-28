import { ProductCardSkeleton } from "@/components/ui/states";

export default function Loading() {
  return (
    <div className="container-px mx-auto max-w-7xl py-10">
      <div className="skeleton mb-6 h-8 w-48" />
      <div className="skeleton mb-10 h-4 w-80 max-w-full" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
