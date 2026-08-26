export interface DocItem {
  id: string;
  label: string;
  note: string;
  group: string;
}

export const documentChecklist: DocItem[] = [
  { id: "notice", label: "Interview appointment notice", note: "Bring the original. Confirm the date, time, and field office.", group: "Essentials" },
  { id: "id", label: "Government photo ID", note: "Driver license or state ID for each person attending.", group: "Essentials" },
  { id: "passport", label: "Passport(s)", note: "Current and expired passports, including the visa page and I-94.", group: "Essentials" },
  { id: "ead", label: "Employment Authorization (EAD)", note: "Your work permit card, if issued.", group: "Essentials" },
  { id: "ap", label: "Advance Parole document", note: "If you have a travel document.", group: "Essentials" },

  { id: "birth", label: "Birth certificate", note: "Certified copy with certified English translation if needed.", group: "Civil documents" },
  { id: "marriage", label: "Marriage certificate", note: "For marriage-based cases.", group: "Civil documents" },
  { id: "divorce", label: "Divorce decrees", note: "For any prior marriages, for you and your spouse.", group: "Civil documents" },
  { id: "kids-birth", label: "Children's birth certificates", note: "Listing both parents, where applicable.", group: "Civil documents" },

  { id: "medical", label: "Medical exam (I-693)", note: "Sealed envelope from the civil surgeon, if not already filed.", group: "Forms & filings" },
  { id: "i864", label: "Affidavit of Support (I-864)", note: "Plus the sponsor's most recent tax return.", group: "Forms & filings" },
  { id: "taxes", label: "Tax returns / transcripts", note: "IRS transcripts for the last 3 years.", group: "Forms & filings" },
  { id: "employment", label: "Employment verification", note: "Recent pay stubs and an employer letter.", group: "Forms & filings" },

  { id: "lease", label: "Lease or mortgage", note: "Showing both spouses' names.", group: "Shared-life evidence" },
  { id: "joint-bank", label: "Joint bank statements", note: "A few recent months.", group: "Shared-life evidence" },
  { id: "insurance", label: "Insurance policies", note: "Health, auto, or life listing each other as beneficiary.", group: "Shared-life evidence" },
  { id: "photos", label: "Photos together over time", note: "With family and friends, across your relationship.", group: "Shared-life evidence" },
  { id: "bills", label: "Joint bills & utilities", note: "Accounts in both names.", group: "Shared-life evidence" },
];
