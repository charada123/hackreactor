"use client";

import { defaultTimeline } from "@/lib/timeline";
import { useAppState } from "@/lib/store";

export default function TimelinePage() {
  const { state, ready, update } = useAppState();

  const setDate = (id: string, value: string) =>
    update((s) => ({ ...s, timeline: { ...s.timeline, [id]: value } }));

  return (
    <div className="container-x py-10">
      <div className="flex flex-col gap-1">
        <span className="eyebrow">Case timeline</span>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Track your adjustment of status
        </h1>
        <p className="mt-1 max-w-2xl text-ink-soft">
          Record the date of each milestone. Completed steps are marked as you
          add dates, so you can see exactly where you are.
        </p>
      </div>

      <div className="mt-8 max-w-2xl">
        <ol className="relative border-l-2 border-black/[0.08] pl-6">
          {defaultTimeline.map((step) => {
            const value = state.timeline[step.id] ?? "";
            const done = Boolean(value);
            return (
              <li key={step.id} className="mb-6 last:mb-0">
                <span
                  className={`absolute -left-[9px] mt-1 grid h-4 w-4 place-items-center rounded-full border-2 ${
                    done ? "border-brand-500 bg-brand-500" : "border-black/20 bg-white"
                  }`}
                />
                <div className="card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold">{step.label}</div>
                      <div className="text-xs text-ink-faint">{step.note}</div>
                    </div>
                    <input
                      type="date"
                      value={value}
                      onChange={(e) => setDate(step.id, e.target.value)}
                      className="rounded-lg border border-black/10 bg-surface-soft px-3 py-1.5 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        {ready ? null : <p className="text-ink-faint">Loading…</p>}
      </div>
    </div>
  );
}
