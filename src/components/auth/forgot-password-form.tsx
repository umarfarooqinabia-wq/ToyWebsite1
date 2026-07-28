"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devLink, setDevLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const loadCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const res = await fetch("/api/captcha", { cache: "no-store" });
      if (!res.ok) throw new Error("CAPTCHA unavailable");
      const data = (await res.json()) as { question: string; token: string };
      setCaptchaQuestion(data.question);
      setCaptchaToken(data.token);
      setCaptchaAnswer("");
    } catch {
      setError("CAPTCHA unavailable. Refresh and try again.");
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    void loadCaptcha();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setDevLink("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          captchaToken,
          captchaAnswer: captchaAnswer.trim(),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
        devResetUrl?: string;
      };
      if (!res.ok) {
        await loadCaptcha();
        throw new Error(data.error ?? "Request failed");
      }
      setSuccess(data.message ?? "Check your email for a reset link.");
      if (data.devResetUrl) setDevLink(data.devResetUrl);
      await loadCaptcha();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl border border-border bg-surface/60 p-6 sm:p-8"
      >
        <BrandLogo className="mb-6" />
        <h1 className="font-display text-2xl font-bold">Forgot password</h1>
        <p className="mt-2 text-sm text-muted">
          Enter your account email and we&apos;ll send a reset link (valid for 1 hour).
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="rounded-2xl border border-border bg-bg/50 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <Label htmlFor="captcha-answer">CAPTCHA</Label>
              <button
                type="button"
                onClick={() => void loadCaptcha()}
                disabled={captchaLoading}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-accent"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${captchaLoading ? "animate-spin" : ""}`}
                />
                New question
              </button>
            </div>
            <p className="mb-3 font-display text-lg font-semibold">
              {captchaLoading ? "Loading…" : captchaQuestion || "—"}
            </p>
            <Input
              id="captcha-answer"
              inputMode="numeric"
              autoComplete="off"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              required
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-xl border border-accent/30 bg-accent-dim px-3 py-2 text-sm text-accent">
              {success}
            </p>
          ) : null}
          {devLink ? (
            <p className="break-all rounded-xl border border-border bg-bg px-3 py-2 text-xs text-muted">
              Dev reset link:{" "}
              <Link href={devLink} className="text-accent underline">
                {devLink}
              </Link>
            </p>
          ) : null}

          <Button type="submit" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/account/login" className="font-medium text-accent hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
