export interface TimelineStep {
  id: string;
  label: string;
  note: string;
}

// Default adjustment-of-status milestones. Users can mark dates in the UI.
export const defaultTimeline: TimelineStep[] = [
  { id: "i130", label: "Filed I-130", note: "Petition for a relative (family/marriage cases)." },
  { id: "i485", label: "Filed I-485", note: "Application to adjust status." },
  { id: "biometrics", label: "Biometrics", note: "Fingerprints and photo at an ASC." },
  { id: "ead", label: "EAD approved", note: "Work permit issued." },
  { id: "ap", label: "Advance Parole", note: "Travel document issued." },
  { id: "medical", label: "Medical exam", note: "I-693 completed." },
  { id: "interview-scheduled", label: "Interview scheduled", note: "Notice received." },
  { id: "interview", label: "Interview complete", note: "Attended the USCIS interview." },
  { id: "decision", label: "Decision", note: "Approval or request for evidence." },
];
