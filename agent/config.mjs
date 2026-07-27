// Configuration for the LinkedIn content agent.
//
// Everything the agent needs to know about *what* to post lives here. Secrets
// (API keys, LinkedIn token) come from the environment, never this file.

export const config = {
  // Claude model used to write posts. Opus 5 is the strongest general model.
  model: process.env.CLAUDE_MODEL || "claude-opus-5",

  // The persona/voice the posts are written in. Tune this to sound like you.
  voice: [
    "You write for a thoughtful professional audience on LinkedIn.",
    "Your voice is warm, direct, and grounded — never hustle-culture, never",
    "clickbait, never a wall of emojis. You favour a concrete story, a sharp",
    "observation, or a small piece of hard-won advice over vague inspiration.",
  ].join(" "),

  // Topics the agent rotates through. Each posting run picks one (by rotation
  // or at random) and asks Claude for an original post on it.
  topics: [
    {
      key: "motivation",
      label: "Motivation & discipline",
      angle:
        "Building momentum, beating procrastination, showing up on hard days, " +
        "the difference between motivation and systems.",
    },
    {
      key: "aesthetics",
      label: "Aesthetics & craft",
      angle:
        "Taste, design, the value of things that are made well, why beauty and " +
        "attention to detail matter in work and life.",
    },
    {
      key: "relationships",
      label: "Improving relationships",
      angle:
        "Communication, listening, trust, showing up for people, professional " +
        "and personal relationships, giving and receiving feedback.",
    },
    {
      key: "business",
      label: "Business & work",
      angle:
        "Building things, leadership, decision-making, customers, focus, the " +
        "unglamorous parts of doing good work.",
    },
    {
      key: "growth",
      label: "Personal growth",
      angle:
        "Learning, changing your mind, resilience, habits, self-awareness, the " +
        "long game of getting better at something.",
    },
  ],

  // How the topic is chosen each run: "rotate" walks the list in order (using
  // the post history), "random" picks one at random.
  selection: process.env.TOPIC_SELECTION || "rotate",

  // Length guidance for the model, in words.
  targetWords: Number(process.env.TARGET_WORDS || 130),

  // How many previous posts to show the model so it doesn't repeat itself.
  historyContext: Number(process.env.HISTORY_CONTEXT || 8),

  // LinkedIn API version (YYYYMM). LinkedIn requires this header on the
  // versioned /rest endpoints. Bump it as LinkedIn releases new versions.
  linkedinApiVersion: process.env.LINKEDIN_API_VERSION || "202606",

  // Post visibility: PUBLIC or CONNECTIONS.
  visibility: process.env.LINKEDIN_VISIBILITY || "PUBLIC",
};
