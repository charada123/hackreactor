"use client";

import { useCallback, useEffect, useState } from "react";
import type { AnswerFeedback, SimulatorConfig } from "./types";

// Lightweight browser persistence. No account required; nothing leaves the
// device. Swap for Prisma/Supabase later (see prisma/schema.prisma).

export interface SessionRecord {
  id: string;
  date: number;
  config: SimulatorConfig;
  questionCount: number;
  averageScore: number;
  scores: number[];
  categoryAverages?: Record<string, number>;
}

export interface AppState {
  sessions: SessionRecord[];
  checklist: Record<string, boolean>;
  timeline: Record<string, string>; // stepId -> ISO date
  bookmarks: string[]; // question ids
  streakDates: string[]; // YYYY-MM-DD practiced
}

const KEY = "gcia.state.v1";

const empty: AppState = {
  sessions: [],
  checklist: {},
  timeline: {},
  bookmarks: [],
  streakDates: [],
};

function read(): AppState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return empty;
  }
}

function write(state: AppState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(read());
    setReady(true);
  }, []);

  const update = useCallback((fn: (s: AppState) => AppState) => {
    setState((prev) => {
      const next = fn(prev);
      write(next);
      return next;
    });
  }, []);

  return { state, ready, update };
}

export function todayKey(now: number): string {
  // Deterministic YYYY-MM-DD from a timestamp passed in by the caller.
  const d = new Date(now);
  return d.toISOString().slice(0, 10);
}

export function averageOf(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// Readiness score (0–100) from recent sessions, weighted toward recency.
export function readinessScore(sessions: SessionRecord[]): number {
  if (sessions.length === 0) return 0;
  const recent = [...sessions].sort((a, b) => b.date - a.date).slice(0, 6);
  let weightSum = 0;
  let acc = 0;
  recent.forEach((s, i) => {
    const w = 1 / (i + 1);
    weightSum += w;
    acc += (s.averageScore / 10) * 100 * w;
  });
  const base = acc / weightSum;
  // A small bonus for having practiced more sessions (experience).
  const volume = Math.min(sessions.length, 10) * 1.2;
  return Math.max(0, Math.min(100, Math.round(base * 0.88 + volume)));
}

export function computeStreak(streakDates: string[], now: number): number {
  const set = new Set(streakDates);
  let streak = 0;
  const cursor = new Date(now);
  // Count consecutive days ending today (or yesterday if not yet practiced today).
  for (let i = 0; i < 400; i++) {
    const key = cursor.toISOString().slice(0, 10);
    if (set.has(key)) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else if (i === 0) {
      // allow a still-active streak if they practiced yesterday
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function scoreFromFeedback(f: AnswerFeedback): number {
  return f.overall;
}
