// Curated practice questions for the USCIS Form I-485 (Adjustment of Status)
// green-card interview. These are common, publicly-known question patterns used
// for practice ONLY. They are not the exact questions any officer will ask, and
// nothing here is legal advice. Always answer truthfully and consult a licensed
// immigration attorney for your case.

export type Question = {
  id: string;
  categoryId: string;
  prompt: string;
  tip?: string;
};

export type Category = {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
  accent: string;
};

export const categories: Category[] = [
  {
    id: 'eligibility',
    title: 'Eligibility & Background',
    emoji: '📋',
    blurb: 'Who you are and why you qualify to adjust status.',
    accent: '#0B7A5B',
  },
  {
    id: 'admissibility',
    title: 'Admissibility ("Have you ever")',
    emoji: '⚖️',
    blurb: 'The Part 8 "have you ever" bars every applicant is asked to confirm.',
    accent: '#C1442E',
  },
  {
    id: 'application',
    title: 'Your I-485 Application',
    emoji: '🗂️',
    blurb: 'Details straight off the forms you filed — know them cold.',
    accent: '#0E6BA8',
  },
  {
    id: 'history',
    title: 'Immigration & Travel History',
    emoji: '🛂',
    blurb: 'How you entered, your status history, and trips abroad.',
    accent: '#6C4AB6',
  },
  {
    id: 'marriage',
    title: 'Marriage & Relationship (Stokes)',
    emoji: '💍',
    blurb: 'How you met, your history together, and proof the marriage is real.',
    accent: '#B83280',
  },
  {
    id: 'daily-life',
    title: 'Daily Life & Household (Stokes)',
    emoji: '🏠',
    blurb: 'The small everyday details a real couple would both know.',
    accent: '#B8791C',
  },
  {
    id: 'employment',
    title: 'Employment-Based',
    emoji: '💼',
    blurb: 'Your job offer, employer, and role for EB adjustment.',
    accent: '#1E8E5A',
  },
  {
    id: 'financial',
    title: 'Financial & Public Charge',
    emoji: '💵',
    blurb: 'The Affidavit of Support and how you will be supported.',
    accent: '#0A8C8C',
  },
];

export const questions: Question[] = [
  // ---------------- Eligibility & Background ----------------
  {
    id: 'elig-1',
    categoryId: 'eligibility',
    prompt: 'Please state your full name, date of birth, and country of birth.',
    tip: 'Answer exactly as written on your I-485. Have your correct legal name and any prior names ready.',
  },
  {
    id: 'elig-2',
    categoryId: 'eligibility',
    prompt: 'What is your current address, and how long have you lived there?',
    tip: 'It should match the most recent address on your application. Mention if you filed an AR-11 change of address.',
  },
  {
    id: 'elig-3',
    categoryId: 'eligibility',
    prompt: 'On what basis are you applying for adjustment of status?',
    tip: 'Name your category clearly — e.g. spouse of a U.S. citizen, employment-based, asylee, etc.',
  },
  {
    id: 'elig-4',
    categoryId: 'eligibility',
    prompt: 'Who is the petitioner in your case, and what is your relationship to them?',
    tip: 'Know their full name, status (citizen or LPR), and how you are related.',
  },
  {
    id: 'elig-5',
    categoryId: 'eligibility',
    prompt: 'Have you ever used any other names, including a maiden name or nickname?',
    tip: 'Disclose every prior name. Inconsistencies with your record raise flags.',
  },
  {
    id: 'elig-6',
    categoryId: 'eligibility',
    prompt: 'What is your current immigration status, and when does it expire?',
    tip: 'Know your latest status (e.g. H-1B, F-1, parole, TPS) and its validity dates.',
  },
  {
    id: 'elig-7',
    categoryId: 'eligibility',
    prompt: 'Do you have any children? Please give their names and dates of birth.',
    tip: 'Include all children — biological, adopted, and stepchildren — whether or not they live with you.',
  },
  {
    id: 'elig-8',
    categoryId: 'eligibility',
    prompt: 'What is your current occupation and where do you work?',
    tip: 'Keep it consistent with your employment history on the form and any tax records.',
  },
  {
    id: 'elig-9',
    categoryId: 'eligibility',
    prompt: 'Raise your right hand — do you swear that everything you tell me today is the truth?',
    tip: 'The interview begins under oath. This is your reminder that honesty is non-negotiable.',
  },

  // ---------------- Admissibility ("Have you ever") ----------------
  {
    id: 'adm-1',
    categoryId: 'admissibility',
    prompt: 'Have you EVER been arrested, cited, charged, or detained by any law enforcement officer, anywhere in the world?',
    tip: 'Disclose everything, even dismissed or expunged cases. Bring certified dispositions. "Cited" includes some traffic stops.',
  },
  {
    id: 'adm-2',
    categoryId: 'admissibility',
    prompt: 'Have you ever been a member of, or in any way associated with, a communist or totalitarian party?',
    tip: 'Answer honestly. If yes, context matters — a waiver or exception may apply. Do not guess; consult counsel.',
  },
  {
    id: 'adm-3',
    categoryId: 'admissibility',
    prompt: 'Have you ever engaged in, ordered, or assisted in genocide, torture, or the killing of any person?',
    tip: 'These are standard Part 8 questions. Confirm your truthful answer calmly.',
  },
  {
    id: 'adm-4',
    categoryId: 'admissibility',
    prompt: 'Have you ever been involved with, or provided support to, a terrorist organization?',
    tip: 'A required question for every applicant. Answer directly.',
  },
  {
    id: 'adm-5',
    categoryId: 'admissibility',
    prompt: 'Have you ever knowingly committed a crime for which you were not arrested?',
    tip: 'This is broad and important. If anything applies, talk to an attorney before your interview.',
  },
  {
    id: 'adm-6',
    categoryId: 'admissibility',
    prompt: 'Have you ever been a habitual drunkard, or a trafficker or abuser of controlled substances?',
    tip: 'Drug-related admissions can trigger inadmissibility even without a conviction. Be careful and truthful.',
  },
  {
    id: 'adm-7',
    categoryId: 'admissibility',
    prompt: 'Have you ever lied to, or misrepresented a fact to, any U.S. government official to gain an immigration benefit or entry?',
    tip: 'Misrepresentation is a serious bar. Review your entire history for consistency beforehand.',
  },
  {
    id: 'adm-8',
    categoryId: 'admissibility',
    prompt: 'Have you ever been ordered removed, deported, or excluded from the United States?',
    tip: 'Know your immigration court history. Prior orders can require special waivers.',
  },
  {
    id: 'adm-9',
    categoryId: 'admissibility',
    prompt: 'Have you ever received public assistance, or do you expect to receive it in the future?',
    tip: 'Answer about your own use of benefits. Understand which benefits count and which do not.',
  },
  {
    id: 'adm-10',
    categoryId: 'admissibility',
    prompt: 'Have you ever failed to file a required tax return or failed to pay taxes you owed?',
    tip: 'Tax compliance reflects good moral character. Bring transcripts if there is any question.',
  },

  // ---------------- Your I-485 Application ----------------
  {
    id: 'app-1',
    categoryId: 'application',
    prompt: 'Did you prepare this application yourself, or did someone help you? Did you read it before signing?',
    tip: 'You are responsible for everything on it. Confirm you reviewed it and it is accurate.',
  },
  {
    id: 'app-2',
    categoryId: 'application',
    prompt: 'Is everything in your application still true and correct today? Are there any changes?',
    tip: 'The officer may let you correct errors under oath. Note anything that changed since filing — new job, address, child.',
  },
  {
    id: 'app-3',
    categoryId: 'application',
    prompt: 'What is your A-number (Alien Registration Number)?',
    tip: 'Memorize it. It appears on your notices and card.',
  },
  {
    id: 'app-4',
    categoryId: 'application',
    prompt: 'List every address where you have lived in the last five years.',
    tip: 'Match the form. Gaps or mismatches invite follow-up questions.',
  },
  {
    id: 'app-5',
    categoryId: 'application',
    prompt: 'List your employment history for the last five years, including dates and employers.',
    tip: 'Keep dates consistent with what you filed and with your tax and pay records.',
  },
  {
    id: 'app-6',
    categoryId: 'application',
    prompt: 'Have you ever filed any other immigration applications or petitions? What happened to them?',
    tip: 'Prior filings (asylum, other petitions, visas) are in your file. Know the outcomes.',
  },
  {
    id: 'app-7',
    categoryId: 'application',
    prompt: 'Are all the documents you submitted genuine and unaltered?',
    tip: 'Only ever submit authentic documents. Fraudulent documents end cases permanently.',
  },

  // ---------------- Immigration & Travel History ----------------
  {
    id: 'hist-1',
    categoryId: 'history',
    prompt: 'When and how did you last enter the United States?',
    tip: 'Give the date, port of entry, and the status you were admitted or paroled in. This must match your I-94.',
  },
  {
    id: 'hist-2',
    categoryId: 'history',
    prompt: 'Were you inspected and admitted or paroled when you entered? What document did you use?',
    tip: 'A lawful entry is often central to eligibility. Know your visa/parole and I-94 details.',
  },
  {
    id: 'hist-3',
    categoryId: 'history',
    prompt: 'Have you ever overstayed a visa or been out of status in the United States?',
    tip: 'Be precise about dates. Some categories forgive overstay; others do not. Know your situation.',
  },
  {
    id: 'hist-4',
    categoryId: 'history',
    prompt: 'List every country you have traveled to in the last five years and the reason for each trip.',
    tip: 'Your passport stamps tell the story. Explain long or repeated trips clearly.',
  },
  {
    id: 'hist-5',
    categoryId: 'history',
    prompt: 'Have you ever worked in the United States without authorization?',
    tip: 'Unauthorized work matters differently by category. Answer honestly and know your dates.',
  },
  {
    id: 'hist-6',
    categoryId: 'history',
    prompt: 'Have you ever been denied a visa or refused entry at a U.S. port of entry?',
    tip: 'Prior refusals are on record. Explain the circumstances briefly and truthfully.',
  },
  {
    id: 'hist-7',
    categoryId: 'history',
    prompt: 'Have you traveled outside the U.S. while your I-485 was pending? Did you have Advance Parole?',
    tip: 'Traveling without Advance Parole can abandon a pending application. Know the rule for your category.',
  },

  // ---------------- Marriage & Relationship (Stokes) ----------------
  {
    id: 'mar-1',
    categoryId: 'marriage',
    prompt: 'How did the two of you first meet? Walk me through it.',
    tip: 'Tell the real story in your own words. Details you both remember — place, date, who introduced you — carry weight.',
  },
  {
    id: 'mar-2',
    categoryId: 'marriage',
    prompt: 'When and where did you get married? Who was there?',
    tip: 'Date, venue, and a few guests or witnesses. Photos help but your memory matters more.',
  },
  {
    id: 'mar-3',
    categoryId: 'marriage',
    prompt: 'When did you decide to get married, and how did the proposal happen?',
    tip: 'The engagement story is a classic pair question. Recall it the way it actually happened.',
  },
  {
    id: 'mar-4',
    categoryId: 'marriage',
    prompt: 'How long did you date before you moved in together? Before you married?',
    tip: 'Timelines should match between spouses and align with your evidence (leases, photos, messages).',
  },
  {
    id: 'mar-5',
    categoryId: 'marriage',
    prompt: 'Describe your wedding day. Was there a ceremony, a reception, a honeymoon?',
    tip: 'Small shared details — the food, the weather, who gave a toast — show a genuine shared experience.',
  },
  {
    id: 'mar-6',
    categoryId: 'marriage',
    prompt: 'Had either of you been married before? What happened to those marriages?',
    tip: 'Disclose prior marriages and divorces with dates. Bring divorce decrees if relevant.',
  },
  {
    id: 'mar-7',
    categoryId: 'marriage',
    prompt: 'Have you met each other’s families? Tell me about them.',
    tip: 'Names of parents and siblings, and whether you have spent time together, show real integration.',
  },
  {
    id: 'mar-8',
    categoryId: 'marriage',
    prompt: 'What did you do together for your last birthday or your last anniversary?',
    tip: 'Recent shared events are hard to fake. Recall the actual day.',
  },
  {
    id: 'mar-9',
    categoryId: 'marriage',
    prompt: 'Do you have children together, or plans to? Tell me about that.',
    tip: 'Answer honestly for your situation; there is no "right" family plan.',
  },
  {
    id: 'mar-10',
    categoryId: 'marriage',
    prompt: 'What languages do you speak to each other at home?',
    tip: 'Officers sometimes probe how you actually communicate. Be straightforward.',
  },
  {
    id: 'mar-11',
    categoryId: 'marriage',
    prompt: 'What do you love about your spouse? What first attracted you to them?',
    tip: 'Speak naturally. A genuine, specific answer reads very differently from a rehearsed one.',
  },

  // ---------------- Daily Life & Household (Stokes) ----------------
  {
    id: 'daily-1',
    categoryId: 'daily-life',
    prompt: 'Describe your home. How many bedrooms and bathrooms? What side of the bed does each of you sleep on?',
    tip: 'These physical details are the classic Stokes-interview separation questions. Answer from real life.',
  },
  {
    id: 'daily-2',
    categoryId: 'daily-life',
    prompt: 'Who wakes up first in the morning? What is your morning routine?',
    tip: 'Everyday rhythms should match between spouses. Describe a normal weekday.',
  },
  {
    id: 'daily-3',
    categoryId: 'daily-life',
    prompt: 'Who does the cooking, the cleaning, and pays the bills in your household?',
    tip: 'There is no correct division — just describe how you two actually split things.',
  },
  {
    id: 'daily-4',
    categoryId: 'daily-life',
    prompt: 'What did you have for dinner last night, and who cooked it?',
    tip: 'A textbook consistency check. Recall the real answer.',
  },
  {
    id: 'daily-5',
    categoryId: 'daily-life',
    prompt: 'What color is your partner’s toothbrush? What brand of coffee or tea do you keep at home?',
    tip: 'Tiny household facts are meant to be things only a real couple would know. Do not overthink — just remember.',
  },
  {
    id: 'daily-6',
    categoryId: 'daily-life',
    prompt: 'Do you own or rent? Whose name is on the lease or mortgage?',
    tip: 'A joint lease or mortgage is strong evidence. Know the exact arrangement.',
  },
  {
    id: 'daily-7',
    categoryId: 'daily-life',
    prompt: 'Do you have joint bank accounts, insurance, or bills? Whose names are on them?',
    tip: 'Commingled finances matter. Be ready to name the accounts and policies you share.',
  },
  {
    id: 'daily-8',
    categoryId: 'daily-life',
    prompt: 'What are your partner’s hobbies? What do they do for fun?',
    tip: 'Knowing each other’s interests signals a real relationship. Answer specifically.',
  },
  {
    id: 'daily-9',
    categoryId: 'daily-life',
    prompt: 'How do you celebrate holidays, and where did you spend the last one?',
    tip: 'Shared traditions and recent holidays are good, verifiable memories.',
  },
  {
    id: 'daily-10',
    categoryId: 'daily-life',
    prompt: 'Do you have any pets? Who takes care of them?',
    tip: 'A small but common question. Answer from real life.',
  },
  {
    id: 'daily-11',
    categoryId: 'daily-life',
    prompt: 'What car(s) do you have, and who drives which one?',
    tip: 'Vehicles, parking, and commutes are everyday details a real couple shares.',
  },

  // ---------------- Employment-Based ----------------
  {
    id: 'emp-1',
    categoryId: 'employment',
    prompt: 'Who is your sponsoring employer, and what is your job title?',
    tip: 'Match the job offer and I-140/PERM exactly — employer name, title, and location.',
  },
  {
    id: 'emp-2',
    categoryId: 'employment',
    prompt: 'Describe your job duties and responsibilities.',
    tip: 'Be consistent with the labor certification. Explain your actual day-to-day work.',
  },
  {
    id: 'emp-3',
    categoryId: 'employment',
    prompt: 'What is your salary, and does it meet the offered wage?',
    tip: 'Know the offered wage on your petition and your current pay.',
  },
  {
    id: 'emp-4',
    categoryId: 'employment',
    prompt: 'Do you still intend to work for this employer after you get your green card?',
    tip: 'Employment-based adjustment requires a bona fide, continuing job offer (unless you have ported under AC21).',
  },
  {
    id: 'emp-5',
    categoryId: 'employment',
    prompt: 'What are your qualifications — degrees, licenses, and experience — for this position?',
    tip: 'Bring diplomas and evaluations. Your credentials should support the petition’s requirements.',
  },
  {
    id: 'emp-6',
    categoryId: 'employment',
    prompt: 'Have you changed employers or used AC21 portability since your I-485 was filed?',
    tip: 'If you ported to a same-or-similar job, be ready to explain it and provide a supplement (I-485J).',
  },

  // ---------------- Financial & Public Charge ----------------
  {
    id: 'fin-1',
    categoryId: 'financial',
    prompt: 'Who is your financial sponsor, and did they file an Affidavit of Support (Form I-864)?',
    tip: 'Know your sponsor, their income, and whether a joint sponsor was needed.',
  },
  {
    id: 'fin-2',
    categoryId: 'financial',
    prompt: 'Does your sponsor’s income meet the required level for your household size?',
    tip: 'The threshold is generally 125% of the Federal Poverty Guidelines. Know your household size.',
  },
  {
    id: 'fin-3',
    categoryId: 'financial',
    prompt: 'How will you support yourself in the United States?',
    tip: 'Point to your own income, your spouse/sponsor’s support, and assets. Show you will not become a public charge.',
  },
  {
    id: 'fin-4',
    categoryId: 'financial',
    prompt: 'Do you understand that your sponsor is financially responsible for you?',
    tip: 'The I-864 is a legally enforceable contract. Both of you should understand the obligation.',
  },
  {
    id: 'fin-5',
    categoryId: 'financial',
    prompt: 'Have you filed federal income tax returns for the years you were required to?',
    tip: 'Bring recent tax transcripts. Sponsors must show their most recent return with the I-864.',
  },
  {
    id: 'fin-6',
    categoryId: 'financial',
    prompt: 'Do you have health insurance, and do you have any significant debts?',
    tip: 'Part of the totality-of-circumstances public-charge review. Answer plainly.',
  },
];

export function questionsForCategory(categoryId: string): Question[] {
  return questions.filter((q) => q.categoryId === categoryId);
}

export function categoryById(categoryId: string): Category | undefined {
  return categories.find((c) => c.id === categoryId);
}

export function questionCount(categoryId: string): number {
  return questions.reduce((n, q) => (q.categoryId === categoryId ? n + 1 : n), 0);
}
