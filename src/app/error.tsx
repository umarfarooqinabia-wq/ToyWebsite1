"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-px mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-secondary">Something broke</p>
      <h1 className="mt-3 font-display text-3xl font-bold">We hit a lag spike</h1>
      <p className="mt-3 text-sm text-muted">
        {error.message || "An unexpected error occurred. Try again or head back to shopping."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/">
          <Button variant="outline">Go home</Button>
        </Link>
      </div>
    </div>
  );
}
