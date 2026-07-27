// Post generation via the Claude API.
//
// Given a theory and the recent post history, ask Claude for one original,
// motivational LinkedIn post that teaches the theory and turns it into a
// practical takeaway. Structured output gives us a clean object (text +
// hashtags) rather than free-form prose to parse.

import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config.mjs";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

const POST_SCHEMA = {
  type: "object",
  properties: {
    text: {
      type: "string",
      description: "The LinkedIn post body, ready to publish verbatim.",
    },
    hashtags: {
      type: "array",
      items: { type: "string" },
      description: "3-5 relevant hashtags, each including the leading #.",
    },
  },
  required: ["text", "hashtags"],
  additionalProperties: false,
};

function buildPrompt(theory, recentPosts) {
  const avoid = recentPosts.length
    ? "You have recently posted the following. Do NOT repeat these openings, " +
      "stories, framings, or takeaways — say something genuinely new:\n\n" +
      recentPosts
        .map((p, i) => `${i + 1}. [${p.theory || p.topic}] ${p.text}`)
        .join("\n\n")
    : "This is your first post — set a strong, motivating tone.";

  return [
    `Write one motivational LinkedIn post built around this idea:`,
    `**${theory.name}** (${theory.category}).`,
    "",
    "Your goal: teach this theory clearly, then turn it into something the",
    "reader feels motivated to act on today. Make a real management/business",
    "concept feel personal and energising, not academic.",
    "",
    "Requirements:",
    `- Around ${config.targetWords} words. Short, punchy, scannable paragraphs.`,
    "- Open with a hook that grabs attention — a tension, a question, a sharp",
    "  claim. Never \"I've been thinking about...\" or \"Did you know...\".",
    "- Explain the core of the theory in plain language — no jargon dumps. One",
    "  crisp example or mini-story that makes it click.",
    "- Draw out ONE motivating, practical takeaway the reader can apply to",
    "  their work, team, or growth. This is the heart of the post.",
    "- Name the theory (and its thinker, if notable) so people learn something.",
    "- End on a line that lifts the reader and invites a reply — motivating,",
    "  not a cheesy \"Agree? Comment below\" CTA.",
    "- No emojis unless one genuinely adds meaning. No hashtags in the body.",
    "- Plain text a real person would type. No markdown, headers, or bold.",
    "",
    avoid,
  ].join("\n");
}

export async function generatePost(theory, recentPosts = []) {
  const response = await client.messages.create({
    model: config.model,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: config.voice,
    output_config: { format: { type: "json_schema", schema: POST_SCHEMA } },
    messages: [{ role: "user", content: buildPrompt(theory, recentPosts) }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Claude declined to generate this post (safety refusal).");
  }

  const block = response.content.find((b) => b.type === "text");
  if (!block) throw new Error("No text returned from Claude.");

  const parsed = JSON.parse(block.text);
  const hashtags = (parsed.hashtags || []).join(" ").trim();

  // Compose the final published text: body, a blank line, then hashtags.
  const commentary = hashtags ? `${parsed.text}\n\n${hashtags}` : parsed.text;

  return {
    text: parsed.text,
    hashtags: parsed.hashtags || [],
    commentary,
    usage: response.usage,
  };
}
