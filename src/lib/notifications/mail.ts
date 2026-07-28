import { SITE } from "@/lib/constants";

export type SendEmailResult = { ok: boolean; detail: string; channel: string };

/** Shared transactional email via Resend (production). */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ??
    `ToyCompany <noreply@${safeHostname()}>`;

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

function safeHostname() {
  try {
    return new URL(SITE.url).hostname || "toycompany.store";
  } catch {
    return "toycompany.store";
  }
}
