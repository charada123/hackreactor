import { DISCLAIMER } from "@/lib/questions";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-black/[0.06] bg-white">
      <div className="container-x py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500 text-white">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 2l2.4 6.9H22l-6 4.4 2.3 7L12 15.9 5.7 20.3 8 13.3 2 8.9h7.6L12 2z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="font-extrabold tracking-tight">GreenPass</span>
          </div>
          <p className="max-w-2xl text-xs leading-relaxed text-ink-faint">
            {DISCLAIMER}
          </p>
        </div>
      </div>
    </footer>
  );
}
