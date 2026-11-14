import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'accent';
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  topAccentClassName?: string;
}

const VARIANT_STYLES = {
  default: 'bg-space-navy/85 border-space-border anantra-panel-rim',
  elevated:
    'bg-space-slate/90 border-space-border shadow-[inset_0_1px_0_rgba(248,250,252,0.08),0_16px_40px_rgba(2,6,23,0.5)]',
  accent:
    'bg-gradient-to-br from-space-slate/95 via-space-navy/95 to-sky-950/45 border-sky-400/35 shadow-[inset_0_1px_0_rgba(125,211,252,0.16),0_18px_44px_rgba(2,6,23,0.55)]',
};

const PADDING_STYLES = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export function Card({
  children,
  variant = 'default',
  interactive = false,
  padding = 'md',
  topAccentClassName,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl border backdrop-blur-md',
        VARIANT_STYLES[variant],
        PADDING_STYLES[padding],
        interactive
          ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/45 hover:bg-space-slate/90'
          : '',
        className,
      ]
        .join(' ')
        .trim()}
      {...props}
    >
      {topAccentClassName && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${topAccentClassName}`}
        />
      )}
      {children}
    </div>
  );
}
