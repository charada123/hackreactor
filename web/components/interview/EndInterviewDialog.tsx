"use client";

export function EndInterviewDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lift">
        <h3 className="text-lg font-extrabold tracking-tight">End the interview?</h3>
        <p className="mt-2 text-sm text-ink-soft">
          The officer will close the session and you&apos;ll go straight to your feedback report.
          Answers you&apos;ve given so far are kept; remaining sections are marked incomplete.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button onClick={onConfirm} className="btn bg-[#C1442E] py-3 text-white hover:opacity-90">
            End interview
          </button>
          <button onClick={onCancel} className="btn-ghost py-3">
            Keep going
          </button>
        </div>
      </div>
    </div>
  );
}
