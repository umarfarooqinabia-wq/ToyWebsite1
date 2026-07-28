"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export function CustomerRegisterForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);

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
      setError("CAPTCHA unavailable. Refresh the page and try again.");
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
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!captchaToken || !captchaAnswer.trim()) {
      setError("Solve the CAPTCHA first");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          captchaToken,
          captchaAnswer: captchaAnswer.trim(),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        await loadCaptcha();
        throw new Error(data.error ?? "Registration failed");
      }
      router.replace("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
        <h1 className="font-display text-2xl font-bold">Create account</h1>
        <p className="mt-2 text-sm text-muted">
          Register to track orders and save your favourite toys.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">WhatsApp / phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 300 1234567"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm password</Label>
            <PasswordInput
              id="confirm"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <div className="rounded-2xl border border-border bg-bg/50 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <Label htmlFor="captcha-answer">CAPTCHA — prove you’re human</Label>
              <button
                type="button"
                onClick={() => void loadCaptcha()}
                disabled={captchaLoading}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-accent disabled:opacity-50"
                aria-label="Refresh CAPTCHA"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${captchaLoading ? "animate-spin" : ""}`}
                />
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

          {error ? (
            <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/account/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
