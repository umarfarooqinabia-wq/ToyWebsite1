"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/utils";
import type { MonthEarnings } from "@/lib/admin/revenue";

export function AdminEarningsPanel({ months }: { months: MonthEarnings[] }) {
  const currentKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const [selectedKey, setSelectedKey] = useState(
    months.find((m) => m.key === currentKey)?.key ?? months[0]?.key ?? currentKey,
  );

  const selected =
    months.find((m) => m.key === selectedKey) ??
    ({
      key: selectedKey,
      label: "This month",
      orderCount: 0,
      unitsSold: 0,
      sales: 0,
      cost: 0,
      profit: 0,
      trackedUnits: 0,
      untrackedUnits: 0,
      topLines: [],
    } satisfies MonthEarnings);

  const allTimeProfit = months.reduce((s, m) => s + m.profit, 0);
  const allTimeSales = months.reduce((s, m) => s + m.sales, 0);

  return (
    <section className="space-y-5 rounded-3xl border border-border bg-surface p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Team earnings
          </p>
          <h2 className="font-display mt-1 text-2xl font-bold">Monthly profit</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Profit = selling price − buying price on sold toys (e.g. buy 7,000 / sell 8,000 →
            +1,000). Cancelled orders are excluded.
          </p>
        </div>
        <label className="text-sm text-muted">
          Month
          <select
            className="ml-2 h-10 rounded-xl border border-border bg-bg px-3 text-sm text-text"
            value={selected.key}
            onChange={(e) => setSelectedKey(e.target.value)}
          >
            {months.length === 0 ? (
              <option value={currentKey}>This month</option>
            ) : (
              months.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))
            )}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: `${selected.label} profit`,
            value: formatMoney({ amount: selected.profit, currencyCode: "PKR" }),
            hint: "What the team made",
            accent: true,
          },
          {
            label: "Sales (sell total)",
            value: formatMoney({ amount: selected.sales, currencyCode: "PKR" }),
            hint: `${selected.orderCount} orders · ${selected.unitsSold} units`,
          },
          {
            label: "Buy cost used",
            value: formatMoney({ amount: selected.cost, currencyCode: "PKR" }),
            hint: "From toy stock buy prices",
          },
          {
            label: "All-time profit",
            value: formatMoney({ amount: allTimeProfit, currencyCode: "PKR" }),
            hint: `Sales ${formatMoney({ amount: allTimeSales, currencyCode: "PKR" })}`,
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border p-4 ${
              card.accent
                ? "border-accent/40 bg-accent-dim"
                : "border-border bg-bg/60"
            }`}
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p
              className={`mt-2 font-display text-2xl font-bold ${
                card.accent ? "text-accent" : "text-text"
              }`}
            >
              {card.value}
            </p>
            <p className="mt-1 text-xs text-subtle">{card.hint}</p>
          </div>
        ))}
      </div>

      {selected.untrackedUnits > 0 ? (
        <p className="rounded-xl border border-border bg-bg/50 px-3 py-2 text-xs text-muted">
          {selected.untrackedUnits} unit(s) this month have no buying price set in Toy Stock —
          set Buy (PKR) on those discs so profit is exact. Tracked: {selected.trackedUnits}{" "}
          unit(s).
        </p>
      ) : null}

      <div>
        <h3 className="font-display text-sm font-semibold">Top profit discs this month</h3>
        {selected.topLines.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No sold discs yet this month. When orders complete, profit shows here.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-bg/70 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Toy</th>
                  <th className="px-3 py-2 font-medium">Qty</th>
                  <th className="px-3 py-2 font-medium">Buy</th>
                  <th className="px-3 py-2 font-medium">Sell</th>
                  <th className="px-3 py-2 font-medium">Profit</th>
                </tr>
              </thead>
              <tbody>
                {selected.topLines.map((line) => (
                  <tr key={line.title} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2">
                      <p className="line-clamp-1 font-medium">{line.title}</p>
                      {!line.hasCost ? (
                        <p className="text-[11px] text-warning">No buy price</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">{line.quantity}</td>
                    <td className="px-3 py-2 text-muted">
                      {line.hasCost
                        ? formatMoney({ amount: line.buyUnit, currencyCode: "PKR" })
                        : "—"}
                    </td>
                    <td className="px-3 py-2">
                      {formatMoney({ amount: line.sellUnit, currencyCode: "PKR" })}
                    </td>
                    <td className="px-3 py-2 font-display font-semibold text-accent">
                      {line.hasCost
                        ? formatMoney({ amount: line.profit, currencyCode: "PKR" })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {months.length > 1 ? (
        <div>
          <h3 className="font-display text-sm font-semibold">Month-by-month</h3>
          <ul className="mt-3 divide-y divide-border rounded-2xl border border-border">
            {months.slice(0, 12).map((m) => (
              <li key={m.key}>
                <button
                  type="button"
                  onClick={() => setSelectedKey(m.key)}
                  className={`flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left text-sm transition hover:bg-bg/50 ${
                    m.key === selected.key ? "bg-accent-dim" : ""
                  }`}
                >
                  <span className="font-medium">{m.label}</span>
                  <span className="text-muted">
                    {m.orderCount} orders · profit{" "}
                    <span className="font-display font-semibold text-accent">
                      {formatMoney({ amount: m.profit, currencyCode: "PKR" })}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
