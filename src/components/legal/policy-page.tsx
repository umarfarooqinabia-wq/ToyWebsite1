import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SITE } from "@/lib/constants";

const POLICY_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/refund-policy", label: "Refund & Return" },
  { href: "/shipping-policy", label: "Shipping Policy" },
] as const;

export function PolicyPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-px mx-auto max-w-3xl py-8 sm:py-12">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: title }]}
        className="mb-6"
      />
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted">Last updated: {updated}</p>
        <p className="mt-3 text-sm text-muted">
          Questions? Contact{" "}
          <a href={`mailto:${SITE.supportEmail}`} className="text-accent hover:underline">
            {SITE.supportEmail}
          </a>{" "}
          or WhatsApp{" "}
          <a href={`tel:${SITE.supportPhone}`} className="text-accent hover:underline">
            {SITE.supportPhone}
          </a>
          .
        </p>
      </header>

      <article className="prose-policy space-y-8 text-sm leading-relaxed text-muted sm:text-[0.95rem]">
        {children}
      </article>

      <nav className="mt-12 rounded-2xl border border-border bg-surface/60 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text">
          Related policies
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {POLICY_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-accent hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 font-display text-xl font-semibold text-text">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
