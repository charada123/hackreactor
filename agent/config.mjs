// Configuration for the LinkedIn content agent.
//
// Everything the agent needs to know about *what* to post lives here. Secrets
// (API keys, LinkedIn token) come from the environment, never this file.

export const config = {
  // Claude model used to write posts. Opus 5 is the strongest general model.
  model: process.env.CLAUDE_MODEL || "claude-opus-5",

  // The persona/voice the posts are written in. Tune this to sound like you.
  voice: [
    "You write motivational, idea-driven posts for an ambitious professional",
    "audience on LinkedIn. Your job is to take a real management, motivation,",
    "leadership, strategy, or business theory and turn it into a genuinely",
    "inspiring, practical lesson people can use today.",
    "Your voice is energising but grounded — never hustle-culture cliché,",
    "never clickbait, never a wall of emojis. You make the reader feel capable",
    "and clear-headed, not hyped. You teach one real idea well, then land it",
    "with a line that makes them want to act.",
  ].join(" "),

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
  targetWords: Number(process.env.TARGET_WORDS || 140),

  // How many previous posts to show the model so it doesn't repeat itself.
  historyContext: Number(process.env.HISTORY_CONTEXT || 8),

  // LinkedIn API version (YYYYMM). LinkedIn requires this header on the
  // versioned /rest endpoints. Bump it as LinkedIn releases new versions
  // (they age out roughly 12 months after release).
  linkedinApiVersion: process.env.LINKEDIN_API_VERSION || "202606",

  // Post visibility: PUBLIC or CONNECTIONS.
  visibility: process.env.LINKEDIN_VISIBILITY || "PUBLIC",
};
