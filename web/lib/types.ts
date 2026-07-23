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
