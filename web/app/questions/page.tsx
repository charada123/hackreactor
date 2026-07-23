"use client";

import { useMemo, useState } from "react";
import { categories, questions } from "@/lib/questions";
import { useAppState } from "@/lib/store";

export default function QuestionsPage() {
  const { state, ready, update } = useAppState();
  const [activeCat, setActiveCat] = useState<string>("all");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  const bookmarks = new Set(state.bookmarks);

  const list = useMemo(() => {
    let l = questions;
    if (activeCat !== "all") l = l.filter((q) => q.categoryId === activeCat);
    if (onlyBookmarked) l = l.filter((q) => bookmarks.has(q.id));
    return l;
  }, [activeCat, onlyBookmarked, state.bookmarks]);

  const toggleReveal = (id: string) =>
    setRevealed((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleBookmark = (id: string) =>
    update((s) => ({
      ...s,
      bookmarks: s.bookmarks.includes(id)
        ? s.bookmarks.filter((b) => b !== id)
        : [...s.bookmarks, id],
    }));

  return (
    <div className="container-x py-10">
      <div className="flex flex-col gap-1">
        <span className="eyebrow">Question bank</span>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Practice by topic
        </h1>
        <p className="mt-1 max-w-2xl text-ink-soft">
          Flip through real question patterns across every category a USCIS
          officer covers. Tap a card to see what the officer is looking for.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip active={activeCat === "all"} onClick={() => setActiveCat("all")}>
          All topics
        </FilterChip>
        {categories.map((c) => (
          <FilterChip key={c.id} active={activeCat === c.id} onClick={() => setActiveCat(c.id)}>
            <span className="mr-1">{c.emoji}</span>
            {c.title}
          </FilterChip>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-ink-faint">
          {ready ? `${list.length} questions` : "…"}
        </span>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink-soft">
          <input
            type="checkbox"
            checked={onlyBookmarked}
            onChange={(e) => setOnlyBookmarked(e.target.checked)}
            className="h-4 w-4 accent-brand-500"
          />
          Bookmarked only
        </label>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {list.map((q) => {
          const open = revealed.has(q.id);
          const marked = bookmarks.has(q.id);
          return (
            <div key={q.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[15px] font-semibold leading-snug">{q.prompt}</p>
                <button
                  onClick={() => toggleBookmark(q.id)}
                  aria-label="Bookmark"
                  className={`shrink-0 rounded-full p-1.5 ${marked ? "text-brand-500" : "text-ink-faint hover:text-ink"}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={marked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M6 3h12a1 1 0 011 1v16l-7-4-7 4V4a1 1 0 011-1z" />
                  </svg>
                </button>
              </div>
              {q.tip ? (
                open ? (
                  <div className="mt-3 rounded-xl bg-surface-soft p-3 text-sm text-ink-soft">
                    <span className="font-semibold text-ink">Keep in mind: </span>
                    {q.tip}
                  </div>
                ) : (
                  <button
                    onClick={() => toggleReveal(q.id)}
                    className="mt-3 text-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Show what the officer looks for →
                  </button>
                )
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
        active
          ? "border-brand-400 bg-brand-50 text-brand-700"
          : "border-black/10 bg-white text-ink-soft hover:bg-surface-mute"
      }`}
    >
      {children}
    </button>
  );
}
