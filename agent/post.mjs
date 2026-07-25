// Entry point: pick a topic, generate a post, and (optionally) publish it.
//
//   node post.mjs            # dry run — generate and print, do NOT publish
//   node post.mjs --post     # generate AND publish to LinkedIn
//   node post.mjs --topic business
//
// The dry-run default is a safety net: you never accidentally publish while
// testing. The scheduled GitHub Action passes --post explicitly.

import { config } from "./config.mjs";
import { generatePost } from "./generate.mjs";
import { resolveAuthorUrn, publishPost } from "./linkedin.mjs";
import { loadHistory, appendHistory, recent } from "./history.mjs";

function parseArgs(argv) {
  const args = { post: false, topic: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--post") args.post = true;
    else if (argv[i] === "--topic") args.topic = argv[++i];
  }
  return args;
}

// Choose the next topic. In "rotate" mode we look at the last posted topic and
// advance to the next one in the list; in "random" mode we pick at random.
function chooseTopic(history, explicitKey) {
  if (explicitKey) {
    const t = config.topics.find((t) => t.key === explicitKey);
    if (!t) throw new Error(`Unknown topic "${explicitKey}".`);
    return t;
  }
  if (config.selection === "random") {
    return config.topics[Math.floor(Math.random() * config.topics.length)];
  }
  // rotate
  const last = history.at(-1)?.topic;
  const lastIdx = config.topics.findIndex((t) => t.key === last);
  return config.topics[(lastIdx + 1) % config.topics.length];
}

async function main() {
  const args = parseArgs(process.argv);
  const history = await loadHistory();
  const topic = chooseTopic(history, args.topic);

  console.log(`Topic: ${topic.label} (${topic.key})`);
  console.log("Generating post with Claude...\n");

  const post = await generatePost(topic, recent(history, config.historyContext));

  console.log("─".repeat(60));
  console.log(post.commentary);
  console.log("─".repeat(60));
  console.log(
    `\nTokens: ${post.usage.input_tokens} in / ${post.usage.output_tokens} out`,
  );

  if (!args.post) {
    console.log("\nDry run — not published. Re-run with --post to publish.");
    return;
  }

  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!token) throw new Error("LINKEDIN_ACCESS_TOKEN is not set.");

  const authorUrn = await resolveAuthorUrn(token);
  console.log(`\nPublishing as ${authorUrn}...`);
  const postUrn = await publishPost(token, authorUrn, post.commentary);
  console.log(`Published: ${postUrn}`);

  await appendHistory({
    postedAt: new Date().toISOString(),
    topic: topic.key,
    text: post.text,
    hashtags: post.hashtags,
    urn: postUrn,
  });
  console.log("Logged to data/history.json.");
}

main().catch((err) => {
  console.error("\nError:", err.message);
  process.exit(1);
});
