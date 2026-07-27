// Configuration for the LinkedIn content agent.
//
// Everything the agent needs to know about *what* to post lives here. Secrets
// (API keys, LinkedIn token) come from the environment, never this file.

export const config = {
  // Claude model used to write posts. Opus 5 is the strongest general model.
  model: process.env.CLAUDE_MODEL || "claude-opus-5",

  // The domain the posts are framed for. The agent applies each theory to
  // this world, the way the author's real posts do.
  domain: [
    "You are Chris Harada, a leader in the medical device and medical",
    "aesthetics industry: high-touch B2B service, field service, device",
    "installs and training, customer experience, retention, and operational",
    "and service excellence. Frame ideas through this world by default.",
  ].join(" "),

  // The persona/voice — modelled on the author's real LinkedIn posts.
  voice: [
    "You write LinkedIn thought-leadership posts in a specific, consistent",
    "voice. Every post takes ONE named concept or theory, defines it plainly,",
    "and applies it to the medical device / aesthetics service world to land a",
    "motivating, practical lesson.",
    "",
    "Follow this structure closely:",
    "1. A titled headline as the first line, e.g. 'The [Concept]: How ...' or",
    "   'The [Concept] in [context]' or 'The [X] Rule/Power/Danger of ...'.",
    "2. A short hook that frames it in the industry ('In aesthetics, ...',",
    "   'In the medical device industry, ...') and raises a tension or question.",
    "3. Name and define the concept in one plain-language line:",
    "   'This is the [Theory]. In plain terms, [definition].'",
    "4. Make it concrete: a short bulleted list using '•' bullets, OR parallel",
    "   'If X? Then Y.' lines. Show the idea in real service/field situations.",
    "5. Turn it: contrast the opposite, then stack a few punchy one-line",
    "   sentences for rhythm.",
    "6. A 'What if ...' rhetorical line that lifts the reader's ambition.",
    "7. A motivating close of two short parallel lines",
    "   (e.g. 'Standards create consistency. Judgment creates loyalty.').",
    "8. End with a genuine engagement question, usually to 'your team'.",
    "",
    "Style: confident, warm, direct. Short one-line paragraphs with lots of",
    "white space. No emoji, or at most one, used rarely.",
    "Around 150-200 words.",
    "",
    "PUNCTUATION — strict rules:",
    "- NEVER use em dashes (—) or en dashes (–). Not once. Use a period, a",
    "  comma, a colon, or the word 'and' instead. When two clauses want a dash,",
    "  make them two short sentences.",
    "- Use plain hyphens only inside real compound words (e.g. high-touch).",
    "",
    "AVOID AI-sounding jargon and filler. Do not use words/phrases like: delve,",
    "dive in, unlock, leverage, elevate, harness, supercharge, game-changer,",
    "tapestry, testament, navigate the landscape, in today's fast-paced world,",
    "at the end of the day, when it comes to, it's not just X, it's Y, the",
    "power of, realm, robust, seamless, synergy, paradigm shift, needle-mover.",
    "Write like a real practitioner talking to peers, in concrete, plain words.",
  ].join("\n"),

  // The heart of the agent: real theories the posts teach and apply. Each run
  // picks one (by rotation or at random) and Claude writes a motivational post
  // that explains it and turns it into a practical takeaway. Grouped by the
  // category, which also drives the framing and hashtags.
  theories: [
    // Management
    { name: "Scientific Management Theory (Frederick Taylor)", category: "Management" },
    { name: "Administrative Management Theory (Henri Fayol)", category: "Management" },
    { name: "Bureaucratic Management Theory (Max Weber)", category: "Management" },
    { name: "Human Relations Theory (Elton Mayo)", category: "Management" },
    { name: "Systems Theory", category: "Management" },
    { name: "Contingency Theory", category: "Management" },
    { name: "Theory X and Theory Y (Douglas McGregor)", category: "Management" },
    { name: "Management by Objectives (Peter Drucker)", category: "Management" },
    { name: "Total Quality Management", category: "Management" },
    { name: "Lean Management", category: "Management" },

    // Motivation & Employees
    { name: "Maslow's Hierarchy of Needs", category: "Motivation" },
    { name: "Herzberg's Two-Factor Theory", category: "Motivation" },
    { name: "Vroom's Expectancy Theory", category: "Motivation" },
    { name: "Equity Theory (John Stacey Adams)", category: "Motivation" },
    { name: "Goal-Setting Theory (Locke and Latham)", category: "Motivation" },
    { name: "Self-Determination Theory", category: "Motivation" },
    { name: "Reinforcement Theory", category: "Motivation" },
    { name: "McClelland's Needs Theory", category: "Motivation" },

    // Leadership
    { name: "Trait Theory of Leadership", category: "Leadership" },
    { name: "Behavioral Leadership Theory", category: "Leadership" },
    { name: "Situational Leadership Theory", category: "Leadership" },
    { name: "Transformational Leadership Theory", category: "Leadership" },
    { name: "Transactional Leadership Theory", category: "Leadership" },
    { name: "Servant Leadership Theory", category: "Leadership" },
    { name: "Path-Goal Theory", category: "Leadership" },
    { name: "Leader-Member Exchange Theory", category: "Leadership" },

    // Strategy & Competition
    { name: "Porter's Five Forces", category: "Strategy" },
    { name: "Resource-Based View", category: "Strategy" },
    { name: "Dynamic Capabilities Theory", category: "Strategy" },
    { name: "Blue Ocean Strategy", category: "Strategy" },
    { name: "Competitive Advantage Theory", category: "Strategy" },
    { name: "Core Competency Theory", category: "Strategy" },
    { name: "Game Theory", category: "Strategy" },
    { name: "Strategic Fit Theory", category: "Strategy" },
    { name: "Disruptive Innovation Theory", category: "Strategy" },
    { name: "Ansoff Growth Matrix", category: "Strategy" },

    // Marketing & Consumer Behavior
    { name: "Marketing Mix Theory (4Ps and 7Ps)", category: "Marketing" },
    { name: "Market Segmentation Theory", category: "Marketing" },
    { name: "Consumer Decision-Making Theory", category: "Marketing" },
    { name: "AIDA Model", category: "Marketing" },
    { name: "Diffusion of Innovations (Everett Rogers)", category: "Marketing" },
    { name: "Brand Equity Theory", category: "Marketing" },
    { name: "Relationship Marketing Theory", category: "Marketing" },
    { name: "Customer Lifetime Value Theory", category: "Marketing" },
    { name: "Technology Acceptance Model", category: "Marketing" },

    // Organization & Operations
    { name: "Organizational Culture Theory (Edgar Schein)", category: "Organization" },
    { name: "Organizational Learning Theory", category: "Organization" },
    { name: "Institutional Theory", category: "Organization" },
    { name: "Agency Theory", category: "Organization" },
    { name: "Stakeholder Theory", category: "Organization" },
    { name: "Transaction Cost Economics", category: "Organization" },
    { name: "Supply Chain Management Theory", category: "Organization" },
    { name: "Theory of Constraints", category: "Organization" },
    { name: "Just-in-Time Theory", category: "Organization" },
    { name: "Six Sigma", category: "Organization" },

    // Entrepreneurship & Innovation
    { name: "Schumpeter's Innovation Theory", category: "Entrepreneurship" },
    { name: "Effectuation Theory", category: "Entrepreneurship" },
    { name: "Entrepreneurial Opportunity Theory", category: "Entrepreneurship" },
    { name: "Lean Startup Theory", category: "Entrepreneurship" },
    { name: "Creative Destruction", category: "Entrepreneurship" },
    { name: "Open Innovation Theory", category: "Entrepreneurship" },
    { name: "Business Model Innovation Theory", category: "Entrepreneurship" },

    // Finance & Economics
    { name: "Efficient Market Hypothesis", category: "Finance" },
    { name: "Modern Portfolio Theory", category: "Finance" },
    { name: "Capital Structure Theory", category: "Finance" },
    { name: "Modigliani-Miller Theorem", category: "Finance" },
    { name: "Prospect Theory", category: "Finance" },
    { name: "Principal-Agent Theory", category: "Finance" },
    { name: "Behavioral Finance Theory", category: "Finance" },
    { name: "Shareholder Value Theory", category: "Finance" },
  ],

  // How the theory is chosen each run: "rotate" walks the list in order (using
  // the post history), "random" picks one at random.
  selection: process.env.TOPIC_SELECTION || "rotate",

  // Length guidance for the model, in words.
  targetWords: Number(process.env.TARGET_WORDS || 180),

  // How many previous posts to show the model so it doesn't repeat itself.
  historyContext: Number(process.env.HISTORY_CONTEXT || 8),

  // LinkedIn API version (YYYYMM). LinkedIn requires this header on the
  // versioned /rest endpoints. Bump it as LinkedIn releases new versions
  // (they age out roughly 12 months after release).
  linkedinApiVersion: process.env.LINKEDIN_API_VERSION || "202606",

  // Post visibility: PUBLIC or CONNECTIONS.
  visibility: process.env.LINKEDIN_VISIBILITY || "PUBLIC",
};
