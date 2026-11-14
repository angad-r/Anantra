import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  label: string;
  showPercentage?: boolean;
  fillClassName?: string;
  size?: 'sm' | 'md';
  helperText?: string;
}

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  fillClassName = 'bg-sky-400',
  size = 'md',
  helperText,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const heightClass = size === 'sm' ? 'h-2' : 'h-2.5';

  return (
    <div className="w-full min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-2 text-xs sm:text-sm">
        <span className="min-w-0 break-words font-medium text-slate-200">{label}</span>
        {showPercentage && (
          <span className="shrink-0 font-mono text-xs font-semibold text-sky-300">
            {clamped}%
          </span>
        )}
      </div>

      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        className={`w-full overflow-hidden rounded-full border border-space-border/90 bg-space-void/95 p-[1px] ${heightClass}`}
      >
        <motion.div
          className={`h-full rounded-full shadow-[0_0_10px_rgba(56,189,248,0.28)] ${fillClassName}`}
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {helperText && (
        <p className="mt-1.5 text-xs text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
