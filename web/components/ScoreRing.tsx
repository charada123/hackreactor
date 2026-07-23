export function ScoreRing({
  value,
  max = 100,
  size = 132,
  stroke = 12,
  label,
  suffix = "%",
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  label?: string;
  suffix?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const dash = c * pct;
  const color =
    pct >= 0.8 ? "#28A15A" : pct >= 0.55 ? "#356CF0" : pct >= 0.3 ? "#B8791C" : "#C1442E";

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF2F9" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-extrabold tracking-tight">
          {Math.round(value)}
          <span className="text-lg text-ink-faint">{suffix}</span>
        </div>
        {label ? <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{label}</div> : null}
      </div>
    </div>
  );
}
