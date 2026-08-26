"use client";

import { useEffect, useRef, useState } from "react";
import type { InterviewMedia } from "@/lib/useInterviewMedia";
import { LocalTextToSpeech } from "@/lib/interviewProviders";

type Status = "checking" | "pass" | "warn" | "fail";
interface Check {
  status: Status;
  detail: string;
}

const sttSupported =
  typeof window !== "undefined" &&
  Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

export function DeviceCheck({
  media,
  personaId,
  onReady,
  onBack,
}: {
  media: InterviewMedia;
  personaId: string;
  onReady: () => void;
  onBack: () => void;
}) {
  const [level, setLevel] = useState(0);
  const [micHeard, setMicHeard] = useState(false);
  const [speakerOk, setSpeakerOk] = useState(false);
  const [checks, setChecks] = useState<Record<string, Check>>({
    camera: { status: "checking", detail: "Looking for your camera…" },
    mic: { status: "checking", detail: "Say a few words to test your microphone." },
    speech: {
      status: sttSupported ? "pass" : "fail",
      detail: sttSupported
        ? "Your browser can transcribe speech."
        : "This browser can't transcribe speech. Try Chrome, Edge, or Safari.",
    },
    speaker: { status: "checking", detail: "Play the test sound to confirm you can hear the officer." },
    connection: { status: "checking", detail: "Checking your connection…" },
    lighting: { status: "checking", detail: "Checking your lighting…" },
    face: { status: "checking", detail: "Checking that your face is visible…" },
  });

  // Live mic meter + "voice detected" latch.
  useEffect(() => {
    const id = setInterval(() => {
      const l = media.levelRef.current;
      setLevel(l);
      if (l > 0.12) setMicHeard(true);
    }, 90);
    return () => clearInterval(id);
  }, [media]);

  // Periodic checks.
  useEffect(() => {
    function run() {
      setChecks((prev) => {
        const next = { ...prev };
        // Camera
        next.camera = media.hasCamera
          ? media.camOn
            ? { status: "pass", detail: "Camera is on and working." }
            : { status: "warn", detail: "Camera is off. You can still begin, but on-camera practice is more realistic." }
          : { status: "warn", detail: "No camera found. You can continue with audio only." };
        // Mic
        next.mic = media.micLost
          ? { status: "fail", detail: "Microphone isn't available. Check permissions and connections." }
          : micHeard
            ? { status: "pass", detail: "We can hear you clearly." }
            : { status: "checking", detail: "Say a few words — we'll confirm we can hear you." };
        // Connection
        const online = typeof navigator !== "undefined" ? navigator.onLine : true;
        next.connection = online
          ? { status: "pass", detail: "You're online." }
          : { status: "warn", detail: "You appear to be offline. The interview still runs locally." };
        // Lighting + face (best-effort presentation checks — no identity detection)
        const b = media.hasCamera && media.camOn ? media.sampleBrightness() : null;
        if (b == null) {
          next.lighting = { status: "warn", detail: "Turn your camera on to check lighting." };
          next.face = { status: "warn", detail: "Turn your camera on so your face is visible." };
        } else if (b < 0.22) {
          next.lighting = { status: "warn", detail: "It looks dark. Add light in front of you for a clearer picture." };
          next.face = { status: "warn", detail: "Your face may be hard to see — add some light." };
        } else if (b > 0.9) {
          next.lighting = { status: "warn", detail: "It looks very bright — reduce backlight behind you." };
          next.face = { status: "pass", detail: "Your face is visible." };
        } else {
          next.lighting = { status: "pass", detail: "Lighting looks good." };
          next.face = { status: "pass", detail: "Your face is visible." };
        }
        // Speaker (user-confirmed)
        next.speaker = speakerOk
          ? { status: "pass", detail: "Great — you can hear the officer." }
          : { status: "checking", detail: "Play the test sound to confirm you can hear the officer." };
        return next;
      });
    }
    run();
    const id = setInterval(run, 1000);
    return () => clearInterval(id);
  }, [media, micHeard, speakerOk]);

  const playTest = () => {
    const tts = new LocalTextToSpeech(personaId);
    if (tts.supported) tts.preview("Sound check. If you can hear me clearly, you're all set.");
    setSpeakerOk(true);
  };

  // The tap that enters the room is our chance to unlock audio on iOS:
  // resume the mic's audio graph AND prime speech synthesis so the officer's
  // voice (spoken later from an async loop) is allowed to play.
  const enterRoom = () => {
    media.resumeAudio();
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.resume();
        const primer = new SpeechSynthesisUtterance(" ");
        primer.volume = 0.01;
        window.speechSynthesis.speak(primer);
      }
    } catch {
      /* noop */
    }
    onReady();
  };

  const micOk = !media.micLost;
  const canBegin = micOk && micHeard && sttSupported;

  const rows: { key: string; label: string }[] = [
    { key: "mic", label: "Microphone" },
    { key: "speech", label: "Speech recognition" },
    { key: "speaker", label: "Speaker output" },
    { key: "camera", label: "Camera" },
    { key: "lighting", label: "Lighting" },
    { key: "face", label: "Face visibility" },
    { key: "connection", label: "Connection" },
  ];

  return (
    <div className="container-x py-8">
      <div className="mx-auto max-w-3xl">
        <span className="eyebrow">System check</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Let&apos;s make sure you&apos;re ready</h1>
        <p className="mt-2 text-ink-soft">
          A quick check of your camera, microphone, and connection before you meet the officer.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          {/* Live preview + meter */}
          <div className="card overflow-hidden p-0">
            <div className="relative aspect-video bg-[#0a1424]">
              <video ref={media.attachVideo} autoPlay playsInline muted className="h-full w-full -scale-x-100 object-cover" />
              {(!media.hasCamera || !media.camOn) && (
                <div className="absolute inset-0 grid place-items-center text-white/60">Camera off</div>
              )}
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-ink-soft">
                <span>Microphone level</span>
                {micHeard ? <span className="text-[#1E8E5A]">Voice detected ✓</span> : <span className="text-ink-faint">Say hello…</span>}
              </div>
              <div className="flex h-8 items-end gap-1">
                {Array.from({ length: 20 }).map((_, i) => {
                  const on = level * 20 > i;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-sm transition-all"
                      style={{
                        height: `${20 + i * 3.6}%`,
                        background: on ? (i > 15 ? "#C1442E" : i > 11 ? "#B8791C" : "#2455D6") : "var(--tw-mute, #E3E9F3)",
                        opacity: on ? 1 : 0.35,
                      }}
                    />
                  );
                })}
              </div>
              <button onClick={playTest} className="btn-ghost mt-4 w-full py-2.5 text-sm">
                ▶ Play test sound
              </button>
            </div>
          </div>

          {/* Checklist */}
          <div className="card divide-y divide-black/[0.06] p-0">
            {rows.map(({ key, label }) => {
              const c = checks[key];
              return (
                <div key={key} className="flex items-start gap-3 p-3.5">
                  <StatusDot status={c.status} />
                  <div>
                    <div className="text-sm font-semibold">{label}</div>
                    <div className="text-xs text-ink-soft">{c.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!canBegin && (
          <p className="mt-4 text-center text-sm text-ink-soft">
            {sttSupported
              ? "We need to hear your microphone before you can begin — say a few words above."
              : "Your browser can't transcribe speech, which this interview needs. Try Chrome, Edge, or Safari."}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button onClick={enterRoom} disabled={!canBegin} className="btn-primary px-8 py-3 disabled:opacity-40">
            Enter the interview room
          </button>
          <button onClick={onBack} className="btn-ghost px-8 py-3">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: Status }) {
  const map: Record<Status, { c: string; icon: React.ReactNode }> = {
    pass: { c: "#1E8E5A", icon: <path d="M5 13l4 4L19 7" /> },
    warn: { c: "#B8791C", icon: <><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="17" x2="12" y2="17" /></> },
    fail: { c: "#C1442E", icon: <><line x1="7" y1="7" x2="17" y2="17" /><line x1="17" y1="7" x2="7" y2="17" /></> },
    checking: { c: "#7D8AA0", icon: <circle cx="12" cy="12" r="3" /> },
  };
  const s = map[status];
  return (
    <span
      className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full"
      style={{ background: `${s.c}22` }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={s.c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {s.icon}
      </svg>
    </span>
  );
}
