import Link from "next/link";
import type { ReactNode } from "react";
import { stripEmojis } from "@/lib/utils";

/** Lightweight Markdown → React for CMS articles (no extra dependency). */
export function MarkdownContent({ source }: { source: string }) {
  const blocks = stripEmojis(source)
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4 text-base leading-relaxed text-text/90">
      {blocks.map((block, i) => {
        if (/^###\s+/.test(block)) {
          return (
            <h3 key={i} className="pt-2 font-display text-xl font-bold text-text">
              {inline(block.replace(/^###\s+/, ""))}
            </h3>
          );
        }
        if (/^##\s+/.test(block)) {
          return (
            <h2 key={i} className="pt-3 font-display text-2xl font-bold text-text">
              {inline(block.replace(/^##\s+/, ""))}
            </h2>
          );
        }
        if (/^#\s+/.test(block)) {
          return (
            <h2 key={i} className="pt-3 font-display text-2xl font-bold text-text">
              {inline(block.replace(/^#\s+/, ""))}
            </h2>
          );
        }
        if (
          /^[-*]\s+/m.test(block) &&
          block.split("\n").every((l) => /^[-*]\s+/.test(l) || !l.trim())
        ) {
          const items = block.split("\n").filter(Boolean);
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 text-muted">
              {items.map((item, j) => (
                <li key={j}>{inline(item.replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-muted">
            {inline(block.replace(/\n/g, " "))}
          </p>
        );
      })}
    </div>
  );
}

function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key++} className="font-semibold text-text">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const href = linkMatch[2]!;
        const label = linkMatch[1]!;
        const internal = href.startsWith("/");
        nodes.push(
          internal ? (
            <Link key={key++} href={href} className="font-medium text-accent hover:underline">
              {label}
            </Link>
          ) : (
            <a
              key={key++}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent hover:underline"
            >
              {label}
            </a>
          ),
        );
      }
    }
    last = m.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
