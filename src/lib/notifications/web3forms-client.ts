import { SITE } from "@/lib/constants";

/**
 * Web3Forms free tier blocks server-side calls (HTTP 403).
 * Owner order alerts must be sent from the browser after checkout.
 */
export async function sendOwnerOrderAlertFromBrowser(opts: {
  orderId: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    paymentMethod: string;
  };
  lines: { title: string; quantity: number; price: { amount: number; currencyCode: string } }[];
  total: { amount: number; currencyCode: string };
}): Promise<{ ok: boolean; detail: string }> {
  const accessKey =
    process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim() ||
    process.env.NEXT_PUBLIC_ORDER_ALERT_WEB3FORMS_KEY?.trim();

  if (!accessKey) {
    return {
      ok: false,
      detail: "NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY not set",
    };
  }

  const lineText = opts.lines
    .map(
      (l) =>
        `• ${l.title} × ${l.quantity} — ${l.price.currencyCode} ${l.price.amount.toLocaleString("en-PK")}`,
    )
    .join("\n");

  const message = [
    "New Order is placed on website below are the details",
    "",
    `Order ID: ${opts.orderId}`,
    `Customer: ${opts.customer.fullName}`,
    `Email: ${opts.customer.email}`,
    `Phone: ${opts.customer.phone}`,
    `Address: ${opts.customer.address}, ${opts.customer.city}, ${opts.customer.province} ${opts.customer.postalCode}`,
    `Payment: ${opts.customer.paymentMethod}`,
    `Total: ${opts.total.currencyCode} ${opts.total.amount.toLocaleString("en-PK")}`,
    "",
    "Items:",
    lineText,
  ].join("\n");

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `New Order is placed — ${opts.orderId}`,
        from_name: `${SITE.name} Orders`,
        name: opts.customer.fullName,
        email: opts.customer.email,
        replyto: opts.customer.email,
        message,
        order_id: opts.orderId,
        phone: opts.customer.phone,
        total: `${opts.total.currencyCode} ${opts.total.amount}`,
        botcheck: "",
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
    };
    return {
      ok: Boolean(data.success),
      detail: data.message ?? (res.ok ? "Web3Forms sent" : `HTTP ${res.status}`),
    };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : "Web3Forms browser send failed",
    };
  }
}
