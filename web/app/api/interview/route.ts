import { NextResponse } from "next/server";
import { hasApiKey, officerReply } from "@/lib/anthropic";
import { scriptedOfficerReply } from "@/lib/scripted";
import type { ChatTurn, SimulatorConfig } from "@/lib/types";

export const runtime = "nodejs";

interface Body {
  config: SimulatorConfig;
  turns: ChatTurn[];
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { config, turns } = body;
  if (!config || !Array.isArray(turns)) {
    return NextResponse.json({ error: "Missing config or turns" }, { status: 400 });
  }

  if (hasApiKey()) {
    try {
      const text = await officerReply(config, turns);
      return NextResponse.json({ text, source: "ai" });
    } catch (err) {
      // Fall through to the scripted officer so the app never breaks.
      const text = scriptedOfficerReply(config, turns);
      return NextResponse.json({ text, source: "fallback" });
    }
  }

  const text = scriptedOfficerReply(config, turns);
  return NextResponse.json({ text, source: "scripted" });
}
