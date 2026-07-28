"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type CustomerRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
  orderCount: number;
  sellRequestCount: number;
  totalSpent: number;
  recentOrders: {
    id: string;
    number: string;
    status: string;
    total: { amount: number; currencyCode: string };
    createdAt: string;
    paymentMethod: string;
  }[];
  recentSellRequests: {
    id: string;
    title: string;
    status: string;
    askingPrice: number;
    createdAt: string;
  }[];
};

export function AdminCustomersClient() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/customers", { cache: "no-store" });
        const data = (await res.json()) as {
          customers?: CustomerRow[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load customers");
        setCustomers(data.customers ?? []);
        if (data.customers?.[0]) setSelectedId(data.customers[0].id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q),
    );
  }, [customers, query]);

  const selected =
    filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold md:text-3xl">Customers</h1>
        <p className="mt-1 text-sm text-muted">
          Registered accounts with their orders and account activity.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          className="pl-9"
          placeholder="Search name, email, phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-muted">Loading customers…</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : customers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Users className="mx-auto mb-3 h-8 w-8 text-muted" />
          <p className="font-medium">No registered customers yet</p>
          <p className="mt-1 text-sm text-muted">
            New signups from /account/register will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <ul className="space-y-2">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    selected?.id === c.id
                      ? "border-accent bg-accent-dim/40"
                      : "border-border bg-surface/60 hover:border-accent/40"
                  }`}
                >
                  <p className="font-semibold text-text">{c.fullName}</p>
                  <p className="truncate text-sm text-muted">{c.email}</p>
                  <p className="mt-1 text-xs text-subtle">
                    {c.orderCount} order{c.orderCount === 1 ? "" : "s"} ·{" "}
                    {c.sellRequestCount} sell request
                    {c.sellRequestCount === 1 ? "" : "s"} · Spent{" "}
                    {formatMoney({ amount: c.totalSpent, currencyCode: "PKR" })}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          {selected ? (
            <div className="space-y-5 rounded-2xl border border-border bg-surface/70 p-5">
              <div>
                <h2 className="font-display text-xl font-semibold">{selected.fullName}</h2>
                <p className="text-sm text-muted">{selected.email}</p>
                <p className="text-sm text-muted">{selected.phone || "No phone"}</p>
                <p className="mt-1 text-xs text-subtle">
                  Joined {new Date(selected.createdAt).toLocaleString("en-PK")}
                </p>
              </div>

              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-text">
                    Orders ({selected.orderCount})
                  </h3>
                  <Link href="/admin/orders" className="text-xs text-accent hover:underline">
                    All orders
                  </Link>
                </div>
                {selected.recentOrders.length === 0 ? (
                  <p className="text-sm text-muted">No orders yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {selected.recentOrders.map((o) => (
                      <li
                        key={o.id}
                        className="rounded-xl border border-border bg-bg/50 px-3 py-2 text-sm"
                      >
                        <div className="flex justify-between gap-2">
                          <span className="font-medium">#{o.number}</span>
                          <span className="capitalize text-muted">{o.status}</span>
                        </div>
                        <p className="text-xs text-muted">
                          {formatMoney(o.total)} · {o.paymentMethod.replaceAll("_", " ")} ·{" "}
                          {new Date(o.createdAt).toLocaleDateString("en-PK")}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-text">
                    Sell requests ({selected.sellRequestCount})
                  </h3>
                  <Link
                    href="/admin/sell-requests"
                    className="text-xs text-accent hover:underline"
                  >
                    All sell requests
                  </Link>
                </div>
                {selected.recentSellRequests.length === 0 ? (
                  <p className="text-sm text-muted">No sell requests.</p>
                ) : (
                  <ul className="space-y-2">
                    {selected.recentSellRequests.map((r) => (
                      <li
                        key={r.id}
                        className="rounded-xl border border-border bg-bg/50 px-3 py-2 text-sm"
                      >
                        <div className="flex justify-between gap-2">
                          <span className="font-medium">{r.title}</span>
                          <span className="capitalize text-muted">{r.status}</span>
                        </div>
                        <p className="text-xs text-muted">
                          Rs. {r.askingPrice.toLocaleString("en-PK")} ·{" "}
                          {new Date(r.createdAt).toLocaleDateString("en-PK")}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
