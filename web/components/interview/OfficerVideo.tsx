"use client";

import { useEffect, useRef, useState } from "react";
import type { Persona } from "@/lib/personas";
import type { OfficerState } from "@/lib/types";

// LOCAL AVATAR IMPLEMENTATION (prototype).
// A stylized, professional presenter placeholder in a neutral studio setting —
// deliberately abstract (no real person, no demographic cues, no government
// branding). It animates: breathing, blinking, subtle sway, mouth movement
// while speaking, and a "reviewing notes" look-down.
//
// PRODUCTION: replace this component with a real AvatarProvider — a real-time
// AI avatar, a lip-synced presenter, or recorded interviewer video states —
// driven by the same `state` prop and the officer audio stream.

export function OfficerVideo({
  persona,
  state,
}: {
  persona: Persona;
  state: OfficerState;
}) {
  const speaking = state === "speaking" || state === "closing";
  const lookingDown = state === "thinking" || state === "reviewing";
  const [mouth, setMouth] = useState(0.06);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!speaking) {
      setMouth(0.06);
      return;
    }
    let t = 0;
    const loop = () => {
      t += 0.28;
      // Layered sines + jitter => believable, non-repetitive mouth movement.
      const base =
        0.5 +
        0.32 * Math.sin(t) +
        0.14 * Math.sin(t * 2.3 + 1) +
        (Math.random() - 0.5) * 0.12;
      setMouth(Math.max(0.05, Math.min(1, base)));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [speaking]);

  const a = persona.accent;
  const pupilDy = lookingDown ? 3.4 : 0;
  const mouthRy = 1.8 + mouth * 7;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Studio backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 70% 20%, #1a2b46 0%, #101c31 45%, #0a1424 100%)",
        }}
      />
      <div
        className="absolute -right-10 top-6 h-56 w-56 rounded-full blur-3xl"
        style={{ background: a, opacity: 0.16 }}
      />
      <div className="absolute -left-16 bottom-0 h-64 w-72 rounded-full bg-[#12233d] blur-3xl opacity-70" />
      {/* Desk line */}
      <div className="absolute inset-x-0 bottom-0 h-[26%] bg-gradient-to-t from-[#0a1526] to-transparent" />

      {/* Speaking glow */}
      <div
        className="absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          background: a,
          opacity: 0,
          animation: speaking ? "ivGlow 1.6s ease-in-out infinite" : "none",
        }}
      />

      {/* Figure */}
      <svg
        viewBox="0 0 400 320"
        preserveAspectRatio="xMidYMax meet"
        className="absolute inset-0 h-full w-full"
        aria-label={`${persona.name}, practice interviewer`}
      >
        <defs>
          <linearGradient id="suit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={a} stopOpacity="0.9" />
            <stop offset="1" stopColor={a} stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="head" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#C9D2DE" />
            <stop offset="1" stopColor="#9AA6B6" />
          </linearGradient>
        </defs>

        <g className="iv-breathe">
          {/* Shoulders / torso */}
          <path
            d="M70 320 C 78 250, 130 224, 200 224 C 270 224, 322 250, 330 320 Z"
            fill="url(#suit)"
          />
          <path
            d="M182 232 L200 262 L218 232 C 214 226, 186 226, 182 232 Z"
            fill="#EEF2F8"
            opacity="0.9"
          />
          {/* collar */}
          <path d="M176 230 L200 250 L176 250 Z" fill="#0d1a2e" opacity="0.35" />
          <path d="M224 230 L200 250 L224 250 Z" fill="#0d1a2e" opacity="0.35" />

          {/* Neck */}
          <rect x="184" y="196" width="32" height="42" rx="14" fill="#95A2B2" />

          {/* Head */}
          <g className="iv-sway" style={{ transformBox: "fill-box" }}>
            <ellipse cx="200" cy="150" rx="52" ry="60" fill="url(#head)" />
            {/* soft rim light */}
            <ellipse cx="222" cy="140" rx="46" ry="54" fill={a} opacity="0.08" />

            {/* Brows */}
            <rect x="168" y="132" width="24" height="4" rx="2" fill="#5c6674" opacity="0.6" />
            <rect x="208" y="132" width="24" height="4" rx="2" fill="#5c6674" opacity="0.6" />

            {/* Eyes */}
            <g>
              <ellipse cx="180" cy="148" rx="9" ry="6.5" fill="#fff" />
              <circle cx={180} cy={148 + pupilDy} r="3.4" fill="#2a3340" />
              {/* eyelid (blink) */}
              <rect
                className="iv-blink"
                x="170"
                y="141"
                width="20"
                height="8"
                rx="4"
                fill="url(#head)"
              />
            </g>
            <g>
              <ellipse cx="220" cy="148" rx="9" ry="6.5" fill="#fff" />
              <circle cx={220} cy={148 + pupilDy} r="3.4" fill="#2a3340" />
              <rect
                className="iv-blink delay"
                x="210"
                y="141"
                width="20"
                height="8"
                rx="4"
                fill="url(#head)"
              />
            </g>

            {/* Nose */}
            <path d="M200 154 C 197 164, 197 168, 200 170" stroke="#7b8695" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Mouth (animated) */}
            <ellipse cx="200" cy="182" rx="13" ry={mouthRy} fill="#5b3a3f" />
            <ellipse cx="200" cy={182 - mouthRy * 0.4} rx="12" ry={mouthRy * 0.5} fill="#c98d90" opacity="0.5" />
          </g>
        </g>

        {/* Reviewing notes: a subtle notepad rises when the officer reviews */}
        {lookingDown && (
          <g className="iv-fade" opacity="0.92">
            <rect x="250" y="292" width="70" height="26" rx="4" fill="#f4f1e8" transform="rotate(-6 285 305)" />
            <line x1="258" y1="300" x2="312" y2="298" stroke="#b9b2a1" strokeWidth="2" transform="rotate(-6 285 305)" />
            <line x1="258" y1="306" x2="306" y2="304" stroke="#b9b2a1" strokeWidth="2" transform="rotate(-6 285 305)" />
            <rect x="300" y="286" width="4" height="30" rx="2" fill={a} transform="rotate(28 302 300)" />
          </g>
        )}
      </svg>
    </div>
  );
}
