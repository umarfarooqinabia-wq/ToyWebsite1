import { SITE } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo-meta";

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "en-PK",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    logo: absoluteUrl("/logo.png"),
    image: absoluteUrl("/logo.png"),
    email: SITE.supportEmail,
    telephone: SITE.supportPhone,
    sameAs: [`https://wa.me/${SITE.whatsappNumber}`],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE.supportPhone,
      contactType: "customer service",
      email: SITE.supportEmail,
      areaServed: "PK",
      availableLanguage: ["English", "Urdu"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.line1,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.countryCode,
    },
  };
}

export function productJsonLd(product: {
  name: string;
  description: string;
  image: string[];
  sku: string;
  brand: string;
  price: number;
  currency: string;
  availability: boolean;
  rating?: number;
  reviewCount?: number;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      url: product.url,
      priceCurrency: product.currency,
      price: product.price,
      availability: product.availability
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SITE.name,
      },
    },
    ...(product.rating && (product.reviewCount ?? 0) > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function articleJsonLd(article: {
  title: string;
  description: string;
  image: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  keywords?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: [article.image],
    datePublished: article.datePublished,
    dateModified: article.dateModified ?? article.datePublished,
    author: { "@type": "Organization", name: SITE.name },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png") },
    },
    mainEntityOfPage: article.url,
    keywords: article.keywords?.join(", "),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
