import { NextResponse } from "next/server";
import { gradeAnswer, hasApiKey } from "@/lib/anthropic";
import { scriptedFeedback } from "@/lib/scripted";
import type { SimulatorConfig } from "@/lib/types";

export const runtime = "nodejs";

interface Body {
  config: SimulatorConfig;
  question: string;
  answer: string;
  priorAnswers?: string[];
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { config, question, answer, priorAnswers = [] } = body;
  if (!config || !question || typeof answer !== "string") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (hasApiKey()) {
    try {
      const feedback = await gradeAnswer(config, question, answer, priorAnswers);
      return NextResponse.json({ feedback, source: "ai" });
    } catch {
      return NextResponse.json({ feedback: scriptedFeedback(answer), source: "fallback" });
    }
  }

  return NextResponse.json({ feedback: scriptedFeedback(answer), source: "scripted" });
}
