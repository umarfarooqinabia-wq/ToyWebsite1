"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Missing reset token. Request a new link.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Reset failed");
      router.replace("/account/login?reset=1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
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
        <h1 className="font-display text-2xl font-bold">Set new password</h1>
        <p className="mt-2 text-sm text-muted">
          Choose a new password for your ToyCompany account.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="password">New password</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {error ? (
            <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" loading={loading} disabled={!token}>
            Update password
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          <Link
            href="/account/forgot-password"
            className="font-medium text-accent hover:underline"
          >
            Request a new link
          </Link>
        </p>
      </form>
    </div>
  );
}
