// Interviewer personas. Presentation only — professional, neutral, and
// deliberately NOT tied to race, gender, ethnicity, or age. The accent color
// and subtle voice rate/pitch differences distinguish them without stereotype.
// The behavioral "style" is driven by the officer mood/difficulty engine, not
// by any demographic trait.

export interface Persona {
  id: string;
  name: string;
  style: string;
  description: string;
  accent: string; // avatar tint
  /** Voice tuning for the local text-to-speech fallback (not a demographic cue). */
  voiceRate: number;
  voicePitch: number;
  /** Deterministic index used to rotate among available browser voices. */
  voiceOrder: number;
}

export const personas: Persona[] = [
  {
    id: "morgan",
    name: "Officer Morgan",
    style: "Professional & neutral",
    description:
      "Businesslike and even-handed. Asks standard questions at a steady pace.",
    accent: "#4F6BED",
    voiceRate: 1.0,
    voicePitch: 1.0,
    voiceOrder: 0,
  },
  {
    id: "ramirez",
    name: "Officer Ramirez",
    style: "Warm but thorough",
    description:
      "Patient and encouraging, while still following up on the details that matter.",
    accent: "#0E9488",
    voiceRate: 0.97,
    voicePitch: 1.05,
    voiceOrder: 1,
  },
  {
    id: "chen",
    name: "Officer Chen",
    style: "Direct & detail-oriented",
    description:
      "Focused on specifics — exact dates, names, and places — with concise prompts.",
    accent: "#3E5C76",
    voiceRate: 1.05,
    voicePitch: 0.98,
    voiceOrder: 2,
  },
  {
    id: "williams",
    name: "Officer Williams",
    style: "Formal & rigorous",
    description:
      "Structured and exacting. Expects precise answers and checks the timeline closely.",
    accent: "#556070",
    voiceRate: 1.06,
    voicePitch: 0.94,
    voiceOrder: 3,
  },
];

export function personaById(id: string): Persona {
  return personas.find((p) => p.id === id) ?? personas[0];
}

/** Initials for the generated avatar (no photo of a real person is used). */
export function personaInitials(p: Persona): string {
  const parts = p.name.replace(/^Officer\s+/i, "").split(/\s+/);
  return parts
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase() ?? "")
    .join("");
}
