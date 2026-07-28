"use client";

import { whatsappUrl, SITE } from "@/lib/constants";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappUrl(`Hi ${SITE.name}! I need help with an order.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat on WhatsApp — ${SITE.supportPhone}`}
      className="group fixed bottom-[calc(var(--bottom-nav-height)+5.25rem)] right-3 z-40 flex items-center gap-2 sm:bottom-[calc(var(--bottom-nav-height)+1rem)] sm:right-4 lg:bottom-6 lg:right-6"
    >
      <span className="pointer-events-none hidden translate-x-2 rounded-xl border border-border/80 bg-bg-elevated/95 px-3 py-2 text-sm font-medium text-text opacity-0 shadow-[var(--shadow)] backdrop-blur-md transition duration-200 group-hover:translate-x-0 group-hover:opacity-100 sm:block">
        Chat on WhatsApp
      </span>
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_32px_rgba(37,211,102,0.45)] transition duration-200 group-hover:scale-105 group-hover:shadow-[0_16px_40px_rgba(37,211,102,0.55)]">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/30 [animation-duration:2.4s]" />
        <svg
          viewBox="0 0 32 32"
          className="relative h-7 w-7"
          fill="currentColor"
          aria-hidden
        >
          <path d="M19.11 17.53c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.41.12-.54.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.46h-.52c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29s.98 2.66 1.12 2.84c.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.57.65.21 1.25.18 1.72.11.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z" />
          <path d="M16.04 3C9.4 3 4 8.38 4 14.99c0 2.11.55 4.17 1.6 5.99L4 29l8.2-1.55c1.75.95 3.72 1.45 5.74 1.45h.01C22.68 28.9 28 23.52 28 16.91 28 10.3 22.68 3 16.04 3zm0 23.74h-.01c-1.8 0-3.56-.48-5.1-1.39l-.37-.22-4.87.92.98-4.75-.24-.39a9.7 9.7 0 0 1-1.49-5.2c0-5.38 4.4-9.76 9.82-9.76 5.41 0 10.02 4.38 10.02 9.76 0 5.38-4.4 10.03-9.74 10.03z" />
        </svg>
      </span>
    </a>
  );
}
