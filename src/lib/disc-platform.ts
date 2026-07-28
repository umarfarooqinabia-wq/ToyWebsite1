import { cn } from "@/lib/utils";
import type { Product } from "@/types/commerce";

export type DiscPlatform = "ps5" | "ps4" | "xbox" | "switch" | "generic";

export function isGameDiscProduct(product: Product): boolean {
  if (product.tags.includes("gift-card")) return false;
  if (product.tags.includes("console") || product.tags.includes("consoles")) {
    return false;
  }
  const cat = product.category.toLowerCase();
  const path = product.categoryPath.join(" ").toLowerCase();
  if (
    cat === "accessories" ||
    cat.includes("accessory") ||
    cat.includes("console") ||
    path.includes("console") ||
    cat.includes("headset") ||
    cat.includes("controller") ||
    cat.includes("chair") ||
    cat.includes("keyboard") ||
    cat.includes("mouse")
  ) {
    return false;
  }
  if (product.tags.includes("game") || cat.includes("game") || cat.includes("pre-owned")) {
    return true;
  }
  return product.platform.some((p) =>
    /playstation|xbox|nintendo|switch|ps5|ps4/i.test(p),
  );
}

export function resolveDiscPlatform(product: Product): DiscPlatform {
  const hay = [
    ...product.platform,
    product.handle,
    product.title,
    product.category,
    ...product.categoryPath,
    ...product.tags,
  ]
    .join(" ")
    .toLowerCase();

  if (/\bps5\b|playstation\s*5|ps\s*5/.test(hay)) return "ps5";
  if (/\bps4\b|playstation\s*4|ps\s*4/.test(hay)) return "ps4";
  if (/xbox|series\s*x|series\s*s/.test(hay)) return "xbox";
  if (/switch|nintendo/.test(hay)) return "switch";
  return "generic";
}

const PLATFORM_LABEL: Record<DiscPlatform, string> = {
  ps5: "PS5",
  ps4: "PS4",
  xbox: "Xbox",
  switch: "Switch",
  generic: "DISC",
};

export { PLATFORM_LABEL };
