"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "@/store/toast";
import { THEME_LABELS, THEME_ORDER, useThemeStore, type Theme } from "@/store/theme";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, loading, setUser } = useCurrentUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    if (!user) return;
    setName(user.fullName);
    setEmail(user.email);
    setPhone(user.phone || "");
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name, phone }),
      });
      const data = (await res.json()) as {
        user?: typeof user;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Could not save");
      if (data.user) setUser(data.user);
      toast({ tone: "success", title: "Profile updated" });
    } catch (err) {
      toast({
        tone: "error",
        title: "Save failed",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-px mx-auto max-w-xl py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Settings" },
        ]}
        className="mb-6"
      />
      <h1 className="mb-8 font-display text-3xl font-bold">Account Settings</h1>

      <section className="mb-6 space-y-3 rounded-2xl border border-border bg-surface p-5">
        <div>
          <h2 className="font-display text-lg font-semibold">Appearance</h2>
          <p className="mt-1 text-sm text-muted">
            Choose from Dark, Light, Sepia, Ocean, Forest, Crimson, Cyber, Sunset, or OLED.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {THEME_ORDER.map((id: Theme) => (
            <button
              key={id}
              type="button"
              onClick={() => setTheme(id)}
              className={cn(
                "rounded-xl border px-2 py-3 text-center text-sm font-medium transition",
                theme === id
                  ? "border-accent bg-accent-dim text-accent"
                  : "border-border text-muted hover:border-accent/40 hover:text-text",
              )}
            >
              {THEME_LABELS[id]}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <form
          className="space-y-4 rounded-2xl border border-border bg-surface p-5"
          onSubmit={(e) => void onSubmit(e)}
        >
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} disabled />
            <p className="mt-1 text-xs text-muted">Email cannot be changed after signup.</p>
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </form>
      )}
    </div>
  );
}
