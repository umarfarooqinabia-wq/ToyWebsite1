import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "@/components/legal/policy-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms and conditions for shopping at ${SITE.name}.`,
};

export default function TermsPage() {
  return (
    <PolicyPage title="Terms of Service" updated="23 July 2026">
      <PolicySection title="1. Agreement">
        <p>
          By browsing, registering, or placing an order on {SITE.name}, you agree to these
          Terms of Service and our related policies (Privacy, Shipping, Refund &amp; Return).
          If you do not agree, please do not use the website.
        </p>
      </PolicySection>

      <PolicySection title="2. About the store">
        <p>
          {SITE.name} sells gaming consoles, games (new and used), accessories, and related
          products for customers in Pakistan. Product images and descriptions are for
          reference; minor packaging differences may occur. We are an independent retailer
          and are not affiliated with Sony, Microsoft, Nintendo, or other manufacturers
          unless stated.
        </p>
      </PolicySection>

      <PolicySection title="3. Accounts">
        <p>
          You are responsible for keeping your login credentials confidential and for
          activity under your account. Provide accurate name, email, phone, and shipping
          details. We may suspend accounts involved in fraud, abuse, or repeated unpaid
          COD refusals.
        </p>
      </PolicySection>

      <PolicySection title="4. Orders & pricing">
        <ul className="list-disc space-y-1 pl-5">
          <li>All prices are shown in Pakistani Rupees (PKR) unless noted otherwise.</li>
          <li>
            An order is an offer to buy. We may accept, reject, or cancel orders (e.g.
            stock errors, pricing mistakes, suspected fraud, or unpaid bank transfers).
          </li>
          <li>
            Stock is limited. If an item cannot be fulfilled, we will contact you to
            refund, replace, or cancel the affected line.
          </li>
          <li>
            Gift cards and digital items may be delivered via WhatsApp or email after
            payment confirmation and may be non-refundable once codes are shared.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="5. Payments">
        <p>We may offer:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="text-text">Cash on Delivery (COD)</span> — pay the courier
            when your parcel arrives (available in supported cities).
          </li>
          <li>
            <span className="text-text">Direct bank transfer</span> — Meezan Bank, Nayapay,
            or Easypaisa. Use your <span className="text-text">order number</span> as the
            transfer reference. Send proof within 48 hours; unpaid orders may be cancelled
            after 72 hours.
          </li>
          <li>
            <span className="text-text">JazzCash / Easypaisa</span> — wallet transfer to{" "}
            <span className="text-text">+92-3322235956</span> (Muhammad Umar Farooq). Same
            proof (48h) and unpaid cancellation (72h) rules apply.
          </li>
          <li>Other methods shown at checkout when enabled.</li>
        </ul>
        <p>
        For prepaid methods, processing usually starts after we verify payment. Send
        payment proof within 48 hours. Unpaid prepaid orders may be cancelled after 72
        hours.
        </p>
      </PolicySection>

      <PolicySection title="6. Product condition">
        <p>
          Toys are sold as described (condition notes and photos where shown). When you
          place an order, you confirm your contact details and that product information
          is accurate. We may cancel orders that cannot be fulfilled due to stock or
          pricing errors.
        </p>
      </PolicySection>

      <PolicySection title="7. Intellectual property">
        <p>
          Site design, branding, and original content belong to {SITE.name}. Product names
          and logos belong to their respective owners and are used for identification.
        </p>
      </PolicySection>

      <PolicySection title="8. Limitation of liability">
        <p>
          To the fullest extent permitted by law, {SITE.name} is not liable for indirect or
          consequential losses. Our total liability for any order is limited to the amount
          you paid for that order.
        </p>
      </PolicySection>

      <PolicySection title="9. Governing law">
        <p>
          These terms are governed by the laws of Pakistan. Disputes will first be
          addressed amicably via {SITE.supportEmail} or WhatsApp {SITE.supportPhone}.
        </p>
      </PolicySection>

      <PolicySection title="10. Changes">
        <p>
          We may update these Terms periodically. Continued use of the site after changes
          constitutes acceptance of the updated Terms.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
