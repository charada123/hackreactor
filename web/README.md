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
| Mock-interview report (readiness, strengths, weak areas) | ✅ | `components/interview/InterviewReport` |
| **Video interview room** — voice-to-voice, webcam self-view, no typing | ✅ | `components/interview/VideoInterviewRoom` |
| Interviewer personas + voice preview, device/system check | ✅ | `components/interview/{PersonaSelector,DeviceCheck}` |
| Question bank + study mode (categories, flashcards, bookmarks) | ✅ | `app/questions` |
| Document checklist (grouped, progress tracked) | ✅ | `app/checklist` |
| Case timeline (milestones with dates) | ✅ | `app/timeline` |
| On-device persistence (progress, streak, bookmarks) | ✅ | `lib/store.ts` |
| Scripted offline fallback for the AI | ✅ | `lib/scripted.ts` |
| Database schema (Prisma / Postgres) | 📄 scaffolded | `prisma/schema.prisma` |
| Auth, admin portal, analytics charts, gamification | 🔜 planned | see below |

## The video interview (v2)

The interview is a **voice-to-voice video call**, not a chatbot — there is no
answer text box and no send button. Flow:

`setup → permission (privacy modal) → device check → video room → report`

- **Setup** — interview type, **interviewer persona** (with a voice preview),
  officer mood, difficulty, and length (Quick ~10m / Standard ~20m / Full ~35–45m).
- **Device check** — camera, microphone, speaker, connection, lighting, and
  face visibility. You cannot begin until the **microphone is working**; a poor
  camera is only a warning.
- **Video room** — the AI officer (an animated professional persona placeholder)
  speaks each question aloud; your webcam shows in a draggable self-view. A
  real-time pipeline runs: mic input → **voice-activity / end-of-turn detection**
  → **speech-to-text** → adaptive next question → **text-to-speech** → synced
  officer animation. You can interrupt the officer (barge-in). Controls: mute,
  camera on/off, flip camera, hide self-view, captions (off by default),
  fullscreen, end. Only discreet status cues appear — *Officer speaking*,
  *Listening…*, *Reviewing your response…* — never a live score.
- **Report** — scored feedback (clarity, specificity, consistency, confidence,
  completeness, pacing), weak areas, possible timeline inconsistencies,
  documents to review, a recommended next session, and the **full transcript**
  with per-answer guidance. Camera and mic are released the moment the interview
  ends. A **Delete session** control clears it from the browser.

### Provider abstraction (swap in production services)

The room depends only on interfaces in `lib/interviewProviders.ts`, with
browser-native implementations so the prototype works with no API keys:

| Interface | Prototype impl | Production swap |
| --- | --- | --- |
| `TextToSpeechProvider` | Web Speech `speechSynthesis` | streaming neural TTS / realtime voice |
| `SpeechToTextProvider` | Web Speech `SpeechRecognition` | streaming ASR |
| `RealtimeConversationProvider` | adaptive engine (`lib/interviewEngine.ts`) | Claude (`/api/interview`) or a realtime model |
| `AvatarProvider` | `OfficerVideo` (animated SVG persona) | real-time avatar / lip-synced video vendor |

No paid vendor is hard-coded; each is a documented plug-point.

### Privacy

Camera/mic are never accessed before explicit permission; the privacy modal
explains the posture up front. **Raw video and audio are never uploaded or
stored** — speech is transcribed on-device, and only the text transcript is kept
locally for your report. Media tracks stop automatically when the session ends,
and any session can be deleted.

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
├── components/
│   ├── interview/          # VideoInterviewRoom, OfficerVideo, ApplicantCamera,
│   │                       #   DeviceCheck, PersonaSelector, PermissionModal,
│   │                       #   EndInterviewDialog, MicrophoneTroubleshooter,
│   │                       #   InterviewReport
│   └── SiteNav, ScoreRing, Reveal, …
├── lib/
│   ├── useInterviewMedia.ts # camera/mic capture, audio level, VAD backbone
│   ├── interviewProviders.ts# STT/TTS/Avatar/RealtimeConversation abstraction
│   ├── interviewEngine.ts   # adaptive sections + content-aware follow-ups
│   ├── personas.ts          # interviewer personas
│   ├── anthropic.ts        # Claude client + officer/grader prompts (optional AI)
│   ├── scripted.ts         # offline answer-grading heuristics
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
