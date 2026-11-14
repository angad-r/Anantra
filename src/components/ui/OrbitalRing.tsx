import { motion } from 'framer-motion';

interface OrbitalRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  caption?: string;
  accentColor?: string;
}

export function OrbitalRing({
  value,
  size = 104,
  strokeWidth = 8,
  caption = 'READY',
  accentColor = '#38bdf8',
}: OrbitalRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center select-none"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Outer subtle orbital guide */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + strokeWidth * 0.65}
          fill="none"
          stroke="rgba(56, 189, 248, 0.16)"
          strokeWidth="1"
          strokeDasharray="3 5"
        />

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(30, 45, 84, 0.9)"
          strokeWidth={strokeWidth}
        />

        {/* Active arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={clamped === 100 ? '#34d399' : accentColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-xl font-bold leading-none text-slate-50">
          {clamped}%
        </span>
        <span className="mt-1 font-mono text-[9px] font-semibold tracking-widest text-sky-300">
          {caption}
        </span>
      </div>
    </div>
  );
}
