"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Disc3, RefreshCw, Upload, X } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "@/store/toast";
import type { SellGameRequest } from "@/lib/admin/sell-requests-db";
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

export function SellGameClient() {
  const { user, loading: userLoading } = useCurrentUser();
  const [sellerName, setSellerName] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [platform, setPlatform] = useState<string>(PLATFORMS[0]);
  const [askingPrice, setAskingPrice] = useState("");
  const [conditionNotes, setConditionNotes] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mine, setMine] = useState<SellGameRequest[]>([]);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const loadMine = async (email: string) => {
    try {
      const res = await fetch(
        `/api/sell-game?email=${encodeURIComponent(email)}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as { requests: SellGameRequest[] };
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
    if (!user) return;
    setSellerName(user.fullName);
    setSellerEmail(user.email);
    setSellerPhone(user.phone || "");
    void loadMine(user.email);
  }, [user]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    if (imageUrls.length + files.length > 6) {
      toast({ tone: "error", title: "Max 6 photos", description: "Remove one to add more." });
      return;
    }
    setUploading(true);
    try {
      const compressed = await compressImageFiles(Array.from(files));
      const body = new FormData();
      body.set("kind", "image");
      compressed.forEach((f) => body.append("files", f));
      const res = await fetch("/api/sell-game/upload", { method: "POST", body });
      if (!res.ok) {
        throw new Error(await readApiError(res, "Upload failed"));
      }
      const data = (await res.json()) as { files?: { url: string }[] };
      setImageUrls((prev) => [...prev, ...(data.files?.map((f) => f.url) ?? [])]);
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
    if (!imageUrls.length) {
      toast({ tone: "error", title: "Add at least one CD photo" });
      return;
    }
    if (!captchaToken || !captchaAnswer.trim()) {
      toast({ tone: "error", title: "Solve the CAPTCHA first" });
      return;
    }
    const price = Number(String(askingPrice).replace(/,/g, "").trim());
    if (!Number.isFinite(price) || price < 500) {
      toast({
        tone: "error",
        title: "Invalid price",
        description: "Enter asking price in PKR (at least Rs 500).",
      });
      return;
    }
    if (conditionNotes.trim().length < 5) {
      toast({
        tone: "error",
        title: "Condition required",
        description: "Describe disc/case condition (at least 5 characters).",
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/sell-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          sellerName: sellerName.trim(),
          sellerEmail: sellerEmail.trim(),
          sellerPhone: sellerPhone.trim(),
          title: title.trim(),
          brand: brand.trim(),
          platform,
          askingPrice: price,
          conditionNotes: conditionNotes.trim(),
          description: description.trim(),
          imageUrls,
          captchaToken,
          captchaAnswer: captchaAnswer.trim(),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        await loadCaptcha();
        throw new Error(data.error || "Could not submit");
      }
      toast({
        tone: "success",
        title: "Request submitted",
        description: "Admin will review your used CD listing.",
      });
      setTitle("");
      setBrand("");
      setAskingPrice("");
      setConditionNotes("");
      setDescription("");
      setImageUrls([]);
      await loadCaptcha();
      if (sellerEmail) await loadMine(sellerEmail);
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

  return (
    <div className="container-px mx-auto max-w-3xl py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Sell Game" },
        ]}
        className="mb-6"
      />

      {userLoading ? (
        <p className="py-12 text-center text-muted">Loading your profile…</p>
      ) : null}

      <div className="mb-8">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-dim text-accent">
          <Disc3 className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-bold">Sell Used Game CD</h1>
        <p className="mt-2 text-muted">
          Upload clear photos of your disc &amp; case. After admin approval, your listing
          appears in{" "}
          <Link href="/pre-owned-games" className="text-accent hover:underline">
            Used Games
          </Link>
          .
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-5 rounded-3xl border border-border bg-surface/60 p-5 sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="seller-name">Your name</Label>
            <Input
              id="seller-name"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="seller-phone">WhatsApp / phone</Label>
            <Input
              id="seller-phone"
              value={sellerPhone}
              onChange={(e) => setSellerPhone(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="seller-email">Email</Label>
          <Input
            id="seller-email"
            type="email"
            value={sellerEmail}
            onChange={(e) => setSellerEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="game-title">Game title</Label>
          <Input
            id="game-title"
            placeholder="e.g. God of War Ragnarök"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="brand">Brand / publisher</Label>
            <Input
              id="brand"
              placeholder="Sony, EA, Nintendo…"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="platform">Platform</Label>
            <Select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
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
          <Label htmlFor="price">Asking price (PKR)</Label>
          <Input
            id="price"
            type="number"
            min={500}
            step={100}
            placeholder="4500"
            value={askingPrice}
            onChange={(e) => setAskingPrice(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="condition">Disc / case condition</Label>
          <Textarea
            id="condition"
            rows={3}
            placeholder="Scratch-free disc, original case, booklet included…"
            value={conditionNotes}
            onChange={(e) => setConditionNotes(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="desc">Extra details (optional)</Label>
          <Textarea
            id="desc"
            rows={3}
            placeholder="Region, edition, any extras…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <Label>CD photos (1–6)</Label>
          <p className="mt-1.5 text-sm text-muted">
            Please include clear photos of the disc surface and case so admin can rate
            condition. The first photo is cropped to a consistent cover size; all images
            are compressed automatically.
            based on the CD condition.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {imageUrls.map((url) => (
              <div
                key={url}
                className="relative h-24 w-24 overflow-hidden rounded-xl border border-border"
              >
                <Image src={url} alt="" fill className="object-cover" sizes="96px" unoptimized />
                <button
                  type="button"
                  aria-label="Remove photo"
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                  onClick={() => setImageUrls((prev) => prev.filter((u) => u !== url))}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {imageUrls.length < 6 ? (
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

        <div className="rounded-2xl border border-border bg-bg/50 p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="captcha-answer">CAPTCHA — prove you’re human</Label>
            <button
              type="button"
              onClick={() => void loadCaptcha()}
              disabled={captchaLoading}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-accent disabled:opacity-50"
              aria-label="Refresh CAPTCHA"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${captchaLoading ? "animate-spin" : ""}`} />
              New question
            </button>
          </div>
          <p className="mb-3 font-display text-lg font-semibold tabular-nums text-fg">
            {captchaLoading ? "Loading…" : captchaQuestion || "—"}
          </p>
          <Input
            id="captcha-answer"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Your answer"
            value={captchaAnswer}
            onChange={(e) => setCaptchaAnswer(e.target.value)}
            required
          />
        </div>

        <Button type="submit" size="lg" className="w-full" loading={submitting || uploading}>
          Submit for admin review
        </Button>
      </form>

      {mine.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display mb-4 text-xl font-semibold">Your sell requests</h2>
          <ul className="space-y-3">
            {mine.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-bg">
                  {r.imageUrls[0] ? (
                    <Image
                      src={r.imageUrls[0]}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="56px"
                      unoptimized
                    />
                  ) : null}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{r.title}</p>
                  <p className="text-sm text-muted">
                    Rs. {r.askingPrice.toLocaleString("en-PK")} · {r.platform}
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
