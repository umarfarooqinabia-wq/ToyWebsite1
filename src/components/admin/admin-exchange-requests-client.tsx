"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { toast } from "@/store/toast";
import type { ExchangeCdRequest } from "@/lib/admin/exchange-requests-db";

export function AdminExchangeRequestsClient() {
  const [requests, setRequests] = useState<ExchangeCdRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">(
    "pending",
  );
  const [note, setNote] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = filter === "all" ? "" : `?status=${filter}`;
      const res = await fetch(`/api/admin/exchange-requests${qs}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = (await res.json()) as { requests: ExchangeCdRequest[] };
      setRequests(data.requests);
    } catch {
      toast({ tone: "error", title: "Could not load exchange requests" });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (id: string, action: "approve" | "reject") => {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/exchange-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, adminNote: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      toast({
        tone: "success",
        title: action === "approve" ? "Exchange approved" : "Request rejected",
        description:
          action === "approve"
            ? "CD is now marked exchangeable. Complete the swap with the customer."
            : "Exchange request marked rejected.",
      });
      setNote("");
      await load();
    } catch (e) {
      toast({
        tone: "error",
        title: "Action failed",
        description: e instanceof Error ? e.message : "Try again",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold md:text-3xl">Exchange CD Requests</h1>
        <p className="mt-1 text-muted">
          Review customer trade-ins. Check disc photos &amp; condition, then approve to mark
          the CD exchangeable.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? "rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-[#04110e]"
                : "rounded-xl border border-border px-3 py-2 text-sm text-muted hover:text-text"
            }
          >
            {f === "all" ? "All" : f[0]!.toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          Admin note (optional, saved with approve/reject)
        </label>
        <Textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Disc clean — approved for swap vs Spider-Man 2 used"
        />
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-muted">
          No {filter === "all" ? "" : filter} exchange requests.
        </div>
      ) : (
        <ul className="space-y-4">
          {requests.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-border bg-surface/70 p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-semibold">
                      {r.offerTitle} → {r.wantTitle}
                    </h2>
                    <Badge
                      variant={
                        r.status === "approved"
                          ? "accent"
                          : r.status === "rejected"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {r.status}
                    </Badge>
                    {r.exchangeable ? (
                      <Badge variant="accent">Exchangeable</Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted">
                    Offer: {r.offerBrand} · {r.offerPlatform}
                  </p>
                  <p className="text-sm text-muted">
                    Wants: {r.wantTitle} · {r.wantPlatform}
                    {r.wantProductHandle ? (
                      <>
                        {" · "}
                        <Link
                          href={`/product/${r.wantProductHandle}`}
                          className="text-accent hover:underline"
                        >
                          View wanted CD
                        </Link>
                      </>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Customer: {r.userName} · {r.userPhone} · {r.userEmail}
                  </p>
                  <p className="mt-2 text-sm font-medium text-text">Condition</p>
                  <p className="text-sm text-muted">{r.offerConditionNotes}</p>
                  {r.offerDescription ? (
                    <p className="mt-1 text-sm text-muted">{r.offerDescription}</p>
                  ) : null}
                  {r.wantNotes ? (
                    <p className="mt-1 text-sm text-muted">Want notes: {r.wantNotes}</p>
                  ) : null}
                  {r.listedProductHandle ? (
                    <Link
                      href={`/product/${r.listedProductHandle}`}
                      className="mt-2 inline-block text-sm text-accent hover:underline"
                    >
                      Listed exchange stock →
                    </Link>
                  ) : null}
                  {r.adminNote ? (
                    <p className="mt-2 text-xs text-subtle">Admin: {r.adminNote}</p>
                  ) : null}
                </div>
                <p className="text-xs text-subtle">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {r.offerImageUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative h-20 w-20 overflow-hidden rounded-xl border border-border"
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized
                    />
                  </a>
                ))}
              </div>

              {r.status === "pending" ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button loading={busyId === r.id} onClick={() => void act(r.id, "approve")}>
                    <Check className="mr-1.5 h-4 w-4" />
                    Approve &amp; mark exchangeable
                  </Button>
                  <Button
                    variant="outline"
                    loading={busyId === r.id}
                    onClick={() => void act(r.id, "reject")}
                  >
                    <X className="mr-1.5 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
