"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/simulator", label: "Simulator" },
  { href: "/questions", label: "Questions" },
  { href: "/checklist", label: "Documents" },
  { href: "/timeline", label: "Timeline" },
];

export function SiteNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-500 text-white shadow-lift">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 2l2.4 6.9H22l-6 4.4 2.3 7L12 15.9 5.7 20.3 8 13.3 2 8.9h7.6L12 2z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="text-[15px] font-extrabold tracking-tight">GreenPass</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-soft hover:bg-surface-mute hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/simulator" className="btn-primary hidden sm:inline-flex">
          Start Practice
        </Link>
      </div>
    </header>
  );
}
