import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/components/providers";
import { SITE } from "@/lib/constants";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { DEFAULT_OG_IMAGE } from "@/lib/seo-meta";
import "./globals.css";

const display = Fredoka({
  variable: "--font-exo",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Nunito({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "kids toys Pakistan",
    "buy toys online Pakistan",
    "diecast models Pakistan",
    "remote control cars",
    "baby toys Pakistan",
    "Intex swimming pools",
    "educational toys",
    "Cash on Delivery toys",
    SITE.name,
  ],
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }, { url: "/logo.png" }],
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: {
    index: false,
    follow: false,
  },
  verification: {
    google: "yDeVsoh1XlqNehuLo60aiojiYIXH_-J7w9p36MxIB54",
  },
  alternates: {
    canonical: SITE.url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" className={`${display.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
