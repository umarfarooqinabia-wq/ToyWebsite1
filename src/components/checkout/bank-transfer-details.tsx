import {
  PAYMENT_ACCOUNTS,
  PAYMENT_PROOF_RULES,
  type PrepaidPaymentMethod,
} from "@/lib/bank-details";

const TITLES: Record<PrepaidPaymentMethod, string> = {
  bank_transfer: "Our bank details",
  easypaisa: "Our Easypaisa details",
  jazzcash: "Our JazzCash details",
};

export function BankTransferDetails({
  orderNumber,
  paymentMethod = "bank_transfer",
  showUploadHint = true,
}: {
  orderNumber: string;
  paymentMethod?: PrepaidPaymentMethod;
  showUploadHint?: boolean;
}) {
  const accounts = PAYMENT_ACCOUNTS.filter((a) =>
    (a.methods as readonly string[]).includes(paymentMethod),
  );

  return (
    <div className="rounded-2xl border border-accent/30 bg-accent-dim/40 p-5 text-left">
      <h2 className="font-display text-lg font-semibold text-text">
        {TITLES[paymentMethod]}
      </h2>
      <p className="mt-2 text-sm text-muted">
        Transfer the <span className="font-semibold text-text">exact order total</span> to{" "}
        {accounts.length > 1 ? "an account" : "the account"} below. Use order number{" "}
        <span className="font-semibold text-accent">{orderNumber}</span> as the payment
        reference.
      </p>

      <ul className="mt-4 space-y-4">
        {accounts.map((account) => (
          <li
            key={account.id}
            className="rounded-xl border border-border bg-bg/60 p-4 text-sm"
          >
            <dl className="space-y-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">
                  Account holder name
                </dt>
                <dd className="font-semibold text-text">{account.accountHolder}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Bank / wallet</dt>
                <dd className="font-semibold text-text">{account.bank}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">
                  {account.bank === "JazzCash" || account.bank === "Easypaisa"
                    ? "Account / mobile number"
                    : "Account number"}
                </dt>
                <dd className="font-mono text-base font-semibold tracking-wide text-accent">
                  {account.accountNumber}
                </dd>
              </div>
              {"iban" in account && account.iban ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">IBAN</dt>
                  <dd className="break-all font-mono text-sm font-semibold tracking-wide text-accent">
                    {account.iban}
                  </dd>
                </div>
              ) : null}
            </dl>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2 rounded-xl border border-border/80 bg-bg/40 p-4 text-sm text-muted">
        <p className="font-semibold text-text">Payment proof &amp; unpaid orders</p>
        <ul className="list-disc space-y-1.5 pl-4">
          <li>
            Upload your transfer screenshot on the order page within{" "}
            <span className="font-semibold text-text">
              {PAYMENT_PROOF_RULES.proofDeadlineHours} hours
            </span>
            {showUploadHint ? (
              <>
                {" "}
                (or {PAYMENT_PROOF_RULES.supportWhatsAppHint}).
              </>
            ) : (
              <> — admin will mark the order paid after verification.</>
            )}
          </li>
          <li>
            We pack and dispatch after payment is verified (same business day when
            possible).
          </li>
          <li>
            If unpaid / no proof within{" "}
            <span className="font-semibold text-text">
              {PAYMENT_PROOF_RULES.cancelAfterHours} hours
            </span>
            , we may cancel the order and restock the items. Message us if you need more
            time.
          </li>
        </ul>
      </div>
    </div>
  );
}
