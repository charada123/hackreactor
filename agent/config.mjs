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
    // Concept Series (curated — runs first). Behavioral and service concepts
    // applied to medical device / aesthetics field service. Each carries an
    // `angle` that steers the post toward the approved take.
    { name: "The Peak-End Rule", category: "Customer Experience",
      angle: "Clients remember the best moment and the goodbye, not the average. The last five minutes of a service call matter most." },
    { name: "The Service Recovery Paradox", category: "Customer Experience",
      angle: "A complaint handled brilliantly builds more loyalty than a flawless record. Your worst service days are your best retention chances." },
    { name: "Goodhart's Law", category: "Operational Excellence",
      angle: "When first-time-fix becomes a target, techs chase the number instead of the outcome. The metric stops telling the truth." },
    { name: "The Trust Equation", category: "Customer Relationships",
      angle: "Credibility plus reliability plus intimacy, divided by self-orientation. The rep who pushes the sale least often wins the account." },
    { name: "The Zeigarnik Effect", category: "Service Operations",
      angle: "An open ticket nags a clinic more than the repair itself. Closing the loop fast is retention, not admin." },
    { name: "Loss Aversion", category: "Behavioral Economics",
      angle: "Clinics fear downtime more than they crave new features. Sell uptime and protection, not just upgrades." },
    { name: "The Endowment Effect", category: "Behavioral Economics",
      angle: "Providers over-value the device and workflow they trained on. Use it to deepen loyalty, and respect it when introducing change." },
    { name: "Diffusion of Innovation", category: "Strategy",
      angle: "Every clinic adopts a new device differently. Early adopters and laggards need different support." },
    { name: "The IKEA Effect", category: "Customer Experience",
      angle: "People value what they help build. Involve providers in shaping their own workflow and they defend it." },
    { name: "Parkinson's Law", category: "Operations",
      angle: "Work expands to fill the time you give it. An install with no time box drifts; a tight one focuses." },
    { name: "The Pratfall Effect", category: "Trust and Communication",
      angle: "Admitting the one thing you cannot fix today builds more trust than pretending everything is fine." },
    { name: "The Dunning-Kruger Curve", category: "Training and Development",
      angle: "The most dangerous moment in provider training is right after they feel confident, before they are competent." },
    { name: "Chesterton's Fence", category: "Leadership and Process",
      angle: "Before you change a service process, learn why it exists. The annoying step may be load-bearing." },
    { name: "The Flywheel Effect", category: "Retention and Strategy",
      angle: "Retention compounds. One saved account funds the effort that saves the next." },
    { name: "Social Proof", category: "Marketing",
      angle: "One reference clinic outsells any spec sheet. Buyers trust peers over pitches." },
    { name: "The Reciprocity Principle", category: "Customer Relationships",
      angle: "The small unbilled favor creates an obligation that quietly shows up at renewal." },
    { name: "The Sunk Cost Fallacy", category: "Behavioral Economics",
      angle: "Clinics keep a device that no longer serves them because of what they already spent. Name it to move them forward." },
    { name: "The Availability Heuristic", category: "Brand and Customer Experience",
      angle: "Your last bad visit defines your whole brand in the customer's mind, no matter your averages." },
    { name: "The Kano Model", category: "Customer Experience",
      angle: "Some things delight a clinic, some are simply expected. Know the difference before you invest." },
    { name: "The Pygmalion Effect", category: "Leadership and Motivation",
      angle: "Providers and techs rise to the confidence you show them. Expectations shape performance." },

    // Management
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

    // Already published once. Placed last so the curated concept series above
    // runs first (rotation picks the entry after the last-posted one).
    { name: "Scientific Management Theory (Frederick Taylor)", category: "Management" },
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
