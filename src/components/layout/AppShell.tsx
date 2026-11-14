import {
  Award,
  BookOpen,
  FileBadge2,
  Home,
  LayoutDashboard,
  Lock,
  Menu,
  Rocket,
  ShieldCheck,
  UserCheck,
  WifiOff,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTraining } from '../../context/TrainingContext';
import { TRAINING_MODULES } from '../../data/modules';
import { CadetAvatar } from '../../features/onboarding/CadetAvatar';
import { SPECIALIZATION_BY_ID } from '../../features/onboarding/cadetProfileData';
import { getModuleCompletion } from '../../utils/progress';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { StarfieldBackground } from '../ui/StarfieldBackground';
import { ErrorState, LoadingState } from '../ui/StateFeedback';

interface AppShellProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function AppShell({ children, showSidebar = true }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const {
    status,
    storageError,
    isOnline,
    cadetProfile,
    state,
    stats,
    certificateStatuses,
    earnedCertificatesCount,
    restoreSampleProgress,
    dismissStorageError,
  } = useTraining();

  const displayName = cadetProfile?.firstName ?? 'Guest Cadet';
  const displayCallsign = cadetProfile?.callsign ?? 'UNREGISTERED';
  const displaySpecTitle = cadetProfile
    ? SPECIALIZATION_BY_ID[cadetProfile.specialization].title
    : 'Awaiting Enrollment';

  const prevPathnameRef = useRef(location.pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== location.pathname) {
      prevPathnameRef.current = location.pathname;
      setMobileMenuOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex min-h-10 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150',
      isActive
        ? 'bg-sky-400/15 text-sky-100 border border-sky-400/40 shadow-[inset_0_1px_0_rgba(125,211,252,0.18)]'
        : 'text-slate-300 border border-transparent hover:bg-space-slate/90 hover:text-slate-50',
    ].join(' ');

  return (
    <div className="relative flex min-h-screen flex-col text-slate-100">
      <StarfieldBackground />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-sky-400 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950"
      >
        Skip to main content
      </a>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-space-border/80 bg-space-void/85 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/"
              className="group flex min-w-0 items-center gap-3 rounded-xl py-1 pr-2 transition-opacity hover:opacity-95"
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-400/45 bg-gradient-to-br from-sky-400/20 to-sky-500/5 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.22)]">
                <Rocket className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="font-display text-base font-bold tracking-wider text-slate-50">
                  ANANTRA
                </span>
                <span className="hidden text-[11px] font-medium text-slate-400 xl:inline">
                  Junior Astronaut Mission Trainer
                </span>
              </span>
            </Link>
          </div>

          {/* Primary Desktop Links */}
          <nav
            aria-label="Primary"
            className="hidden shrink-0 items-center gap-1 rounded-2xl border border-space-border/70 bg-space-navy/60 p-1 lg:flex"
          >
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors xl:px-3.5 xl:text-sm ${
                  isActive
                    ? 'bg-sky-400/15 text-sky-200 shadow-[inset_0_1px_0_rgba(125,211,252,0.16)]'
                    : 'text-slate-300 hover:bg-space-slate hover:text-slate-100'
                }`
              }
            >
              Mission Overview
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors xl:px-3.5 xl:text-sm ${
                  isActive
                    ? 'bg-sky-400/15 text-sky-200 shadow-[inset_0_1px_0_rgba(125,211,252,0.16)]'
                    : 'text-slate-300 hover:bg-space-slate hover:text-slate-100'
                }`
              }
            >
              Astronaut Dashboard
            </NavLink>
            <NavLink
              to="/academy"
              className={({ isActive }) =>
                `whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors xl:px-3.5 xl:text-sm ${
                  isActive
                    ? 'bg-sky-400/15 text-sky-200 shadow-[inset_0_1px_0_rgba(125,211,252,0.16)]'
                    : 'text-slate-300 hover:bg-space-slate hover:text-slate-100'
                }`
              }
            >
              Training Deck
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors xl:px-3.5 xl:text-sm ${
                  isActive
                    ? 'bg-sky-400/15 text-sky-200 shadow-[inset_0_1px_0_rgba(125,211,252,0.16)]'
                    : 'text-slate-300 hover:bg-space-slate hover:text-slate-100'
                }`
              }
            >
              Cadet Profile
            </NavLink>
          </nav>

          {/* Cadet Telemetry Pill + Mobile Menu Toggle */}
          <div className="flex shrink-0 items-center gap-2.5">
            <Link
              to={cadetProfile ? '/profile' : '/dashboard'}
              className="hidden items-center gap-2 whitespace-nowrap rounded-full border border-space-border bg-space-navy/95 py-1 pl-1.5 pr-3.5 text-xs font-medium text-slate-200 shadow-[inset_0_1px_0_rgba(248,250,252,0.06)] transition-all hover:border-sky-400/45 hover:bg-space-slate sm:inline-flex"
              aria-label={`Cadet ${displayName} (${displayCallsign}), ${stats.totalXp} XP. Open Cadet Profile`}
            >
              <CadetAvatar avatarId={cadetProfile?.avatarId} size="xs" />
              <span className="font-mono font-semibold text-sky-300">
                {displayCallsign}
              </span>
              <span className="text-slate-600">|</span>
              <Award className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden="true" />
              <span className="font-mono text-slate-100">{stats.totalXp} XP</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-space-border bg-space-navy text-slate-200 hover:border-sky-400/40 hover:text-sky-300 lg:hidden cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <nav
            id="mobile-nav-drawer"
            aria-label="Mobile navigation"
            className="border-t border-space-border bg-space-navy/98 px-4 py-4 backdrop-blur-xl lg:hidden"
          >
            <div className="mb-3 flex items-start justify-between gap-3 rounded-xl border border-space-border/90 bg-space-void/70 px-3.5 py-2.5 text-xs">
              <div className="flex min-w-0 items-start gap-2.5">
                <CadetAvatar avatarId={cadetProfile?.avatarId} size="sm" className="mt-0.5" />
                <div className="min-w-0 space-y-0.5">
                  <p className="break-words font-display font-semibold text-slate-100">
                    {displayName}
                  </p>
                  <p className="break-words font-mono text-[11px] leading-snug text-sky-300">
                    {displayCallsign}
                  </p>
                  <p className="break-words font-mono text-[11px] leading-snug text-emerald-300">
                    {displaySpecTitle}
                  </p>
                </div>
              </div>
              <span className="shrink-0 font-mono font-semibold text-amber-300">
                {stats.totalXp} XP
              </span>
            </div>

            <div className="space-y-1.5">
              <NavLink
                to="/"
                end
                className={navLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2.5">
                  <Home className="h-4 w-4 text-sky-300" aria-hidden="true" />
                  Mission Overview
                </span>
              </NavLink>
              <NavLink
                to="/dashboard"
                className={navLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2.5">
                  <LayoutDashboard className="h-4 w-4 text-sky-300" aria-hidden="true" />
                  Astronaut Dashboard
                </span>
                <span className="font-mono text-xs text-sky-300">
                  {stats.overallPercentage}%
                </span>
              </NavLink>
              <NavLink
                to="/profile"
                className={navLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2.5">
                  <UserCheck className="h-4 w-4 text-sky-300" aria-hidden="true" />
                  Cadet Profile
                </span>
              </NavLink>
              <NavLink
                to="/certificates"
                className={navLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2.5">
                  <FileBadge2 className="h-4 w-4 text-amber-300" aria-hidden="true" />
                  Certificates
                </span>
                <span className="font-mono text-xs text-amber-300">
                  {earnedCertificatesCount}/{certificateStatuses.length}
                </span>
              </NavLink>
              <NavLink
                to="/references"
                className={navLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen className="h-4 w-4 text-sky-300" aria-hidden="true" />
                  Science & Sources
                </span>
              </NavLink>

              <p className="px-3 pt-3 pb-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Training Modules
              </p>

              {TRAINING_MODULES.map((mod) => {
                const Icon = mod.icon;
                const summary = getModuleCompletion(
                  mod,
                  state.progressByModule[mod.id],
                );
                const isLocked =
                  state.guidedProgression && !stats.moduleUnlocks[mod.id]?.unlocked;
                return (
                  <NavLink
                    key={mod.id}
                    to={mod.route}
                    className={navLinkClass}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2.5">
                      {isLocked ? (
                        <Lock className="h-4 w-4 text-amber-300" aria-hidden="true" />
                      ) : (
                        <Icon className="h-4 w-4 text-sky-300" aria-hidden="true" />
                      )}
                      {mod.shortTitle}
                    </span>
                    <span
                      className={`font-mono text-xs ${
                        isLocked
                          ? 'text-amber-300'
                          : summary.status === 'completed'
                            ? 'text-emerald-300'
                            : summary.status === 'in-progress'
                              ? 'text-sky-300'
                              : 'text-slate-400'
                      }`}
                    >
                      {isLocked ? 'Locked' : `${summary.percentage}%`}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* Main Content Layout */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 print:block print:max-w-none print:p-0">
        {showSidebar && (
          <aside className="hidden w-68 shrink-0 lg:block print:hidden">
            <div className="sticky top-24 space-y-5 rounded-2xl border border-space-border bg-space-navy/85 p-4 backdrop-blur-md anantra-panel-rim">
              {/* Compact Cadet Dossier */}
              <div className="rounded-xl border border-sky-400/25 bg-gradient-to-br from-space-slate/90 to-space-void/90 p-3.5">
                <div className="flex items-start gap-2.5">
                  <CadetAvatar avatarId={cadetProfile?.avatarId} size="sm" className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                      <span className="break-words font-mono text-[11px] font-semibold uppercase tracking-wider text-sky-300">
                        {displayCallsign}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-amber-300">
                        {stats.totalXp} XP
                      </span>
                    </div>
                    <p className="mt-0.5 break-words font-display text-sm font-semibold text-slate-50">
                      {displayName}
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 space-y-1 border-t border-space-border/70 pt-2">
                  <p className="break-words font-mono text-[11px] font-semibold leading-snug text-emerald-300">
                    {displaySpecTitle}
                  </p>
                  <p className="break-words text-xs leading-snug text-slate-300">
                    {stats.currentRank.title}
                  </p>
                </div>
                <div className="mt-2.5">
                  <ProgressBar
                    label="Mission Readiness"
                    value={stats.overallPercentage}
                    size="sm"
                  />
                </div>
              </div>

              <div>
                <p className="px-3 pb-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Command Deck
                </p>
                <nav aria-label="Mission sections" className="space-y-1">
                  <NavLink to="/" end className={navLinkClass}>
                    <span className="flex items-center gap-2.5">
                      <Home className="h-4 w-4 text-sky-300" aria-hidden="true" />
                      Mission Overview
                    </span>
                  </NavLink>
                  <NavLink to="/dashboard" className={navLinkClass}>
                    <span className="flex items-center gap-2.5">
                      <LayoutDashboard className="h-4 w-4 text-sky-300" aria-hidden="true" />
                      Dashboard
                    </span>
                    <span className="font-mono text-xs text-sky-300">
                      {stats.overallPercentage}%
                    </span>
                  </NavLink>
                  <NavLink to="/profile" className={navLinkClass}>
                    <span className="flex items-center gap-2.5">
                      <UserCheck className="h-4 w-4 text-sky-300" aria-hidden="true" />
                      Cadet Profile
                    </span>
                  </NavLink>
                  <NavLink to="/certificates" className={navLinkClass}>
                    <span className="flex items-center gap-2.5">
                      <FileBadge2 className="h-4 w-4 text-amber-300" aria-hidden="true" />
                      Certificates
                    </span>
                    <span className="font-mono text-xs text-amber-300">
                      {earnedCertificatesCount}/{certificateStatuses.length}
                    </span>
                  </NavLink>
                  <NavLink to="/references" className={navLinkClass}>
                    <span className="flex items-center gap-2.5">
                      <BookOpen className="h-4 w-4 text-sky-300" aria-hidden="true" />
                      Science & Sources
                    </span>
                  </NavLink>
                </nav>
              </div>

              <div className="border-t border-space-border/80 pt-4">
                <p className="px-3 pb-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Training Modules
                </p>
                <nav aria-label="Training modules" className="space-y-1">
                  {TRAINING_MODULES.map((mod) => {
                    const Icon = mod.icon;
                    const summary = getModuleCompletion(
                      mod,
                      state.progressByModule[mod.id],
                    );
                    const isLocked =
                      state.guidedProgression &&
                      !stats.moduleUnlocks[mod.id]?.unlocked;
                    return (
                      <NavLink
                        key={mod.id}
                        to={mod.route}
                        className={navLinkClass}
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          {isLocked ? (
                            <Lock
                              className="h-4 w-4 shrink-0 text-amber-300"
                              aria-hidden="true"
                            />
                          ) : (
                            <Icon
                              className="h-4 w-4 shrink-0 text-sky-300"
                              aria-hidden="true"
                            />
                          )}
                          <span className="truncate">{mod.shortTitle}</span>
                        </span>
                        <span
                          className={`font-mono text-[11px] ${
                            isLocked
                              ? 'text-amber-300'
                              : summary.status === 'completed'
                                ? 'text-emerald-300'
                                : summary.status === 'in-progress'
                                  ? 'text-sky-300'
                                  : 'text-slate-500'
                          }`}
                        >
                          {isLocked ? 'Locked' : `${summary.percentage}%`}
                        </span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>
        )}

        <main id="main-content" className="min-w-0 flex-1">
          {!isOnline && (
            <div
              role="status"
              className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-500/12 px-4 py-3 text-xs text-amber-100 sm:text-sm print:hidden"
            >
              <WifiOff className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
              <span>
                <strong className="font-semibold">Offline Telemetry Mode:</strong>{' '}
                Your Academy lessons, 4 interactive simulators, and local progress
                continue running without internet. Live cloud AI requests fall back
                to ARIA&apos;s verified onboard handbook.
              </span>
            </div>
          )}

          {storageError && (
            <div className="mb-6 print:hidden">
              <ErrorState
                message={storageError}
                action={
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={restoreSampleProgress}
                    >
                      Restore Sample Telemetry
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={dismissStorageError}
                    >
                      Dismiss
                    </Button>
                  </div>
                }
              />
            </div>
          )}

          {status === 'loading' ? <LoadingState /> : children}
        </main>
      </div>

      <footer className="mt-auto border-t border-space-border/75 bg-space-void/75 py-5 backdrop-blur-sm print:hidden">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-center text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
          <p>
            <span className="font-display font-semibold text-slate-200">
              ANANTRA
            </span>{' '}
            — Junior Astronaut Mission Trainer • Independent Educational Project
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-[11px] text-slate-400">
            <Link to="/certificates/verify" className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 underline-offset-4 hover:underline">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              Verify Certificate
            </Link>
            <span>•</span>
            <Link to="/references" className="text-sky-300 hover:text-sky-200 underline-offset-4 hover:underline">
              NASA Sources &amp; Models
            </Link>
            <span>•</span>
            <span>Local Cadet Telemetry Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
