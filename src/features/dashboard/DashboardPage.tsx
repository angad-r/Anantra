import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  FileBadge2,
  Lock,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Unlock,
  UserCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { BadgePill, StatusPill } from '../../components/ui/BadgePill';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { OrbitalRing } from '../../components/ui/OrbitalRing';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/StateFeedback';
import { useTraining } from '../../context/TrainingContext';
import { ACCENT_STYLES } from '../../data/designTokens';
import { TRAINING_MODULES } from '../../data/modules';
import type { CertificateKey, CertificateStatusItem } from '../../types/certificate';
import type { ModuleId, ModuleStatus } from '../../types/training';
import { getModuleCompletion } from '../../utils/progress';
import {
  CertificatePreviewModal,
  CertificateVerificationModal,
  LockedCertificateModal,
} from '../certificates';
import {
  generatePortfolioCertificatesPdf,
  generateSingleCertificatePdf,
} from '../certificates/certificatePdf';
import { resolveCadetCertificateIdentity } from '../certificates/certificateService';
import { CadetAvatar, getAvatarLabel } from '../onboarding/CadetAvatar';
import { SPECIALIZATION_BY_ID } from '../onboarding/cadetProfileData';

type FilterTab = 'all' | ModuleStatus;

function formatActivityTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DashboardPage() {
  const {
    cadetProfile,
    state,
    stats,
    certificateStatuses,
    earnedCertificatesCount,
    setGuidedProgression,
    reissueCertificate,
    verifyCertificate,
    resetAllProgress,
    restoreSampleProgress,
  } = useTraining();

  const firstName = cadetProfile?.firstName ?? state.profile.name;
  const callsign = cadetProfile?.callsign ?? state.profile.callsign;
  const specialization = cadetProfile
    ? SPECIALIZATION_BY_ID[cadetProfile.specialization]
    : SPECIALIZATION_BY_ID['lunar-explorer'];
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Mission Patch / Certificate state
  const [previewCertKey, setPreviewCertKey] = useState<CertificateKey | null>(
    null,
  );
  const [lockedCertKey, setLockedCertKey] = useState<CertificateKey | null>(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyInitialQuery, setVerifyInitialQuery] = useState('');
  const [downloadingKey, setDownloadingKey] = useState<CertificateKey | null>(
    null,
  );
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [rackNotice, setRackNotice] = useState<string | null>(null);

  const currentCertIdentity = useMemo(
    () => resolveCadetCertificateIdentity(cadetProfile, state.profile),
    [cadetProfile, state.profile],
  );

  const earnedCertificateRecords = useMemo(
    () =>
      certificateStatuses
        .map((item) => item.issuedRecord)
        .filter((rec): rec is NonNullable<typeof rec> => rec !== null),
    [certificateStatuses],
  );

  const certificateByModule = useMemo(() => {
    const map = new Map<ModuleId, CertificateStatusItem>();
    for (const item of certificateStatuses) {
      map.set(item.definition.moduleId, item);
    }
    return map;
  }, [certificateStatuses]);

  const activePreviewCert = useMemo(
    () =>
      previewCertKey
        ? certificateStatuses.find(
            (s) => s.definition.key === previewCertKey,
          ) ?? null
        : null,
    [previewCertKey, certificateStatuses],
  );

  const activeLockedCert = useMemo(
    () =>
      lockedCertKey
        ? certificateStatuses.find((s) => s.definition.key === lockedCertKey) ??
          null
        : null,
    [lockedCertKey, certificateStatuses],
  );

  const handleQuickDownloadCertificate = async (item: CertificateStatusItem) => {
    if (!item.issuedRecord) return;
    setDownloadingKey(item.definition.key);
    setRackNotice(null);
    try {
      const res = await generateSingleCertificatePdf(item.issuedRecord, {
        download: true,
      });
      setRackNotice(`Downloaded PDF: ${res.filename}`);
    } catch {
      setRackNotice(
        'PDF export encountered an error in this browser. Open Preview and use Print Certificate.',
      );
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleDownloadAllEarned = async () => {
    if (earnedCertificateRecords.length === 0) return;
    setDownloadingAll(true);
    setRackNotice(null);
    try {
      const res = await generatePortfolioCertificatesPdf(
        earnedCertificateRecords,
        currentCertIdentity.recipientName,
        { download: true },
      );
      setRackNotice(
        `Downloaded ${res.pageCount}-page portfolio PDF: ${res.filename}`,
      );
    } catch {
      setRackNotice(
        'Unable to export multi-page PDF. Download certificates individually instead.',
      );
    } finally {
      setDownloadingAll(false);
    }
  };

  const modulesWithSummary = useMemo(
    () =>
      TRAINING_MODULES.map((mod, index) => ({
        mod,
        deckNumber: `0${index + 1}`,
        summary: getModuleCompletion(mod, state.progressByModule[mod.id]),
        unlockState: stats.moduleUnlocks[mod.id],
        perfRecord: state.moduleRecords?.[mod.id],
      })),
    [state.moduleRecords, state.progressByModule, stats.moduleUnlocks],
  );

  const filteredModules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return modulesWithSummary.filter(({ mod, summary }) => {
      const matchesStatus =
        activeFilter === 'all' || summary.status === activeFilter;
      const matchesQuery =
        !query ||
        mod.title.toLowerCase().includes(query) ||
        mod.description.toLowerCase().includes(query) ||
        mod.patchTitle.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [activeFilter, modulesWithSummary, searchQuery]);

  const nextRecommended =
    modulesWithSummary.find(
      ({ summary, unlockState }) =>
        summary.status !== 'completed' &&
        (!state.guidedProgression || unlockState.unlocked),
    )?.mod ?? TRAINING_MODULES[0];
  const NextIcon = nextRecommended.icon;

  const filterCounts = useMemo(
    () => ({
      all: modulesWithSummary.length,
      'in-progress': modulesWithSummary.filter(
        ({ summary }) => summary.status === 'in-progress',
      ).length,
      'not-started': modulesWithSummary.filter(
        ({ summary }) => summary.status === 'not-started',
      ).length,
      completed: modulesWithSummary.filter(
        ({ summary }) => summary.status === 'completed',
      ).length,
    }),
    [modulesWithSummary],
  );

  const filterButtons: { key: FilterTab; label: string }[] = [
    { key: 'all', label: `All (${filterCounts.all})` },
    { key: 'in-progress', label: `In Progress (${filterCounts['in-progress']})` },
    { key: 'not-started', label: `Not Started (${filterCounts['not-started']})` },
    { key: 'completed', label: `Completed (${filterCounts.completed})` },
  ];

  const recentActivity = (state.activityHistory ?? []).slice(0, 8);

  return (
    <>
      <div className="space-y-6 sm:space-y-8 print:hidden">
      <PageHeader
        eyebrow="ASTRONAUT COMMAND DECK"
        title={`GOOD TO SEE YOU AGAIN, CADET ${firstName.toUpperCase()}.`}
        subtitle="Monitor real persisted mission telemetry, develop your 5 core astronaut skills, earn mission patches, and launch into interactive simulators."
        badges={
          <>
            <BadgePill
              tone="cyan"
              dot
              icon={<UserCheck className="h-3.5 w-3.5" />}
            >
              CALLSIGN: {callsign}
            </BadgePill>
            <BadgePill tone="emerald">{specialization.title}</BadgePill>
            <BadgePill tone="amber" icon={<Sparkles className="h-3.5 w-3.5" />}>
              Rank {stats.currentRank.level}: {stats.currentRank.title}
            </BadgePill>
            {cadetProfile?.favoriteDestination && (
              <BadgePill tone="neutral">
                Destination: {cadetProfile.favoriteDestination}
              </BadgePill>
            )}
          </>
        }
        actions={
          <>
            <ButtonLink
              to="/profile"
              variant="primary"
              size="sm"
              leftIcon={<UserCheck className="h-4 w-4" />}
            >
              Cadet Profile
            </ButtonLink>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={
                state.guidedProgression ? (
                  <Lock className="h-4 w-4 text-amber-300" />
                ) : (
                  <Unlock className="h-4 w-4 text-emerald-300" />
                )
              }
              onClick={() => setGuidedProgression(!state.guidedProgression)}
            >
              {state.guidedProgression ? 'Guided Locks: ON' : 'Open Mode: ON'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw className="h-4 w-4" />}
              onClick={resetAllProgress}
            >
              Start Fresh (0%)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={restoreSampleProgress}
            >
              Load Sample Data
            </Button>
          </>
        }
      />

      {/* Asymmetric Command Telemetry Grid */}
      <div className="grid gap-5 xl:grid-cols-12">
        {/* Primary Readiness & Rank Deck */}
        <Card
          variant="accent"
          topAccentClassName="from-sky-400/90 via-cyan-300/60 to-transparent"
          className="flex min-w-0 flex-col justify-between xl:col-span-7"
        >
          <div className="space-y-5">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
              <div className="shrink-0 self-start sm:self-center">
                <OrbitalRing
                  value={stats.overallPercentage}
                  size={104}
                  strokeWidth={8}
                  caption="READINESS"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex min-w-0 items-start gap-2.5">
                  <CadetAvatar
                    avatarId={cadetProfile?.avatarId}
                    size="sm"
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-mono text-xs font-semibold uppercase tracking-widest text-sky-300 leading-snug">
                      {specialization.title}
                    </p>
                    <p className="mt-0.5 break-words text-xs text-slate-400">
                      {cadetProfile
                        ? `${cadetProfile.cadetId} • ${getAvatarLabel(cadetProfile.avatarId)}`
                        : 'Mission Readiness'}
                    </p>
                  </div>
                </div>
                <p className="break-words font-display text-2xl font-bold text-slate-50 sm:text-[1.65rem] sm:leading-tight">
                  {stats.currentRank.title}
                </p>
                <p className="text-xs text-slate-300 sm:text-sm">
                  {stats.completedModulesCount}/{stats.totalModulesCount} completed missions •{' '}
                  <span className="font-mono font-semibold text-sky-300">
                    {stats.totalXp} XP
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 min-[340px]:grid-cols-2">
              <div className="min-w-0 rounded-xl border border-space-border/80 bg-space-void/70 px-3.5 py-2.5 text-center">
                <p className="font-mono text-base font-bold text-emerald-300">
                  {stats.completedModulesCount}
                </p>
                <p className="break-words text-[11px] text-slate-400">
                  Completed Missions
                </p>
              </div>
              <div className="min-w-0 rounded-xl border border-space-border/80 bg-space-void/70 px-3.5 py-2.5 text-center">
                <p className="font-mono text-base font-bold text-amber-300">
                  Day {state.profile.missionDay}
                </p>
                <p className="break-words text-[11px] text-slate-400">
                  Mission Log
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2">
            <ProgressBar
              label="Curriculum Completion"
              value={stats.overallPercentage}
              helperText={`${stats.completedModulesCount} of ${stats.totalModulesCount} decks complete`}
            />
            <ProgressBar
              label={
                stats.nextRank
                  ? `Rank Progress → ${stats.nextRank.title}`
                  : 'Highest Rank Achieved!'
              }
              value={stats.rankProgressPercent}
              fillClassName="bg-amber-400"
              helperText={
                stats.nextRank
                  ? `${stats.xpToNextRank} XP to next promotion`
                  : 'Junior Mission Commander unlocked!'
              }
            />
          </div>

          <div className="mt-5 flex min-w-0 flex-col gap-3 rounded-xl border border-space-border/80 bg-space-void/65 p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-400/15 text-sky-300">
                <NextIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  Next Recommended Mission
                </p>
                <p className="break-words text-sm font-semibold text-slate-50">
                  {nextRecommended.title}
                </p>
              </div>
            </div>

            <ButtonLink
              to={nextRecommended.route}
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="shrink-0"
            >
              Continue: {nextRecommended.shortTitle}
            </ButtonLink>
          </div>
        </Card>

        {/* Mission Patch Rack — Interactive Certificate Generation System */}
        <Card
          topAccentClassName="from-amber-400/80 via-emerald-400/50 to-transparent"
          className="flex min-w-0 flex-col justify-between xl:col-span-5"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold uppercase tracking-widest text-amber-300">
                  Mission Patch Rack
                </p>
                <h2 className="mt-0.5 font-display text-lg font-semibold text-slate-50">
                  Earned Certifications
                </h2>
              </div>
              <BadgePill
                tone={earnedCertificatesCount > 0 ? 'amber' : 'neutral'}
                icon={<Award className="h-3.5 w-3.5" />}
                className="shrink-0"
              >
                {earnedCertificatesCount}/{certificateStatuses.length} Earned
              </BadgePill>
            </div>

            <div className="mt-4 grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2">
              {certificateStatuses.map((item) => {
                const { definition, eligibility, issuedRecord } = item;
                const earned = issuedRecord !== null;

                if (earned && issuedRecord) {
                  return (
                    <div
                      key={definition.key}
                      className="flex min-w-0 items-stretch overflow-hidden rounded-xl border border-amber-400/50 bg-amber-400/12 shadow-[0_0_18px_rgba(251,191,36,0.12)] transition-all hover:border-amber-300/80 hover:bg-amber-400/18"
                    >
                      <button
                        type="button"
                        onClick={() => setPreviewCertKey(definition.key)}
                        aria-label={`Preview ${definition.title} certificate (${issuedRecord.certificateId})`}
                        className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5 px-3 py-2.5 text-left text-xs text-amber-100 focus-visible:outline-none"
                      >
                        <Award
                          className="mt-0.5 h-4 w-4 shrink-0 text-amber-300"
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="block break-words whitespace-normal font-semibold leading-snug text-amber-50">
                            {definition.title}
                          </span>
                          <span className="mt-0.5 block font-mono text-[10px] text-amber-200/90">
                            Earned • Click to Preview
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickDownloadCertificate(item)}
                        disabled={downloadingKey === definition.key}
                        aria-label={`Download ${definition.title} PDF certificate`}
                        title="Download A4 Landscape PDF"
                        className="flex shrink-0 cursor-pointer items-center justify-center border-l border-amber-400/35 px-2.5 text-amber-200 transition-colors hover:bg-amber-400/20 hover:text-white disabled:opacity-50"
                      >
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  );
                }

                return (
                  <button
                    key={definition.key}
                    type="button"
                    onClick={() => setLockedCertKey(definition.key)}
                    aria-label={`${definition.title} certification locked (${eligibility.progressPercent}% ready). View unlock requirements`}
                    className="flex min-w-0 cursor-pointer items-start gap-2.5 rounded-xl border border-space-border/90 bg-space-void/55 px-3 py-2.5 text-left text-xs text-slate-300 transition-colors hover:border-sky-400/45 hover:bg-space-void/80 hover:text-slate-100"
                  >
                    <Lock
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block break-words whitespace-normal font-medium leading-snug text-slate-200">
                        {definition.title}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] text-slate-400">
                        Locked • {eligibility.progressPercent}% ({eligibility.metCount}/{eligibility.totalCount})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 space-y-2.5 border-t border-space-border/75 pt-3">
            {rackNotice && (
              <p
                role="status"
                aria-live="polite"
                className="rounded-lg border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-medium text-emerald-200"
              >
                {rackNotice}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Download className="h-3.5 w-3.5" />}
                disabled={earnedCertificateRecords.length === 0 || downloadingAll}
                onClick={handleDownloadAllEarned}
              >
                {downloadingAll
                  ? 'Building Portfolio PDF…'
                  : 'Download All Earned (PDF)'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ShieldCheck className="h-3.5 w-3.5 text-sky-300" />}
                onClick={() => {
                  setVerifyInitialQuery('');
                  setVerifyModalOpen(true);
                }}
              >
                Verify ID
              </Button>
              <Link
                to="/certificates"
                className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200"
              >
                <FileBadge2 className="h-3.5 w-3.5" aria-hidden="true" />
                Certificates Vault →
              </Link>
            </div>

            <p className="text-[11px] leading-relaxed text-slate-400">
              {earnedCertificatesCount === 0
                ? 'Complete all 3 checklist steps AND pass the deck quiz or simulator mastery run to unlock downloadable A4 PDF certificates.'
                : 'Click any earned credential to preview A4 certificate, print, copy Certificate ID, or download PDF.'}
            </p>
          </div>
        </Card>
      </div>

      {/* Real Skill Development Matrix + Performance Analytics */}
      <div className="grid gap-5 lg:grid-cols-12">
        <Card
          topAccentClassName="from-sky-400/80 via-violet-400/50 to-transparent"
          className="min-w-0 lg:col-span-7"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-sky-300">
                Cadet Competency Profile
              </p>
              <h2 className="mt-0.5 font-display text-lg font-semibold text-slate-50">
                5 Core Astronaut Skill Tracks
              </h2>
            </div>
            <BadgePill tone="cyan" icon={<Compass className="h-3.5 w-3.5" />}>
              Live Persisted Progress
            </BadgePill>
          </div>

          <div className="space-y-3.5">
            {stats.skillScores.map((skill) => {
              const accent = ACCENT_STYLES[skill.accent];
              return (
                <div key={skill.id} className="min-w-0 space-y-1">
                  <ProgressBar
                    label={skill.label}
                    value={skill.percentage}
                    size="sm"
                    fillClassName={accent.progressFill}
                    helperText={skill.description}
                  />
                </div>
              );
            })}
          </div>
        </Card>

        <Card
          topAccentClassName="from-emerald-400/80 via-sky-400/50 to-transparent"
          className="flex min-w-0 flex-col justify-between lg:col-span-5"
        >
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-widest text-emerald-300">
                  Flight Analytics
                </p>
                <h2 className="mt-0.5 font-display text-lg font-semibold text-slate-50">
                  Recorded Telemetry Metrics
                </h2>
              </div>
              <BarChart3 className="h-5 w-5 text-emerald-300" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0 rounded-xl border border-space-border bg-space-void/75 p-3">
                <p className="font-mono text-lg font-bold text-sky-300">
                  {stats.analytics.totalSimAttempts}
                </p>
                <p className="text-[11px] text-slate-400">Logged Sim Runs</p>
              </div>
              <div className="min-w-0 rounded-xl border border-space-border bg-space-void/75 p-3">
                <p className="font-mono text-lg font-bold text-emerald-300">
                  {stats.analytics.totalPassedRuns}
                </p>
                <p className="text-[11px] text-slate-400">Passed Runs</p>
              </div>
              <div className="min-w-0 rounded-xl border border-space-border bg-space-void/75 p-3">
                <p className="font-mono text-lg font-bold text-amber-300">
                  {stats.analytics.averageBestScorePercent !== null
                    ? `${stats.analytics.averageBestScorePercent}%`
                    : '—'}
                </p>
                <p className="text-[11px] text-slate-400">Avg Best Sim Score</p>
              </div>
              <div className="min-w-0 rounded-xl border border-space-border bg-space-void/75 p-3">
                <p className="font-mono text-lg font-bold text-violet-300">
                  {stats.analytics.academyLessonsStudied}/10
                </p>
                <p className="text-[11px] text-slate-400">Academy Lessons</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 rounded-xl border border-space-border/80 bg-space-void/65 p-3 text-xs text-slate-300">
              <div className="flex items-center justify-between gap-2">
                <span>Best Academy Mastery Quiz</span>
                <span className="font-mono font-semibold text-sky-200">
                  {typeof state.academyBestQuizScore === 'number'
                    ? `${state.academyBestQuizScore}/10`
                    : 'Not taken yet'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Best ARIA Knowledge Quiz</span>
                <span className="font-mono font-semibold text-amber-200">
                  {typeof state.mentorBestQuizScore === 'number'
                    ? `${state.mentorBestQuizScore}/5`
                    : 'Not taken yet'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-space-border/75 pt-3">
            <span className="text-xs text-slate-400">
              Zero simulated filler — every counter reflects your actions.
            </span>
            <ButtonLink
              to="/references"
              variant="ghost"
              size="sm"
              leftIcon={<BookOpen className="h-3.5 w-3.5" />}
            >
              NASA Sources
            </ButtonLink>
          </div>
        </Card>
      </div>

      {/* Earned Achievements + Recent Activity Log */}
      <div className="grid gap-5 lg:grid-cols-12">
        <Card
          topAccentClassName="from-amber-400/80 via-rose-400/40 to-transparent"
          className="min-w-0 lg:col-span-7"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-amber-300">
                Milestones &amp; Honors
              </p>
              <h2 className="mt-0.5 font-display text-lg font-semibold text-slate-50">
                Cadet Achievements ({stats.analytics.earnedAchievementsCount}/
                {stats.analytics.totalAchievementsCount})
              </h2>
            </div>
            <Trophy className="h-5 w-5 text-amber-300" aria-hidden="true" />
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {stats.achievements.map((ach) => (
              <div
                key={ach.id}
                className={`min-w-0 rounded-xl border p-3 ${
                  ach.earned
                    ? 'border-amber-400/45 bg-amber-500/10'
                    : 'border-space-border bg-space-void/65 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-sm font-semibold text-slate-50">
                    {ach.title}
                  </p>
                  {ach.earned ? (
                    <ShieldCheck
                      className="h-4 w-4 shrink-0 text-emerald-300"
                      aria-hidden="true"
                    />
                  ) : (
                    <Lock
                      className="h-3.5 w-3.5 shrink-0 text-slate-500"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  {ach.description}
                </p>
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  {ach.earned ? 'Unlocked' : `Unlock: ${ach.requirement}`}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card
          topAccentClassName="from-cyan-400/80 via-sky-400/40 to-transparent"
          className="min-w-0 lg:col-span-5"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-cyan-300">
                Flight Data Recorder
              </p>
              <h2 className="mt-0.5 font-display text-lg font-semibold text-slate-50">
                Recent Mission Activity
              </h2>
            </div>
            <Activity className="h-5 w-5 text-cyan-300" aria-hidden="true" />
          </div>

          {recentActivity.length === 0 ? (
            <EmptyState
              title="No Telemetry Events Logged Yet"
              description="Complete a Moon landing attempt, Zero-G docking, EVA suit repair, Emergency alert, or ARIA quiz to record mission history here."
            />
          ) : (
            <div className="max-h-[340px] space-y-2.5 overflow-y-auto pr-1">
              {recentActivity.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-space-border bg-space-void/75 p-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-slate-100">
                      {entry.moduleTitle}
                    </span>
                    <BadgePill
                      tone={
                        entry.outcome === 'success'
                          ? 'emerald'
                          : entry.outcome === 'milestone'
                            ? 'amber'
                            : 'rose'
                      }
                    >
                      {entry.outcome === 'success'
                        ? 'Pass'
                        : entry.outcome === 'milestone'
                          ? 'Milestone'
                          : 'Retry'}
                    </BadgePill>
                  </div>
                  <p className="mt-1 leading-relaxed text-slate-300">
                    {entry.summary}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] text-slate-400">
                    <span>{formatActivityTime(entry.timestamp)}</span>
                    {typeof entry.score === 'number' &&
                      typeof entry.maxScore === 'number' && (
                        <span>
                          Score: {entry.score}/{entry.maxScore}
                        </span>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Module Filter & Search Bar */}
      <section aria-labelledby="modules-list-heading" className="space-y-5">
        <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-space-border/80 bg-space-navy/75 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <h2
              id="modules-list-heading"
              className="font-display text-xl font-bold text-slate-50"
            >
              Training Modules
            </h2>
            <p className="text-sm text-slate-400">
              Select any deck to practice space skills and record checklist progress.{' '}
              {state.guidedProgression
                ? 'Guided Prerequisites mode is active.'
                : 'Open Exploration allows jumping into any deck.'}
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative min-w-0 sm:w-56">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <label htmlFor="module-search" className="sr-only">
                Search training modules
              </label>
              <input
                id="module-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules..."
                className="h-10 w-full rounded-xl border border-space-border bg-space-void/90 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400/60 focus:outline-none"
              />
            </div>

            <div
              role="group"
              aria-label="Filter modules by status"
              className="flex flex-wrap gap-1.5"
            >
              {filterButtons.map((btn) => {
                const isActive = activeFilter === btn.key;
                return (
                  <button
                    key={btn.key}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveFilter(btn.key)}
                    className={`min-h-9 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'border-sky-400/50 bg-sky-400/15 text-sky-200 shadow-[inset_0_1px_0_rgba(125,211,252,0.16)]'
                        : 'border-space-border bg-space-void/70 text-slate-300 hover:border-sky-400/30 hover:text-slate-100'
                    }`}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {filteredModules.length === 0 ? (
          <EmptyState
            title="No Training Modules Match This Filter"
            description="Try clearing your search keyword or switching back to view all six astronaut training decks."
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setActiveFilter('all');
                  setSearchQuery('');
                }}
              >
                Show All Modules
              </Button>
            }
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredModules.map(
              ({ mod, deckNumber, summary, unlockState, perfRecord }) => {
                const Icon = mod.icon;
                const accent = ACCENT_STYLES[mod.accent];
                const isLocked = state.guidedProgression && !unlockState.unlocked;

                return (
                  <Card
                    key={mod.id}
                    interactive
                    topAccentClassName={accent.topBar}
                    className={`flex min-w-0 flex-col justify-between ${accent.borderHover} ${accent.glow}`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2.5">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${accent.iconBox}`}
                          >
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
                              <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                Deck {deckNumber}
                              </span>
                              <span aria-hidden="true">•</span>
                              <span>{mod.difficulty}</span>
                              <span aria-hidden="true">•</span>
                              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                                <Clock className="h-3 w-3" aria-hidden="true" />
                                {mod.estimatedMinutes} min
                              </span>
                            </div>
                            <h3 className="mt-0.5 break-words font-display text-lg font-semibold text-slate-50">
                              {mod.title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                          {isLocked && (
                            <BadgePill tone="amber" icon={<Lock className="h-3 w-3" />}>
                              Locked
                            </BadgePill>
                          )}
                          <StatusPill status={summary.status} />
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-slate-300">
                        {mod.description}
                      </p>

                      {isLocked && (
                        <p className="mt-2.5 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200">
                          Prerequisite: {unlockState.requirementText}
                        </p>
                      )}

                      {!isLocked &&
                        perfRecord &&
                        perfRecord.attempts > 0 && (
                          <p className="mt-2.5 font-mono text-[11px] text-slate-400">
                            Telemetry: {perfRecord.attempts} run(s) •{' '}
                            {perfRecord.bestScore !== null &&
                            perfRecord.maxScore !== null
                              ? `Best Score ${perfRecord.bestScore}/${perfRecord.maxScore}`
                              : `${perfRecord.passedCount} passed`}
                          </p>
                        )}
                    </div>

                    <div className="mt-5 space-y-4 border-t border-space-border/80 pt-4">
                      <ProgressBar
                        label={`${summary.completedCount} of ${summary.totalCount} checklist steps`}
                        value={summary.percentage}
                        fillClassName={accent.progressFill}
                        size="sm"
                      />

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                          {certificateByModule.get(mod.id)?.issuedRecord ? (
                            <>
                              <CheckCircle2
                                className="h-4 w-4 text-emerald-300"
                                aria-hidden="true"
                              />
                              <span className="text-emerald-300">
                                Certified: {mod.patchTitle}
                              </span>
                            </>
                          ) : summary.status === 'completed' ? (
                            <span className="text-amber-300">
                              Checklist Complete • Pass mastery proof to certify
                            </span>
                          ) : (
                            <span>
                              Reward: +{summary.totalPossibleXp} XP &amp;{' '}
                              {mod.patchTitle}
                            </span>
                          )}
                        </span>

                        <ButtonLink
                          to={mod.route}
                          variant={
                            summary.status === 'completed' || isLocked
                              ? 'secondary'
                              : 'primary'
                          }
                          size="sm"
                          rightIcon={<ArrowRight className="h-4 w-4" />}
                        >
                          {isLocked
                            ? 'Inspect Lock'
                            : summary.status === 'completed'
                              ? 'Review'
                              : summary.status === 'in-progress'
                                ? 'Continue'
                                : 'Launch'}
                        </ButtonLink>
                      </div>
                    </div>
                  </Card>
                );
              },
            )}
          </div>
        )}
      </section>
    </div>

    <CertificatePreviewModal
      statusItem={activePreviewCert}
      currentCadetName={currentCertIdentity.recipientName}
      currentCadetCallsign={currentCertIdentity.recipientCallsign}
      onClose={() => setPreviewCertKey(null)}
      onReissue={reissueCertificate}
      onOpenVerify={(certId) => {
        setPreviewCertKey(null);
        setVerifyInitialQuery(certId);
        setVerifyModalOpen(true);
      }}
    />

    <LockedCertificateModal
      statusItem={activeLockedCert}
      onClose={() => setLockedCertKey(null)}
    />

    <CertificateVerificationModal
      open={verifyModalOpen}
      initialQuery={verifyInitialQuery}
      issuedCertificates={earnedCertificateRecords}
      onVerify={verifyCertificate}
      onSelectPreviewRecord={(record) => setPreviewCertKey(record.certificateKey)}
      onClose={() => setVerifyModalOpen(false)}
    />
  </>
  );
}
