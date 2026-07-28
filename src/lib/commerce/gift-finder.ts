import type { AgeRangeId } from "@/lib/commerce/age-interest";

export type GiftOccasionId =
  | "birthday"
  | "eid"
  | "newborn"
  | "party"
  | "just-because";

export const GIFT_OCCASIONS: {
  id: GiftOccasionId;
  label: string;
  description: string;
  /** Soft keyword boost for ranking / matching */
  keywords: RegExp;
  /** Default max budget suggestion (PKR) */
  suggestedMax?: number;
}[] = [
  {
    id: "birthday",
    label: "Birthday",
    description: "Crowd-pleasers kids actually ask for",
    keywords: /\bbirthday\b|\bparty\b|\bgift\b|\bkit\b|\bset\b/i,
  },
  {
    id: "eid",
    label: "Eid",
    description: "Special treats & memorable outdoor fun",
    keywords: /\beid\b|\bfestival\b|\bpool\b|\binflatable\b|\brc\b|\bdoll\b/i,
    suggestedMax: 8000,
  },
  {
    id: "newborn",
    label: "Newborn",
    description: "Soft, safe essentials for 0–2",
    keywords: /\bnewborn\b|\bbaby\b|\bplush\b|\brattle\b|\bteether\b|\bstroller\b/i,
    suggestedMax: 15000,
  },
  {
    id: "party",
    label: "Party favor",
    description: "Small fun gifts under a tight budget",
    keywords: /\bbubble\b|\bpop\s*it\b|\bflashlight\b|\bwatch\b|\bwallet\b|\bball\b/i,
    suggestedMax: 2000,
  },
  {
    id: "just-because",
    label: "Just because",
    description: "Everyday joy — no occasion needed",
    keywords: /\blearning\b|\bpuzzle\b|\bblocks?\b|\bcar\b|\bdoll\b/i,
  },
];

export const BUDGET_PRESETS = [
  { label: "Under 1,000", min: 0, max: 999 },
  { label: "1k – 3k", min: 1000, max: 3000 },
  { label: "3k – 7k", min: 3000, max: 7000 },
  { label: "7k – 15k", min: 7000, max: 15000 },
  { label: "15k+", min: 15000, max: 200000 },
] as const;

export function getOccasion(id: string | undefined) {
  if (!id) return undefined;
  return GIFT_OCCASIONS.find((o) => o.id === id);
}

/** Newborn occasion forces baby age when age isn't set. */
export function effectiveGiftAge(
  age: string | undefined,
  occasion: string | undefined,
): AgeRangeId | undefined {
  if (age) return age as AgeRangeId;
  if (occasion === "newborn") return "0-2";
  return undefined;
}
