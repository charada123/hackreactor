// Entry point: pick a theory, generate a motivational post about it, and
// (optionally) publish it.
//
//   node post.mjs                    # dry run — generate and print, do NOT publish
//   node post.mjs --post             # generate AND publish to LinkedIn
//   node post.mjs --theory maslow    # force a theory (substring match)
//
// The dry-run default is a safety net: you never accidentally publish while
// testing. The scheduled GitHub Action passes --post explicitly.

import { config } from "./config.mjs";
import { generatePost } from "./generate.mjs";
import { resolveAuthorUrn, publishPost } from "./linkedin.mjs";
import { loadHistory, appendHistory, recent } from "./history.mjs";

function parseArgs(argv) {
  const args = { post: false, theory: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--post") args.post = true;
    else if (argv[i] === "--theory") args.theory = argv[++i];
  }
  return args;
}

// Choose the next theory. In "rotate" mode we look at the last posted theory
// and advance to the next one in the list; in "random" mode we pick at random.
// An explicit --theory value matches by case-insensitive substring.
function chooseTheory(history, explicitQuery) {
  if (explicitQuery) {
    const q = explicitQuery.toLowerCase();
    const t = config.theories.find((t) => t.name.toLowerCase().includes(q));
    if (!t) throw new Error(`No theory matches "${explicitQuery}".`);
    return t;
  }
  if (config.selection === "random") {
    return config.theories[Math.floor(Math.random() * config.theories.length)];
  }
  // rotate
  const last = history.at(-1)?.theory;
  const lastIdx = config.theories.findIndex((t) => t.name === last);
  return config.theories[(lastIdx + 1) % config.theories.length];
}

async function main() {
  const args = parseArgs(process.argv);
  const history = await loadHistory();
  const theory = chooseTheory(history, args.theory);

  console.log(`Theory: ${theory.name} (${theory.category})`);
  console.log("Generating post with Claude...\n");

  const post = await generatePost(theory, recent(history, config.historyContext));

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
    theory: theory.name,
    category: theory.category,
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
