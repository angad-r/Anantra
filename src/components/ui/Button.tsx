import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface SharedButtonStyles {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-sky-400 text-slate-950 font-semibold hover:bg-sky-300 active:bg-sky-500 shadow-[0_0_24px_rgba(56,189,248,0.24)] hover:shadow-[0_0_28px_rgba(56,189,248,0.36)] border border-sky-200/70',
  secondary:
    'bg-space-slate/95 text-slate-100 font-medium hover:bg-space-hover border border-space-border hover:border-sky-400/45 shadow-[inset_0_1px_0_rgba(248,250,252,0.06)]',
  ghost:
    'bg-transparent text-slate-200 font-medium hover:bg-space-slate/85 hover:text-sky-300 border border-transparent hover:border-space-border',
  danger:
    'bg-rose-500/15 text-rose-200 font-medium hover:bg-rose-500/25 border border-rose-400/35 hover:border-rose-400/60',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3.5 py-1.5 text-sm rounded-xl gap-1.5',
  md: 'min-h-11 px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'min-h-12 px-6 py-3 text-base rounded-2xl gap-2.5',
};

function composeButtonClass(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
): string {
  return [
    'inline-flex items-center justify-center transition-all duration-150 active:scale-[0.985] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className ?? '',
  ]
    .join(' ')
    .trim();
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    SharedButtonStyles {}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  leftIcon,
  rightIcon,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={composeButtonClass(variant, size, className)}
      {...props}
    >
      {leftIcon && (
        <span className="shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span className="min-w-0">{children}</span>
      {rightIcon && (
        <span className="shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
}

export interface ButtonLinkProps extends LinkProps, SharedButtonStyles {}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={composeButtonClass(variant, size, className)} {...props}>
      {leftIcon && (
        <span className="shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span className="min-w-0">{children}</span>
      {rightIcon && (
        <span className="shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </Link>
  );
}
