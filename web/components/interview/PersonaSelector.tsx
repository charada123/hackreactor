"use client";

import { personas, personaInitials, type Persona } from "@/lib/personas";
import { LocalTextToSpeech } from "@/lib/interviewProviders";

// Professional, generated headshot placeholder — abstract on purpose (no real
// person, no demographic cues). Consistent with the in-room officer avatar.
function Headshot({ persona }: { persona: Persona }) {
  const a = persona.accent;
  return (
    <svg viewBox="0 0 96 96" className="h-14 w-14 shrink-0 rounded-xl" aria-hidden>
      <defs>
        <linearGradient id={`bg-${persona.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} stopOpacity="0.28" />
          <stop offset="1" stopColor={a} stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="14" fill={`url(#bg-${persona.id})`} />
      <path d="M20 96 C 24 74, 36 66, 48 66 C 60 66, 72 74, 76 96 Z" fill={a} opacity="0.85" />
      <circle cx="48" cy="44" r="19" fill="#C9D2DE" />
      <circle cx="48" cy="44" r="19" fill={a} opacity="0.10" />
      <text x="48" y="49" textAnchor="middle" fontSize="15" fontWeight="800" fill="#2a3340">
        {personaInitials(persona)}
      </text>
    </svg>
  );
}

export function PersonaSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const preview = (p: Persona) => {
    const tts = new LocalTextToSpeech(p.id);
    tts.preview("Good morning. I'll be conducting your practice interview today.");
  };

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {personas.map((p) => {
        const active = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
              active
                ? "border-brand-400 bg-brand-50 ring-2 ring-brand-100"
                : "border-black/10 bg-white hover:bg-surface-mute"
            }`}
          >
            <Headshot persona={p} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-bold">{p.name}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    preview(p);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      preview(p);
                    }
                  }}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-brand-700 ring-1 ring-black/10 hover:bg-brand-50"
                  aria-label={`Preview ${p.name}'s voice`}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  Voice
                </span>
              </div>
              <div className="mt-0.5 text-[12px] font-semibold text-brand-600">{p.style}</div>
              <p className="mt-1 text-[12px] leading-snug text-ink-soft">{p.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
