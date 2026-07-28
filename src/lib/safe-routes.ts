import { redirect } from "next/navigation";
import { commerce } from "@/lib/commerce";

/** Turn a slug into a human search query. */
export function slugToQuery(slug: string) {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function searchRedirect(query: string, fallback = "/products"): never {
  const q = query.trim();
  if (!q) redirect(fallback);
  redirect(`/search?q=${encodeURIComponent(q)}&from=missing`);
}

/**
 * If `handle` is a known collection, return it.
 * Otherwise try a light fuzzy match (contains / starts-with).
 */
export async function resolveCollectionHandle(handle: string) {
  const exact = await commerce.getCollectionByHandle(handle);
  if (exact) return exact;

  const all = await commerce.getCollections();
  const h = handle.toLowerCase();
  // Prefer meaningful overlaps (3+ chars) to avoid accidental matches.
  if (h.length >= 3) {
    const starts = all.find(
      (c) =>
        (c.handle.startsWith(h) || h.startsWith(c.handle)) &&
        Math.min(c.handle.length, h.length) >= 3,
    );
    if (starts) return starts;
    const contains = all.find(
      (c) =>
        c.handle.includes(h) ||
        h.includes(c.handle) ||
        c.title.toLowerCase().includes(slugToQuery(h).toLowerCase()),
    );
    if (contains) return contains;
  }
  return null;
}

/** Missing product → search for the slug text. */
export function redirectMissingProduct(slug: string): never {
  searchRedirect(slugToQuery(slug));
}

/** Missing article → news index. */
export function redirectMissingArticle(): never {
  redirect("/news");
}

/** Missing category → products (or closest collection). */
export async function redirectMissingCategory(handle: string): Promise<never> {
  const match = await resolveCollectionHandle(handle);
  if (match && match.handle !== handle) {
    redirect(`/${match.handle}`);
  }
  const q = slugToQuery(handle);
  if (q) searchRedirect(q);
  redirect("/products");
}

/** Missing game hub → search / games. */
export function redirectMissingGameHub(slug: string): never {
  searchRedirect(slugToQuery(slug), "/games");
}
