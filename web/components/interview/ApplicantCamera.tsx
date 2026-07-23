"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Applicant self-view. Draggable floating window (so it never covers the
// officer's face on mobile). Mirrored, with a camera-off placeholder.

export function ApplicantCamera({
  attach,
  camOn,
  name = "You",
  onHide,
}: {
  attach: (el: HTMLVideoElement | null) => void;
  camOn: boolean;
  name?: string;
  onHide?: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  // Default to bottom-right within the parent.
  useEffect(() => {
    const parent = wrapRef.current?.parentElement;
    const self = wrapRef.current;
    if (!parent || !self) return;
    const pr = parent.getBoundingClientRect();
    setPos({ x: pr.width - self.offsetWidth - 16, y: pr.height - self.offsetHeight - 16 });
  }, []);

  const onDown = useCallback((e: React.PointerEvent) => {
    const self = wrapRef.current;
    if (!self) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const r = self.getBoundingClientRect();
    drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
  }, []);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    const parent = wrapRef.current?.parentElement;
    const self = wrapRef.current;
    if (!parent || !self) return;
    const pr = parent.getBoundingClientRect();
    let x = e.clientX - pr.left - drag.current.dx;
    let y = e.clientY - pr.top - drag.current.dy;
    x = Math.max(8, Math.min(pr.width - self.offsetWidth - 8, x));
    y = Math.max(8, Math.min(pr.height - self.offsetHeight - 8, y));
    setPos({ x, y });
  }, []);

  const onUp = useCallback(() => {
    drag.current = null;
  }, []);

  return (
    <div
      ref={wrapRef}
      className="absolute z-20 w-[34%] max-w-[220px] min-w-[128px] touch-none select-none"
      style={pos ? { left: pos.x, top: pos.y } : { right: 16, bottom: 16 }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <div className="relative aspect-video overflow-hidden rounded-xl border border-white/15 bg-[#0a1424] shadow-lift ring-1 ring-black/40">
        <video
          ref={attach}
          autoPlay
          playsInline
          muted
          className="h-full w-full -scale-x-100 object-cover"
          style={{ opacity: camOn ? 1 : 0 }}
        />
        {!camOn && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-sm font-bold text-white/80">
              {name.slice(0, 2).toUpperCase()}
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
          <span className="text-[11px] font-semibold text-white/90">{name}</span>
          {!camOn && <span className="text-[10px] font-semibold text-amber-300">Camera off</span>}
        </div>
        {onHide && (
          <button
            onClick={onHide}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Hide self-view"
            className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-md bg-black/45 text-white/80 hover:bg-black/70"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}
