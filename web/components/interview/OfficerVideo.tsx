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
          <linearGradient id="blazer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a3a56" />
            <stop offset="1" stopColor="#182640" />
          </linearGradient>
          <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#EAC3A4" />
            <stop offset="1" stopColor="#D49C77" />
          </linearGradient>
          <linearGradient id="hair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b362f" />
            <stop offset="1" stopColor="#26221d" />
          </linearGradient>
        </defs>

        <g className="iv-breathe">
          {/* Blazer / shoulders */}
          <path d="M58 320 C 70 248, 122 222, 200 222 C 278 222, 330 248, 342 320 Z" fill="url(#blazer)" />
          {/* Shirt */}
          <path d="M176 226 L200 300 L224 226 C 218 236, 182 236, 176 226 Z" fill="#F2F5FA" />
          {/* Lapels */}
          <path d="M176 226 L200 264 L170 300 L146 300 C 148 260, 160 234, 176 226 Z" fill="url(#blazer)" />
          <path d="M224 226 L200 264 L230 300 L254 300 C 252 260, 240 234, 224 226 Z" fill="url(#blazer)" />
          {/* Tie */}
          <path d="M195 231 L205 231 L203 244 L209 300 L191 300 L197 244 Z" fill={a} />
          <path d="M195 231 L205 231 L200 239 Z" fill={a} opacity="0.85" />

          {/* Neck */}
          <rect x="185" y="196" width="30" height="40" rx="12" fill="url(#skin)" />
          <path d="M185 223 C 194 231, 206 231, 215 223 L215 236 L185 236 Z" fill="#000" opacity="0.10" />

          {/* Head */}
          <g className="iv-sway" style={{ transformBox: "fill-box" }}>
            {/* Ears */}
            <ellipse cx="151" cy="152" rx="8" ry="12" fill="url(#skin)" />
            <ellipse cx="249" cy="152" rx="8" ry="12" fill="url(#skin)" />
            {/* Face */}
            <path d="M152 138 C 152 100, 174 84, 200 84 C 226 84, 248 100, 248 138 C 248 173, 227 200, 200 200 C 173 200, 152 173, 152 138 Z" fill="url(#skin)" />
            {/* soft rim light */}
            <path d="M200 84 C 226 84, 248 100, 248 138 C 248 168, 231 193, 208 199 C 225 188, 236 164, 236 138 C 236 108, 220 92, 200 90 Z" fill={a} opacity="0.10" />
            {/* Hair */}
            <path d="M149 142 C 145 96, 176 76, 200 76 C 224 76, 255 96, 251 142 C 249 127, 244 117, 238 111 C 236 119, 231 123, 225 122 C 213 112, 187 112, 175 122 C 169 123, 164 119, 162 111 C 156 117, 151 127, 149 142 Z" fill="url(#hair)" />

            {/* Brows */}
            <path d="M170 130 C 176 126, 187 126, 192 130" stroke="#3a352e" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            <path d="M208 130 C 213 126, 224 126, 230 130" stroke="#3a352e" strokeWidth="3.4" fill="none" strokeLinecap="round" />

            {/* Eyes */}
            <g>
              <ellipse cx="181" cy="143" rx="9" ry="6" fill="#fff" />
              <g transform={`translate(0 ${pupilDy})`}>
                <circle cx="181" cy="143" r="4.3" fill="#5b4634" />
                <circle cx="181" cy="143" r="2.1" fill="#1b1410" />
                <circle cx="182.6" cy="141.4" r="1" fill="#fff" />
              </g>
              <rect className="iv-blink" x="171" y="136" width="20" height="8" rx="3" fill="url(#skin)" />
            </g>
            <g>
              <ellipse cx="219" cy="143" rx="9" ry="6" fill="#fff" />
              <g transform={`translate(0 ${pupilDy})`}>
                <circle cx="219" cy="143" r="4.3" fill="#5b4634" />
                <circle cx="219" cy="143" r="2.1" fill="#1b1410" />
                <circle cx="220.6" cy="141.4" r="1" fill="#fff" />
              </g>
              <rect className="iv-blink delay" x="209" y="136" width="20" height="8" rx="3" fill="url(#skin)" />
            </g>

            {/* Nose */}
            <path d="M200 146 C 197 158, 195 163, 201 166 C 204 167, 206 166, 207 164" stroke="#b5825f" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />

            {/* Mouth (animated) */}
            <path d="M187 177 C 193 173, 207 173, 213 177 C 207 175, 193 175, 187 177 Z" fill="#9a5049" />
            <ellipse cx="200" cy="180" rx="11" ry={mouthRy} fill="#7a3f3a" />
            <ellipse cx="200" cy={180 + mouthRy * 0.5} rx="9" ry={mouthRy * 0.5} fill="#c98d86" opacity="0.65" />
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
