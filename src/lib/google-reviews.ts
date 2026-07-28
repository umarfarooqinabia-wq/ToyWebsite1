import { SITE, shopAddressText } from "@/lib/constants";

export type GoogleReview = {
  id: string;
  authorName: string;
  authorPhotoUrl?: string;
  rating: number;
  text: string;
  relativeTime: string;
  time?: number;
};

export type GoogleReviewsFeed = {
  configured: boolean;
  name: string;
  rating: number | null;
  reviewCount: number | null;
  mapsUrl: string | null;
  address: string;
  reviews: GoogleReview[];
  source: "google" | "none";
  error?: string;
};

type PlacesDetailsResponse = {
  status: string;
  error_message?: string;
  result?: {
    name?: string;
    rating?: number;
    user_ratings_total?: number;
    url?: string;
    formatted_address?: string;
    reviews?: {
      author_name?: string;
      profile_photo_url?: string;
      rating?: number;
      text?: string;
      relative_time_description?: string;
      time?: number;
    }[];
  };
};

function emptyFeed(error?: string): GoogleReviewsFeed {
  return {
    configured: false,
    name: SITE.name,
    rating: null,
    reviewCount: null,
    mapsUrl: null,
    address: shopAddressText(),
    reviews: [],
    source: "none",
    error,
  };
}

/**
 * Fetches live Google Business / Maps reviews via Places Details API.
 * Requires GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID (or NEXT_PUBLIC_GOOGLE_PLACE_ID).
 * Google returns up to 5 most relevant reviews.
 */
export async function fetchGoogleReviews(): Promise<GoogleReviewsFeed> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const placeId =
    process.env.GOOGLE_PLACE_ID?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID?.trim();

  if (!apiKey || !placeId) {
    return emptyFeed();
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    url.searchParams.set("place_id", placeId);
    url.searchParams.set(
      "fields",
      "name,rating,user_ratings_total,reviews,url,formatted_address",
    );
    url.searchParams.set("reviews_sort", "newest");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return emptyFeed(`Places API HTTP ${res.status}`);
    }

    const data = (await res.json()) as PlacesDetailsResponse;
    if (data.status !== "OK" || !data.result) {
      return emptyFeed(data.error_message || data.status || "Places API error");
    }

    const result = data.result;
    const reviews: GoogleReview[] = (result.reviews ?? []).map((r, i) => ({
      id: `g-${r.time ?? i}-${(r.author_name ?? "anon").slice(0, 12)}`,
      authorName: r.author_name?.trim() || "Google user",
      authorPhotoUrl: r.profile_photo_url,
      rating: Math.min(5, Math.max(1, Math.round(r.rating ?? 5))),
      text: (r.text ?? "").trim(),
      relativeTime: r.relative_time_description ?? "",
      time: r.time,
    })).filter((r) => r.text.length > 0 || r.rating > 0);

    return {
      configured: true,
      name: result.name || SITE.name,
      rating: typeof result.rating === "number" ? result.rating : null,
      reviewCount:
        typeof result.user_ratings_total === "number" ? result.user_ratings_total : null,
      mapsUrl: result.url ?? null,
      address: result.formatted_address || shopAddressText(),
      reviews,
      source: "google",
    };
  } catch (err) {
    return emptyFeed(err instanceof Error ? err.message : "Failed to load reviews");
  }
}
