# GreenPass — AI USCIS Green Card Interview Practice

A premium web app that helps **Form I-485 (Adjustment of Status)** applicants
prepare for their USCIS green-card interview — realistic AI interview
simulations, instant feedback, a readiness score, a document checklist, and a
case timeline.

Built with **Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer
Motion**, with the AI officer powered by the **Claude API** and a built-in
scripted fallback so the whole app runs with or without an API key.

> ⚠️ **Educational tool only.** GreenPass does not provide legal advice and does
> not guarantee any interview outcome. The questions are common, publicly-known
> patterns — not the exact questions USCIS will ask. Always answer truthfully
> and consult a licensed immigration attorney about your specific case.

## Run it

```bash
cd web
npm install
cp .env.example .env.local   # optional — add ANTHROPIC_API_KEY for live AI
npm run dev                  # http://localhost:3000
```

- **With `ANTHROPIC_API_KEY` set** — the officer and the answer-grader are
  generated live by Claude (`claude-opus-4-8` by default; override with
  `ANTHROPIC_MODEL`). The officer asks one question at a time and follows up on
  your answers; a separate coach scores each answer.
- **Without a key** — the app falls back to a deterministic scripted officer and
  heuristic feedback, so every feature works offline with zero setup.

Production build: `npm run build && npm run start`.

## What's built

| Area | Status | Where |
| --- | --- | --- |
| Landing page (hero, features, testimonials, FAQ, CTA) | ✅ | `app/page.tsx` |
| Dashboard (readiness score, streak, sessions, recommendations) | ✅ | `app/dashboard` |
| **AI Interview Simulator** (type / mood / difficulty → live chat → report) | ✅ | `app/simulator` |
| Per-answer feedback (confidence, specificity, consistency, red flags) | ✅ | `app/api/feedback` + `lib/anthropic.ts` |
| Mock-interview report (readiness, strengths, weak areas) | ✅ | `app/simulator` |
| **Voice mode** — officer reads questions aloud (TTS) + dictate answers (STT) | ✅ | `lib/useVoice.ts` |
| Question bank + study mode (categories, flashcards, bookmarks) | ✅ | `app/questions` |
| Document checklist (grouped, progress tracked) | ✅ | `app/checklist` |
| Case timeline (milestones with dates) | ✅ | `app/timeline` |
| On-device persistence (progress, streak, bookmarks) | ✅ | `lib/store.ts` |
| Scripted offline fallback for the AI | ✅ | `lib/scripted.ts` |
| Database schema (Prisma / Postgres) | 📄 scaffolded | `prisma/schema.prisma` |
| Auth, admin portal, analytics charts, gamification | 🔜 planned | see below |

## Architecture

```
web/
├── app/
│   ├── page.tsx            # landing
│   ├── dashboard/          # readiness score + metrics
│   ├── simulator/          # the AI interview simulator (core)
│   ├── questions/          # question bank + study mode
│   ├── checklist/          # document checklist
│   ├── timeline/           # case timeline
│   └── api/
│       ├── interview/      # POST → officer's next question (Claude or scripted)
│       └── feedback/       # POST → scored answer feedback (Claude or scripted)
├── components/             # SiteNav, ScoreRing, Reveal, …
├── lib/
│   ├── anthropic.ts        # Claude client + officer/grader prompts
│   ├── scripted.ts         # offline fallback engine
│   ├── questions.ts        # question bank + categories
│   ├── documents.ts        # checklist data
│   ├── timeline.ts         # milestone data
│   ├── store.ts            # localStorage state + readiness/streak math
│   └── types.ts
└── prisma/schema.prisma    # DB models for the server-backed version
```

### AI safety guardrails

The officer prompt (`lib/anthropic.ts`) is constrained to: ask exactly one
question per turn, never give legal advice, **never suggest the applicant lie**,
and press on vague answers for specifics. The grader scores truthful,
well-organized answers higher — it never rewards fabrication.

## Roadmap (not yet built)

These were in scope but are deliberately deferred so the core ships solid:

- **Auth + server persistence** — wire `prisma/schema.prisma` to Supabase/Postgres
  and replace `lib/store.ts` reads/writes with API routes.
- **Analytics charts** — scores over time, category heat map (data is already
  captured per session).
- **Gamification** — streaks exist; add XP, levels, and achievement badges.
- **Admin portal** — manage questions, categories, and templates (the
  `QuestionBankItem` model is scaffolded).
- **Multilingual interviews** and **PDF report export**.

## Notes

- No account is required; practice history is private to the browser.
- The `web/` app is self-contained; it does not depend on anything else in this
  repository.
