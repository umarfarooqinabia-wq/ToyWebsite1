import type { Product } from "@/types/commerce";

export type AgeRangeId = "0-2" | "3-5" | "6-8" | "9-12" | "13-plus";
export type AudienceId = "boy" | "girl" | "both" | "collector";

export const AGE_RANGES: {
  id: AgeRangeId;
  label: string;
  shortLabel: string;
  description: string;
  /** Preferred Shopify collection when browsing this age */
  collection?: string;
  keywords: RegExp;
}[] = [
  {
    id: "0-2",
    label: "0 – 2 years",
    shortLabel: "0–2",
    description: "Baby gear, rattles, soft toys & first play",
    collection: "baby-toys",
    keywords:
      /\bbaby\b|\btoddler\b|\binfant\b|\bnewborn\b|\bteether\b|\brattle\b|\bwalker\b|\bbassinet\b|\bplay\s*gym\b|\bstroller\b|\bhigh\s*chair\b|\bplush\b|\bsoft\s*toy\b|\bxylophone\b|\bfriction\b|\bwind-?up\b|\bbouncer\b|\brocker\b/i,
  },
  {
    id: "3-5",
    label: "3 – 5 years",
    shortLabel: "3–5",
    description: "Preschool learning, blocks, dolls & ride-ons",
    collection: "learning-toys",
    keywords:
      /\bpreschool\b|\bkindergarten\b|\babc\b|\bnumber\b|\bblocks?\b|\bpuzzle\b|\bdoll\b|\bkitchen\b|\btricycle\b|\bride[- ]?on\b|\bwooden\b|\bmagnetic\b|\bslime\b|\bdough\b|\bclay\b|\beasel\b|\bcrayon\b|\blearning\b|\bflash\s*card\b/i,
  },
  {
    id: "6-8",
    label: "6 – 8 years",
    shortLabel: "6–8",
    description: "RC starters, outdoor play, action & craft kits",
    collection: "outdoor-play",
    keywords:
      /\bbeyblade\b|\baction\s*figure\b|\bscooter\b|\bskateboard\b|\bwater\s*gun\b|\bpool\b|\btent\b|\bwalkie\b|\btransformer\b|\brobot\b|\bgun\b|\bshooter\b|\bpainting\s*kit\b|\bbriefcase\b|\binflatable\b|\bremote\s*control\b|\brc\b/i,
  },
  {
    id: "9-12",
    label: "9 – 12 years",
    shortLabel: "9–12",
    description: "Hobby RC, drones, STEM & bigger outdoor toys",
    collection: "remote-control",
    keywords:
      /\bdrone\b|\bhelicopter\b|\bglider\b|\bdrift\b|\bhobby\b|\bstem\b|\bscience\b|\bexperiment\b|\b2\.4g\b|\bflying\b|\bjet\b|\bexcavator\b|\btruck\b|\bcamera\b|\bsmart\s*watch\b/i,
  },
  {
    id: "13-plus",
    label: "13+ / Teens",
    shortLabel: "13+",
    description: "Collectors, scale models & advanced hobby",
    collection: "die-cast-scale-models",
    keywords:
      /\bdiecast\b|\bdie-?cast\b|\b1:1[68]\b|\b1:24\b|\b1:32\b|\b1:43\b|\bscale\s*model\b|\bcollectible\b|\bsouvenir\b|\bbburago\b|\bmaisto\b|\bkinsmart\b|\bstreet\s*machine\b/i,
  },
];

export const AUDIENCES: {
  id: AudienceId;
  label: string;
  description: string;
  collection?: string;
  keywords: RegExp;
}[] = [
  {
    id: "boy",
    label: "Boy",
    description: "Cars, RC, action & outdoor adventure",
    collection: "toys-for-boys",
    keywords:
      /\bboy\b|\bcars?\b|\btruck\b|\bgun\b|\bshooter\b|\brobot\b|\bbeyblade\b|\brc\b|\bremote\b|\bdrone\b|\bhelicopter\b|\btransformer\b|\bexcavator\b|\bdrift\b|\bdic?ecast\b|\bdie-?cast\b/i,
  },
  {
    id: "girl",
    label: "Girl",
    description: "Dolls, kitchen sets, fashion & craft",
    collection: "toys-for-girls",
    keywords:
      /\bgirl\b|\bdoll\b|\bkitchen\b|\bprincess\b|\bbarbie\b|\bmakeup\b|\bfashion\b|\bdressing\b|\bunicorn\b|\bpink\b|\bplayset\b|\bbriefcase\b|\bhair\b/i,
  },
  {
    id: "both",
    label: "Both / Unisex",
    description: "Learning, outdoor, pools & family fun",
    keywords:
      /\beducational\b|\blearning\b|\boutdoor\b|\bpool\b|\bwooden\b|\bpuzzle\b|\bblocks?\b|\bstem\b|\bintex\b|\bswim\b|\bfamily\b|\bkids?\b/i,
  },
  {
    id: "collector",
    label: "Collector",
    description: "Diecast, scale models & display pieces",
    collection: "die-cast-scale-models",
    keywords:
      /\bdiecast\b|\bdie-?cast\b|\bscale\s*model\b|\bcollectible\b|\bsouvenir\b|\bbburago\b|\bmaisto\b|\b1:24\b|\b1:32\b|\b1:18\b|\b1:43\b|\bdisplay\b/i,
  },
];

function productHaystack(product: Product): string {
  return [
    product.title,
    product.handle,
    product.brand,
    product.category,
    ...product.categoryPath,
    ...product.tags,
    product.description.slice(0, 400),
  ]
    .join(" ")
    .toLowerCase();
}

export function getAgeRange(id: string | undefined) {
  if (!id) return undefined;
  return AGE_RANGES.find((a) => a.id === id);
}

export function getAudience(id: string | undefined) {
  if (!id) return undefined;
  return AUDIENCES.find((a) => a.id === id);
}

export function productMatchesAge(product: Product, ageId: AgeRangeId): boolean {
  const age = getAgeRange(ageId);
  if (!age) return true;
  const hay = productHaystack(product);
  if (age.keywords.test(hay)) return true;
  // Soft fallback: matching preferred collection tag/handle/category path
  if (age.collection) {
    const needle = age.collection.toLowerCase();
    if (
      product.tags.some((t) => t.toLowerCase().includes(needle)) ||
      product.categoryPath.some((c) => c.toLowerCase().includes(needle)) ||
      product.category.toLowerCase().includes(needle) ||
      product.handle.toLowerCase().includes(needle)
    ) {
      return true;
    }
  }
  return false;
}

export function productMatchesAudience(product: Product, audienceId: AudienceId): boolean {
  const audience = getAudience(audienceId);
  if (!audience) return true;
  const hay = productHaystack(product);

  if (audienceId === "both") {
    // Unisex: include educational/outdoor/family OR exclude strongly gendered-only if neither matches
    if (audience.keywords.test(hay)) return true;
    const boyish = AUDIENCES.find((a) => a.id === "boy")!.keywords.test(hay);
    const girlish = AUDIENCES.find((a) => a.id === "girl")!.keywords.test(hay);
    // Allow products that aren't strongly one-sided
    return !(boyish && !girlish) && !(girlish && !boyish);
  }

  if (audience.keywords.test(hay)) return true;
  if (
    audience.collection &&
    product.tags.some((t) => t.toLowerCase().includes(audience.collection!))
  ) {
    return true;
  }
  return false;
}

/** Best Shopify collection handle to seed results for age + audience. */
export function resolveFinderCollection(
  ageId?: string,
  audienceId?: string,
): string | undefined {
  const audience = getAudience(audienceId);
  const age = getAgeRange(ageId);

  if (audienceId === "collector") return "die-cast-scale-models";
  if (audienceId === "boy") return "toys-for-boys";
  if (audienceId === "girl") return "toys-for-girls";
  if (ageId === "0-2") return "baby-toys";
  if (ageId === "13-plus") return "die-cast-scale-models";
  if (age?.collection) return age.collection;
  if (audience?.collection) return audience.collection;
  return "new-arrival";
}

export function buildFinderQuery(ageId?: string, audienceId?: string): string {
  const params = new URLSearchParams();
  if (ageId) params.set("age", ageId);
  if (audienceId) params.set("audience", audienceId);
  const qs = params.toString();
  return qs ? `/find?${qs}` : "/find";
}
