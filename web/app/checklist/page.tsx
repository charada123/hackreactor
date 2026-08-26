"use client";

import { useMemo } from "react";
import { documentChecklist } from "@/lib/documents";
import { useAppState } from "@/lib/store";

export default function ChecklistPage() {
  const { state, ready, update } = useAppState();

  const groups = useMemo(() => {
    const map = new Map<string, typeof documentChecklist>();
    for (const d of documentChecklist) {
      const arr = map.get(d.group) ?? [];
      arr.push(d);
      map.set(d.group, arr);
    }
    return Array.from(map.entries());
  }, []);

  const done = documentChecklist.filter((d) => state.checklist[d.id]).length;
  const total = documentChecklist.length;
  const pct = Math.round((done / total) * 100);

  const toggle = (id: string) =>
    update((s) => ({
      ...s,
      checklist: { ...s.checklist, [id]: !s.checklist[id] },
    }));

  return (
    <div className="container-x py-10">
      <div className="flex flex-col gap-1">
        <span className="eyebrow">Document checklist</span>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          What to bring to your interview
        </h1>
        <p className="mt-1 max-w-2xl text-ink-soft">
          Check items off as you gather them. Bring originals plus copies, and
          certified English translations where needed.
        </p>
      </div>

      <div className="mt-6 card p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">
            {ready ? `${done} of ${total} ready` : "…"}
          </span>
          <span className="pill bg-brand-50 text-brand-700">{pct}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-mute">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {groups.map(([group, items]) => (
          <section key={group}>
            <h2 className="mb-2 text-sm font-bold text-ink-soft">{group}</h2>
            <div className="card divide-y divide-black/[0.06]">
              {items.map((d) => {
                const checked = Boolean(state.checklist[d.id]);
                return (
                  <button
                    key={d.id}
                    onClick={() => toggle(d.id)}
                    className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-surface-soft"
                  >
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                        checked ? "border-brand-500 bg-brand-500 text-white" : "border-black/20 bg-white"
                      }`}
                    >
                      {checked ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      ) : null}
                    </span>
                    <span>
                      <span className={`block text-sm font-semibold ${checked ? "text-ink-faint line-through" : "text-ink"}`}>
                        {d.label}
                      </span>
                      <span className="block text-xs text-ink-faint">{d.note}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
