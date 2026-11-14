import { Compass, Home, LayoutDashboard } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { ButtonLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export function NotFoundPage() {
  return (
    <AppShell showSidebar={false}>
      <div className="mx-auto max-w-xl py-12">
        <Card className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/15 text-sky-300">
            <Compass className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-sky-300">
            SECTOR 404 • OFF-COURSE
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-slate-50">
            Orbital Coordinates Not Found
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            That training station does not exist in our flight plan. Navigate back to
            Mission Control or your Astronaut Dashboard.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink
              to="/dashboard"
              variant="primary"
              leftIcon={<LayoutDashboard className="h-4 w-4" />}
            >
              Astronaut Dashboard
            </ButtonLink>
            <ButtonLink
              to="/"
              variant="secondary"
              leftIcon={<Home className="h-4 w-4" />}
            >
              Mission Overview
            </ButtonLink>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
