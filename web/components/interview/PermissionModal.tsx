"use client";

// Shown BEFORE any camera/microphone access. Explains the why and the privacy
// posture, then requests permission on user action.

export function PermissionModal({
  onAllow,
  onCancel,
  requesting,
  error,
}: {
  onAllow: () => void;
  onCancel: () => void;
  requesting: boolean;
  error: string | null;
}) {
  const rows: [string, string][] = [
    ["Why we need access", "A realistic mock interview means the officer speaks to you and you answer by voice, on camera — just like the real thing."],
    ["Is video recorded?", "No. Your camera feed is shown live on your screen and never uploaded or saved."],
    ["Is audio recorded?", "No raw audio is stored. Speech is transcribed on-device so your answers can be scored."],
    ["Transcripts", "A text transcript is kept only for your report, in this browser. You can delete the session at any time."],
    ["When it ends", "Your camera and microphone are switched off automatically the moment the interview ends."],
  ];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-lift">
        <div className="border-b border-black/[0.06] p-6">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2455D6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
          </div>
          <h2 className="mt-4 text-xl font-extrabold tracking-tight">Camera & microphone access</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Your browser will ask for permission. Here&apos;s exactly how it&apos;s used.
          </p>
        </div>
        <div className="max-h-[45vh] divide-y divide-black/[0.06] overflow-y-auto">
          {rows.map(([q, aTxt]) => (
            <div key={q} className="px-6 py-3.5">
              <div className="text-[13px] font-bold">{q}</div>
              <div className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">{aTxt}</div>
            </div>
          ))}
        </div>
        {error && (
          <div className="mx-6 mt-4 rounded-xl bg-[#FDECE9] px-4 py-3 text-[13px] text-[#8f3324]">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-2 p-6 sm:flex-row-reverse">
          <button onClick={onAllow} disabled={requesting} className="btn-primary flex-1 py-3 disabled:opacity-50">
            {requesting ? "Requesting…" : "Allow camera & microphone"}
          </button>
          <button onClick={onCancel} className="btn-ghost flex-1 py-3">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
