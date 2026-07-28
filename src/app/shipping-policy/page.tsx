import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "@/components/legal/policy-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: `Shipping, COD, and bank transfer fulfilment rules for ${SITE.name} in Pakistan.`,
};

export default function ShippingPolicyPage() {
  return (
    <PolicyPage title="Shipping Policy" updated="23 July 2026">
      <PolicySection title="1. Where we ship">
        <p>
          {SITE.name} currently ships within <span className="text-text">Pakistan</span>.
          Enter a complete address with city, province, postal code, and an active phone
          number so the courier can reach you.
        </p>
      </PolicySection>

      <PolicySection title="2. Shipping charges">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Standard shipping is typically charged at checkout (commonly{" "}
            <span className="text-text">Rs. 299</span> unless a promotion applies).
          </li>
          <li>
            <span className="text-text">Free shipping</span> on qualifying orders of{" "}
            <span className="text-text">Rs. 15,000</span> or more (before discounts that we
            may exclude from the threshold).
          </li>
          <li>
            Digital gift cards usually have <span className="text-text">no physical
            shipping</span>; delivery is via WhatsApp/email after payment confirmation.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="3. Dispatch times">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="text-text">In-stock physical items</span> — we aim to dispatch
            within <span className="text-text">24 hours</span> on business days after the
            order is confirmed / paid (see payment rules below).
          </li>
          <li>
            Delivery after dispatch usually takes{" "}
            <span className="text-text">1–5 business days</span> depending on your city
            and courier conditions. Remote areas may take longer.
          </li>
          <li>
            Pre-orders ship after the publisher’s release / our stock arrival; dates are
            estimates only.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="4. Cash on Delivery (COD)">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            COD is available for eligible orders and cities served by our courier partners.
          </li>
          <li>
            Please keep your phone on. If the courier cannot reach you after reasonable
            attempts, the parcel may be returned and COD may be restricted next time.
          </li>
          <li>
            Inspect the outer packaging on delivery. If the seal is broken or the box is
            badly damaged, refuse the parcel and contact us immediately with photos.
          </li>
          <li>
            Pay only the amount shown on your order (product total + shipping if
            applicable).
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="5. Direct bank transfer, JazzCash, Nayapay & Easypaisa">
        <p>
          If you choose <span className="text-text">Direct bank transfer</span>,{" "}
          <span className="text-text">JazzCash</span>, or{" "}
          <span className="text-text">Easypaisa</span>:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Transfer the <span className="text-text">exact order total</span> to the
            account details shown after checkout:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Meezan Bank / Nayapay / Easypaisa (bank transfer option)</li>
              <li>
                JazzCash or Easypaisa wallet:{" "}
                <span className="text-text">+92-3322235956</span> (Muhammad Umar Farooq)
              </li>
            </ul>
          </li>
          <li>
            Use your <span className="text-text">numeric order number</span> as the payment
            reference / remarks so we can match your payment quickly.
          </li>
          <li>
            Send payment proof (screenshot) on WhatsApp ({SITE.supportPhone}) within{" "}
            <span className="text-text">48 hours</span> of placing the order.
          </li>
          <li>
            We begin packing and dispatch after payment is verified (usually the same
            business day if transferred during working hours; overnight transfers are
            checked the next business day).
          </li>
          <li>
            <span className="text-text">If unpaid:</span> orders without verified payment /
            proof may be held, then <span className="text-text">cancelled after 72 hours</span>{" "}
            and items returned to stock. Contact us before the deadline if you need more
            time.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="6. Order tracking">
        <p>
          After dispatch we may share a tracking number by WhatsApp or in your Account →
          Orders page. Tracking updates depend on the courier network.
        </p>
      </PolicySection>

      <PolicySection title="7. Address mistakes & failed delivery">
        <p>
          Please double-check your address at checkout. Re-delivery fees for incorrect
          addresses provided by the customer may be charged. If a parcel is returned to us
          as undeliverable, we will contact you about re-shipping or refund (minus return
          courier costs where applicable).
        </p>
      </PolicySection>

      <PolicySection title="8. Fragile toys & delicate items">
        <p>
          Toys and delicate items are packed carefully. Keep packaging until you confirm the
          item is intact. Report transit damage with photos as soon as possible (see our{" "}
          <a href="/refund-policy" className="text-accent hover:underline">
            Refund &amp; Return Policy
          </a>
          ).
        </p>
      </PolicySection>

      <PolicySection title="9. Contact">
        <p>
          Shipping questions: {SITE.supportEmail} · WhatsApp {SITE.supportPhone}. Always
          include your order number.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
