"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const resetOk = searchParams.get("reset") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Sign in failed");
      const dest =
        next.startsWith("/account") && !next.startsWith("/account/login")
          ? next
          : "/account";
      router.replace(dest);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
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
        <h1 className="font-display text-2xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Access your orders, wishlist, and account settings.
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
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/account/forgot-password"
                className="text-xs font-medium text-accent hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {resetOk ? (
            <p className="rounded-xl border border-accent/30 bg-accent-dim px-3 py-2 text-sm text-accent">
              Password updated. Sign in with your new password.
            </p>
          ) : null}
          {error ? (
            <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" loading={loading}>
            Sign in
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          New here?{" "}
          <Link href="/account/register" className="font-medium text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
