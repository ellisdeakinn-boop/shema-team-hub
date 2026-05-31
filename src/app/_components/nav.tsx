"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/cn";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/priorities", label: "Priorities" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/eod", label: "EOD" },
  { href: "/sops", label: "SOPs" },
  { href: "/suggestions", label: "Suggestions" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[color:var(--color-bg)]/90 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--color-bg)]/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-[var(--color-accent)] pulse-dot" />
          </span>
          <Image
            src="/framework-logo.png"
            alt="Framework"
            width={1920}
            height={509}
            priority
            className="h-6 w-auto select-none transition-opacity group-hover:opacity-80"
          />
          <span className="hidden sm:inline-block text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-muted-2)] border-l border-[var(--color-border)] pl-3 ml-1">
            Team Hub
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l, i) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "group relative px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] font-medium rounded-sm transition-colors",
                  active
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-muted)] hover:text-white hover:bg-[var(--color-surface-2)]"
                )}
              >
                <span className={cn(
                  "mr-1.5 text-[9px] tabular-nums",
                  active ? "text-white/70" : "text-[var(--color-muted-2)] group-hover:text-[var(--color-accent)]"
                )}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted-2)]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-[var(--color-accent)] pulse-dot" />
          </span>
          Live
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden flex gap-1 px-4 pb-3 overflow-x-auto">
        {LINKS.map((l, i) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "shrink-0 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] rounded-sm transition-colors",
                active
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--color-muted)] hover:text-white bg-[var(--color-surface)]"
              )}
            >
              <span className="mr-1 text-[9px] tabular-nums opacity-60">
                {String(i + 1).padStart(2, "0")}
              </span>
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
