# LinkedIn Content Agent

A standalone agent that generates and auto-posts original LinkedIn updates on
**motivation, aesthetics, improving relationships, business, and personal
growth** using the Claude API.

The project lives in [`agent/`](./agent) — see
[`agent/README.md`](./agent/README.md) for setup, usage, and scheduled
auto-posting.

```bash
cd agent
npm install
cp .env.example .env   # add ANTHROPIC_API_KEY + LINKEDIN_ACCESS_TOKEN
node post.mjs          # preview a post (does not publish)
node post.mjs --post   # publish to LinkedIn
```
