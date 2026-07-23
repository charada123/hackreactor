"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { InterviewMedia } from "@/lib/useInterviewMedia";
import {
  LocalSpeechToText,
  LocalTextToSpeech,
  MockRealtimeConversation,
} from "@/lib/interviewProviders";
import { personaById } from "@/lib/personas";
import type {
  InterviewConfig,
  LiveStatus,
  OfficerState,
  TranscriptEntry,
} from "@/lib/types";
import { OfficerVideo } from "./OfficerVideo";
import { ApplicantCamera } from "./ApplicantCamera";
import { EndInterviewDialog } from "./EndInterviewDialog";
import { MicrophoneTroubleshooter } from "./MicrophoneTroubleshooter";

const BUDGET_SECONDS: Record<InterviewConfig["duration"], number> = {
  quick: 10 * 60,
  standard: 20 * 60,
  full: 42 * 60,
};

// Voice-activity / end-of-turn tuning (calibrated for phone mics).
const SPEECH_ON = 0.05;
const BARGE_ON = 0.12;
const END_SILENCE = 1300;
const STILL_SILENCE = 600;
const NO_SPEECH_NUDGE = 14000;
const NO_SPEECH_GIVEUP = 32000;

const CLOSING_LINE = "Thank you. This concludes your practice interview.";

export function VideoInterviewRoom({
  config,
  media,
  onComplete,
}: {
  config: InterviewConfig;
  media: InterviewMedia;
  onComplete: (transcript: TranscriptEntry[]) => void;
}) {
  const persona = personaById(config.personaId);

  // Providers (stable for the life of the room).
  const ttsRef = useRef<LocalTextToSpeech | null>(null);
  const sttRef = useRef<LocalSpeechToText | null>(null);
  const convoRef = useRef<MockRealtimeConversation | null>(null);
  if (!ttsRef.current) ttsRef.current = new LocalTextToSpeech(config.personaId);
  if (!sttRef.current) sttRef.current = new LocalSpeechToText();
  if (!convoRef.current) convoRef.current = new MockRealtimeConversation(config);

  const [officerState, setOfficerState] = useState<OfficerState>("idle");
  const [status, setStatus] = useState<LiveStatus>("connecting");
  const [section, setSection] = useState("Introduction");
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [officerCaption, setOfficerCaption] = useState("");
  const [interim, setInterim] = useState("");
  const [meter, setMeter] = useState(0);
  const [showEnd, setShowEnd] = useState(false);
  const [selfHidden, setSelfHidden] = useState(false);
  const [camWarn, setCamWarn] = useState(false);

  // Live mirror of media so the mount-time interview loop reads current
  // mic state (mute / mic-loss) instead of stale first-render values.
  const mediaRef = useRef(media);
  mediaRef.current = media;

  const containerRef = useRef<HTMLDivElement>(null);
  const cancelledRef = useRef(false);
  const finishedRef = useRef(false);
  const finalRef = useRef("");
  const interimRef = useRef("");
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // Elapsed timer + budget → request a graceful close when time runs out.
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((e) => {
        const n = e + 1;
        if (n >= BUDGET_SECONDS[config.duration]) convoRef.current?.requestEnd();
        return n;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [config.duration]);

  // Small ambient meter for the control bar.
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setMeter(media.levelRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [media]);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    cancelledRef.current = true;
    ttsRef.current?.cancel();
    sttRef.current?.stop();
    media.stop(); // releases camera + microphone immediately
    onComplete(transcriptRef.current);
  }, [media, onComplete]);

  // Officer speaks; resolves on end OR on a sustained applicant barge-in.
  const speakWithBargeIn = useCallback(
    (text: string) =>
      new Promise<void>((resolve) => {
        let done = false;
        const settle = () => {
          if (done) return;
          done = true;
          cancelAnimationFrame(raf);
          resolve();
        };
        void ttsRef.current!.speak(text).then(settle);
        let voiced = 0;
        let raf = requestAnimationFrame(function loop() {
          if (cancelledRef.current) return settle();
          const m = mediaRef.current;
          if (m.micOn && m.levelRef.current > BARGE_ON) {
            voiced += 16;
            if (voiced > 350) {
              // Applicant interrupted — stop talking and listen.
              ttsRef.current!.cancel();
              return settle();
            }
          } else {
            voiced = Math.max(0, voiced - 24);
          }
          raf = requestAnimationFrame(loop);
        });
      }),
    [],
  );

  // Listen for one applicant answer using STT + audio VAD for end-of-turn.
  const listen = useCallback(
    () =>
      new Promise<{ text: string; spokenMs: number; hesitationMs: number }>((resolve) => {
        finalRef.current = "";
        interimRef.current = "";
        setInterim("");

        sttRef.current!.start({
          onInterim: (t) => {
            interimRef.current = t;
            setInterim(t);
          },
          onFinal: (full) => {
            finalRef.current = full;
          },
          onError: () => {
            /* no-speech etc. — VAD governs turn end */
          },
        });

        const t0 = Date.now();
        let started = false;
        let speechStart = 0;
        let lastVoice = t0;
        let raf = requestAnimationFrame(function loop() {
          if (cancelledRef.current) {
            cancelAnimationFrame(raf);
            return;
          }
          const m = mediaRef.current;
          // Paused for a mic problem — hold here until it recovers.
          if (m.micLost) {
            started = false;
            lastVoice = Date.now();
            raf = requestAnimationFrame(loop);
            return;
          }
          const now = Date.now();
          const level = m.micOn ? m.levelRef.current : 0;

          if (level > SPEECH_ON) {
            if (!started) {
              started = true;
              speechStart = now;
              setStatus("listening");
            }
            lastVoice = now;
          }

          if (started) {
            const silence = now - lastVoice;
            if (silence > END_SILENCE) {
              cancelAnimationFrame(raf);
              sttRef.current!.stop();
              const text = (finalRef.current || interimRef.current).trim();
              resolve({
                text,
                spokenMs: lastVoice - speechStart,
                hesitationMs: speechStart - t0,
              });
              return;
            }
            setStatus(silence > STILL_SILENCE ? "still-listening" : "listening");
          } else {
            const waited = now - t0;
            if (waited > NO_SPEECH_GIVEUP) {
              cancelAnimationFrame(raf);
              sttRef.current!.stop();
              resolve({ text: "", spokenMs: 0, hesitationMs: waited });
              return;
            }
            setStatus(waited > NO_SPEECH_NUDGE ? "no-audio" : "listening");
          }
          raf = requestAnimationFrame(loop);
        });
      }),
    [],
  );

  // The interview loop.
  useEffect(() => {
    cancelledRef.current = false;
    let alive = true;
    // Re-assert audio unlock on entry (belt-and-suspenders with the tap that
    // brought us here) so the mic meter runs and the officer's voice plays.
    media.resumeAudio();
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.resume();
      }
    } catch {
      /* noop */
    }

    async function runTurn(lastAnswer: string | null) {
      if (!alive || cancelledRef.current) return;

      setStatus("processing");
      setOfficerState(lastAnswer == null ? "idle" : "reviewing");
      await wait(lastAnswer == null ? 250 : 520);
      if (!alive || cancelledRef.current) return;

      const step = convoRef.current!.next(lastAnswer);
      setSection(step.section);
      setProgress(step.progress);
      setOfficerCaption(step.text);
      setOfficerState(step.done ? "closing" : "speaking");
      setStatus("speaking");
      await speakWithBargeIn(step.text);
      if (!alive || cancelledRef.current) return;

      if (step.done) {
        setOfficerState("idle");
        finish();
        return;
      }

      setOfficerState("listening");
      setStatus("listening");
      const ans = await listen();
      if (!alive || cancelledRef.current) return;

      transcriptRef.current.push({
        section: step.section,
        question: step.text,
        answer: ans.text,
        isFollowUp: step.isFollowUp,
        spokenMs: ans.spokenMs,
        hesitationMs: ans.hesitationMs,
      });
      setInterim("");
      runTurn(ans.text);
    }

    runTurn(null);
    return () => {
      alive = false;
      cancelledRef.current = true;
      ttsRef.current?.cancel();
      sttRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // User ends early: officer closes verbally, then we release media + report.
  const confirmEnd = useCallback(async () => {
    setShowEnd(false);
    cancelledRef.current = true;
    sttRef.current?.stop();
    ttsRef.current?.cancel();
    setOfficerState("closing");
    setStatus("speaking");
    setOfficerCaption(CLOSING_LINE);
    await ttsRef.current!.speak(CLOSING_LINE);
    finish();
  }, [finish]);

  const onToggleCamera = useCallback(() => {
    const wasOn = media.camOn;
    media.toggleCamera();
    if (wasOn) {
      setCamWarn(true);
      setTimeout(() => setCamWarn(false), 4200);
    }
  }, [media]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void el.requestFullscreen?.().catch(() => {});
  }, []);

  const mm = Math.floor(elapsed / 60);
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex h-[100dvh] w-full max-w-6xl flex-col bg-[#08111f] text-white"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 6.9H22l-6 4.4 2.3 7L12 15.9 5.7 20.3 8 13.3 2 8.9h7.6L12 2z" /></svg>
          </span>
          <span className="hidden font-semibold sm:inline">Practice interview</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold num tabular-nums">{mm}:{ss}</span>
          <ConnPill />
        </div>
      </div>

      {/* Section + progress */}
      <div className="px-4 pb-2">
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-white/55">
          <span>{section}</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[#5B8CFB] transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      {/* Stage */}
      <div className="relative flex-1 overflow-hidden">
        <OfficerVideo persona={persona} state={officerState} />

        {/* Officer nameplate */}
        <div className="absolute left-4 top-4 rounded-xl bg-black/35 px-3 py-1.5 backdrop-blur">
          <div className="text-sm font-bold">{persona.name}</div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-white/60">Practice interviewer</div>
        </div>

        {/* Live status pill */}
        <div className="absolute left-1/2 top-4 -translate-x-1/2">
          <StatusPill status={status} camOn={media.camOn} />
        </div>

        {/* Captions (off by default; accessibility toggle) */}
        {captionsOn && (
          <div className="absolute inset-x-0 bottom-4 mx-auto max-w-2xl px-4">
            <div className="rounded-xl bg-black/55 px-4 py-2.5 text-center text-[15px] leading-snug backdrop-blur">
              <span className="text-white/60">{persona.name.split(" ")[1]}: </span>
              {officerCaption}
              {interim && <div className="mt-1 text-white/70">You: {interim}</div>}
            </div>
          </div>
        )}

        {/* Applicant self-view */}
        {!selfHidden && (
          <ApplicantCamera
            attach={media.attachVideo}
            camOn={media.camOn}
            onHide={() => setSelfHidden(true)}
          />
        )}
        {selfHidden && (
          <button
            onClick={() => setSelfHidden(false)}
            className="absolute bottom-4 right-4 z-20 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:bg-white/20"
          >
            Show self-view
          </button>
        )}

        {/* Camera-off warning */}
        {camWarn && (
          <div className="iv-fade absolute inset-x-0 top-16 mx-auto w-fit rounded-full bg-amber-500/90 px-4 py-1.5 text-xs font-semibold text-black">
            Camera off — the simulation feels most realistic with your camera on.
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 px-3 py-3 sm:gap-3">
        <Ctrl label={media.micOn ? "Mute" : "Unmute"} active={!media.micOn} danger={!media.micOn} onClick={media.toggleMic}>
          {media.micOn ? <MicIcon /> : <MicOffIcon />}
        </Ctrl>
        <MeterBars level={meter} muted={!media.micOn} />
        <Ctrl label={media.camOn ? "Camera off" : "Camera on"} active={!media.camOn} onClick={onToggleCamera}>
          {media.camOn ? <CamIcon /> : <CamOffIcon />}
        </Ctrl>
        <Ctrl label="Flip camera" onClick={() => void media.switchCamera()} hideMobile>
          <FlipIcon />
        </Ctrl>
        <Ctrl label={captionsOn ? "Captions off" : "Captions"} active={captionsOn} onClick={() => setCaptionsOn((v) => !v)}>
          <CcIcon />
        </Ctrl>
        <Ctrl label="Fullscreen" onClick={toggleFullscreen} hideMobile>
          <FullIcon />
        </Ctrl>
        <button
          onClick={() => setShowEnd(true)}
          className="ml-1 inline-flex items-center gap-2 rounded-full bg-[#C1442E] px-4 py-2.5 text-sm font-bold hover:opacity-90"
        >
          <EndIcon />
          <span className="hidden sm:inline">End</span>
        </button>
      </div>

      {showEnd && <EndInterviewDialog onConfirm={confirmEnd} onCancel={() => setShowEnd(false)} />}
      {media.micLost && (
        <MicrophoneTroubleshooter onRetry={() => void media.request()} onEnd={confirmEnd} />
      )}
    </div>
  );
}

/* ---------- small pieces ---------- */

function StatusPill({ status, camOn }: { status: LiveStatus; camOn: boolean }) {
  const map: Record<LiveStatus, { t: string; c: string; pulse?: boolean }> = {
    connecting: { t: "Connecting…", c: "#93A29B" },
    speaking: { t: "Officer speaking", c: "#5B8CFB" },
    listening: { t: "Listening…", c: "#39B87E", pulse: true },
    "still-listening": { t: "Still listening…", c: "#39B87E", pulse: true },
    processing: { t: "Reviewing your response…", c: "#D8A24A" },
    "no-audio": { t: "We can't hear you — please speak up", c: "#E0705B", pulse: true },
    ended: { t: "Interview complete", c: "#93A29B" },
  };
  const s = map[status];
  return (
    <div className="flex items-center gap-2 rounded-full bg-black/45 px-3.5 py-1.5 text-xs font-semibold backdrop-blur">
      <span className="relative flex h-2 w-2">
        {s.pulse && <span className="absolute inline-flex h-full w-full rounded-full" style={{ background: s.c, animation: "ivPing 1.3s infinite" }} />}
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: s.c }} />
      </span>
      <span style={{ color: s.c }}>{s.t}</span>
    </div>
  );
}

function ConnPill() {
  const online = typeof navigator !== "undefined" ? navigator.onLine : true;
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
      <span className="h-2 w-2 rounded-full" style={{ background: online ? "#39B87E" : "#E0705B" }} />
      <span className="hidden sm:inline">{online ? "Connected" : "Offline"}</span>
    </span>
  );
}

function MeterBars({ level, muted }: { level: number; muted: boolean }) {
  return (
    <div className="hidden h-9 items-end gap-0.5 rounded-full bg-white/5 px-2.5 py-2 sm:flex">
      {Array.from({ length: 7 }).map((_, i) => {
        const on = !muted && level * 7 > i;
        return <div key={i} className="w-1 rounded-sm" style={{ height: `${30 + i * 10}%`, background: on ? "#5B8CFB" : "rgba(255,255,255,.18)" }} />;
      })}
    </div>
  );
}

function Ctrl({
  label,
  children,
  onClick,
  active,
  danger,
  hideMobile,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  hideMobile?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`grid h-12 w-12 place-items-center rounded-full transition ${hideMobile ? "hidden sm:grid" : ""} ${
        danger ? "bg-[#C1442E] text-white" : active ? "bg-white text-[#08111f]" : "bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  );
}

/* icons */
const MicIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M5 11a7 7 0 0 0 14 0" /><line x1="12" y1="18" x2="12" y2="22" /></svg>);
const MicOffIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /><line x1="12" y1="19" x2="12" y2="23" /></svg>);
const CamIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>);
const CamOffIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M16 16H3a2 2 0 0 1-2-2V6a2 2 0 0 1 .59-1.41M9 3h6a2 2 0 0 1 2 2v6l4-3v10" /></svg>);
const FlipIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>);
const CcIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M9 10a2 2 0 0 0-2 2 2 2 0 0 0 2 2M16 10a2 2 0 0 0-2 2 2 2 0 0 0 2 2" /></svg>);
const FullIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>);
const EndIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.29.62A2 2 0 0 1 23 16.92v1.65a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34A19.79 19.79 0 0 1 3.12 4.9 2 2 0 0 1 5.11 2.7h1.65a2 2 0 0 1 2 1.72c.13.81.34 1.6.62 2.35a2 2 0 0 1-.45 2.11L7.66 10.15" /><line x1="1" y1="1" x2="23" y2="23" /></svg>);
