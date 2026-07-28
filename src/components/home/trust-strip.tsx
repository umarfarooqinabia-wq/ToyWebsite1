import { ShieldCheck, Truck, BadgeCheck, RotateCcw } from "lucide-react";

const items = [
  {
    icon: Truck,
    title: "Free shipping",
    text: "On orders over Rs 4,999 anywhere in Pakistan.",
  },
  {
    icon: BadgeCheck,
    title: "Cash on delivery",
    text: "Pay when your toys arrive at the door.",
  },
  {
    icon: RotateCcw,
    title: "Easy returns",
    text: "Refund & exchange policy you can trust.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & age-appropriate",
    text: "Quality-checked toys for every age.",
  },
];

export function TrustStrip({ compact }: { compact?: boolean }) {
  return (
    <section
      className={
        compact
          ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
          : "container-px mx-auto grid max-w-7xl gap-3 py-10 sm:grid-cols-2 lg:grid-cols-4"
      }
    >
      {items.map(({ icon: Icon, title, text }) => (
        <div
          key={title}
          className="rounded-2xl border border-border bg-surface/80 px-4 py-4 backdrop-blur"
        >
          <Icon className="mb-3 h-5 w-5 text-accent" />
          <p className="font-display text-sm font-semibold text-text">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">{text}</p>
        </div>
      ))}
    </section>
  );
}
