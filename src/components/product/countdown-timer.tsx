"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CountdownTimer({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState({ h: 0, m: 0, s: 0, expired: false });

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining({ h: 0, m: 0, s: 0, expired: true });
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining({ h, m, s, expired: false });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (remaining.expired) {
    return <span className="text-sm text-muted">Deal ended</span>;
  }

  return (
    <div className="flex items-center gap-1.5 font-display text-sm font-semibold tabular-nums">
      {[remaining.h, remaining.m, remaining.s].map((v, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          <span className="rounded-lg bg-bg px-2 py-1 text-accent">{pad(v)}</span>
          {i < 2 ? <span className="text-subtle">:</span> : null}
        </span>
      ))}
    </div>
  );
}
