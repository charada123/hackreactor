"use client";

import Link from "next/link";
import { interviewTypeLabels } from "@/lib/questions";
import {
  averageOf,
  computeStreak,
  readinessScore,
  useAppState,
} from "@/lib/store";
import { ScoreRing } from "@/components/ScoreRing";

export default function DashboardPage() {
  const { state, ready } = useAppState();

  if (!ready) {
    return (
      <div className="container-x py-16 text-center text-ink-faint">Loading…</div>
    );
  }

  const sessions = [...state.sessions].sort((a, b) => b.date - a.date);
  const readiness = readinessScore(sessions);
  const streak = computeStreak(state.streakDates, Date.now());
  const totalAnswers = sessions.reduce((n, s) => n + s.questionCount, 0);
  const confidence = sessions.length
    ? averageOf(sessions.map((s) => s.averageScore))
    : 0;
  // Rough practice-time estimate: ~40s per answered question.
  const minutes = Math.round((totalAnswers * 40) / 60);

  const allScores = sessions.flatMap((s) => s.scores);
  const weakCount = allScores.filter((s) => s < 6).length;

  return (
    <div className="container-x py-10">
      <div className="flex flex-col gap-1">
        <span className="eyebrow">Dashboard</span>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Your interview readiness
        </h1>
      </div>

      {sessions.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="mt-8 grid gap-4 lg:grid-cols-[300px_1fr]">
            <div className="card flex flex-col items-center justify-center gap-3 p-6">
              <ScoreRing value={readiness} label="Readiness" />
              <p className="text-center text-xs text-ink-soft">
                Based on your {sessions.length} most recent mock interview
                {sessions.length === 1 ? "" : "s"}.
              </p>
              <Link href="/simulator" className="btn-primary w-full">
                Practice again
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Metric label="Study streak" value={`${streak}`} unit="days" />
              <Metric label="Time practiced" value={`${minutes}`} unit="min" />
              <Metric label="Confidence score" value={confidence.toFixed(1)} unit="/ 10" />
              <Metric label="Interviews" value={`${sessions.length}`} unit="done" />
              <Metric label="Questions answered" value={`${totalAnswers}`} unit="total" />
              <Metric label="Weak answers" value={`${weakCount}`} unit="to review" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <section className="card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold">Saved sessions</h2>
                <Link href="/simulator" className="text-xs font-semibold text-brand-600">
                  New →
                </Link>
              </div>
              <ul className="mt-3 divide-y divide-black/[0.06]">
                {sessions.slice(0, 6).map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="text-sm font-semibold">
                        {interviewTypeLabels[s.config.interviewType]}
                      </div>
                      <div className="text-xs text-ink-faint">
                        {s.config.mood} · {s.questionCount} questions
                      </div>
                    </div>
                    <span className="pill bg-brand-50 text-brand-700">
                      {s.averageScore.toFixed(1)} / 10
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="card p-5">
              <h2 className="text-sm font-bold">Recommended next</h2>
              <div className="mt-3 space-y-3">
                <RecoRow
                  title="Marriage Deep Dive"
                  desc="Relationship history and daily-life details."
                  href="/simulator"
                />
                <RecoRow
                  title="Rapid Fire"
                  desc="Browse the full question bank by category."
                  href="/questions"
                />
                <RecoRow
                  title="Document Review"
                  desc="Make sure your checklist is complete."
                  href="/checklist"
                />
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 card p-10 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-3xl">
        🎙️
      </div>
      <h2 className="mt-4 text-xl font-bold">No interviews yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
        Run your first mock interview to unlock your readiness score, streak, and
        a personalized list of weak areas to focus on.
      </p>
      <Link href="/simulator" className="btn-primary mt-6 px-7 py-3">
        Start a mock interview
      </Link>
    </div>
  );
}

function Metric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</div>
      <div className="mt-1.5 text-3xl font-extrabold tracking-tight">
        {value}
        <span className="ml-1 text-sm font-semibold text-ink-faint">{unit}</span>
      </div>
    </div>
  );
}

function RecoRow({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl bg-surface-soft p-3.5 transition hover:bg-surface-mute"
    >
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-ink-faint">{desc}</div>
      </div>
      <span className="text-brand-500">→</span>
    </Link>
  );
}
