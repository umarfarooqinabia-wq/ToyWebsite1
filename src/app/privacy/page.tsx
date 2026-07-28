import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "@/components/legal/policy-page";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.name} collects, uses, and protects your personal information.`,
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage title="Privacy Policy" updated="23 July 2026">
      <PolicySection title="1. Who we are">
        <p>
          {SITE.name} (“we”, “us”, “our”) operates an online store for toys in
          Pakistan. This Privacy Policy explains what information we collect when you use{" "}
          {SITE.url}, create an account, place an order, or contact support.
        </p>
      </PolicySection>

      <PolicySection title="2. Information we collect">
        <p>We may collect:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="text-text">Account details</span> — name, email, phone number,
            and password (stored securely as a hash).
          </li>
          <li>
            <span className="text-text">Order & shipping details</span> — delivery address,
            city, province, postal code, and payment method chosen.
          </li>
          <li>
            <span className="text-text">Support attachments</span> — photos or details you
            optionally send when contacting us about an order.
          </li>
          <li>
            <span className="text-text">Technical data</span> — basic device/browser info and
            cookies needed for login sessions, cart, and site preferences.
          </li>
          <li>
            <span className="text-text">Communications</span> — messages you send via email
            or WhatsApp ({SITE.supportPhone}).
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="3. How we use your information">
        <ul className="list-disc space-y-1 pl-5">
          <li>Process and fulfil orders, including COD and bank / wallet transfers.</li>
          <li>Create and secure your customer account.</li>
          <li>Send order updates and respond to support requests.</li>
          <li>Prevent fraud, spam, and abuse (including CAPTCHA checks).</li>
          <li>Improve our catalogue, shipping, and customer experience.</li>
        </ul>
      </PolicySection>

      <PolicySection title="4. Sharing of information">
        <p>
          We do not sell your personal data. We may share limited information with:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Courier / logistics partners to deliver your order.</li>
          <li>Payment confirmation workflows (e.g. matching your bank or Easypaisa transfer).</li>
          <li>Service providers that help us host the website or send notifications.</li>
          <li>Authorities if required by Pakistani law.</li>
        </ul>
      </PolicySection>

      <PolicySection title="5. Cookies & sessions">
        <p>
          We use essential cookies / local storage for sign-in sessions, cart contents,
          wishlist, and theme preference. These are required for the store to function.
          You can clear them in your browser; doing so may sign you out or empty your cart.
        </p>
      </PolicySection>

      <PolicySection title="6. Data retention & security">
        <p>
          We keep order and account records as long as needed for fulfilment, accounting,
          dispute resolution, and legal requirements. We take reasonable technical measures
          (hashed passwords, secure session cookies) to protect your data, but no online
          transmission is 100% secure.
        </p>
      </PolicySection>

      <PolicySection title="7. Your choices">
        <p>
          You may update profile details in Account → Settings, or request correction /
          deletion of your account data by contacting {SITE.supportEmail}. We may retain
          limited records required for completed orders or legal compliance.
        </p>
      </PolicySection>

      <PolicySection title="8. Children’s privacy">
        <p>
          Our store is intended for customers who can legally make purchases in Pakistan.
          If you believe a minor has provided personal data, contact us and we will take
          appropriate steps.
        </p>
      </PolicySection>

      <PolicySection title="9. Changes">
        <p>
          We may update this policy from time to time. The “Last updated” date at the top
          will change when we do. Continued use of the site after updates means you accept
          the revised policy.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
