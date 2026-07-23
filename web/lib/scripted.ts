import type {
  AnswerFeedback,
  ChatTurn,
  SimulatorConfig,
} from "./types";
import {
  questions,
  typeCategoryEmphasis,
} from "./questions";

// Deterministic fallback "officer" used when no ANTHROPIC_API_KEY is set, or
// when the API call fails. It walks a shuffled pool of real question patterns
// biased toward the chosen interview type, and produces heuristic feedback so
// the whole app is fully usable offline.

function seedFrom(turns: ChatTurn[]): number {
  // Simple deterministic seed from conversation length + last answer length.
  const answers = turns.filter((t) => t.role === "applicant");
  const last = answers[answers.length - 1]?.text ?? "";
  return answers.length * 97 + last.length * 13 + 7;
}

function poolFor(config: SimulatorConfig) {
  const emphasis = typeCategoryEmphasis[config.interviewType] ?? [];
  const inScope = questions.filter((q) => emphasis.includes(q.categoryId));
  return inScope.length > 0 ? inScope : questions;
}

const strictOpeners = [
  "Let me be direct.",
  "I need a precise answer.",
  "Be specific, please.",
];
const friendlyOpeners = [
  "Thanks — that's helpful.",
  "Great, appreciate it.",
  "Okay, good.",
];

export function scriptedOfficerReply(
  config: SimulatorConfig,
  turns: ChatTurn[],
): string {
  const pool = poolFor(config);
  const asked = new Set(
    turns.filter((t) => t.role === "officer").map((t) => t.text),
  );
  const seed = seedFrom(turns);

  // Pick the next unasked question deterministically.
  let chosen = pool.find((q) => !asked.has(q.prompt));
  if (!chosen) {
    chosen = pool[seed % pool.length];
  }

  const isFirst = turns.filter((t) => t.role === "officer").length === 0;
  if (isFirst) {
    const hello =
      config.mood === "strict"
        ? "Please raise your right hand. Do you swear everything you tell me today is the truth? Now — "
        : config.mood === "friendly"
          ? "Good morning, and welcome. Let's get started. "
          : "Good morning. Let's begin. ";
    return hello + chosen.prompt;
  }

  // Occasionally add a challenge/follow-up for vague short answers.
  const lastAnswer =
    turns.filter((t) => t.role === "applicant").slice(-1)[0]?.text ?? "";
  const vague = lastAnswer.trim().split(/\s+/).length < 6;

  let lead = "";
  if (config.mood === "strict") lead = strictOpeners[seed % strictOpeners.length] + " ";
  else if (config.mood === "friendly") lead = friendlyOpeners[seed % friendlyOpeners.length] + " ";

  if (vague && config.difficulty !== "easy") {
    return (
      lead +
      "That was brief. Can you give me more detail — dates, names, or specifics? " +
      chosen.prompt
    );
  }

  return lead + chosen.prompt;
}

export function scriptedFeedback(answer: string): AnswerFeedback {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const len = words.length;
  const hasNumbers = /\d/.test(answer);
  const hasNames = /[A-Z][a-z]+/.test(answer.replace(/^\s*[A-Z]/, ""));

  const clamp = (n: number) => Math.max(1, Math.min(10, Math.round(n)));

  const completeness = clamp(len < 4 ? 3 : len < 12 ? 6 : len < 40 ? 8 : 9);
  const specificity = clamp(
    (hasNumbers ? 3 : 0) + (hasNames ? 2 : 0) + (len > 15 ? 4 : 2),
  );
  const confidence = clamp(len < 4 ? 4 : len > 60 ? 7 : 8 - (len > 90 ? 2 : 0));
  const naturalness = clamp(len > 120 ? 6 : len < 4 ? 4 : 8);
  const consistency = 8; // heuristic can't cross-check; assume neutral-positive
  const overall = clamp(
    (completeness + specificity + confidence + naturalness + consistency) / 5,
  );

  const redFlags: string[] = [];
  if (len < 4) redFlags.push("Answer is very short — officers may probe further.");
  if (!hasNumbers) redFlags.push("No specific dates or numbers given.");
  if (len > 120) redFlags.push("Answer is long and may sound over-rehearsed.");

  const suggestion =
    len < 4
      ? "Add a concrete detail or two — a date, a place, or a name."
      : hasNumbers
        ? "Solid. Keep answers this specific and natural."
        : "Anchor your answer with a specific date or fact to make it more credible.";

  return {
    confidence,
    naturalness,
    specificity,
    consistency,
    completeness,
    overall,
    redFlags,
    suggestion,
  };
}
