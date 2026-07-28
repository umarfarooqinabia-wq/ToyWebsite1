"use client";

import { useEffect, useState } from "react";
import type { PublicUser } from "@/lib/auth/types";

export function useCurrentUser() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        setUser(null);
        setError("Not signed in");
        return null;
      }
      const data = (await res.json()) as { user: PublicUser };
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      setError("Could not load profile");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return { user, loading, error, refresh, setUser };
}
