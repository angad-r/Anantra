import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BookOpen,
  Clock,
  Compass,
  LayoutDashboard,
  Rocket,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { BadgePill, StatusPill } from '../../components/ui/BadgePill';
import { ButtonLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { OrbitalRing } from '../../components/ui/OrbitalRing';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useTraining } from '../../context/TrainingContext';
import { ACCENT_STYLES } from '../../data/designTokens';
import { TRAINING_MODULES } from '../../data/modules';
import { getModuleCompletion } from '../../utils/progress';
import { CadetAvatar } from '../onboarding/CadetAvatar';
import { SPECIALIZATION_BY_ID } from '../onboarding/cadetProfileData';

const PILLARS = [
  {
    step: 'STEP 01',
    icon: Rocket,
    title: 'Master 10 Core Academy Lessons',
    description:
      'Explore interactive diagrams, NASA mission case studies, and a 10-question mastery exam covering orbits, rockets, Mars, spacesuits, physiology, and radiation.',
  },
  {
    step: 'STEP 02',
    icon: ShieldCheck,
    title: 'Command 4 Physics Simulators',
    description:
      'Pilot lunar descent thrust (1.62 m/s²), test microgravity inertia (F = m×a), verify EVA spacewalk tethers, and triage station emergencies.',
  },
  {
    step: 'STEP 03',
    icon: Compass,
    title: 'Track Telemetry & Coach With ARIA',
    description:
      'Earn patches, grow 5 astronaut skill bars, unlock achievements, and debrief tough runs with ARIA—saved locally with zero accounts.',
  },
];

export function LandingPage() {
  const {
    cadetProfile,
    state,
    stats,
    certificateStatuses,
    earnedCertificatesCount,
  } = useTraining();

  const firstName = cadetProfile?.firstName ?? state.profile.name;
  const callsign = cadetProfile?.callsign ?? state.profile.callsign;
  const specializationTitle = cadetProfile
    ? SPECIALIZATION_BY_ID[cadetProfile.specialization].title
    : 'Explorer Track';

  const nextModule =
    TRAINING_MODULES.find(
      (mod) =>
        getModuleCompletion(mod, state.progressByModule[mod.id]).status !==
        'completed',
    ) ?? TRAINING_MODULES[0];
  const NextIcon = nextModule.icon;

  return (
    <AppShell showSidebar={false}>
      <div className="space-y-16 pb-12 sm:space-y-22">
        {/* Hero Section */}
        <section className="grid items-center gap-8 pt-2 lg:grid-cols-12 lg:gap-10 lg:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 lg:col-span-7"
          >
            <BadgePill
              tone="cyan"
              dot
              icon={<Sparkles className="h-3.5 w-3.5" />}
              className="mb-4 max-w-full"
            >
              NASA Space Apps • ANANTRA Academy
            </BadgePill>

            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
              Train Like a Junior Astronaut.{' '}
              <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-sky-400 bg-clip-text text-transparent">
                Launch Into Orbit.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Welcome to ANANTRA, an interactive astronaut mission trainer where
              students master 10 NASA-grounded space lessons, command lunar
              landing &amp; zero-gravity physics simulators, and earn cadet mission
              patches.
            </p>

            {/* Quick Highlight Chips */}
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300">
              <span className="rounded-full border border-space-border bg-space-navy/80 px-3 py-1">
                10 Academy Lessons
              </span>
              <span className="rounded-full border border-space-border bg-space-navy/80 px-3 py-1">
                4 Physics Simulators
              </span>
              <span className="rounded-full border border-space-border bg-space-navy/80 px-3 py-1">
                No Account Needed
              </span>
              <span className="rounded-full border border-space-border bg-space-navy/80 px-3 py-1">
                Verified NASA Sources
              </span>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <ButtonLink
                to="/dashboard"
                variant="primary"
                size="lg"
                leftIcon={<LayoutDashboard className="h-5 w-5" />}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Open Astronaut Dashboard
              </ButtonLink>

              <a
                href="#training-modules"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-space-border bg-space-slate/90 px-6 py-3 text-base font-medium text-slate-100 shadow-[inset_0_1px_0_rgba(248,250,252,0.06)] transition-all hover:border-sky-400/45 hover:bg-space-hover"
              >
                Explore 6 Modules
              </a>

              <ButtonLink
                to="/references"
                variant="ghost"
                size="lg"
                leftIcon={<BookOpen className="h-5 w-5" />}
              >
                Science &amp; Sources
              </ButtonLink>
            </div>
          </motion.div>

          {/* Live Cadet Orbital Flight Pass */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="min-w-0 lg:col-span-5"
          >
            <Card
              variant="accent"
              padding="lg"
              topAccentClassName="from-sky-400/90 via-cyan-300/70 to-indigo-400/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-space-border/80 pb-3.5">
                <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-sky-300">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  />
                  Cadet Flight Pass // Active
                </span>
                <BadgePill tone="amber" icon={<Award className="h-3 w-3" />}>
                  {stats.currentRank.title}
                </BadgePill>
              </div>

              <div className="mt-5 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-3.5">
                  <CadetAvatar avatarId={cadetProfile?.avatarId} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-mono text-[11px] uppercase tracking-wider text-sky-300">
                      {cadetProfile
                        ? `Cadet ID • ${cadetProfile.cadetId}`
                        : 'Cadet Flight Profile'}
                    </p>
                    <h2 className="mt-0.5 break-words font-display text-2xl font-bold text-slate-50">
                      Cadet {firstName}
                    </h2>
                    <p className="mt-1 break-words text-xs text-slate-300 leading-snug">
                      Callsign{' '}
                      <span className="font-mono font-semibold text-sky-300">
                        {callsign}
                      </span>{' '}
                      • {specializationTitle}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-start sm:self-center">
                  <OrbitalRing
                    value={stats.overallPercentage}
                    size={96}
                    strokeWidth={7}
                    caption="READY"
                  />
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <ProgressBar
                  label="Overall Orbital Readiness"
                  value={stats.overallPercentage}
                  helperText={`${stats.completedModulesCount} of ${stats.totalModulesCount} modules certified`}
                />

                <div className="grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-3">
                  <div className="min-w-0 rounded-xl border border-space-border/85 bg-space-void/75 p-3 text-center">
                    <p className="font-mono text-lg font-bold text-sky-300">
                      {stats.totalXp}
                    </p>
                    <p className="text-[11px] text-slate-400">Total XP</p>
                  </div>
                  <div className="min-w-0 rounded-xl border border-space-border/85 bg-space-void/75 p-3 text-center">
                    <p className="font-mono text-lg font-bold text-amber-300">
                      {earnedCertificatesCount}/{certificateStatuses.length}
                    </p>
                    <p className="text-[11px] text-slate-400">Certificates</p>
                  </div>
                  <div className="min-w-0 rounded-xl border border-space-border/85 bg-space-void/75 p-3 text-center">
                    <p className="font-mono text-lg font-bold text-emerald-300">
                      Day {state.profile.missionDay}
                    </p>
                    <p className="text-[11px] text-slate-400">Mission Log</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-space-border/80 bg-space-void/65 p-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-400/15 text-sky-300">
                    <NextIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Next Recommended • {nextModule.estimatedMinutes} min
                    </p>
                    <p className="truncate text-sm font-semibold text-slate-100">
                      {nextModule.title}
                    </p>
                  </div>
                </div>
                <ButtonLink
                  to={nextModule.route}
                  size="sm"
                  variant="secondary"
                  rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                >
                  Resume
                </ButtonLink>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* 3-Step Astronaut Pathway */}
        <section aria-labelledby="pillars-heading">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-sky-300">
                Mission Pathway
              </p>
              <h2
                id="pillars-heading"
                className="mt-1 font-display text-2xl font-bold text-slate-50 sm:text-3xl"
              >
                Built for Curiosity, Clarity, and Teamwork
              </h2>
            </div>
            <p className="text-sm text-slate-400">
              Three simple steps from Earth launchpad to Mission Commander.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card
                  key={pillar.title}
                  topAccentClassName="from-sky-400/60 via-cyan-400/20 to-transparent"
                  className="h-full"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-400/12 text-sky-300">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="font-mono text-xs font-semibold tracking-widest text-sky-300/80">
                      {pillar.step}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-slate-50">
                    {pillar.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                    {pillar.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 6 Training Modules Grid */}
        <section id="training-modules" aria-labelledby="curriculum-heading">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-sky-300">
                Flight Curriculum
              </p>
              <h2
                id="curriculum-heading"
                className="mt-1 font-display text-2xl font-bold text-slate-50 sm:text-3xl"
              >
                Six Training Decks to Complete
              </h2>
            </div>

            <ButtonLink
              to="/dashboard"
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              View Full Dashboard
            </ButtonLink>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TRAINING_MODULES.map((mod, index) => {
              const Icon = mod.icon;
              const accent = ACCENT_STYLES[mod.accent];
              const summary = getModuleCompletion(
                mod,
                state.progressByModule[mod.id],
              );

              return (
                <Card
                  key={mod.id}
                  interactive
                  topAccentClassName={accent.topBar}
                  className={`flex h-full flex-col justify-between ${accent.borderHover} ${accent.glow}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${accent.iconBox}`}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                            Deck 0{index + 1}
                          </p>
                          <p className="inline-flex items-center gap-1.5 text-xs text-slate-300">
                            <span>{mod.difficulty}</span>
                            <span>•</span>
                            <Clock className="h-3 w-3 text-slate-400" aria-hidden="true" />
                            <span>{mod.estimatedMinutes} min</span>
                          </p>
                        </div>
                      </div>
                      <StatusPill status={summary.status} />
                    </div>

                    <h3 className="mt-4 font-display text-lg font-semibold text-slate-50">
                      {mod.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                      {mod.description}
                    </p>
                  </div>

                  <div className="mt-5 space-y-4 border-t border-space-border/80 pt-4">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                        Patch: <strong className="font-medium text-slate-200">{mod.patchTitle}</strong>
                      </span>
                      <span className="font-mono text-sky-300">
                        +{summary.totalPossibleXp} XP
                      </span>
                    </div>

                    <ProgressBar
                      label={`${summary.completedCount}/${summary.totalCount} steps`}
                      value={summary.percentage}
                      fillClassName={accent.progressFill}
                      size="sm"
                    />

                    <ButtonLink
                      to={mod.route}
                      variant={
                        summary.status === 'in-progress' ? 'primary' : 'secondary'
                      }
                      size="sm"
                      className="w-full"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      {summary.status === 'completed'
                        ? 'Review Module'
                        : summary.status === 'in-progress'
                          ? 'Continue Training'
                          : 'Enter Module'}
                    </ButtonLink>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
