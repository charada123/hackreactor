// Post generation via the Claude API.
//
// Given a topic and the recent post history, ask Claude for one original
// LinkedIn post. We use structured outputs so we get back a clean object
// (post text + hashtags) rather than having to parse free-form prose.

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

function buildPrompt(topic, recentPosts) {
  const avoid = recentPosts.length
    ? "You have recently posted the following. Do NOT repeat these openings, " +
      "stories, or core ideas — say something genuinely new:\n\n" +
      recentPosts
        .map((p, i) => `${i + 1}. [${p.topic}] ${p.text}`)
        .join("\n\n")
    : "This is your first post — set a strong tone.";

  return [
    `Write one LinkedIn post about **${topic.label}**.`,
    `Angle to explore: ${topic.angle}`,
    "",
    "Requirements:",
    `- Around ${config.targetWords} words. Short, scannable paragraphs.`,
    "- Open with a hook that earns the next line — no \"I've been thinking about...\".",
    "- One concrete idea, story, or piece of advice. Not a list of platitudes.",
    "- End with a line that invites reflection or a reply, without a cheesy CTA.",
    "- No emojis unless one genuinely adds meaning. No hashtags in the body.",
    "- Do not use markdown, headers, or bold. Plain text a person would type.",
    "",
    avoid,
  ].join("\n");
}

export async function generatePost(topic, recentPosts = []) {
  const response = await client.messages.create({
    model: config.model,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: config.voice,
    output_config: { format: { type: "json_schema", schema: POST_SCHEMA } },
    messages: [{ role: "user", content: buildPrompt(topic, recentPosts) }],
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
