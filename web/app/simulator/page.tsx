"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { interviewTypeLabels } from "@/lib/questions";
import type {
  AnswerFeedback,
  ChatTurn,
  Difficulty,
  InterviewType,
  OfficerMood,
  SimulatorConfig,
} from "@/lib/types";
import { averageOf, todayKey, useAppState } from "@/lib/store";
import { ScoreRing } from "@/components/ScoreRing";

type Phase = "setup" | "live" | "report";

interface AnsweredItem {
  question: string;
  answer: string;
  feedback: AnswerFeedback;
}

const typeOptions: { id: InterviewType; emoji: string }[] = [
  { id: "marriage", emoji: "💍" },
  { id: "family", emoji: "👨‍👩‍👧" },
  { id: "employment", emoji: "💼" },
  { id: "diversity", emoji: "🌍" },
  { id: "asylee", emoji: "🕊️" },
];

const moodOptions: { id: OfficerMood; label: string; desc: string }[] = [
  { id: "friendly", label: "Friendly", desc: "Warm and reassuring" },
  { id: "neutral", label: "Neutral", desc: "Calm and businesslike" },
  { id: "strict", label: "Strict", desc: "Firm and probing" },
];

const difficultyOptions: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

const QUESTION_TARGET = 8;

export default function SimulatorPage() {
  const { update } = useAppState();
  const [phase, setPhase] = useState<Phase>("setup");
  const [config, setConfig] = useState<SimulatorConfig>({
    interviewType: "marriage",
    mood: "neutral",
    difficulty: "medium",
  });

  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [answered, setAnswered] = useState<AnsweredItem[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<AnswerFeedback | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentQuestion = useMemo(() => {
    const officer = turns.filter((t) => t.role === "officer");
    return officer[officer.length - 1]?.text ?? "";
  }, [turns]);

  const scrollDown = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const fetchOfficer = useCallback(
    async (history: ChatTurn[]) => {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, turns: history }),
      });
      const data = await res.json();
      return String(data.text ?? "Let's continue.");
    },
    [config],
  );

  const start = useCallback(async () => {
    setBusy(true);
    setPhase("live");
    setTurns([]);
    setAnswered([]);
    setLastFeedback(null);
    try {
      const first = await fetchOfficer([]);
      setTurns([{ role: "officer", text: first }]);
    } finally {
      setBusy(false);
      scrollDown();
    }
  }, [fetchOfficer, scrollDown]);

  const submitAnswer = useCallback(async () => {
    const answer = draft.trim();
    if (!answer || busy) return;
    setBusy(true);
    setDraft("");
    setLastFeedback(null);

    const question = currentQuestion;
    const withAnswer: ChatTurn[] = [...turns, { role: "applicant", text: answer }];
    setTurns(withAnswer);
    scrollDown();

    // 1) Grade the answer.
    let feedback: AnswerFeedback | null = null;
    try {
      const priorAnswers = answered.map((a) => a.answer);
      const fres = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, question, answer, priorAnswers }),
      });
      const fdata = await fres.json();
      feedback = fdata.feedback as AnswerFeedback;
    } catch {
      feedback = null;
    }
    if (feedback) {
      setLastFeedback(feedback);
      setAnswered((prev) => [...prev, { question, answer, feedback: feedback! }]);
    }

    // 2) Next officer question (or finish).
    const answeredCount = answered.length + 1;
    if (answeredCount >= QUESTION_TARGET) {
      setBusy(false);
      finishInterview([...answered, ...(feedback ? [{ question, answer, feedback }] : [])]);
      return;
    }
    try {
      const next = await fetchOfficer(withAnswer);
      setTurns([...withAnswer, { role: "officer", text: next }]);
    } finally {
      setBusy(false);
      scrollDown();
    }
  }, [answered, busy, config, currentQuestion, draft, fetchOfficer, scrollDown, turns]);

  const finishInterview = useCallback(
    (items: AnsweredItem[]) => {
      const scores = items.map((i) => i.feedback.overall);
      const avg = averageOf(scores);
      update((s) => ({
        ...s,
        sessions: [
          ...s.sessions,
          {
            id: `sess-${s.sessions.length + 1}-${scores.length}-${Math.round(avg * 10)}`,
            date: performanceNow(),
            config,
            questionCount: items.length,
            averageScore: avg,
            scores,
          },
        ],
        streakDates: Array.from(new Set([...s.streakDates, todayKey(performanceNow())])),
      }));
      setPhase("report");
    },
    [config, update],
  );

  const stopNow = useCallback(() => {
    finishInterview(answered);
  }, [answered, finishInterview]);

  if (phase === "setup") {
    return (
      <SetupScreen config={config} setConfig={setConfig} onStart={start} />
    );
  }

  if (phase === "report") {
    return <ReportScreen items={answered} config={config} onRestart={() => setPhase("setup")} />;
  }

  // Live
  const progress = Math.min(100, (answered.length / QUESTION_TARGET) * 100);
  return (
    <div className="container-x py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="eyebrow">Mock interview</div>
          <h1 className="text-xl font-extrabold tracking-tight">
            {interviewTypeLabels[config.interviewType]} · {config.mood} officer
          </h1>
        </div>
        <button onClick={stopNow} className="btn-ghost">
          Finish & see report
        </button>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-surface-mute">
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card flex h-[62vh] flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
            {turns.map((t, i) => (
              <Bubble key={i} role={t.role} text={t.text} />
            ))}
            {busy ? <TypingBubble /> : null}
          </div>
          <div className="border-t border-black/[0.06] p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    submitAnswer();
                  }
                }}
                rows={2}
                placeholder="Answer out loud, then type your answer…  (⌘/Ctrl + Enter to send)"
                className="min-h-[52px] flex-1 resize-none rounded-xl border border-black/10 bg-surface-soft px-3.5 py-2.5 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
              />
              <button onClick={submitAnswer} disabled={busy || !draft.trim()} className="btn-primary h-[52px] disabled:opacity-40">
                Send
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-ink-faint">Live feedback</div>
            {lastFeedback ? (
              <FeedbackCard f={lastFeedback} />
            ) : (
              <p className="mt-3 text-sm text-ink-soft">
                Answer a question to see how it scored across confidence, specificity, and consistency.
              </p>
            )}
          </div>
          <div className="card p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-ink-faint">Session</div>
            <div className="mt-2 text-sm text-ink-soft">
              {answered.length} of {QUESTION_TARGET} answered
            </div>
            {answered.length > 0 ? (
              <div className="mt-1 text-2xl font-extrabold">
                {averageOf(answered.map((a) => a.feedback.overall)).toFixed(1)}
                <span className="text-base text-ink-faint"> / 10 avg</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// A monotonic-ish timestamp usable in the client. Date.now via performance origin.
function performanceNow(): number {
  return Date.now();
}

function SetupScreen({
  config,
  setConfig,
  onStart,
}: {
  config: SimulatorConfig;
  setConfig: (c: SimulatorConfig) => void;
  onStart: () => void;
}) {
  return (
    <div className="container-x py-10">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="eyebrow">AI Interview Simulator</span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Set up your mock interview
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-ink-soft">
            The officer asks one question at a time and follows up on your answers.
            Answer out loud as if you&apos;re across the desk.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <Field label="Interview type">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {typeOptions.map((o) => (
                <Choice
                  key={o.id}
                  active={config.interviewType === o.id}
                  onClick={() => setConfig({ ...config, interviewType: o.id })}
                >
                  <span className="mr-1.5">{o.emoji}</span>
                  {interviewTypeLabels[o.id]}
                </Choice>
              ))}
            </div>
          </Field>

          <Field label="Officer mood">
            <div className="grid grid-cols-3 gap-2">
              {moodOptions.map((o) => (
                <Choice key={o.id} active={config.mood === o.id} onClick={() => setConfig({ ...config, mood: o.id })}>
                  <div className="text-center">
                    <div className="font-bold">{o.label}</div>
                    <div className="text-[11px] font-normal text-ink-faint">{o.desc}</div>
                  </div>
                </Choice>
              ))}
            </div>
          </Field>

          <Field label="Difficulty">
            <div className="grid grid-cols-3 gap-2">
              {difficultyOptions.map((o) => (
                <Choice key={o.id} active={config.difficulty === o.id} onClick={() => setConfig({ ...config, difficulty: o.id })}>
                  {o.label}
                </Choice>
              ))}
            </div>
          </Field>

          <button onClick={onStart} className="btn-primary w-full py-3.5 text-base">
            Begin interview
          </button>
          <p className="text-center text-xs text-ink-faint">
            Runs with Claude when an API key is configured, and with a built-in
            scripted officer otherwise — either way it works.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="mb-3 text-sm font-bold">{label}</div>
      {children}
    </div>
  );
}

function Choice({
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
      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
        active
          ? "border-brand-400 bg-brand-50 text-brand-700 ring-2 ring-brand-100"
          : "border-black/10 bg-white text-ink hover:bg-surface-mute"
      }`}
    >
      {children}
    </button>
  );
}

function Bubble({ role, text }: { role: "officer" | "applicant"; text: string }) {
  const officer = role === "officer";
  return (
    <div className={`flex ${officer ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          officer ? "rounded-tl-sm bg-surface-mute text-ink" : "rounded-tr-sm bg-brand-500 text-white"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-surface-mute px-4 py-3">
        <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
      </div>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

function FeedbackCard({ f }: { f: AnswerFeedback }) {
  const rows: [string, number][] = [
    ["Confidence", f.confidence],
    ["Naturalness", f.naturalness],
    ["Specificity", f.specificity],
    ["Consistency", f.consistency],
    ["Completeness", f.completeness],
  ];
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink-soft">Overall</span>
        <span className="pill bg-brand-50 text-brand-700">{f.overall.toFixed(1)} / 10</span>
      </div>
      <div className="mt-3 space-y-2">
        {rows.map(([label, v]) => (
          <div key={label}>
            <div className="flex justify-between text-[11px] font-semibold text-ink-faint">
              <span>{label}</span>
              <span>{v}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-mute">
              <div className="h-full rounded-full bg-brand-400" style={{ width: `${v * 10}%` }} />
            </div>
          </div>
        ))}
      </div>
      {f.redFlags.length > 0 ? (
        <div className="mt-3 rounded-lg bg-[#FDECE9] p-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wide text-[#C1442E]">Red flags</div>
          <ul className="mt-1 list-disc pl-4 text-xs text-[#8f3324]">
            {f.redFlags.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="mt-3 text-xs leading-relaxed text-ink-soft">
        <span className="font-semibold text-ink">Tip: </span>
        {f.suggestion}
      </p>
    </div>
  );
}

function ReportScreen({
  items,
  config,
  onRestart,
}: {
  items: AnsweredItem[];
  config: SimulatorConfig;
  onRestart: () => void;
}) {
  const scores = items.map((i) => i.feedback.overall);
  const avg = averageOf(scores);
  const readiness = Math.round((avg / 10) * 100);
  const strengths = items.filter((i) => i.feedback.overall >= 8);
  const weak = items.filter((i) => i.feedback.overall < 6);
  const impression =
    avg >= 8 ? "Strong" : avg >= 6.5 ? "Solid" : avg >= 5 ? "Developing" : "Needs work";

  return (
    <div className="container-x py-10">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="eyebrow">Mock interview report</span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {interviewTypeLabels[config.interviewType]} interview
          </h1>
        </div>

        <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
          <ScoreRing value={readiness} label="Readiness" />
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Answered" value={String(items.length)} />
            <Stat label="Avg score" value={avg.toFixed(1)} />
            <Stat label="Impression" value={impression} />
          </div>
        </div>

        {weak.length > 0 ? (
          <section className="mt-8 card p-5">
            <h2 className="text-sm font-bold">Focus next on these</h2>
            <ul className="mt-3 space-y-3">
              {weak.map((w, i) => (
                <li key={i} className="rounded-xl bg-surface-soft p-3">
                  <div className="text-sm font-semibold">{w.question}</div>
                  <div className="mt-1 text-xs text-ink-soft">{w.feedback.suggestion}</div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {strengths.length > 0 ? (
          <section className="mt-4 card p-5">
            <h2 className="text-sm font-bold">Strengths</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-ink-soft">
              {strengths.slice(0, 5).map((s, i) => (
                <li key={i}>{s.question}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button onClick={onRestart} className="btn-primary px-7 py-3">
            Run another interview
          </button>
          <Link href="/dashboard" className="btn-ghost px-7 py-3">
            View dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card px-5 py-4 text-center">
      <div className="text-2xl font-extrabold tracking-tight">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{label}</div>
    </div>
  );
}
