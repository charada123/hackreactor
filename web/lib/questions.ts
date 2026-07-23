import type { Category, Question, InterviewType } from "./types";

// Publicly-known USCIS I-485 interview question patterns, for practice only.
// Not legal advice; not the exact questions any officer will ask.

export const interviewTypeLabels: Record<InterviewType, string> = {
  marriage: "Marriage-Based",
  family: "Family-Based",
  employment: "Employment-Based",
  diversity: "Diversity Visa",
  asylee: "Refugee / Asylee",
};

export const categories: Category[] = [
  { id: "relationship", title: "Relationship History", emoji: "💞", blurb: "How you met, dated, and decided to marry." },
  { id: "marriage", title: "Marriage & Wedding", emoji: "💍", blurb: "The ceremony, guests, and your life as a couple." },
  { id: "daily-life", title: "Daily Married Life", emoji: "🏠", blurb: "The small everyday details a real couple shares." },
  { id: "family", title: "Family & Children", emoji: "👨‍👩‍👧", blurb: "Relatives, in-laws, and children." },
  { id: "employment", title: "Employment", emoji: "💼", blurb: "Your job, employer, and role." },
  { id: "immigration", title: "Immigration History", emoji: "🛂", blurb: "Entries, status, and prior applications." },
  { id: "travel", title: "Travel", emoji: "✈️", blurb: "Trips abroad and advance parole." },
  { id: "address", title: "Address History", emoji: "📮", blurb: "Where you have lived." },
  { id: "financial", title: "Financial Support", emoji: "💵", blurb: "The Affidavit of Support and finances." },
  { id: "admissibility", title: "Security & Admissibility", emoji: "⚖️", blurb: "The Part 8 'have you ever' bars." },
  { id: "criminal", title: "Criminal History", emoji: "🚔", blurb: "Arrests, citations, and charges." },
  { id: "taxes", title: "Taxes", emoji: "🧾", blurb: "Filing history and compliance." },
  { id: "medical", title: "Medical", emoji: "🩺", blurb: "The I-693 medical exam." },
  { id: "random", title: "Random Officer Questions", emoji: "🎲", blurb: "The unexpected details officers probe." },
];

export const questions: Question[] = [
  // Relationship History
  { id: "rel-1", categoryId: "relationship", prompt: "How did you and your spouse first meet? Walk me through it.", tip: "Tell the real story in your own words — place, date, who introduced you." },
  { id: "rel-2", categoryId: "relationship", prompt: "When was your first date, and what did you do?", tip: "Recent-feeling, specific details are hard to fake." },
  { id: "rel-3", categoryId: "relationship", prompt: "How long did you date before you moved in together?", tip: "Timelines should match your spouse and your evidence." },
  { id: "rel-4", categoryId: "relationship", prompt: "How did the proposal happen? Who proposed?", tip: "The engagement story is a classic pair question." },
  { id: "rel-5", categoryId: "relationship", prompt: "What first attracted you to your spouse?", tip: "Speak naturally — a genuine answer reads very differently from a scripted one." },
  { id: "rel-6", categoryId: "relationship", prompt: "What language do you speak to each other at home?", tip: "Officers may probe how you actually communicate." },

  // Marriage & Wedding
  { id: "mar-1", categoryId: "marriage", prompt: "When and where did you get married?", tip: "Date and venue. It should match your marriage certificate." },
  { id: "mar-2", categoryId: "marriage", prompt: "Who attended your wedding? Name a few guests.", tip: "A few real names and roles help." },
  { id: "mar-3", categoryId: "marriage", prompt: "Describe your wedding day. Was there a reception?", tip: "The food, the weather, who gave a toast — small shared memories." },
  { id: "mar-4", categoryId: "marriage", prompt: "What color were the decorations or flowers?", tip: "A textbook separation question. Recall the real answer." },
  { id: "mar-5", categoryId: "marriage", prompt: "Did you have a honeymoon? Where did you go?", tip: "Answer from real life; there is no 'right' honeymoon." },
  { id: "mar-6", categoryId: "marriage", prompt: "Had either of you been married before? What happened?", tip: "Disclose prior marriages with dates; bring divorce decrees." },

  // Daily Married Life
  { id: "day-1", categoryId: "daily-life", prompt: "Describe your home. How many bedrooms and bathrooms?", tip: "Classic Stokes physical-detail question." },
  { id: "day-2", categoryId: "daily-life", prompt: "Which side of the bed does each of you sleep on?", tip: "Answer from real life — don't overthink it." },
  { id: "day-3", categoryId: "daily-life", prompt: "What did you have for dinner last night, and who cooked?", tip: "A consistency check between spouses." },
  { id: "day-4", categoryId: "daily-life", prompt: "Who wakes up first? What is your morning routine?", tip: "Everyday rhythms should match." },
  { id: "day-5", categoryId: "daily-life", prompt: "Who pays the utilities and the rent or mortgage?", tip: "Know the exact arrangement; joint bills are strong evidence." },
  { id: "day-6", categoryId: "daily-life", prompt: "What are your spouse's hobbies?", tip: "Knowing each other's interests signals a real relationship." },
  { id: "day-7", categoryId: "daily-life", prompt: "Do you have any pets? Who takes care of them?", tip: "Small but common. Answer from real life." },

  // Family & Children
  { id: "fam-1", categoryId: "family", prompt: "Have you met your spouse's parents? Tell me about them.", tip: "Names and whether you've spent time together." },
  { id: "fam-2", categoryId: "family", prompt: "Do you have children together, or from prior relationships?", tip: "Include all children, biological and step, with dates of birth." },
  { id: "fam-3", categoryId: "family", prompt: "How do you and your spouse split childcare and chores?", tip: "There's no correct division — describe how you actually split things." },
  { id: "fam-4", categoryId: "family", prompt: "How did your families react to your marriage?", tip: "Answer honestly for your situation." },

  // Employment
  { id: "emp-1", categoryId: "employment", prompt: "Who is your employer, and what is your job title?", tip: "Match your forms and any petition exactly." },
  { id: "emp-2", categoryId: "employment", prompt: "Describe your job duties.", tip: "Be consistent with a labor certification, if applicable." },
  { id: "emp-3", categoryId: "employment", prompt: "What is your salary?", tip: "Keep it consistent with pay and tax records." },
  { id: "emp-4", categoryId: "employment", prompt: "Do you intend to keep working for this employer after you get your green card?", tip: "Employment-based cases need a bona fide, continuing job offer (unless ported under AC21)." },

  // Immigration History
  { id: "imm-1", categoryId: "immigration", prompt: "When and how did you last enter the United States?", tip: "Date, port of entry, and the status you were admitted in — matches your I-94." },
  { id: "imm-2", categoryId: "immigration", prompt: "Were you inspected and admitted or paroled? What document did you use?", tip: "A lawful entry is often central to eligibility." },
  { id: "imm-3", categoryId: "immigration", prompt: "Have you ever overstayed a visa or been out of status?", tip: "Be precise about dates; know how it affects your category." },
  { id: "imm-4", categoryId: "immigration", prompt: "Have you filed any other immigration applications before? What happened?", tip: "Prior filings are in your file — know the outcomes." },
  { id: "imm-5", categoryId: "immigration", prompt: "What is your A-number?", tip: "Memorize it; it's on your notices and card." },

  // Travel
  { id: "trv-1", categoryId: "travel", prompt: "List the countries you've traveled to in the last five years and why.", tip: "Your passport stamps tell the story." },
  { id: "trv-2", categoryId: "travel", prompt: "Did you travel outside the U.S. while your I-485 was pending? Did you have Advance Parole?", tip: "Traveling without Advance Parole can abandon a pending application." },
  { id: "trv-3", categoryId: "travel", prompt: "When was your last international trip, and who did you travel with?", tip: "Recent trips are easy to verify — recall the real one." },

  // Address History
  { id: "adr-1", categoryId: "address", prompt: "What is your current address, and how long have you lived there?", tip: "Should match the latest address on your application." },
  { id: "adr-2", categoryId: "address", prompt: "List every address where you've lived in the last five years.", tip: "Match the form; gaps invite follow-ups." },
  { id: "adr-3", categoryId: "address", prompt: "Whose name is on the lease or mortgage?", tip: "A joint lease is strong evidence of a shared life." },

  // Financial Support
  { id: "fin-1", categoryId: "financial", prompt: "Who is your financial sponsor, and did they file Form I-864?", tip: "Know your sponsor and whether a joint sponsor was needed." },
  { id: "fin-2", categoryId: "financial", prompt: "Does your sponsor's income meet the required level for your household size?", tip: "Threshold is generally 125% of the Federal Poverty Guidelines." },
  { id: "fin-3", categoryId: "financial", prompt: "How will you support yourself in the United States?", tip: "Point to income, your sponsor's support, and assets." },
  { id: "fin-4", categoryId: "financial", prompt: "Do you have joint bank accounts or shared insurance? Whose names are on them?", tip: "Commingled finances matter — be ready to name them." },

  // Security & Admissibility
  { id: "adm-1", categoryId: "admissibility", prompt: "Have you EVER been a member of a communist or totalitarian party?", tip: "Answer honestly; if yes, context matters — consult counsel." },
  { id: "adm-2", categoryId: "admissibility", prompt: "Have you ever been involved with or supported a terrorist organization?", tip: "A required Part 8 question. Answer directly." },
  { id: "adm-3", categoryId: "admissibility", prompt: "Have you ever engaged in, ordered, or assisted in genocide, torture, or killing?", tip: "Standard admissibility question — confirm your truthful answer calmly." },
  { id: "adm-4", categoryId: "admissibility", prompt: "Have you ever lied to a U.S. official to gain an immigration benefit or entry?", tip: "Misrepresentation is a serious bar. Review your history for consistency." },
  { id: "adm-5", categoryId: "admissibility", prompt: "Have you ever received or do you expect to receive public assistance?", tip: "Understand which benefits count and which do not." },
  { id: "adm-6", categoryId: "admissibility", prompt: "Have you ever been ordered removed or deported from the United States?", tip: "Prior orders can require special waivers." },

  // Criminal History
  { id: "cri-1", categoryId: "criminal", prompt: "Have you EVER been arrested, cited, charged, or detained by any law enforcement, anywhere?", tip: "Disclose everything, even dismissed or expunged cases. Bring certified dispositions." },
  { id: "cri-2", categoryId: "criminal", prompt: "Have you ever committed a crime for which you were not arrested?", tip: "Broad and important — talk to an attorney before your interview if anything applies." },
  { id: "cri-3", categoryId: "criminal", prompt: "Have you ever been a habitual drunkard or trafficked or abused controlled substances?", tip: "Drug admissions can trigger inadmissibility even without a conviction." },

  // Taxes
  { id: "tax-1", categoryId: "taxes", prompt: "Have you filed federal income tax returns for the years you were required to?", tip: "Bring recent tax transcripts." },
  { id: "tax-2", categoryId: "taxes", prompt: "Do you file taxes jointly or separately with your spouse?", tip: "Joint filing is supporting evidence for a marriage case." },
  { id: "tax-3", categoryId: "taxes", prompt: "Do you owe any back taxes?", tip: "Tax compliance reflects good moral character." },

  // Medical
  { id: "med-1", categoryId: "medical", prompt: "Did you complete your medical exam (Form I-693) with a civil surgeon?", tip: "Bring the sealed envelope if you didn't file it with your application." },
  { id: "med-2", categoryId: "medical", prompt: "Are your vaccinations up to date per USCIS requirements?", tip: "The civil surgeon documents this on the I-693." },

  // Random Officer Questions
  { id: "rnd-1", categoryId: "random", prompt: "What is your spouse's date of birth?", tip: "Know it cold." },
  { id: "rnd-2", categoryId: "random", prompt: "What time does your spouse leave for work?", tip: "Everyday timing a real couple would know." },
  { id: "rnd-3", categoryId: "random", prompt: "What did you do together last weekend?", tip: "Recent shared events are hard to fabricate." },
  { id: "rnd-4", categoryId: "random", prompt: "What is your spouse's phone number?", tip: "A simple but common probe." },
  { id: "rnd-5", categoryId: "random", prompt: "How did you get to this interview today, and who came with you?", tip: "A warm-up question — answer plainly and truthfully." },
];

export function questionsForCategory(categoryId: string): Question[] {
  return questions.filter((q) => q.categoryId === categoryId);
}

export function categoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

// Category emphasis per interview type — used to bias the practice pools.
export const typeCategoryEmphasis: Record<InterviewType, string[]> = {
  marriage: ["relationship", "marriage", "daily-life", "family", "random"],
  family: ["family", "relationship", "immigration", "financial", "admissibility"],
  employment: ["employment", "immigration", "financial", "taxes", "admissibility"],
  diversity: ["immigration", "travel", "address", "admissibility", "financial"],
  asylee: ["immigration", "travel", "admissibility", "criminal", "address"],
};

export const DISCLAIMER =
  "GreenPass is an independent educational practice tool. It is not affiliated with USCIS or the U.S. government, does not provide legal advice, and cannot predict or guarantee the outcome of an immigration case. Practice questions are illustrative — actual USCIS questions vary. Always answer truthfully and consult a licensed immigration attorney about your case.";
