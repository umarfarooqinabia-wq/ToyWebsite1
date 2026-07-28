import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { DiscPlatform } from "@/lib/disc-platform";

const CASE_SHELL: Record<DiscPlatform, string> = {
  ps5: "bg-[linear-gradient(145deg,#5a9fd4_0%,#2b6ea8_42%,#1a4f7a_100%)]",
  ps4: "bg-[linear-gradient(145deg,#4a8ec8_0%,#1e4f86_45%,#12365c_100%)]",
  xbox: "bg-[linear-gradient(145deg,#3ddc84_0%,#107c10_45%,#0b5a0b_100%)]",
  switch: "bg-[linear-gradient(145deg,#e60012_0%,#8b0010_40%,#222_100%)]",
  generic: "bg-[linear-gradient(145deg,#64748b_0%,#334155_50%,#1e293b_100%)]",
};

function PlatformHeaderMark({ platform }: { platform: DiscPlatform }) {
  if (platform === "ps5" || platform === "ps4") {
    return (
      <div className="flex items-center gap-[0.35em] text-black">
        <svg
          viewBox="0 0 32 32"
          className="h-[1.05em] w-[1.05em] shrink-0"
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M9.2 21.6c-1.7.5-3.3.4-4.4-.3-1.3-.8-1.4-2.1-.4-2.9.7-.6 1.7-.8 2.9-.6v-2.1c-2.2-.3-4.2.3-5.4 1.6-1.8 1.9-1.4 4.7 1 6.1 1.5.9 3.5 1.1 5.5.5l8.4-2.7v-3.1l-7.6 2.5zm6.4-5.4V8.9c0-1.7.3-3.2 1.7-3.8 1.2-.5 2.5 0 3.1 1.1.2.4.3.9.3 1.5v11.8l-3.3 1.1c-2.1.7-3.9.6-5.1-.3-1.4-1-1.4-2.6-.1-3.5.9-.7 2.2-.8 3.4-.4v-2.2c-2.4-.5-4.6.2-5.9 1.7-2 2.3-1.5 5.6 1.3 7.2 1.7 1 4 1.1 6.4.3l8.8-2.8V5.8c0-2.1-.5-3.8-2.1-4.8C22.3.2 20.2.3 18.1 1.1L9.8 3.8v2.4l5.8-1.9z"
          />
        </svg>
        <span
          className="text-[0.95em] font-black leading-none tracking-[-0.04em]"
          style={{ fontFamily: "var(--font-display), Arial Black, sans-serif" }}
        >
          {platform === "ps5" ? "PS5" : "PS4"}
        </span>
      </div>
    );
  }

  if (platform === "xbox") {
    return (
      <div className="flex items-center gap-[0.35em] text-[#107c10]">
        <svg viewBox="0 0 24 24" className="h-[1em] w-[1em]" aria-hidden>
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          <path
            fill="#fff"
            d="M7.2 8.2c1.2-1.4 2.6-2.2 4.8-2.2s3.6.8 4.8 2.2c-1.5 1.1-3.1 1.7-4.8 1.7S8.7 9.3 7.2 8.2zm0 7.6C8.7 14.7 10.3 14 12 14s3.3.7 4.8 1.8c-1.2 1.4-2.6 2.2-4.8 2.2s-3.6-.8-4.8-2.2z"
          />
        </svg>
        <span className="text-[0.85em] font-black tracking-tight">Xbox</span>
      </div>
    );
  }

  if (platform === "switch") {
    return (
      <div className="flex items-center gap-[0.4em]">
        <span className="inline-flex h-[0.9em] w-[1.35em] overflow-hidden rounded-[0.15em]">
          <span className="w-1/2 bg-[#e60012]" />
          <span className="w-1/2 bg-[#0ab4e0]" />
        </span>
        <span className="text-[0.8em] font-black tracking-tight text-black">
          Switch
        </span>
      </div>
    );
  }

  return (
    <span className="text-[0.75em] font-black uppercase tracking-wider text-black">
      Toy
    </span>
  );
}

type CdCaseFrameProps = {
  platform: DiscPlatform;
  children: ReactNode;
  className?: string;
  /** Extra classes for the cover art well */
  artClassName?: string;
};

/** Physical Blu-ray / console CD case chrome around cover art. */
export function CdCaseFrame({
  platform,
  children,
  className,
  artClassName,
}: CdCaseFrameProps) {
  return (
    <div
      className={cn(
        "relative isolate h-full w-full overflow-hidden rounded-[0.35rem] p-[3.2%] shadow-[0_10px_28px_rgba(0,0,0,0.45)]",
        CASE_SHELL[platform],
        className,
      )}
    >
      {/* Plastic gloss */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[0.35rem] opacity-40"
        style={{
          background:
            "linear-gradient(125deg, rgba(255,255,255,0.45) 0%, transparent 28%, transparent 62%, rgba(0,0,0,0.25) 100%)",
        }}
      />
      {/* Right spine edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-[3%] right-[1.2%] w-[2.2%] rounded-r-[0.15rem] bg-black/25"
      />

      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[0.12rem] bg-[#0a0a0a] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.35)]">
        {/* White platform header bar (PS5-style) */}
        <div className="relative z-[2] flex h-[11.5%] min-h-[1.35rem] shrink-0 items-center bg-white px-[4%]">
          <PlatformHeaderMark platform={platform} />
        </div>

        {/* Cover art — absolute inset so Next/Image fill always has bounds */}
        <div className={cn("relative min-h-0 flex-1", artClassName)}>
          <div className="absolute inset-0 overflow-hidden">{children}</div>
        </div>
      </div>
    </div>
  );
}
