/**
 * Order notifications for production:
 *
 * Customer confirmation email + owner new-order email/WhatsApp.
 *
 * Email (pick one):
 * - RESEND_API_KEY + RESEND_FROM_EMAIL  (recommended)
 * - WEB3FORMS_ACCESS_KEY                (owner inbox only)
 * - FormSubmit fallback                 (owner inbox; confirm once)
 *
 * WhatsApp to owner (pick one):
 * - CALLMEBOT_API_KEY                   (free; activate once via CallMeBot)
 * - WHATSAPP_CLOUD_TOKEN + WHATSAPP_PHONE_NUMBER_ID  (Meta Cloud API)
 *
 * Optional SMS: TEXTBELT_API_KEY
 */

import { SITE } from "@/lib/constants";
import { PAYMENT_ACCOUNTS } from "@/lib/bank-details";

export const ORDER_ALERT_EMAIL =
  process.env.ORDER_ALERT_EMAIL ?? "toycompany1@gmail.com";

export const ORDER_ALERT_PHONE =
  process.env.ORDER_ALERT_PHONE ?? "+923322235956";

export interface OrderAlertPayload {
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
  lines: {
    title: string;
    quantity: number;
    price: { amount: number; currencyCode: string };
  }[];
  total: { amount: number; currencyCode: string };
  subtotal?: { amount: number; currencyCode: string };
  shipping?: { amount: number; currencyCode: string };
}

type ChannelResult = { ok: boolean; detail: string; channel: string };

function formatMoney(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString("en-PK")}`;
}

function paymentLabel(method: string) {
  if (method === "bank_transfer") return "Direct bank transfer";
  if (method === "easypaisa") return "Easypaisa";
  if (method === "jazzcash") return "JazzCash";
  if (method === "cod") return "Cash on Delivery";
  return method.replaceAll("_", " ");
}

function paymentInstructions(payload: OrderAlertPayload) {
  const method = payload.customer.paymentMethod;
  if (
    method !== "bank_transfer" &&
    method !== "easypaisa" &&
    method !== "jazzcash"
  ) {
    if (method === "cod") {
      return "Pay the courier in cash when your parcel arrives.";
    }
    return `Pay using: ${paymentLabel(method)}.`;
  }

  const filterMethod =
    method === "easypaisa"
      ? "easypaisa"
      : method === "jazzcash"
        ? "jazzcash"
        : "bank_transfer";

  const accounts = PAYMENT_ACCOUNTS.filter((a) =>
    (a.methods as readonly string[]).includes(filterMethod),
  );

  const lines = accounts.map((a) => {
    const iban = "iban" in a && a.iban ? `, IBAN ${a.iban}` : "";
    return `• ${a.bank}: ${a.accountNumber}${iban} (${a.accountHolder})`;
  });

  return [
    `Please transfer ${formatMoney(payload.total.amount, payload.total.currencyCode)} and use order number ${payload.orderId} as the reference.`,
    ...lines,
    `Send payment proof on WhatsApp within 48 hours (${SITE.supportPhone}).`,
    `Unpaid orders may be cancelled after 72 hours if we receive no proof.`,
  ].join("\n");
}

function itemsBlock(payload: OrderAlertPayload) {
  return payload.lines
    .map(
      (l) =>
        `• ${l.title} ×${l.quantity} (${formatMoney(l.price.amount * l.quantity, l.price.currencyCode)})`,
    )
    .join("\n");
}

function buildOwnerMessage(payload: OrderAlertPayload) {
  return [
    `New Order is placed on website below are the details`,
    ``,
    `Order ID: ${payload.orderId}`,
    `Customer: ${payload.customer.fullName}`,
    `Email: ${payload.customer.email}`,
    `Phone: ${payload.customer.phone}`,
    `Address: ${payload.customer.address}, ${payload.customer.city}, ${payload.customer.province} ${payload.customer.postalCode}`,
    `Payment: ${paymentLabel(payload.customer.paymentMethod)}`,
    `Total: ${formatMoney(payload.total.amount, payload.total.currencyCode)}`,
    ``,
    `Items:`,
    itemsBlock(payload),
    ``,
    `Admin: ${SITE.url}/admin/orders`,
  ].join("\n");
}

function buildCustomerMessage(payload: OrderAlertPayload) {
  const trackUrl = `${SITE.url}/account/orders/${payload.orderId}`;
  return [
    `Hi ${payload.customer.fullName},`,
    ``,
    `Thanks for ordering from ${SITE.name}!`,
    ``,
    `Order number: ${payload.orderId}`,
    `Total: ${formatMoney(payload.total.amount, payload.total.currencyCode)}`,
    `Payment: ${paymentLabel(payload.customer.paymentMethod)}`,
    ``,
    `Items:`,
    itemsBlock(payload),
    ``,
    `Ship to:`,
    `${payload.customer.address}`,
    `${payload.customer.city}, ${payload.customer.province} ${payload.customer.postalCode}`,
    ``,
    paymentInstructions(payload),
    ``,
    `Track your order: ${trackUrl}`,
    `WhatsApp support: ${SITE.supportPhone}`,
    ``,
    `— ${SITE.name}`,
  ].join("\n");
}

function buildWhatsAppShort(payload: OrderAlertPayload) {
  return [
    `🛒 ${SITE.name} #${payload.orderId}`,
    `${payload.customer.fullName} · ${payload.customer.phone}`,
    `${formatMoney(payload.total.amount, payload.total.currencyCode)} · ${paymentLabel(payload.customer.paymentMethod)}`,
    payload.lines.map((l) => `${l.title}×${l.quantity}`).join(", "),
  ].join("\n");
}

/* ---------- Email via Resend ---------- */

async function sendViaResend(opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<ChannelResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ?? `Orders <orders@${new URL(SITE.url).hostname}>`;

  if (!apiKey) {
    return { ok: false, detail: "RESEND_API_KEY not set", channel: "resend" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
      error?: { message?: string };
    };
    if (!res.ok) {
      return {
        ok: false,
        detail: data.error?.message ?? data.message ?? `Resend HTTP ${res.status}`,
        channel: "resend",
      };
    }
    return {
      ok: true,
      detail: data.id ? `Resend id ${data.id}` : "Resend sent",
      channel: "resend",
    };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : "Resend error",
      channel: "resend",
    };
  }
}

async function sendViaWeb3Forms(opts: {
  subject: string;
  text: string;
  replyTo?: string;
  extra?: Record<string, string>;
}): Promise<ChannelResult> {
  // Free Web3Forms blocks server-side submits (HTTP 403). Owner alerts are
  // sent from the browser after checkout via NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY.
  if (!process.env.WEB3FORMS_ALLOW_SERVER?.trim()) {
    return {
      ok: false,
      detail:
        "Web3Forms skipped on server (free plan blocks server IP). Browser alert runs after checkout.",
      channel: "web3forms",
    };
  }

  const web3Key = process.env.WEB3FORMS_ACCESS_KEY?.trim();
  if (!web3Key) {
    return { ok: false, detail: "WEB3FORMS_ACCESS_KEY not set", channel: "web3forms" };
  }

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: web3Key,
        subject: opts.subject,
        from_name: `${SITE.name} Orders`,
        name: opts.extra?.customer_name || `${SITE.name} Checkout`,
        email: opts.replyTo || ORDER_ALERT_EMAIL,
        message: opts.text,
        botcheck: "",
        ...(opts.replyTo ? { replyto: opts.replyTo } : {}),
        ...opts.extra,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
    };
    return {
      ok: Boolean(data.success),
      detail: data.message ?? (res.ok ? "Web3Forms sent" : `Web3Forms HTTP ${res.status}`),
      channel: "web3forms",
    };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : "Web3Forms error",
      channel: "web3forms",
    };
  }
}

async function sendViaFormSubmit(opts: {
  subject: string;
  text: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  orderId: string;
  totalLabel: string;
  paymentMethod: string;
}): Promise<ChannelResult> {
  try {
    const res = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(ORDER_ALERT_EMAIL)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: opts.subject,
          _template: "table",
          name: opts.customerName,
          email: opts.customerEmail,
          phone: opts.customerPhone,
          message: opts.text,
          orderId: opts.orderId,
          total: opts.totalLabel,
          payment: opts.paymentMethod,
        }),
      },
    );
    const data = (await res.json().catch(() => ({}))) as {
      success?: string | boolean;
      message?: string;
    };
    const message =
      typeof data.message === "string" ? data.message : "";
    // FormSubmit sometimes returns 200 with a docs warning that is NOT a sent email.
    const fakeOk =
      /will not work in pages browsed as HTML/i.test(message) ||
      /make sure you open this page/i.test(message);
    const ok = res.ok && data.success !== false && !fakeOk;
    return {
      ok,
      detail: message
        ? message
        : ok
          ? "FormSubmit email queued (confirm inbox link on first use)"
          : `FormSubmit HTTP ${res.status}`,
      channel: "formsubmit",
    };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : "FormSubmit error",
      channel: "formsubmit",
    };
  }
}

/**
 * Owner alerts: Web3Forms first (reliable for Gmail inbox), then Resend, then FormSubmit.
 * Resend with an unverified domain / @resend.dev often fails for arbitrary Gmail inboxes.
 */
async function sendOwnerEmail(payload: OrderAlertPayload): Promise<ChannelResult> {
  const subject = `New Order is placed — ${payload.orderId}`;
  const text = buildOwnerMessage(payload);
  const attempts: ChannelResult[] = [];

  const web3 = await sendViaWeb3Forms({
    subject,
    text,
    replyTo: payload.customer.email,
    extra: {
      order_id: payload.orderId,
      customer_name: payload.customer.fullName,
      customer_phone: payload.customer.phone,
      total: formatMoney(payload.total.amount, payload.total.currencyCode),
    },
  });
  if (web3.ok) return web3;
  attempts.push(web3);
  console.warn("[order-alerts] Web3Forms owner email failed, trying fallbacks", web3);

  if (process.env.RESEND_API_KEY) {
    const resend = await sendViaResend({ to: ORDER_ALERT_EMAIL, subject, text });
    if (resend.ok) return resend;
    attempts.push(resend);
    console.warn("[order-alerts] Resend owner email failed, trying FormSubmit", resend);
  }

  const form = await sendViaFormSubmit({
    subject,
    text,
    customerEmail: payload.customer.email,
    customerName: payload.customer.fullName,
    customerPhone: payload.customer.phone,
    orderId: payload.orderId,
    totalLabel: formatMoney(payload.total.amount, payload.total.currencyCode),
    paymentMethod: payload.customer.paymentMethod,
  });
  if (form.ok) {
    return {
      ...form,
      detail: `${form.detail} (earlier: ${attempts.map((a) => a.detail).join("; ")})`,
    };
  }

  return {
    ok: false,
    detail: [...attempts, form].map((a) => `${a.channel}: ${a.detail}`).join(" | "),
    channel: "owner-email",
  };
}

async function sendCustomerEmail(payload: OrderAlertPayload): Promise<ChannelResult> {
  const to = payload.customer.email.trim();
  if (!to) {
    return { ok: false, detail: "No customer email", channel: "customer-email" };
  }

  const subject = `${SITE.name} — Order ${payload.orderId} confirmed`;
  const text = buildCustomerMessage(payload);

  if (process.env.RESEND_API_KEY) {
    const resend = await sendViaResend({ to, subject, text });
    if (resend.ok) return resend;
    console.warn(
      "[order-alerts] Resend customer email failed; sending owner copy via Web3Forms",
      resend,
    );
  }

  // Without a working Resend send (or without Resend), notify the owner with
  // a customer-tagged copy so the order confirmation is not lost.
  const web3 = await sendViaWeb3Forms({
    subject: `[Customer copy] ${subject}`,
    text: `Forward / reply to customer (${to}):\n\n${text}`,
    replyTo: to,
  });
  if (web3.ok) {
    return {
      ok: true,
      detail:
        "Owner inbox got customer confirmation copy (verify your domain in Resend to email customers directly)",
      channel: "web3forms-customer-copy",
    };
  }

  return {
    ok: false,
    detail:
      web3.detail ||
      "Customer email skipped — set RESEND_API_KEY + verified RESEND_FROM_EMAIL for production confirmations",
    channel: "customer-email",
  };
}

/* ---------- WhatsApp ---------- */

async function sendWhatsAppCallMeBot(text: string): Promise<ChannelResult> {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!apiKey) {
    return { ok: false, detail: "CALLMEBOT_API_KEY not set", channel: "callmebot" };
  }

  const phone = ORDER_ALERT_PHONE.replace(/[^\d]/g, "");
  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", phone);
  url.searchParams.set("text", text);
  url.searchParams.set("apikey", apiKey);

  try {
    const res = await fetch(url.toString(), { method: "GET" });
    const body = await res.text();
    const ok = res.ok && !/error|invalid/i.test(body);
    return {
      ok,
      detail: ok ? "CallMeBot WhatsApp sent" : body.slice(0, 180) || `HTTP ${res.status}`,
      channel: "callmebot",
    };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : "CallMeBot error",
      channel: "callmebot",
    };
  }
}

async function sendWhatsAppCloud(text: string): Promise<ChannelResult> {
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    return {
      ok: false,
      detail: "WHATSAPP_CLOUD_TOKEN / WHATSAPP_PHONE_NUMBER_ID not set",
      channel: "whatsapp-cloud",
    };
  }

  const to = ORDER_ALERT_PHONE.replace(/[^\d]/g, "");
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: text.slice(0, 4000) },
        }),
      },
    );
    const data = (await res.json().catch(() => ({}))) as {
      messages?: { id: string }[];
      error?: { message?: string };
    };
    if (!res.ok) {
      return {
        ok: false,
        detail: data.error?.message ?? `WhatsApp Cloud HTTP ${res.status}`,
        channel: "whatsapp-cloud",
      };
    }
    return {
      ok: true,
      detail: data.messages?.[0]?.id
        ? `WhatsApp Cloud id ${data.messages[0].id}`
        : "WhatsApp Cloud sent",
      channel: "whatsapp-cloud",
    };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : "WhatsApp Cloud error",
      channel: "whatsapp-cloud",
    };
  }
}

async function sendOwnerWhatsApp(payload: OrderAlertPayload): Promise<ChannelResult> {
  const text = buildWhatsAppShort(payload);

  if (process.env.WHATSAPP_CLOUD_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    return sendWhatsAppCloud(text);
  }
  if (process.env.CALLMEBOT_API_KEY) {
    return sendWhatsAppCallMeBot(text);
  }

  return {
    ok: false,
    detail:
      "WhatsApp skipped — set CALLMEBOT_API_KEY (easy) or WHATSAPP_CLOUD_TOKEN + WHATSAPP_PHONE_NUMBER_ID",
    channel: "whatsapp",
  };
}

/* ---------- Optional SMS ---------- */

async function sendOwnerSms(payload: OrderAlertPayload): Promise<ChannelResult> {
  if (process.env.ORDER_ALERT_SMS_ENABLED !== "true") {
    return {
      ok: false,
      detail: "SMS disabled (set ORDER_ALERT_SMS_ENABLED=true to enable TextBelt)",
      channel: "sms",
    };
  }

  const phone = ORDER_ALERT_PHONE.replace(/[^\d+]/g, "");
  const key = process.env.TEXTBELT_API_KEY ?? "textbelt";

  try {
    const res = await fetch("https://textbelt.com/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        message: buildWhatsAppShort(payload).slice(0, 300),
        key,
      }),
    });
    const data = (await res.json()) as {
      success?: boolean;
      error?: string;
      quotaRemaining?: number;
    };
    return {
      ok: Boolean(data.success),
      detail: data.success
        ? `SMS sent (quota left: ${data.quotaRemaining ?? "?"})`
        : data.error ?? "TextBelt failed",
      channel: "sms",
    };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : "TextBelt error",
      channel: "sms",
    };
  }
}

/** Fire-and-forget friendly: never throws to the checkout caller. */
export async function notifyNewOrder(payload: OrderAlertPayload) {
  const [ownerEmail, customerEmail, whatsapp, sms] = await Promise.all([
    sendOwnerEmail(payload),
    sendCustomerEmail(payload),
    sendOwnerWhatsApp(payload),
    sendOwnerSms(payload),
  ]);

  console.info("[order-alerts]", {
    orderId: payload.orderId,
    ownerEmail,
    customerEmail,
    whatsapp,
    sms,
  });

  return {
    ownerEmail,
    customerEmail,
    whatsapp,
    sms,
    /** @deprecated use ownerEmail */
    email: ownerEmail,
  };
}
