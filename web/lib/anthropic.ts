import Anthropic from "@anthropic-ai/sdk";
import type {
  AnswerFeedback,
  ChatTurn,
  SimulatorConfig,
} from "./types";
import { interviewTypeLabels } from "./questions";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function client(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function officerSystemPrompt(config: SimulatorConfig): string {
  const moodLine = {
    friendly: "Your demeanor is warm and reassuring, but still professional.",
    neutral: "Your demeanor is calm, neutral, and businesslike.",
    strict: "Your demeanor is firm and probing. You press on vague answers.",
  }[config.mood];

  const difficultyLine = {
    easy: "Keep questions straightforward and expected.",
    medium: "Mix expected questions with occasional follow-ups.",
    hard: "Ask detailed, specific, and occasionally unexpected follow-ups, and challenge answers that are vague or inconsistent.",
  }[config.difficulty];

  return [
    `You are a USCIS officer conducting a ${interviewTypeLabels[config.interviewType]} Adjustment of Status (Form I-485) green-card interview.`,
    "You are role-playing for interview practice. Stay fully in character as the officer.",
    moodLine,
    difficultyLine,
    "",
    "Rules you must always follow:",
    "- Ask exactly ONE question per turn. Never list multiple questions.",
    "- Never give legal advice, and never act like the applicant's lawyer.",
    "- Never tell or suggest that the applicant lie or fabricate anything.",
    "- Ask intelligent follow-up questions based on what the applicant just said.",
    "- If an answer is vague, brief, or evasive, politely press for a specific detail (a date, a name, a place).",
    "- Keep each question short and natural — one or two sentences. No preamble like 'As a USCIS officer'.",
    "- Do not break character to explain yourself or coach the applicant.",
    "",
    "Output only the officer's next spoken line.",
  ].join("\n");
}

function toMessages(turns: ChatTurn[]): Anthropic.MessageParam[] {
  // Map officer/applicant turns to assistant/user roles.
  const msgs: Anthropic.MessageParam[] = turns.map((t) => ({
    role: t.role === "officer" ? "assistant" : "user",
    content: t.text,
  }));
  // The API requires the first message to be from the user. If the very first
  // turn is the officer (opening line), prepend a neutral user cue.
  if (msgs.length === 0 || msgs[0].role !== "user") {
    msgs.unshift({ role: "user", content: "(The applicant sits down for the interview.)" });
  }
  return msgs;
}

export async function officerReply(
  config: SimulatorConfig,
  turns: ChatTurn[],
): Promise<string> {
  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 400,
    system: officerSystemPrompt(config),
    messages: toMessages(turns),
  });
  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
  return text || "Let's continue. Please tell me a bit more about your situation.";
}

const feedbackSchema = {
  type: "object",
  properties: {
    confidence: { type: "integer" },
    naturalness: { type: "integer" },
    specificity: { type: "integer" },
    consistency: { type: "integer" },
    completeness: { type: "integer" },
    overall: { type: "integer" },
    redFlags: { type: "array", items: { type: "string" } },
    suggestion: { type: "string" },
  },
  required: [
    "confidence",
    "naturalness",
    "specificity",
    "consistency",
    "completeness",
    "overall",
    "redFlags",
    "suggestion",
  ],
  additionalProperties: false,
} as const;

export async function gradeAnswer(
  config: SimulatorConfig,
  question: string,
  answer: string,
  priorAnswers: string[],
): Promise<AnswerFeedback> {
  const system = [
    "You are an expert USCIS interview coach reviewing one practice answer.",
    "Score each dimension from 0 to 10 (integers). Be constructive and specific.",
    "Detect red flags a real officer might notice: contradictions with earlier answers, incomplete or evasive answers, over-rehearsed phrasing, or missing documents implied by the answer.",
    "Never give legal advice and never suggest the applicant lie. Encourage truthful, specific, well-organized answers.",
  ].join("\n");

  const context = priorAnswers.length
    ? `\n\nEarlier answers in this interview (for consistency-checking):\n- ${priorAnswers.join("\n- ")}`
    : "";

  // output_config.format constrains the response to our schema. Typed as any so
  // the call is resilient to SDK type-version drift on this newer field.
  const params = {
    model: MODEL,
    max_tokens: 700,
    system,
    output_config: { format: { type: "json_schema", schema: feedbackSchema } },
    messages: [
      {
        role: "user",
        content: `Interview type: ${interviewTypeLabels[config.interviewType]}\nOfficer question: ${question}\nApplicant answer: ${answer}${context}\n\nReturn the scored feedback.`,
      },
    ],
  };
  const response = (await client().messages.create(
    params as unknown as Anthropic.MessageCreateParamsNonStreaming,
  )) as Anthropic.Message;

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return JSON.parse(text) as AnswerFeedback;
}
