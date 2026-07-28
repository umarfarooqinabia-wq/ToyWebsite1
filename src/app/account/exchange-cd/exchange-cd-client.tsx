"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeftRight, RefreshCw, Upload, X } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "@/store/toast";
import type { ExchangeCdRequest } from "@/lib/admin/exchange-requests-db";
import {
  compressImageFiles,
  readApiError,
} from "@/lib/uploads/client-compress";

const PLATFORMS = [
  "PlayStation 5",
  "PlayStation 4",
  "Xbox Series X|S",
  "Xbox One",
  "Nintendo Switch",
] as const;

export function ExchangeCdClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useCurrentUser();

  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [offerTitle, setOfferTitle] = useState("");
  const [offerBrand, setOfferBrand] = useState("");
  const [offerPlatform, setOfferPlatform] = useState<string>(PLATFORMS[0]);
  const [offerConditionNotes, setOfferConditionNotes] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerImageUrls, setOfferImageUrls] = useState<string[]>([]);
  const [wantTitle, setWantTitle] = useState("");
  const [wantPlatform, setWantPlatform] = useState<string>(PLATFORMS[0]);
  const [wantProductHandle, setWantProductHandle] = useState("");
  const [wantNotes, setWantNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mine, setMine] = useState<ExchangeCdRequest[]>([]);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const loadMine = async () => {
    try {
      const res = await fetch("/api/exchange-cd", { credentials: "same-origin" });
      if (!res.ok) return;
      const data = (await res.json()) as { requests: ExchangeCdRequest[] };
      setMine(data.requests);
    } catch {
      /* ignore */
    }
  };

  const loadCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const res = await fetch("/api/captcha", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load CAPTCHA");
      const data = (await res.json()) as { question: string; token: string };
      setCaptchaQuestion(data.question);
      setCaptchaToken(data.token);
      setCaptchaAnswer("");
    } catch {
      setCaptchaQuestion("");
      setCaptchaToken("");
      toast({
        tone: "error",
        title: "CAPTCHA unavailable",
        description: "Refresh the page and try again.",
      });
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    void loadCaptcha();
  }, []);

  useEffect(() => {
    const want = searchParams.get("want")?.trim();
    const title = searchParams.get("wantTitle")?.trim();
    const platform = searchParams.get("wantPlatform")?.trim();
    if (want) setWantProductHandle(want);
    if (title) setWantTitle(title);
    if (platform && PLATFORMS.includes(platform as (typeof PLATFORMS)[number])) {
      setWantPlatform(platform);
    }
  }, [searchParams]);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.replace(
        `/account/login?next=${encodeURIComponent("/account/exchange-cd")}`,
      );
      return;
    }
    setUserName(user.fullName);
    setUserPhone(user.phone || "");
    void loadMine();
  }, [user, userLoading, router]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    if (offerImageUrls.length + files.length > 6) {
      toast({ tone: "error", title: "Max 6 photos", description: "Remove one to add more." });
      return;
    }
    setUploading(true);
    try {
      const compressed = await compressImageFiles(Array.from(files));
      const body = new FormData();
      compressed.forEach((f) => body.append("files", f));
      const res = await fetch("/api/exchange-cd/upload", {
        method: "POST",
        body,
        credentials: "same-origin",
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, "Upload failed"));
      }
      const data = (await res.json()) as { files?: { url: string }[] };
      setOfferImageUrls((prev) => [...prev, ...(data.files?.map((f) => f.url) ?? [])]);
      toast({ tone: "success", title: "Photos uploaded" });
    } catch (e) {
      toast({
        tone: "error",
        title: "Upload failed",
        description: e instanceof Error ? e.message : "Try again",
      });
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ tone: "error", title: "Please log in to request an exchange" });
      return;
    }
    if (!offerImageUrls.length) {
      toast({ tone: "error", title: "Add at least one photo of your CD" });
      return;
    }
    if (!captchaToken || !captchaAnswer.trim()) {
      toast({ tone: "error", title: "Solve the CAPTCHA first" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/exchange-cd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          userName,
          userPhone,
          offerTitle,
          offerBrand,
          offerPlatform,
          offerConditionNotes,
          offerDescription,
          offerImageUrls,
          wantTitle,
          wantPlatform,
          wantProductHandle,
          wantNotes,
          captchaToken,
          captchaAnswer: captchaAnswer.trim(),
        }),
      });
      if (!res.ok) {
        await loadCaptcha();
        throw new Error(await readApiError(res, "Could not submit"));
      }
      await res.json();
      toast({
        tone: "success",
        title: "Exchange request submitted",
        description: "Admin will check your CD condition and approve if exchangeable.",
      });
      setOfferTitle("");
      setOfferBrand("");
      setOfferConditionNotes("");
      setOfferDescription("");
      setOfferImageUrls([]);
      setWantNotes("");
      await loadCaptcha();
      await loadMine();
    } catch (err) {
      toast({
        tone: "error",
        title: "Submit failed",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading || !user) {
    return (
      <div className="container-px mx-auto max-w-3xl py-16 text-center text-muted">
        Checking your account…
      </div>
    );
  }

  return (
    <div className="container-px mx-auto max-w-3xl py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Exchange CD" },
        ]}
        className="mb-6"
      />

      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-dim text-accent">
          <ArrowLeftRight className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-bold">Exchange Used Game CD</h1>
        <p className="mt-2 text-muted">
          Trade a game you&apos;ve finished for another used CD from our shop. Upload clear
          photos of your disc — admin reviews condition, then marks it{" "}
          <strong className="text-text">exchangeable</strong> when approved. Browse{" "}
          <Link href="/pre-owned-games" className="text-accent hover:underline">
            Used Games
          </Link>{" "}
          to pick what you want.
        </p>
      </div>

      <form
        onSubmit={(e) => void submit(e)}
        className="space-y-5 rounded-3xl border border-border bg-surface/60 p-5 sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="ex-name">Your name</Label>
            <Input
              id="ex-name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="ex-phone">WhatsApp / phone</Label>
            <Input
              id="ex-phone"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              required
            />
          </div>
        </div>
        <p className="text-sm text-muted">
          Account email: <span className="text-text">{user.email}</span>
        </p>

        <div className="rounded-2xl border border-accent/25 bg-accent-dim/20 p-4">
          <p className="mb-3 text-sm font-semibold text-accent">1. Your CD (what you give)</p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="offer-title">Game title</Label>
              <Input
                id="offer-title"
                placeholder="e.g. God of War Ragnarök"
                value={offerTitle}
                onChange={(e) => setOfferTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="offer-brand">Brand / publisher</Label>
                <Input
                  id="offer-brand"
                  placeholder="Sony, EA, Nintendo…"
                  value={offerBrand}
                  onChange={(e) => setOfferBrand(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="offer-platform">Platform</Label>
                <Select
                  id="offer-platform"
                  value={offerPlatform}
                  onChange={(e) => setOfferPlatform(e.target.value)}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="offer-condition">Disc / case condition</Label>
              <Textarea
                id="offer-condition"
                rows={3}
                placeholder="Scratch-free disc, original case, working perfectly…"
                value={offerConditionNotes}
                onChange={(e) => setOfferConditionNotes(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="offer-desc">Extra details (optional)</Label>
              <Textarea
                id="offer-desc"
                rows={2}
                placeholder="Region, edition, booklet…"
                value={offerDescription}
                onChange={(e) => setOfferDescription(e.target.value)}
              />
            </div>
            <div>
              <Label>Photos of your CD (1–6)</Label>
              <p className="mt-1 text-sm text-muted">
    Disc surface + case so admin can judge condition before approval. Large
                phone photos are compressed automatically before upload.
              </p>
              <div className="mt-2 flex flex-wrap gap-3">
                {offerImageUrls.map((url) => (
                  <div
                    key={url}
                    className="relative h-24 w-24 overflow-hidden rounded-xl border border-border"
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                      unoptimized
                    />
                    <button
                      type="button"
                      aria-label="Remove photo"
                      className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                      onClick={() =>
                        setOfferImageUrls((prev) => prev.filter((u) => u !== url))
                      }
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {offerImageUrls.length < 6 ? (
                  <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-muted transition hover:border-accent hover:text-accent">
                    <Upload className="h-5 w-5" />
                    <span className="text-[10px] font-medium">
                      {uploading ? "…" : "Add"}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        void onFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bg/40 p-4">
          <p className="mb-3 text-sm font-semibold text-text">2. Wanted CD (what you get)</p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="want-title">Game you want</Label>
              <Input
                id="want-title"
                placeholder="e.g. Spider-Man 2 (Used)"
                value={wantTitle}
                onChange={(e) => setWantTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="want-platform">Platform</Label>
                <Select
                  id="want-platform"
                  value={wantPlatform}
                  onChange={(e) => setWantPlatform(e.target.value)}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="want-handle">Product link handle (optional)</Label>
                <Input
                  id="want-handle"
                  placeholder="spiderman-2-preowned-ps5"
                  value={wantProductHandle}
                  onChange={(e) => setWantProductHandle(e.target.value)}
                />
              </div>
            </div>
            {wantProductHandle ? (
              <p className="text-sm text-muted">
                Linked listing:{" "}
                <Link
                  href={`/product/${wantProductHandle}`}
                  className="text-accent hover:underline"
                >
                  /product/{wantProductHandle}
                </Link>
              </p>
            ) : null}
            <div>
              <Label htmlFor="want-notes">Notes for admin (optional)</Label>
              <Textarea
                id="want-notes"
                rows={2}
                placeholder="Happy to top up cash if values differ…"
                value={wantNotes}
                onChange={(e) => setWantNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bg/50 p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="ex-captcha">CAPTCHA — prove you’re human</Label>
            <button
              type="button"
              onClick={() => void loadCaptcha()}
              disabled={captchaLoading}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-accent disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${captchaLoading ? "animate-spin" : ""}`}
              />
              New question
            </button>
          </div>
          <p className="mb-3 font-display text-lg font-semibold tabular-nums">
            {captchaLoading ? "Loading…" : captchaQuestion || "—"}
          </p>
          <Input
            id="ex-captcha"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Your answer"
            value={captchaAnswer}
            onChange={(e) => setCaptchaAnswer(e.target.value)}
            required
          />
        </div>

        <Button type="submit" size="lg" className="w-full" loading={submitting || uploading}>
          Submit exchange request
        </Button>
      </form>

      {mine.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display mb-4 text-xl font-semibold">Your exchange requests</h2>
          <ul className="space-y-3">
            {mine.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-bg">
                  {r.offerImageUrls[0] ? (
                    <Image
                      src={r.offerImageUrls[0]}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="56px"
                      unoptimized
                    />
                  ) : null}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {r.offerTitle} → {r.wantTitle}
                  </p>
                  <p className="text-sm text-muted">
                    {r.offerPlatform}
                    {r.exchangeable ? " · Exchangeable" : ""}
                  </p>
                </div>
                <span
                  className={
                    r.status === "approved"
                      ? "rounded-full bg-accent-dim px-2.5 py-1 text-xs font-semibold capitalize text-accent"
                      : r.status === "rejected"
                        ? "rounded-full bg-danger/15 px-2.5 py-1 text-xs font-semibold capitalize text-danger"
                        : "rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold capitalize text-warning"
                  }
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
