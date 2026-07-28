import { ProductCardSkeleton } from "@/components/ui/states";

export default function ProductsLoading() {
  return (
    <div className="container-px mx-auto max-w-7xl py-8">
      <div className="skeleton mb-4 h-4 w-40" />
      <div className="skeleton mb-3 h-9 w-56" />
      <div className="skeleton mb-10 h-4 w-96 max-w-full" />
      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <div className="hidden space-y-4 lg:block">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-24 w-full rounded-xl" />
          ))}
        </div>
        <div>
          <div className="mb-6 flex justify-between">
            <div className="skeleton h-5 w-28" />
            <div className="skeleton h-10 w-48" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
