import {
  ArrowRight,
  Award,
  Bot,
  CheckCircle2,
  Circle,
  Clock,
  Lock,
  RotateCcw,
  Sparkles,
  Target,
  Unlock,
  Wrench,
} from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { useTraining } from '../../context/TrainingContext';
import { ACCENT_STYLES, DESIGN_TOKENS } from '../../data/designTokens';
import { getModuleById } from '../../data/modules';
import type { FeatureModuleData } from '../../types/training';
import { getModuleCompletion } from '../../utils/progress';
import { PageHeader } from '../layout/PageHeader';
import { BadgePill, StatusPill } from '../ui/BadgePill';
import { Button, ButtonLink } from '../ui/Button';
import { Card } from '../ui/Card';
import { OrbitalRing } from '../ui/OrbitalRing';
import { ProgressBar } from '../ui/ProgressBar';
import { EmptyState } from '../ui/StateFeedback';

interface ModuleSandboxProps {
  module: FeatureModuleData;
  children?: ReactNode;
}

const ACCENT_HEX = {
  cyan: DESIGN_TOKENS.colors.cyan,
  emerald: DESIGN_TOKENS.colors.emerald,
  violet: DESIGN_TOKENS.colors.violet,
  amber: DESIGN_TOKENS.colors.amber,
  rose: DESIGN_TOKENS.colors.rose,
} as const;

export function ModuleSandbox({ module, children }: ModuleSandboxProps) {
  const {
    state,
    stats,
    toggleTask,
    completeModule,
    resetModule,
    markModuleVisited,
    setGuidedProgression,
  } = useTraining();

  const registered = getModuleById(module.id);
  const Icon = registered.icon;
  const accent = ACCENT_STYLES[module.accent];
  const progress = state.progressByModule[module.id];
  const summary = getModuleCompletion(module, progress);
  const unlockState = stats.moduleUnlocks[module.id];
  const isLocked = state.guidedProgression && !unlockState.unlocked;
  const perfRecord = state.moduleRecords?.[module.id];
  const bestPercent =
    perfRecord?.bestScore != null && perfRecord.maxScore && perfRecord.maxScore > 0
      ? Math.round((perfRecord.bestScore / perfRecord.maxScore) * 100)
      : perfRecord?.bestScore ?? null;

  const nextModule = module.nextRecommendedModuleId
    ? getModuleById(module.nextRecommendedModuleId)
    : null;

  useEffect(() => {
    markModuleVisited(module.id);
  }, [markModuleVisited, module.id]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`ANANTRA MODULE • ${module.difficulty.toUpperCase()} LEVEL`}
        title={module.title}
        subtitle={module.tagline}
        backTo={{ label: 'Back to Astronaut Dashboard', to: '/dashboard' }}
        badges={
          <>
            <StatusPill status={summary.status} />
            <BadgePill
              tone="neutral"
              icon={<Clock className="h-3.5 w-3.5" />}
            >
              ~{module.estimatedMinutes} min
            </BadgePill>
            <BadgePill
              tone={summary.status === 'completed' ? 'amber' : 'neutral'}
              icon={<Award className="h-3.5 w-3.5" />}
            >
              Patch: {module.patchTitle}
            </BadgePill>
            {perfRecord && perfRecord.attempts > 0 && (
              <BadgePill tone="cyan" icon={<Target className="h-3.5 w-3.5" />}>
                {bestPercent != null ? `Best: ${bestPercent}% • ` : ''}
                {perfRecord.attempts}{' '}
                {perfRecord.attempts === 1 ? 'run' : 'runs'}
              </BadgePill>
            )}
          </>
        }
        actions={
          <>
            {perfRecord && perfRecord.lastOutcome === 'retry' && (
              <ButtonLink
                to={`/ai-mentor?debrief=${module.id}`}
                variant="secondary"
                size="sm"
                leftIcon={<Bot className="h-4 w-4" />}
              >
                Debrief With ARIA
              </ButtonLink>
            )}
            {summary.status !== 'completed' &&
              module.tasks.length > 0 &&
              !isLocked && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => completeModule(module.id)}
                >
                  Complete Module
                </Button>
              )}
            {summary.completedCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RotateCcw className="h-4 w-4" />}
                onClick={() => resetModule(module.id)}
              >
                Reset Module
              </Button>
            )}
          </>
        }
      />

      {/* Module Progress & Mission Brief */}
      <Card variant="accent" topAccentClassName={accent.topBar}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${accent.iconBox}`}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-slate-50">
                Mission Brief
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-300">
                {module.missionBrief}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-space-border/80 bg-space-void/65 p-3.5 sm:shrink-0">
            <OrbitalRing
              value={summary.percentage}
              size={84}
              strokeWidth={7}
              caption={summary.status === 'completed' ? 'CERTIFIED' : 'DECK'}
              accentColor={ACCENT_HEX[module.accent]}
            />
            <div className="w-44 sm:w-48">
              <ProgressBar
                label="Module Readiness"
                value={summary.percentage}
                fillClassName={accent.progressFill}
                size="sm"
                helperText={`${summary.completedCount}/${summary.totalCount} steps • ${summary.earnedXp}/${summary.totalPossibleXp} XP`}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Team Feature Extension Zone / Guided Lock Gate */}
      {isLocked ? (
        <Card
          variant="accent"
          topAccentClassName="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/15 text-amber-300">
                <Lock className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <BadgePill tone="amber">Guided Progression Lock</BadgePill>
                <h2 className="font-display text-lg font-semibold text-slate-50">
                  {module.title} Is Currently Locked
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
                  {unlockState.requirementText}
                </p>
                <p className="text-xs text-slate-400">
                  You can complete the prerequisite mission or switch to Free Explore
                  Mode at any time from Cadet Profile or the button on the right.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 sm:shrink-0">
              <ButtonLink to="/academy" variant="primary" size="sm">
                Open Astronaut Academy
              </ButtonLink>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Unlock className="h-4 w-4" />}
                onClick={() => setGuidedProgression(false)}
              >
                Unlock Free Explore Mode
              </Button>
            </div>
          </div>
        </Card>
      ) : children ? (
        <section aria-label="Interactive activity">{children}</section>
      ) : (
        <Card
          variant="elevated"
          className="border-dashed border-sky-400/35 bg-space-navy/70"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/35 bg-sky-400/12 text-sky-300">
                <Wrench className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <BadgePill tone="cyan" dot className="mb-2">
                  Team Feature Workspace Ready
                </BadgePill>
                <h2 className="font-display text-lg font-semibold text-slate-50">
                  Interactive Simulation Slot
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">
                  {module.teamNotes}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Checklist + Learning Goals & Fun Facts */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Card className="h-full">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-slate-50">
                Training Checklist
              </h2>
              <span className="font-mono text-xs text-slate-400">
                Click any step to log progress
              </span>
            </div>

            {module.tasks.length === 0 ? (
              <EmptyState
                title="No Training Tasks Listed"
                description="Add steps to this module's data file to track cadet progress."
              />
            ) : (
              <ul className="space-y-3">
                {module.tasks.map((task, idx) => {
                  const isDone = progress.completedTaskIds.includes(task.id);
                  return (
                    <li key={task.id}>
                      <button
                        type="button"
                        aria-pressed={isDone}
                        onClick={() => toggleTask(module.id, task.id)}
                        className={`flex w-full items-start gap-3.5 rounded-xl border p-4 text-left transition-all duration-150 cursor-pointer ${
                          isDone
                            ? 'border-emerald-400/45 bg-emerald-500/10 shadow-[inset_0_1px_0_rgba(52,211,153,0.12)]'
                            : 'border-space-border bg-space-void/65 hover:border-sky-400/45 hover:bg-space-slate/75'
                        }`}
                      >
                        <span className="mt-0.5 flex shrink-0 items-center gap-2">
                          <span
                            className={`hidden h-6 w-6 items-center justify-center rounded-lg font-mono text-[11px] font-semibold sm:inline-flex ${
                              isDone
                                ? 'bg-emerald-400/20 text-emerald-200'
                                : 'bg-space-slate text-slate-400'
                            }`}
                          >
                            0{idx + 1}
                          </span>
                          {isDone ? (
                            <CheckCircle2
                              className="h-5 w-5 text-emerald-300"
                              aria-hidden="true"
                            />
                          ) : (
                            <Circle
                              className="h-5 w-5 text-slate-400"
                              aria-hidden="true"
                            />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center justify-between gap-2">
                            <span
                              className={`text-sm font-semibold ${
                                isDone ? 'text-emerald-100' : 'text-slate-100'
                              }`}
                            >
                              {task.title}
                            </span>
                            <span className="rounded-full border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-sky-300">
                              +{task.xpReward} XP
                            </span>
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-slate-300 sm:text-sm">
                            {task.description}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <Card>
            <h2 className="font-display text-lg font-semibold text-slate-50">
              What You Will Learn
            </h2>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-300">
              {module.learningGoals.map((goal) => (
                <li key={goal} className="flex items-start gap-2.5">
                  <Sparkles
                    className="mt-0.5 h-4 w-4 shrink-0 text-sky-300"
                    aria-hidden="true"
                  />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold text-slate-50">
              Space Briefing Facts
            </h2>
            <div className="mt-3 space-y-3">
              {module.funFacts.map((fact) => (
                <div
                  key={fact.title}
                  className="rounded-xl border border-space-border/80 bg-space-void/65 p-3.5"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                    {fact.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">
                    {fact.detail}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Module Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-space-border bg-space-navy/85 p-4 sm:p-5 anantra-panel-rim">
        <ButtonLink to="/dashboard" variant="secondary">
          Return to Dashboard
        </ButtonLink>

        {nextModule && (
          <ButtonLink
            to={nextModule.route}
            variant="primary"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Next: {nextModule.shortTitle}
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
