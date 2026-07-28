import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "@/components/legal/policy-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Refund & Return Policy",
  description: `Refund and return rules for ${SITE.name} orders in Pakistan.`,
};

export default function RefundPolicyPage() {
  return (
    <PolicyPage title="Refund & Return Policy" updated="23 July 2026">
      <PolicySection title="1. Overview">
        <p>
          We want you to be happy with your purchase. This policy explains when returns and
          refunds are available for physical products sold by {SITE.name}. Digital gift
          cards / codes have special rules (see below).
        </p>
      </PolicySection>

      <PolicySection title="2. Return window">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="text-text">New, sealed products</span> — request a return
            within <span className="text-text">7 days</span> of delivery if unopened and in
            original packaging.
          </li>
          <li>
            <span className="text-text">Used / pre-owned toys</span> — may be returned
            within <span className="text-text">48 hours</span> of delivery only if the toy
            does not match the listed condition and you provide clear photos/video. Opened
            used toys that work as described are generally{" "}
            <span className="text-text">non-returnable</span>.
          </li>
          <li>
            Damaged-in-transit items should be reported within{" "}
            <span className="text-text">24–48 hours</span> with unboxing photos.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="3. What we cannot accept">
        <ul className="list-disc space-y-1 pl-5">
          <li>Products without original packaging, seals broken (for new items), or missing accessories.</li>
          <li>Items damaged by misuse, water, electrical faults after use, or customer modification.</li>
          <li>Digital codes / gift cards after the code has been shared or redeemed.</li>
          <li>Change-of-mind returns on cleared sale items marked final sale (if stated on the product).</li>
        </ul>
      </PolicySection>

      <PolicySection title="4. How to request a return">
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Message us on WhatsApp ({SITE.supportPhone}) or email {SITE.supportEmail} with
            your <span className="text-text">order number</span>, product name, and reason.
          </li>
          <li>Share photos/video if the item is defective or not as described.</li>
          <li>
            Wait for approval and return instructions. Do not ship items back without
            confirmation.
          </li>
        </ol>
      </PolicySection>

      <PolicySection title="5. Refunds by payment method">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="text-text">Bank transfer / Nayapay / Easypaisa</span> — refund
            to the same account or another account you provide, usually within{" "}
            <span className="text-text">3–7 business days</span> after we receive and
            inspect the return.
          </li>
          <li>
            <span className="text-text">Cash on Delivery (COD)</span> — refund via bank /
            wallet transfer after inspection, or store credit if you prefer.
          </li>
          <li>
            Shipping fees are only refunded if the return is due to our error (wrong /
            defective item) or courier damage we accept.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="6. Replacements">
        <p>
          Where stock allows, we may offer a replacement instead of a refund for defective
          or incorrect items. If the same item is unavailable, we will offer an alternative
          or a refund.
        </p>
      </PolicySection>

      <PolicySection title="7. COD refusals">
        <p>
          If you refuse a COD parcel without a valid reason (wrong address on our side,
          damaged box, etc.), we may deduct return courier costs from future orders or
          restrict COD for your account.
        </p>
      </PolicySection>

      <PolicySection title="8. Contact">
        <p>
          For refund help, contact {SITE.supportEmail} or WhatsApp {SITE.supportPhone} and
          include your order number.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
