"use client";

import { createInterview, type OfficerStep } from "./interviewEngine";
import type { InterviewConfig, OfficerState } from "./types";
import { personaById } from "./personas";

// ---------------------------------------------------------------------------
// Provider abstractions. The prototype ships with browser-native "Local"
// implementations that fully demonstrate the voice+video workflow with no API
// keys. Swap any of these for a production service (see the notes on each) by
// implementing the same interface — the interview room depends only on the
// interfaces below, never on a specific vendor.
// ---------------------------------------------------------------------------

export interface TextToSpeechProvider {
  supported: boolean;
  /** Speak text; resolves when finished (or cancelled). */
  speak(text: string, opts?: { onStart?: () => void }): Promise<void>;
  cancel(): void;
  /** Play a short sample in this voice (for the persona preview button). */
  preview(text: string): void;
}

export interface SpeechToTextProvider {
  supported: boolean;
  start(handlers: {
    onInterim: (text: string) => void;
    onFinal: (fullText: string) => void;
    onError?: (err: string) => void;
  }): void;
  stop(): void;
}

/** The officer's visual/animation controller. In this prototype the local
 *  implementation is the <OfficerVideo> React component, driven by props.
 *  A production AvatarProvider (e.g. a real-time avatar or lip-synced video
 *  vendor) would implement this and receive audio + state to render. */
export interface AvatarProvider {
  setState(state: OfficerState): void;
  destroy(): void;
}

export interface RealtimeConversationProvider {
  /** Next officer line given the applicant's last spoken answer (null to open). */
  next(lastAnswer: string | null): OfficerStep;
  requestEnd(): void;
  targetBase: number;
}

// ---- Local text-to-speech (Web Speech API) --------------------------------
// Production swap: a streaming neural TTS or a real-time voice API.
export class LocalTextToSpeech implements TextToSpeechProvider {
  supported: boolean;
  private rate: number;
  private pitch: number;
  private order: number;

  constructor(personaId: string) {
    const p = personaById(personaId);
    this.rate = p.voiceRate;
    this.pitch = p.voicePitch;
    this.order = p.voiceOrder;
    this.supported =
      typeof window !== "undefined" && "speechSynthesis" in window;
  }

  private pickVoice(): SpeechSynthesisVoice | undefined {
    const all = window.speechSynthesis.getVoices();
    const en = all.filter((v) => /^en/i.test(v.lang));
    const pool = en.length ? en : all;
    if (pool.length === 0) return undefined;
    // Rank toward the most natural voice available on this device and avoid
    // the robotic "compact"/eSpeak ones. Then let the persona pick among the
    // best few for variety.
    const score = (v: SpeechSynthesisVoice): number => {
      const n = v.name.toLowerCase();
      let s = 0;
      if (/google (us|uk) english/.test(n)) s += 7; // Chrome, very natural
      if (/natural|neural|enhanced|premium/.test(n)) s += 6; // Edge/iOS enhanced
      if (/\b(samantha|ava|allison|serena|zoe|evan|nathan|aaron|joelle|noelle|siri)\b/.test(n)) s += 4;
      if (/\b(daniel|karen|moira|tessa|fiona|arthur|martha)\b/.test(n)) s += 2;
      if (/en[-_]us/i.test(v.lang)) s += 2;
      if (v.localService === false) s += 1; // network voices usually nicer
      if (/compact|eloquence|espeak|fred|albert|zarvox|robot/.test(n)) s -= 6;
      return s;
    };
    const ranked = [...pool].sort((a, b) => score(b) - score(a));
    const top = ranked.slice(0, Math.min(3, ranked.length));
    return top[this.order % top.length];
  }

  speak(text: string, opts?: { onStart?: () => void }): Promise<void> {
    if (!this.supported) {
      // Approximate the spoken duration so the room still paces correctly.
      const ms = Math.min(9000, 900 + text.length * 45);
      opts?.onStart?.();
      return new Promise((res) => setTimeout(res, ms));
    }
    return new Promise((resolve) => {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = this.pickVoice();
      if (v) u.voice = v;
      u.rate = this.rate;
      u.pitch = this.pitch;
      u.volume = 1;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };
      u.onstart = () => opts?.onStart?.();
      u.onend = finish;
      u.onerror = finish;
      // iOS Safari sometimes leaves synthesis paused — nudge it before/after.
      try {
        synth.resume();
      } catch {
        /* noop */
      }
      synth.speak(u);
      try {
        synth.resume();
      } catch {
        /* noop */
      }
      // Safety: some browsers drop onend for long utterances.
      setTimeout(finish, Math.min(20000, 1500 + text.length * 90));
    });
  }

  cancel() {
    if (this.supported) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* noop */
      }
    }
  }

  preview(text: string) {
    void this.speak(text);
  }
}

// ---- Local speech-to-text (Web Speech API) --------------------------------
// Production swap: a streaming ASR / real-time transcription provider.
export class LocalSpeechToText implements SpeechToTextProvider {
  supported: boolean;
  private rec: SpeechRecognition | null = null;
  private finalText = "";

  constructor() {
    this.supported =
      typeof window !== "undefined" &&
      Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  start(handlers: {
    onInterim: (text: string) => void;
    onFinal: (fullText: string) => void;
    onError?: (err: string) => void;
  }) {
    if (!this.supported) return;
    const Ctor = (window.SpeechRecognition || window.webkitSpeechRecognition)!;
    this.finalText = "";
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) this.finalText += r[0].transcript + " ";
        else interim += r[0].transcript;
      }
      if (interim) handlers.onInterim(interim.trim());
      handlers.onFinal(this.finalText.trim());
    };
    rec.onerror = (e: SpeechRecognitionErrorEvent) => handlers.onError?.(e.error);
    this.rec = rec;
    try {
      rec.start();
    } catch {
      /* already started */
    }
  }

  stop() {
    if (this.rec) {
      try {
        this.rec.stop();
      } catch {
        /* noop */
      }
    }
  }
}

// ---- Mock real-time conversation (adaptive engine) ------------------------
// Production swap: a real-time LLM conversation service. Point this at
// /api/interview (Claude) or a realtime voice model to get fully generative
// follow-ups; the room code does not change.
export class MockRealtimeConversation implements RealtimeConversationProvider {
  private engine: ReturnType<typeof createInterview>;
  targetBase: number;

  constructor(config: InterviewConfig) {
    this.engine = createInterview(config);
    this.targetBase = this.engine.targetBase;
  }
  next(lastAnswer: string | null) {
    return this.engine.next(lastAnswer);
  }
  requestEnd() {
    this.engine.requestEnd();
  }
}
