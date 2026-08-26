"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import type { AnswerFeedback, InterviewConfig, TranscriptEntry } from "@/lib/types";
import { scriptedFeedback } from "@/lib/scripted";
import { interviewTypeLabels } from "@/lib/questions";
import { personaById } from "@/lib/personas";
import { averageOf, useAppState } from "@/lib/store";
import { ScoreRing } from "@/components/ScoreRing";

interface Scored extends TranscriptEntry {
  fb: AnswerFeedback;
  pacing: number;
}

function pacingScore(e: TranscriptEntry): number {
  if (!e.answer) return 2;
  const s = e.spokenMs / 1000;
  let score = 8;
  if (s < 2) score = 4;
  else if (s >= 4 && s <= 45) score = 9;
  else if (s > 70) score = 6;
  if (e.hesitationMs > 6000) score -= 2;
  return Math.max(1, Math.min(10, score));
}

export function InterviewReport({
  config,
  transcript,
  onRestart,
  onDelete,
}: {
  config: InterviewConfig;
  transcript: TranscriptEntry[];
  onRestart: () => void;
  onDelete: () => void;
}) {
  const { update } = useAppState();
  const savedId = useRef<string | null>(null);
  const persona = personaById(config.personaId);

  const answered = useMemo(() => transcript.filter((t) => t.answer.trim().length > 0), [transcript]);
  const scored: Scored[] = useMemo(
    () => answered.map((e) => ({ ...e, fb: scriptedFeedback(e.answer), pacing: pacingScore(e) })),
    [answered],
  );

  const contradiction = useMemo(() => {
    const yrs = transcript.flatMap((t) => (t.answer.match(/\b(19|20)\d{2}\b/g) || []) as string[]);
    const distinct = Array.from(new Set(yrs));
    return distinct.length >= 2
      ? `You referred to more than one year (${distinct.join(", ")}). Make sure your timeline is consistent and in order.`
      : null;
  }, [transcript]);

  const dims = useMemo(() => {
    const g = (sel: (f: Scored) => number) => (scored.length ? averageOf(scored.map(sel)) : 0);
    const consistencyPenalty = contradiction ? 1.5 : 0;
    return {
      clarity: g((s) => s.fb.naturalness),
      specificity: g((s) => s.fb.specificity),
      consistency: Math.max(1, g((s) => s.fb.consistency) - consistencyPenalty),
      confidence: g((s) => s.fb.confidence),
      completeness: g((s) => s.fb.completeness),
      pacing: g((s) => s.pacing),
    };
  }, [scored, contradiction]);

  const overall = useMemo(() => averageOf(Object.values(dims)), [dims]);
  const readiness = Math.round((overall / 10) * 100);

  const weak = scored.filter((s) => s.fb.overall < 6);
  const hesitated = scored.filter((s) => s.hesitationMs > 5000);
  const needsClarify = scored.filter((s) => s.fb.specificity < 5 || !s.answer.match(/\d/));

  const recommendedDocs = useMemo(() => docsFor(config.interviewType), [config.interviewType]);

  // Persist the session once (transcript stays local to the browser).
  useEffect(() => {
    if (savedId.current) return;
    const id = `iv-${Date.now()}`;
    savedId.current = id;
    update((s) => ({
      ...s,
      sessions: [
        ...s.sessions,
        {
          id,
          date: Date.now(),
          config: { interviewType: config.interviewType, mood: config.mood, difficulty: config.difficulty },
          questionCount: answered.length,
          averageScore: overall,
          scores: scored.map((x) => x.fb.overall),
        },
      ],
      streakDates: Array.from(new Set([...s.streakDates, new Date().toISOString().slice(0, 10)])),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeSession = () => {
    if (savedId.current) {
      const id = savedId.current;
      update((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) }));
    }
    onDelete();
  };

  const verdict = overall >= 8 ? "Strong" : overall >= 6.5 ? "Solid" : overall >= 5 ? "Developing" : "Needs work";

  return (
    <div className="container-x py-10">
      <div className="mx-auto max-w-3xl">
        <span className="eyebrow">Interview report</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {interviewTypeLabels[config.interviewType]} interview with {persona.name}
        </h1>

        <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
          <ScoreRing value={readiness} label="Readiness" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Metric label="Answered" value={String(answered.length)} />
            <Metric label="Avg score" value={overall.toFixed(1)} />
            <Metric label="Impression" value={verdict} />
          </div>
        </div>

        {/* Dimension breakdown */}
        <section className="mt-8 card p-5">
          <h2 className="text-sm font-bold">How you came across</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {([
              ["Answer clarity", dims.clarity],
              ["Specificity", dims.specificity],
              ["Consistency", dims.consistency],
              ["Confidence", dims.confidence],
              ["Completeness", dims.completeness],
              ["Interview pacing", dims.pacing],
            ] as [string, number][]).map(([label, v]) => (
              <div key={label}>
                <div className="flex justify-between text-xs font-semibold text-ink-soft">
                  <span>{label}</span>
                  <span className="num">{v.toFixed(1)}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-mute">
                  <div className="h-full rounded-full bg-brand-400" style={{ width: `${v * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Attention items */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(weak.length > 0 || needsClarify.length > 0) && (
            <section className="card p-5">
              <h2 className="text-sm font-bold">Practice these more</h2>
              <ul className="mt-2 space-y-2 text-sm text-ink-soft">
                {(weak.length ? weak : needsClarify).slice(0, 5).map((w, i) => (
                  <li key={i} className="flex gap-2"><span className="text-brand-500">•</span>{w.question}</li>
                ))}
              </ul>
            </section>
          )}
          <section className="card p-5">
            <h2 className="text-sm font-bold">Documents to review</h2>
            <ul className="mt-2 space-y-2 text-sm text-ink-soft">
              {recommendedDocs.map((d) => (
                <li key={d} className="flex gap-2"><span className="text-brand-500">•</span>{d}</li>
              ))}
            </ul>
          </section>
        </div>

        {(contradiction || hesitated.length > 0) && (
          <section className="mt-4 card p-5">
            <h2 className="text-sm font-bold">Things to double-check</h2>
            <ul className="mt-2 space-y-2 text-sm text-ink-soft">
              {contradiction && <li className="flex gap-2"><span className="text-[#B8791C]">•</span>{contradiction}</li>}
              {hesitated.length > 0 && (
                <li className="flex gap-2"><span className="text-[#B8791C]">•</span>You hesitated before {hesitated.length} answer{hesitated.length > 1 ? "s" : ""}. Rehearsing those aloud will help them come more naturally.</li>
              )}
            </ul>
          </section>
        )}

        {/* Recommended next session */}
        <section className="mt-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
          <h2 className="text-sm font-bold text-brand-800">Your next practice session</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {weak.length > 0
              ? `Run another ${interviewTypeLabels[config.interviewType]} interview and focus on the "${weak[0].section}" section. `
              : `You're doing well — try raising the difficulty for a tougher ${interviewTypeLabels[config.interviewType]} run. `}
            Aim to anchor each answer with a specific date, name, or place.
          </p>
        </section>

        {/* Transcript — internal record, shown only here */}
        <section className="mt-8">
          <h2 className="mb-2 text-lg font-extrabold tracking-tight">Full transcript & feedback</h2>
          <div className="space-y-3">
            {transcript.map((t, i) => {
              const fb = t.answer ? scriptedFeedback(t.answer) : null;
              return (
                <div key={i} className="card p-4">
                  <div className="flex items-center gap-2">
                    <span className="pill bg-surface-mute text-ink-soft">{t.section}</span>
                    {t.isFollowUp && <span className="pill bg-brand-50 text-brand-700">Follow-up</span>}
                    {fb && <span className="pill bg-brand-50 text-brand-700 num">{fb.overall.toFixed(1)} / 10</span>}
                  </div>
                  <div className="mt-2 text-sm font-semibold">{t.question}</div>
                  <div className="mt-1.5 rounded-lg bg-surface-soft p-3 text-sm text-ink-soft">
                    {t.answer ? `“${t.answer}”` : <em>No answer was captured for this question.</em>}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                    <span className="font-semibold text-ink">How to make your own answer stronger: </span>
                    {strongerStructure(t, fb)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button onClick={onRestart} className="btn-primary px-7 py-3">New interview</button>
          <Link href="/dashboard" className="btn-ghost px-7 py-3 text-center">View dashboard</Link>
          <button onClick={removeSession} className="btn px-7 py-3 text-[#C1442E] hover:bg-[#FBEAE6]">Delete this session</button>
        </div>
        <p className="mt-4 text-center text-xs text-ink-faint">
          This report and transcript are stored only in your browser. Deleting the session removes them from this device.
        </p>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card px-5 py-4 text-center">
      <div className="text-2xl font-extrabold tracking-tight">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{label}</div>
    </div>
  );
}

function strongerStructure(t: TranscriptEntry, fb: AnswerFeedback | null): string {
  if (!t.answer) {
    return "Practice answering this one aloud. Even a short, truthful reply — with a date or a name — is far stronger than silence.";
  }
  const base =
    "Lead with the direct answer, then add one specific, truthful detail (a date, a place, or a name), and keep it to two or three sentences. ";
  return base + (fb ? fb.suggestion : "");
}

function docsFor(type: InterviewConfig["interviewType"]): string[] {
  const common = ["Passport and government photo ID", "Interview appointment notice", "Copies of your filed forms"];
  const byType: Record<InterviewConfig["interviewType"], string[]> = {
    marriage: ["Marriage certificate", "Joint lease/mortgage and bank statements", "Photos together over time"],
    family: ["Proof of the qualifying family relationship", "Sponsor's Affidavit of Support (I-864)", "Tax transcripts"],
    employment: ["Employer offer/verification letter", "Recent pay stubs", "Degrees and credential evaluations"],
    diversity: ["DV selection notice", "Education or work-experience proof", "Civil documents with translations"],
    asylee: ["Approval/status documents", "Travel and identity documents", "Any court or USCIS notices"],
  };
  return [...byType[type], ...common];
}
