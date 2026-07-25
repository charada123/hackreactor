# LinkedIn Content Agent

Generates original LinkedIn posts about **motivation, aesthetics, improving
relationships, business, and personal growth** with the Claude API, and
auto-publishes them on a schedule.

- **Writes** each post fresh with Claude (Opus 5) in a voice you control.
- **Rotates** through topics and reads its own post history so it never repeats
  itself.
- **Publishes** to LinkedIn via the official Posts API.
- **Runs on a schedule** via GitHub Actions (or any cron), or on demand.

## How it works

```
config.mjs     topics, voice, length, LinkedIn settings
generate.mjs   asks Claude for one post (structured output: text + hashtags)
linkedin.mjs   publishes to https://api.linkedin.com/rest/posts
history.mjs    logs every post to data/history.json (audit + dedupe context)
post.mjs       ties it together: pick topic -> generate -> publish -> log
```

Each run picks the next topic in rotation, shows Claude the last several posts
so it stays fresh, generates a post, and (with `--post`) publishes it.

## Setup

```bash
cd agent
npm install
cp .env.example .env   # then fill in your keys
```

You need two credentials:

1. **`ANTHROPIC_API_KEY`** — from https://console.anthropic.com/
2. **`LINKEDIN_ACCESS_TOKEN`** — an OAuth 2.0 token with the `w_member_social`
   scope (add `openid` + `profile` if you want the agent to auto-detect your
   author URN). See _Getting a LinkedIn token_ below.

## Usage

```bash
# Dry run — generate and print a post, but DO NOT publish (safe default)
node post.mjs

# Publish for real
node post.mjs --post

# Force a specific topic
node post.mjs --topic business
node post.mjs --topic aesthetics --post
```

Topics: `motivation`, `aesthetics`, `relationships`, `business`, `growth`.
Edit the `topics` array in `config.mjs` to change them, or the `voice` string
to change how the posts sound.

## Scheduled auto-posting (GitHub Actions)

`.github/workflows/linkedin-post.yml` posts once every weekday at 14:00 UTC.

1. In the repo: **Settings → Secrets and variables → Actions** and add:
   - `ANTHROPIC_API_KEY`
   - `LINKEDIN_ACCESS_TOKEN`
   - `LINKEDIN_AUTHOR_URN` (optional)
2. Adjust the `cron:` line in the workflow to your preferred cadence.
3. Trigger a manual run from the **Actions** tab (with the _dry run_ box ticked
   the first time) to confirm it works.

The workflow commits the updated `data/history.json` after each post so rotation
and dedupe persist across runs.

## Getting a LinkedIn token

1. Create an app at https://www.linkedin.com/developers/apps and request the
   **Share on LinkedIn** (`w_member_social`) and **Sign In with LinkedIn using
   OpenID Connect** products.
2. Run the OAuth 2.0 authorization-code flow with scopes
   `w_member_social openid profile` to obtain an access token.
3. Put the token in `LINKEDIN_ACCESS_TOKEN`.

Member access tokens are relatively short-lived (about 60 days). Refresh it on
that cadence, or use a LinkedIn refresh token to mint new ones.

## Notes

- Posts are published as `PUBLIC` by default — change `LINKEDIN_VISIBILITY` to
  `CONNECTIONS` to restrict.
- Nothing is published without the `--post` flag, so you can always preview
  first.
