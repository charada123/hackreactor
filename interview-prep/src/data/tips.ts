export type TipSection = {
  id: string;
  title: string;
  emoji: string;
  points: string[];
};

export const tipSections: TipSection[] = [
  {
    id: 'before',
    title: 'Before the interview',
    emoji: '🗓️',
    points: [
      'Re-read your entire I-485 and every supporting form. You may be asked about any line.',
      'Organize originals: passport, I-94, birth/marriage certificates, tax transcripts, and your interview notice.',
      'Bring a certified disposition for every arrest or citation, even if the case was dismissed.',
      'Confirm the date, time, and field office on your appointment notice. Arrive early.',
      'If you need an interpreter or an accommodation, arrange it ahead of time per USCIS rules.',
    ],
  },
  {
    id: 'during',
    title: 'During the interview',
    emoji: '🎙️',
    points: [
      'You will be placed under oath. Tell the truth — always. A single lie can sink an otherwise winnable case.',
      'Listen to the whole question before answering. It is fine to ask the officer to repeat or rephrase.',
      'Answer only what is asked. Do not volunteer unrelated information or ramble.',
      'If you do not know or do not remember, say so plainly. Guessing creates inconsistencies.',
      'Stay calm and polite. Nervousness is normal and officers expect it.',
    ],
  },
  {
    id: 'marriage',
    title: 'Marriage-based & Stokes tips',
    emoji: '💍',
    points: [
      'A "Stokes" interview separates spouses and asks each the same questions to compare answers.',
      'You cannot memorize a real life — focus on remembering true details, not scripting answers.',
      'Small mismatches (what you ate, who sleeps where) happen to real couples too; do not panic over one.',
      'Bring evidence of a shared life: joint lease/accounts, photos over time, insurance, trips, messages.',
      'Talk about your relationship naturally. Genuine, specific memories are the strongest evidence.',
    ],
  },
  {
    id: 'rights',
    title: 'Your rights & good practice',
    emoji: '🛡️',
    points: [
      'You have the right to be represented by an attorney; they can attend the interview with you.',
      'You may ask for clarification and take a moment to think before answering.',
      'Never sign anything you do not understand or that you believe is inaccurate.',
      'If an answer changed since you filed, it is okay to correct the record under oath.',
      'This app is practice only and is not legal advice — consult a licensed immigration attorney for your case.',
    ],
  },
];

export const DISCLAIMER =
  'This app is a practice tool only. The questions are common, publicly-known patterns — not the exact questions USCIS will ask — and nothing here is legal advice. Always answer truthfully and consult a licensed immigration attorney about your specific case.';
