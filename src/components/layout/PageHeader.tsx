import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { ButtonLink } from '../ui/Button';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  eyebrow?: string;
  backTo?: { label: string; to: string };
  badges?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  backTo,
  badges,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 border-b border-space-border/60 pb-6 sm:mb-8">
      {backTo && (
        <div className="mb-3">
          <ButtonLink
            to={backTo.to}
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="-ml-2 text-slate-300"
          >
            {backTo.label}
          </ButtonLink>
        </div>
      )}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-sky-300">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-sky-400"
              />
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            {subtitle}
          </p>
          {badges && (
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              {badges}
            </div>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
