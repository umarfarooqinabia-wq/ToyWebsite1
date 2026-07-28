"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Star } from "lucide-react";
import type { GoogleReview, GoogleReviewsFeed } from "@/lib/google-reviews";
import {
  SITE,
  googleReviewWriteUrl,
  shopAddressText,
  shopMapsEmbedUrl,
  shopMapsSearchUrl,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Stars({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const filled = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            cls,
            i < filled ? "fill-warning text-warning" : "fill-transparent text-subtle",
          )}
        />
      ))}
    </span>
  );
}

function GoogleG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function ReviewCard({ review }: { review: GoogleReview }) {
  const [expanded, setExpanded] = useState(false);
  const long = review.text.length > 140;
  const shown =
    !long || expanded ? review.text : `${review.text.slice(0, 140).trimEnd()}…`;
  const initial = (review.authorName.trim()[0] || "G").toUpperCase();

  return (
    <article className="flex w-[min(18.5rem,82vw)] shrink-0 flex-col rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow)] sm:w-72">
      <div className="mb-3 flex items-start justify-between gap-2">
        <Stars rating={review.rating} size="sm" />
        <GoogleG className="h-5 w-5 shrink-0" />
      </div>
      <p className="flex-1 text-sm leading-relaxed text-muted">
        {shown || "Rated on Google"}
        {long ? (
          <>
            {" "}
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="font-medium text-accent hover:underline"
            >
              {expanded ? "Less" : "More"}
            </button>
          </>
        ) : null}
      </p>
      <div className="mt-4 flex items-center gap-3 border-t border-border pt-3">
        {review.authorPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.authorPhotoUrl}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-dim text-sm font-bold text-accent"
            aria-hidden
          >
            {initial}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text">{review.authorName}</p>
          <p className="text-xs text-subtle">{review.relativeTime || "Google review"}</p>
        </div>
      </div>
    </article>
  );
}

export function CustomerReviews({ feed }: { feed: GoogleReviewsFeed }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reviewUrl = googleReviewWriteUrl();
  const mapsUrl = feed.mapsUrl || shopMapsSearchUrl();
  const rating = feed.rating;
  const count = feed.reviewCount;

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(320, el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <section className="border-t border-border bg-bg-elevated/60 py-12 sm:py-16">
      <div className="container-px mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5">
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-surface">
                <Image
                  src="/logo.png"
                  alt={SITE.name}
                  fill
                  className="object-contain p-1"
                  sizes="40px"
                />
              </span>
              <div>
                <p className="font-display text-lg font-bold text-text sm:text-xl">
                  {feed.name || SITE.name}
                </p>
                <p className="flex items-start gap-1 text-xs text-muted sm:text-sm">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                  <span>{feed.address || shopAddressText()}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {typeof rating === "number" ? (
                <>
                  <span className="font-display text-xl font-bold text-text">
                    {rating.toFixed(1)}
                  </span>
                  <Stars rating={rating} />
                </>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2 py-1 text-xs text-muted">
                  <GoogleG className="h-4 w-4" /> Google reviews
                </span>
              )}
              {typeof count === "number" ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted hover:text-accent hover:underline"
                >
                  {count} Google reviews
                </a>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <Button type="button" size="sm" variant="outline">
                View on Google
              </Button>
            </a>
            <a href={reviewUrl} target="_blank" rel="noopener noreferrer">
              <Button type="button" size="sm">
                Review us
              </Button>
            </a>
          </div>
        </div>

        <p className="mb-5 max-w-2xl text-sm text-muted">
          Verified Google reviews from customers who shopped with us at our Nagan Chowrangi, Karachi location
          and online.
        </p>

        {feed.reviews.length > 0 ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="absolute -left-1 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-text shadow-lg transition hover:border-accent hover:text-accent md:flex"
              aria-label="Previous reviews"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="absolute -right-1 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-text shadow-lg transition hover:border-accent hover:text-accent md:flex"
              aria-label="Next reviews"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div
              ref={scrollerRef}
              className="flex gap-3 overflow-x-auto pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] md:px-2 [&::-webkit-scrollbar]:hidden"
            >
              {feed.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-5 py-8 text-center">
            <GoogleG className="mx-auto mb-3 h-8 w-8" />
            <p className="font-display text-lg font-semibold text-text">
              {feed.configured
                ? "No written Google reviews yet"
                : "Connect your Google Business Profile"}
            </p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
              {feed.configured
                ? "Ask happy toy buyers to leave a Google review — they will show here automatically."
                : `Register ToyCompany at ${shopAddressText()} on Google Business Profile, then add your Place ID + Places API key in .env so live reviews appear here.`}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <a
                href="https://business.google.com/create"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button type="button" size="sm">
                  Create Google Business
                </Button>
              </a>
              <a href={reviewUrl} target="_blank" rel="noopener noreferrer">
                <Button type="button" size="sm" variant="outline">
                  Leave a review
                </Button>
              </a>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <iframe
              title={`${SITE.name} on Google Maps`}
              src={shopMapsEmbedUrl()}
              className="h-56 w-full border-0 sm:h-64"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Visit our shop
            </p>
            <h3 className="mt-2 font-display text-xl font-bold text-text">{SITE.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              <MapPin className="mr-1 inline h-4 w-4 text-accent" />
              {shopAddressText()}
            </p>
            <p className="mt-3 text-sm text-muted">
              WhatsApp{" "}
              <a href={`tel:${SITE.supportPhone}`} className="text-accent hover:underline">
                {SITE.supportPhone}
              </a>
            </p>
            <a
              href={shopMapsSearchUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5"
            >
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Open in Google Maps
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
