export type InterviewType =
  | "marriage"
  | "family"
  | "employment"
  | "diversity"
  | "asylee";

export type OfficerMood = "friendly" | "neutral" | "strict";

export type Difficulty = "easy" | "medium" | "hard";

export type ChatRole = "officer" | "applicant";

export interface ChatTurn {
  role: ChatRole;
  text: string;
}

export interface SimulatorConfig {
  interviewType: InterviewType;
  mood: OfficerMood;
  difficulty: Difficulty;
}

/** Scored feedback for a single answer. All scores are 0–10. */
export interface AnswerFeedback {
  confidence: number;
  naturalness: number;
  specificity: number;
  consistency: number;
  completeness: number;
  overall: number;
  redFlags: string[];
  suggestion: string;
}

export interface Question {
  id: string;
  categoryId: string;
  prompt: string;
  tip?: string;
}

export interface Category {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
}

// ---- Video interview (v2) ----

export type InterviewDuration = "quick" | "standard" | "full";

export interface InterviewConfig extends SimulatorConfig {
  personaId: string;
  duration: InterviewDuration;
}

/** Visual state the officer persona can present. */
export type OfficerState =
  | "idle"
  | "listening"
  | "speaking"
  | "thinking"
  | "reviewing"
  | "closing";

/** Discreet live status shown in the interview room (never a chat transcript). */
export type LiveStatus =
  | "connecting"
  | "speaking"
  | "listening"
  | "still-listening"
  | "processing"
  | "no-audio"
  | "ended";

/** One captured turn. Retained internally for scoring; shown only on the report. */
export interface TranscriptEntry {
  section: string;
  question: string;
  answer: string;
  isFollowUp: boolean;
  /** ms the applicant spent speaking their answer. */
  spokenMs: number;
  /** ms of silence before the applicant began answering (hesitation). */
  hesitationMs: number;
}
