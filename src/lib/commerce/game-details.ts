import { isGameDiscProduct } from "@/lib/disc-platform";
import type { Product, ProductSpec } from "@/types/commerce";

/** Ordered fields shown on game product detail screens. */
export const GAME_DETAIL_LABELS = [
  "Age rating",
  "Genre",
  "Number of players",
  "Online/offline",
  "Story length",
  "Difficulty",
  "Language",
  "PS4",
  "PS5",
] as const;

export type GameDetailLabel = (typeof GAME_DETAIL_LABELS)[number];

function specValue(product: Product, label: string): string | undefined {
  return product.specs.find((s) => s.label.toLowerCase() === label.toLowerCase())?.value;
}

function genreOf(product: Product): string {
  const fromSpec = specValue(product, "Genre");
  if (fromSpec) return fromSpec;
  const skip = new Set([
    "game",
    "ps5-cd",
    "ps4-cd",
    "top-pakistan",
    "top-50",
    "top-ps4",
    "top-switch",
    "top-xbox",
    "pre-owned",
    "used-games",
    "switch-game",
    "gift-card",
  ]);
  const tag = product.tags.find((t) => !skip.has(t) && !t.includes("pakistan"));
  if (tag) {
    return tag
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return "Action";
}

function platformHay(product: Product): string {
  return [
    ...product.platform,
    product.category,
    ...product.categoryPath,
    product.handle,
    product.title,
    ...product.tags,
  ]
    .join(" ")
    .toLowerCase();
}

function yesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

function defaultsForGenre(genre: string): {
  age: string;
  players: string;
  online: string;
  story: string;
  difficulty: string;
} {
  const g = genre.toLowerCase();

  if (/sport|racing|party|life sim|platform/.test(g)) {
    return {
      age: "PEGI 3+",
      players: "1–4",
      online: "Online & Offline",
      story: "8–20 hours",
      difficulty: "Easy–Medium",
    };
  }
  if (/fight|wrestling/.test(g)) {
    return {
      age: "PEGI 16",
      players: "1–2 (local) / Online",
      online: "Online & Offline",
      story: "6–12 hours",
      difficulty: "Medium–Hard",
    };
  }
  if (/fps|shooter|horror/.test(g)) {
    return {
      age: "PEGI 18",
      players: "1 / Online multiplayer",
      online: "Online & Offline",
      story: "6–12 hours",
      difficulty: "Medium",
    };
  }
  if (/open world|rpg|adventure/.test(g)) {
    return {
      age: "PEGI 18",
      players: "1",
      online: "Offline (online features optional)",
      story: "30–60+ hours",
      difficulty: "Medium",
    };
  }
  if (/action/.test(g)) {
    return {
      age: "PEGI 16",
      players: "1–2",
      online: "Online & Offline",
      story: "12–25 hours",
      difficulty: "Medium",
    };
  }

  return {
    age: "PEGI 16",
    players: "1–4",
    online: "Online & Offline",
    story: "10–20 hours",
    difficulty: "Medium",
  };
}

/** Infer PS4 / PS5 support for storefront display. */
export function inferPsSupport(product: Product): { ps4: boolean; ps5: boolean } {
  const hay = platformHay(product);
  const isPs5 = /\bps5\b|playstation\s*5|ps\s*5/.test(hay);
  const isPs4 = /\bps4\b|playstation\s*4|ps\s*4/.test(hay);
  // PS4 discs typically play on PS5 via backwards compatibility.
  if (isPs4 && !isPs5) return { ps4: true, ps5: true };
  if (isPs5) return { ps4: false, ps5: true };
  return { ps4: false, ps5: false };
}

export function buildGameDetailSpecs(product: Product): ProductSpec[] {
  const genre = genreOf(product);
  const defaults = defaultsForGenre(genre);
  const { ps4, ps5 } = inferPsSupport(product);

  const inferred: Record<GameDetailLabel, string> = {
    "Age rating": defaults.age,
    Genre: genre,
    "Number of players": defaults.players,
    "Online/offline": defaults.online,
    "Story length": defaults.story,
    Difficulty: defaults.difficulty,
    Language: "English",
    PS4: yesNo(ps4),
    PS5: yesNo(ps5),
  };

  return GAME_DETAIL_LABELS.map((label) => ({
    label,
    value: specValue(product, label) ?? inferred[label],
  }));
}

/** Specs currently used for the Game details panel (existing or inferred). */
export function getGameDetailSpecs(product: Product): ProductSpec[] {
  if (!isGameDiscProduct(product)) return [];
  return buildGameDetailSpecs(product);
}

/** Merge game detail fields into product.specs without dropping other specs. */
export function withGameDetails(product: Product): Product {
  if (!isGameDiscProduct(product)) return product;

  const details = buildGameDetailSpecs(product);
  const detailKeys = new Set(GAME_DETAIL_LABELS.map((l) => l.toLowerCase()));
  const rest = product.specs.filter((s) => !detailKeys.has(s.label.toLowerCase()));

  // Keep Genre only once (inside game details); drop duplicate Genre from rest if present.
  return {
    ...product,
    specs: [...details, ...rest],
  };
}
