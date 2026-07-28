import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { BrandLogo } from "@/components/layout/brand-logo";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=2000&q=80"
          alt="Colorful kids toys and summer play"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[color-mix(in_srgb,var(--bg)_92%,transparent)] via-[color-mix(in_srgb,var(--bg)_72%,transparent)] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-[color-mix(in_srgb,var(--bg)_45%,transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--accent) 28%, transparent), transparent 42%), radial-gradient(circle at 80% 30%, color-mix(in srgb, var(--accent-secondary) 22%, transparent), transparent 38%)",
          }}
        />
      </div>

      <div className="container-px relative mx-auto flex min-h-[68vh] max-w-7xl flex-col justify-start pt-5 pb-14 sm:pt-8 sm:pb-16 md:min-h-[72vh] md:justify-center md:py-16">
        <div className="animate-fade-up mb-5 sm:mb-8">
          <BrandLogo size="hero" priority />
        </div>

        <h1 className="animate-fade-up-delay-1 font-display max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight text-text sm:text-4xl md:text-5xl lg:text-6xl">
          Summer is <span className="text-accent">here</span>
        </h1>
        <p className="animate-fade-up-delay-2 mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          Cool off the fun way. Shop pools, floats, RC cars, diecast models and everyday toys —
          delivered anywhere in Pakistan.
        </p>
        <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap gap-3">
          <Link href="/find">
            <Button size="lg" className="min-w-[140px]">
              Shop by Age
            </Button>
          </Link>
          <Link href="/swimming-pools">
            <Button
              size="lg"
              variant="outline"
              className="min-w-[140px] border-border bg-surface/50 backdrop-blur"
            >
              Dive In
            </Button>
          </Link>
        </div>
        <p className="animate-fade-up-delay-2 mt-6 text-sm text-muted">{SITE.tagline}</p>
      </div>
    </section>
  );
}
