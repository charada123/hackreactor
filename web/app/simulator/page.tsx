"use client";

import { useCallback, useState } from "react";
import { interviewTypeLabels } from "@/lib/questions";
import type {
  Difficulty,
  InterviewConfig,
  InterviewDuration,
  InterviewType,
  OfficerMood,
  TranscriptEntry,
} from "@/lib/types";
import { useInterviewMedia } from "@/lib/useInterviewMedia";
import { PersonaSelector } from "@/components/interview/PersonaSelector";
import { PermissionModal } from "@/components/interview/PermissionModal";
import { DeviceCheck } from "@/components/interview/DeviceCheck";
import { VideoInterviewRoom } from "@/components/interview/VideoInterviewRoom";
import { InterviewReport } from "@/components/interview/InterviewReport";

type Phase = "setup" | "permission" | "devicecheck" | "room" | "report";

const typeOptions: { id: InterviewType; emoji: string }[] = [
  { id: "marriage", emoji: "💍" },
  { id: "family", emoji: "👨‍👩‍👧" },
  { id: "employment", emoji: "💼" },
  { id: "diversity", emoji: "🌍" },
  { id: "asylee", emoji: "🕊️" },
];
const moodOptions: { id: OfficerMood; label: string; desc: string }[] = [
  { id: "friendly", label: "Friendly", desc: "Warm & patient" },
  { id: "neutral", label: "Neutral", desc: "Businesslike" },
  { id: "strict", label: "Strict", desc: "Formal & probing" },
];
const diffOptions: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];
const durationOptions: { id: InterviewDuration; label: string; time: string }[] = [
  { id: "quick", label: "Quick Practice", time: "~10 min" },
  { id: "standard", label: "Standard Interview", time: "~20 min" },
  { id: "full", label: "Full Interview", time: "~35–45 min" },
];

export default function SimulatorPage() {
  const media = useInterviewMedia();
  const [phase, setPhase] = useState<Phase>("setup");
  const [requesting, setRequesting] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [config, setConfig] = useState<InterviewConfig>({
    interviewType: "marriage",
    personaId: "morgan",
    mood: "neutral",
    difficulty: "medium",
    duration: "standard",
  });

  const allow = useCallback(async () => {
    setRequesting(true);
    const ok = await media.request();
    setRequesting(false);
    if (ok) setPhase("devicecheck");
  }, [media]);

  const backToSetup = useCallback(() => {
    media.stop();
    setPhase("setup");
  }, [media]);

  const onComplete = useCallback((t: TranscriptEntry[]) => {
    setTranscript(t);
    setPhase("report");
  }, []);

  const restart = useCallback(() => {
    media.stop();
    setTranscript([]);
    setPhase("setup");
  }, [media]);

  if (phase === "room") {
    return <VideoInterviewRoom config={config} media={media} onComplete={onComplete} />;
  }

  if (phase === "report") {
    return (
      <InterviewReport
        config={config}
        transcript={transcript}
        onRestart={restart}
        onDelete={restart}
      />
    );
  }

  if (phase === "devicecheck") {
    return (
      <DeviceCheck
        media={media}
        personaId={config.personaId}
        onReady={() => setPhase("room")}
        onBack={backToSetup}
      />
    );
  }

  // setup (+ permission modal overlay)
  return (
    <div className="container-x py-10">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="eyebrow">AI Video Interview</span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Set up your mock interview
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-ink-soft">
            You&apos;ll join a private video room and speak with an AI officer — they ask,
            you answer out loud, just like the real interview.
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-black/[0.06] bg-white px-4 py-3 text-center text-xs text-ink-soft">
          Practice questions are illustrative and actual USCIS questions vary. GreenPass is an
          independent educational tool, not affiliated with USCIS or the U.S. government.
        </div>

        <div className="mt-6 space-y-4">
          <Field label="Interview type">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {typeOptions.map((o) => (
                <Choice key={o.id} active={config.interviewType === o.id} onClick={() => setConfig({ ...config, interviewType: o.id })}>
                  <span className="mr-1">{o.emoji}</span>
                  {interviewTypeLabels[o.id]}
                </Choice>
              ))}
            </div>
          </Field>

          <Field label="Interview officer">
            <PersonaSelector value={config.personaId} onChange={(id) => setConfig({ ...config, personaId: id })} />
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
              {diffOptions.map((o) => (
                <Choice key={o.id} active={config.difficulty === o.id} onClick={() => setConfig({ ...config, difficulty: o.id })}>
                  {o.label}
                </Choice>
              ))}
            </div>
          </Field>

          <Field label="Interview length">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {durationOptions.map((o) => (
                <Choice key={o.id} active={config.duration === o.id} onClick={() => setConfig({ ...config, duration: o.id })}>
                  <div className="text-center">
                    <div className="font-bold">{o.label}</div>
                    <div className="text-[11px] font-normal text-ink-faint">{o.time}</div>
                  </div>
                </Choice>
              ))}
            </div>
          </Field>

          <button onClick={() => setPhase("permission")} className="btn-primary w-full py-3.5 text-base">
            Begin interview
          </button>
          <p className="text-center text-xs text-ink-faint">
            Next, we&apos;ll ask for camera &amp; microphone access and run a quick device check.
          </p>
        </div>
      </div>

      {phase === "permission" && (
        <PermissionModal
          onAllow={allow}
          onCancel={() => setPhase("setup")}
          requesting={requesting}
          error={media.error}
        />
      )}
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
      type="button"
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
