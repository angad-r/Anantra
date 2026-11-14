import { AlertTriangle, Inbox, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from './Card';

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export function LoadingState({
  title = 'Synchronizing Mission Telemetry...',
  description = 'Preparing your astronaut training modules and cadet logbook.',
}: LoadingStateProps) {
  return (
    <Card
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-sky-300">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      </div>
      <h2 className="font-display text-lg font-semibold text-slate-100">
        {title}
      </h2>
      <p className="mt-1 max-w-md text-sm text-slate-400">{description}</p>
    </Card>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-space-border bg-space-slate text-slate-300">
        {icon ?? <Inbox className="h-6 w-6" aria-hidden="true" />}
      </div>
      <h2 className="font-display text-lg font-semibold text-slate-100">
        {title}
      </h2>
      <p className="mt-1.5 max-w-md text-sm text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: ReactNode;
}

export function ErrorState({
  title = 'Telemetry Link Interrupted',
  message,
  action,
}: ErrorStateProps) {
  return (
    <Card
      role="alert"
      className="border-rose-400/40 bg-rose-950/20 p-5 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-400/30 bg-rose-500/15 text-rose-300">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-rose-100">
              {title}
            </h2>
            <p className="mt-1 text-sm text-rose-200/85">{message}</p>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </Card>
  );
}
