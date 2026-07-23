import type { InterviewConfig, InterviewDuration } from "./types";

// Adaptive interview logic. This is the "mock" RealtimeConversationProvider:
// it produces the officer's next spoken line from the section plan, the mood /
// difficulty, and — crucially — the content of the applicant's last spoken
// answer (missing dates, "we met online", short answers, timeline conflicts).
//
// It NEVER coaches the applicant to invent, exaggerate, or conceal anything.

export interface OfficerStep {
  text: string;
  section: string;
  isQuestion: boolean;
  isFollowUp: boolean;
  progress: number; // 0..1
  done: boolean; // closing line — no answer expected after this
}

interface Section {
  id: string;
  label: string;
  /** Interview types this section applies to; omitted = all. */
  types?: InterviewConfig["interviewType"][];
  questions: string[];
}

const SECTIONS: Section[] = [
  {
    id: "bio",
    label: "Biographical information",
    questions: [
      "What is your current mailing address?",
      "What is your country of birth, and your country of citizenship?",
      "Have you ever used any other names, including a maiden name or nickname?",
    ],
  },
  {
    id: "address",
    label: "Address & employment history",
    questions: [
      "How long have you lived at your current address?",
      "Where did you live before that?",
      "Who is your current employer, and what is your job title?",
      "What are your main duties at work?",
    ],
  },
  {
    id: "immigration",
    label: "Immigration & travel history",
    questions: [
      "When and how did you last enter the United States?",
      "What immigration status did you enter in?",
      "Have you ever overstayed a visa or been out of status?",
      "Which countries have you traveled to in the last five years, and why?",
    ],
  },
  {
    id: "relationship",
    label: "Relationship history",
    types: ["marriage"],
    questions: [
      "How did you and your spouse first meet?",
      "When did you first begin communicating regularly?",
      "How long did you date before you decided to marry?",
      "How did the proposal happen?",
    ],
  },
  {
    id: "wedding",
    label: "Marriage & the wedding",
    types: ["marriage"],
    questions: [
      "When and where did you get married?",
      "Describe your wedding day. Was there a ceremony and a reception?",
      "Who attended the wedding?",
    ],
  },
  {
    id: "household",
    label: "Shared residence & daily life",
    types: ["marriage"],
    questions: [
      "Describe your home. How many bedrooms does it have?",
      "What is a typical weekday morning like in your household?",
      "Who handles the cooking and the household bills?",
      "What did you and your spouse do together most recently?",
    ],
  },
  {
    id: "finances",
    label: "Joint finances & support",
    types: ["marriage", "family"],
    questions: [
      "Do you and your spouse share any bank accounts, insurance, or bills?",
      "Who is your financial sponsor for this application?",
    ],
  },
  {
    id: "family",
    label: "Family",
    types: ["marriage", "family"],
    questions: [
      "Have you met your spouse's parents? Tell me about them.",
      "Do you have any children, together or from prior relationships?",
    ],
  },
  {
    id: "employment-eb",
    label: "Employment details",
    types: ["employment"],
    questions: [
      "Who is your sponsoring employer, and what position were you offered?",
      "Describe your day-to-day responsibilities.",
      "Do you intend to continue in this role after your application is approved?",
      "What are your qualifications for this position?",
    ],
  },
  {
    id: "admissibility",
    label: "Eligibility & admissibility",
    questions: [
      "Have you ever been arrested, cited, or detained by any law enforcement, anywhere?",
      "Have you ever been ordered removed or deported from the United States?",
      "Have you ever misrepresented a fact to a U.S. official to gain an immigration benefit?",
    ],
  },
  {
    id: "documents",
    label: "Documents",
    questions: [
      "Did you bring your passport and identification with you today?",
      "Have you completed your medical examination?",
    ],
  },
];

const TARGET: Record<InterviewDuration, number> = {
  quick: 8,
  standard: 14,
  full: 20,
};

const ACK = {
  friendly: ["Thank you.", "That's helpful, thank you.", "Understood.", "Okay, good."],
  neutral: ["Understood.", "Thank you.", "Noted.", "Let's continue."],
  strict: ["Noted.", "Understood.", "Let's continue.", ""],
};

function wc(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}
function hasYear(s: string): boolean {
  return /\b(19|20)\d{2}\b/.test(s);
}
function years(s: string): string[] {
  return (s.match(/\b(19|20)\d{2}\b/g) || []) as string[];
}

type Stage = "greet" | "identity" | "oath" | "body" | "closing" | "done";

export function createInterview(config: InterviewConfig) {
  const relevant = SECTIONS.filter(
    (s) => !s.types || s.types.includes(config.interviewType),
  );

  // Flat plan of {section,label,question}. Depth scales with difficulty.
  const perSection =
    config.difficulty === "hard" ? 99 : config.difficulty === "medium" ? 3 : 2;
  const plan: { section: string; q: string }[] = [];
  for (const s of relevant) {
    for (const q of s.questions.slice(0, perSection)) {
      plan.push({ section: s.label, q });
    }
  }
  const targetBase = Math.min(TARGET[config.duration], plan.length);

  let stage: Stage = "greet";
  let planIdx = 0;
  let askedBase = 0;
  let lastWasFollowUp = false;
  let followUpsThisQuestion = 0;
  let currentSection = "Introduction";
  const seenYears = new Set<string>();
  let timelineChecked = false;
  let ended = false;

  const pFollow =
    config.difficulty === "hard" || config.mood === "strict"
      ? 0.85
      : config.difficulty === "easy" || config.mood === "friendly"
        ? 0.35
        : 0.6;

  function ack(): string {
    const pool = ACK[config.mood];
    if (Math.random() < 0.55) {
      const a = pool[Math.floor(Math.random() * pool.length)];
      return a ? a + " " : "";
    }
    return "";
  }

  function progress(): number {
    return Math.max(0, Math.min(1, askedBase / targetBase));
  }

  // Decide an adaptive follow-up from the applicant's last answer, or null.
  function followUp(answer: string): string | null {
    const words = wc(answer);

    // Always allow a clarify prompt for a very thin answer.
    if (words > 0 && words < 5) {
      return config.mood === "strict"
        ? "Please be more specific. I need details such as dates, names, or places."
        : "Could you be a little more specific? Details like dates, names, or places help.";
    }

    // One content follow-up at most, and not two follow-ups back-to-back.
    if (lastWasFollowUp || followUpsThisQuestion >= 1) return null;

    // Timeline consistency check (hard difficulty only, once).
    if (config.difficulty === "hard" && !timelineChecked) {
      const ys = years(answer);
      const conflict = ys.find((y) => seenYears.size > 0 && !seenYears.has(y));
      if (conflict && seenYears.size > 0) {
        timelineChecked = true;
        const prior = Array.from(seenYears)[0];
        return `Earlier I noted ${prior}, and now I'm hearing ${conflict}. Help me understand the order of events.`;
      }
    }

    if (Math.random() > pFollow) return null;

    const lower = answer.toLowerCase();
    if (config.difficulty !== "easy") {
      if (/\bonline\b|\bapp\b|\bwebsite\b|\bdating\b|\binstagram\b|\bmatch\b/.test(lower)) {
        return "Which website or application did you use, and when did you first meet in person?";
      }
      if (/\bmarried\b|\bwed\b|\bwedding\b/.test(lower) && !hasYear(answer)) {
        return "What was the exact date of the wedding, and where did the ceremony take place?";
      }
    }
    if (config.difficulty === "hard") {
      if (/\bmoved\b|\bmoving\b/.test(lower) && !hasYear(answer)) {
        return "Around what date did you move, and what was the address?";
      }
      if (/\bwork|\bjob\b|\bemployed|\bcompany\b/.test(lower) && !hasYear(answer)) {
        return "How long have you been there, and what are your main responsibilities?";
      }
      if (/\bmet\b/.test(lower) && !hasYear(answer)) {
        return "And when did the two of you first meet in person?";
      }
    }
    return null;
  }

  function recordFacts(answer: string) {
    for (const y of years(answer)) seenYears.add(y);
  }

  function next(lastAnswer: string | null): OfficerStep {
    if (lastAnswer) recordFacts(lastAnswer);

    if (ended && stage !== "done") stage = "closing";

    if (stage === "greet") {
      stage = "identity";
      currentSection = "Introduction & identity";
      return {
        text: "Good morning, and thank you for coming in. I'm your interviewer for today's practice session. To start, please confirm your full name and your date of birth.",
        section: currentSection,
        isQuestion: true,
        isFollowUp: false,
        progress: 0,
        done: false,
      };
    }

    if (stage === "identity") {
      stage = "body";
      currentSection = "Oath & basic information";
      const first = plan[planIdx];
      currentSection = first ? first.section : currentSection;
      return {
        text: "Thank you. Before we continue, please remember this is a practice interview, not an official one — so answer naturally and truthfully, just as you would on the real day. Let's begin. " +
          (first ? first.q : "Tell me a little about your current situation."),
        section: currentSection,
        isQuestion: true,
        isFollowUp: false,
        progress: progress(),
        done: false,
      };
    }

    if (stage === "body") {
      // Consider an adaptive follow-up to the previous answer first.
      if (lastAnswer != null) {
        const fu = followUp(lastAnswer);
        if (fu) {
          lastWasFollowUp = true;
          followUpsThisQuestion += 1;
          return {
            text: fu,
            section: currentSection,
            isQuestion: true,
            isFollowUp: true,
            progress: progress(),
            done: false,
          };
        }
      }

      // Advance to the next planned base question.
      lastWasFollowUp = false;
      followUpsThisQuestion = 0;
      planIdx += 1;
      askedBase += 1;

      if (ended || askedBase >= targetBase || planIdx >= plan.length) {
        stage = "closing";
      } else {
        const item = plan[planIdx];
        currentSection = item.section;
        return {
          text: ack() + item.q,
          section: currentSection,
          isQuestion: true,
          isFollowUp: false,
          progress: progress(),
          done: false,
        };
      }
    }

    // Closing
    stage = "done";
    currentSection = "Closing";
    return {
      text: "That covers everything I need for today. Thank you for your time and your thoughtful answers. This concludes your practice interview.",
      section: currentSection,
      isQuestion: false,
      isFollowUp: false,
      progress: 1,
      done: true,
    };
  }

  function requestEnd() {
    ended = true;
  }

  return { next, requestEnd, targetBase };
}
