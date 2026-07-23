# I-485 Interview Prep

A mobile app (iOS **and** Android) that helps green-card applicants practice for
the USCIS **Form I-485 Adjustment of Status** interview. Built with
[Expo](https://expo.dev) / React Native, so a single codebase runs on both
platforms.

> ⚠️ **Practice tool only.** The questions are common, publicly-known patterns —
> not the exact questions USCIS will ask — and nothing in the app is legal
> advice. Always answer truthfully and consult a licensed immigration attorney
> about your specific case.

## What it does

- **Practice by topic** — flip through questions in eight categories, with
  guidance on what the officer is looking for on each one. Centered on the two
  most-asked areas: **general eligibility & admissibility** and
  **marriage-based / Stokes** questions.
- **Mock interview** — a timed, shuffled run through a mix of questions, one at
  a time, so you get used to answering under a little pressure.
- **Self-rating & progress** — mark each question Shaky / Okay / Confident. Your
  ratings are saved on-device and shown per topic on the Progress tab, so you
  know exactly what to drill next.
- **Interview tips** — how to prepare, what to bring, how Stokes interviews
  work, and your rights.
- Light and dark themes, fully offline — no account, no network, nothing leaves
  the device.

## Question categories

| Topic | Focus |
| --- | --- |
| 📋 Eligibility & Background | Who you are and why you qualify |
| ⚖️ Admissibility | The Part 8 "have you ever" bars |
| 🗂️ Your I-485 Application | Details straight off your forms |
| 🛂 Immigration & Travel History | Entries, status, trips abroad |
| 💍 Marriage & Relationship (Stokes) | How you met, your history, proof it's real |
| 🏠 Daily Life & Household (Stokes) | Everyday details a real couple shares |
| 💼 Employment-Based | Job offer, employer, role |
| 💵 Financial & Public Charge | Affidavit of Support and how you're supported |

## Run it

You need [Node.js](https://nodejs.org) 18+ and the Expo tooling. No Xcode or
Android Studio required to try it — install **Expo Go** on your phone.

```bash
cd interview-prep
npm install
npx expo start
```

Then:

- **iPhone** — open the Camera app and scan the QR code (opens in Expo Go).
- **Android** — open **Expo Go** and scan the QR code.
- **Simulator** — press `i` (iOS) or `a` (Android) in the terminal, if you have
  the simulators installed.

If dependency versions ever drift, align them to the installed Expo SDK with:

```bash
npx expo install --fix
```

## Build store-ready apps

Use [EAS Build](https://docs.expo.dev/build/introduction/) to produce real
`.ipa` / `.aab` binaries for the App Store and Google Play:

```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

## Project layout

```
interview-prep/
├── App.tsx                 # navigation: bottom tabs + practice/mock stack
├── app.json                # Expo config (name, bundle ids)
├── src/
│   ├── theme.ts            # light/dark design tokens
│   ├── storage.ts          # on-device progress (AsyncStorage)
│   ├── navigation.ts       # typed route params
│   ├── components/ui.tsx   # Card, Button, ConfidencePicker, etc.
│   ├── data/
│   │   ├── questions.ts     # the question bank (edit to add questions)
│   │   └── tips.ts          # prep tips + disclaimer
│   └── screens/            # Home, Categories, Practice, MockInterview, Progress, Tips
```

To add or edit questions, change the `questions` array in
`src/data/questions.ts` — everything else updates automatically.
