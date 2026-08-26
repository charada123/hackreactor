"use client";

// Shown when the microphone stops working mid-interview. Per requirements the
// interview PAUSES here — there is deliberately no "type your answer" fallback.

export function MicrophoneTroubleshooter({
  onRetry,
  onEnd,
}: {
  onRetry: () => void;
  onEnd: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lift">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#FDECE9]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C1442E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /><line x1="12" y1="19" x2="12" y2="23" /></svg>
        </div>
        <h3 className="mt-4 text-lg font-extrabold tracking-tight">We can&apos;t hear you</h3>
        <p className="mt-1 text-sm text-ink-soft">
          The interview is paused. Let&apos;s get your microphone working again:
        </p>
        <ul className="mt-3 space-y-2 text-[13px] text-ink-soft">
          <li className="flex gap-2"><b className="text-brand-600">1.</b> Check that your mic isn&apos;t muted in your system or headset.</li>
          <li className="flex gap-2"><b className="text-brand-600">2.</b> Confirm this site still has microphone permission (address-bar icon).</li>
          <li className="flex gap-2"><b className="text-brand-600">3.</b> Close other apps that may be using the mic, then retry.</li>
        </ul>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <button onClick={onRetry} className="btn-primary flex-1 py-3">Retry microphone</button>
          <button onClick={onEnd} className="btn-ghost flex-1 py-3">End & see report</button>
        </div>
      </div>
    </div>
  );
}
