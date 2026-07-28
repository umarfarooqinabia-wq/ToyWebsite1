import { SITE } from "@/lib/constants";

/** Payment accounts shown after checkout for bank / wallet transfers. */
export const PAYMENT_ACCOUNTS = [
  {
    id: "meezan",
    accountHolder: "Muhammad Umar Farooq",
    bank: "Meezan Bank",
    accountNumber: "9921-103037604",
    iban: "PK07MEZN0099210103037604",
    methods: ["bank_transfer"] as const,
  },
  {
    id: "nayapay",
    accountHolder: "Muhammad Umar Farooq",
    bank: "Nayapay",
    accountNumber: "+92-332-2235956",
    methods: ["bank_transfer"] as const,
  },
  {
    id: "easypaisa",
    accountHolder: "Muhammad Umar Farooq",
    bank: "Easypaisa",
    accountNumber: "+92-3322235956",
    methods: ["easypaisa", "bank_transfer"] as const,
  },
  {
    id: "jazzcash",
    accountHolder: "Muhammad Umar Farooq",
    bank: "JazzCash",
    accountNumber: "+92-3322235956",
    methods: ["jazzcash"] as const,
  },
] as const;

/** How long prepaid orders wait for proof before cancellation. */
export const PAYMENT_PROOF_RULES = {
  /** Hours to send transfer / screenshot after placing a prepaid order */
  proofDeadlineHours: 48,
  /** Soft hold window before we may cancel unpaid prepaid orders */
  cancelAfterHours: 72,
  supportPhone: SITE.supportPhone,
  supportWhatsAppHint: `WhatsApp ${SITE.supportPhone} with your order number + payment screenshot`,
} as const;

export type PrepaidPaymentMethod = "bank_transfer" | "easypaisa" | "jazzcash";

export function isPrepaidTransferMethod(
  method: string,
): method is PrepaidPaymentMethod {
  return (
    method === "bank_transfer" ||
    method === "easypaisa" ||
    method === "jazzcash"
  );
}

/** @deprecated use PAYMENT_ACCOUNTS */
export const BANK_ACCOUNTS = PAYMENT_ACCOUNTS;
