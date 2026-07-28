import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  reviewCount,
  size = "sm",
  className,
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < Math.round(rating)
                ? "fill-warning text-warning"
                : "fill-transparent text-subtle",
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted">
        {rating.toFixed(1)}
        {reviewCount != null ? ` (${reviewCount})` : null}
      </span>
    </div>
  );
}
