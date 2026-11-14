import type { ReactNode } from 'react';
import type { ModuleStatus } from '../../types/training';

type PillTone = 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet' | 'neutral';

interface BadgePillProps {
  children: ReactNode;
  tone?: PillTone;
  icon?: ReactNode;
  dot?: boolean;
  className?: string;
}

const TONE_CLASSES: Record<PillTone, string> = {
  cyan: 'bg-sky-400/15 text-sky-300 border-sky-400/30',
  emerald: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
  amber: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  rose: 'bg-rose-400/15 text-rose-300 border-rose-400/30',
  violet: 'bg-violet-400/15 text-violet-300 border-violet-400/30',
  neutral: 'bg-slate-800/85 text-slate-300 border-slate-700/80',
};

const DOT_CLASSES: Record<PillTone, string> = {
  cyan: 'bg-sky-300',
  emerald: 'bg-emerald-300',
  amber: 'bg-amber-300',
  rose: 'bg-rose-300',
  violet: 'bg-violet-300',
  neutral: 'bg-slate-400',
};

export function BadgePill({
  children,
  tone = 'cyan',
  icon,
  dot = false,
  className = '',
}: BadgePillProps) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide leading-snug ${TONE_CLASSES[tone]} ${className}`.trim()}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_CLASSES[tone]}`}
        />
      )}
      {icon && (
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="min-w-0 break-words">{children}</span>
    </span>
  );
}

const STATUS_META: Record<
  ModuleStatus,
  { label: string; tone: PillTone; dot: boolean }
> = {
  'not-started': { label: 'Not Started', tone: 'neutral', dot: false },
  'in-progress': { label: 'In Progress', tone: 'cyan', dot: true },
  completed: { label: 'Completed', tone: 'emerald', dot: true },
};

export function StatusPill({ status }: { status: ModuleStatus }) {
  const meta = STATUS_META[status];
  return (
    <BadgePill tone={meta.tone} dot={meta.dot}>
      {meta.label}
    </BadgePill>
  );
}
