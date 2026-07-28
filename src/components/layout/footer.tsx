import Link from "next/link";
import { MapPin } from "lucide-react";
import { NAV_LINKS, SITE, shopAddressText, shopMapsSearchUrl, whatsappUrl } from "@/lib/constants";
import { BrandLogo } from "@/components/layout/brand-logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-bg-elevated pb-[calc(var(--bottom-nav-height)+1rem)] lg:pb-0">
      <div className="container-px mx-auto grid max-w-7xl gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0 space-y-5">
          <BrandLogo size="md" className="max-w-full" />
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            {SITE.description}
          </p>
          <a
            href={shopMapsSearchUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 text-sm text-muted transition hover:text-accent"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{shopAddressText()}</span>
          </a>
        </div>

        <div>
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-text">
            Shop
          </h3>
          <ul className="space-y-2">
            {NAV_LINKS.slice(0, 6).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-muted transition hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-text">
            Support
          </h3>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link href="/news" className="hover:text-accent">
                Blogs &amp; Guides
              </Link>
            </li>
            <li>
              <Link href="/track" className="hover:text-accent">
                Track Order
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-accent">
                My Account
              </Link>
            </li>
            <li>
              <Link href="/shipping-policy" className="hover:text-accent">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="hover:text-accent">
                Refund &amp; Return
              </Link>
            </li>
            <li>
              <a href={`mailto:${SITE.supportEmail}`} className="hover:text-accent">
                {SITE.supportEmail}
              </a>
            </li>
            <li>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                WhatsApp {SITE.supportPhone}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-text">
            Payments &amp; legal
          </h3>
          <p className="text-sm text-muted">
            JazzCash · Easypaisa · COD · Bank Transfer · Stripe · Cards
          </p>
          <p className="mt-4 text-sm text-muted">
            Free shipping on orders over Rs. 15,000
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>
              <Link href="/privacy" className="hover:text-accent">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-accent">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/shipping-policy" className="hover:text-accent">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="hover:text-accent">
                Refund &amp; Return
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-subtle">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.{" "}
        <Link href="/privacy" className="hover:text-accent">
          Privacy
        </Link>
        {" · "}
        <Link href="/terms" className="hover:text-accent">
          Terms
        </Link>
      </div>
    </footer>
  );
}
