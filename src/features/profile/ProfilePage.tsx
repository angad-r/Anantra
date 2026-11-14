import {
  AlertTriangle,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Compass,
  Download,
  FileBadge2,
  Lock,
  RotateCcw,
  Save,
  ShieldAlert,
  Sparkles,
  Unlock,
  UserCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { BadgePill } from '../../components/ui/BadgePill';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useTraining } from '../../context/TrainingContext';
import type {
  AgeGroup,
  AvatarId,
  SpaceDestination,
  SpecializationId,
} from '../../types/cadetProfile';
import { CadetAvatar, getAvatarLabel } from '../onboarding/CadetAvatar';
import { SpecializationArtwork } from '../onboarding/SpecializationArtwork';
import {
  AGE_GROUP_OPTIONS,
  CADET_AVATARS,
  CADET_SPECIALIZATIONS,
  FAVORITE_DESTINATIONS,
  SPECIALIZATION_BY_ID,
  type CadetIdentityValidationErrors,
  validateCadetIdentity,
} from '../onboarding/cadetProfileData';

export function ProfilePage() {
  const navigate = useNavigate();
  const {
    cadetProfile,
    state,
    stats,
    certificateStatuses,
    earnedCertificatesCount,
    isOnline,
    storageError,
    setGuidedProgression,
    updateCadetProfile,
    resetCadetProfile,
  } = useTraining();

  const [firstName, setFirstName] = useState(cadetProfile?.firstName ?? '');
  const [fullName, setFullName] = useState(cadetProfile?.fullName ?? '');
  const [callsign, setCallsign] = useState(cadetProfile?.callsign ?? '');
  const [specialization, setSpecialization] = useState<SpecializationId>(
    cadetProfile?.specialization ?? 'lunar-explorer',
  );
  const [avatarId, setAvatarId] = useState<AvatarId | undefined>(
    cadetProfile?.avatarId,
  );
  const [ageGroup, setAgeGroup] = useState<AgeGroup | undefined>(
    cadetProfile?.ageGroup,
  );
  const [favoriteDestination, setFavoriteDestination] = useState<
    SpaceDestination | undefined
  >(cadetProfile?.favoriteDestination);

  const [errors, setErrors] = useState<CadetIdentityValidationErrors>({});
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  useEffect(() => {
    if (!cadetProfile) return;
    setFirstName(cadetProfile.firstName);
    setFullName(cadetProfile.fullName ?? '');
    setCallsign(cadetProfile.callsign);
    setSpecialization(cadetProfile.specialization);
    setAvatarId(cadetProfile.avatarId);
    setAgeGroup(cadetProfile.ageGroup);
    setFavoriteDestination(cadetProfile.favoriteDestination);
  }, [cadetProfile]);

  useEffect(() => {
    if (!resetDialogOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setResetDialogOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetDialogOpen]);

  if (!cadetProfile) {
    return null;
  }

  const activeSpec = SPECIALIZATION_BY_ID[cadetProfile.specialization];

  const handleSaveChanges = (event: FormEvent) => {
    event.preventDefault();
    const validation = validateCadetIdentity(firstName, callsign);
    setErrors(validation);

    const cleanedFullName = fullName.trim().replace(/\s+/g, ' ');
    let nextFullNameError: string | null = null;
    if (cleanedFullName.includes('@')) {
      nextFullNameError =
        'No email needed! Enter your display/full name for certificates only.';
    } else if (cleanedFullName.length > 60) {
      nextFullNameError = 'Full name must be 60 characters or fewer.';
    }
    setFullNameError(nextFullNameError);

    if (validation.firstName || validation.callsign || nextFullNameError) {
      setSavedNotice(null);
      return;
    }

    const updated = updateCadetProfile({
      firstName,
      ...(cleanedFullName ? { fullName: cleanedFullName } : {}),
      callsign,
      specialization,
      ...(avatarId ? { avatarId } : {}),
      ...(ageGroup ? { ageGroup } : {}),
      ...(favoriteDestination ? { favoriteDestination } : {}),
    });

    if (updated) {
      setSavedNotice(
        `Cadet badge updated for CADET ${updated.firstName.toUpperCase()} (${updated.callsign}). Previously earned certificates preserve their original recipient snapshot until deliberately reissued in the Certificates Vault.`,
      );
    }
  };

  const handleExportTelemetry = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      application: 'ANANTRA Junior Astronaut Mission Trainer',
      cadetProfile,
      trainingState: state,
      summary: {
        rank: stats.currentRank.title,
        totalXp: stats.totalXp,
        overallPercentage: stats.overallPercentage,
        completedModulesCount: stats.completedModulesCount,
        skills: stats.skillScores,
        earnedAchievements: stats.achievements
          .filter((a) => a.earned)
          .map((a) => a.title),
      },
    };

    const jsonText = JSON.stringify(payload, null, 2);
    if (typeof URL.createObjectURL === 'function') {
      const blob = new Blob([jsonText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `anantra-cadet-${cadetProfile.callsign.toLowerCase()}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }
    setExportNotice(
      `Exported non-sensitive cadet mission log (${stats.totalXp} XP, ${stats.completedModulesCount}/${stats.totalModulesCount} decks).`,
    );
  };

  const handleConfirmResetProfile = () => {
    setResetDialogOpen(false);
    resetCadetProfile();
    navigate('/');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow="CADET CREDENTIALS & DOSSIER"
        title="Cadet Profile"
        subtitle="Manage your callsign, specialization, avatar badge, progression lock mode, and exported telemetry."
        backTo={{ label: 'Back to Dashboard', to: '/dashboard' }}
        actions={
          <ButtonLink
            to="/certificates"
            variant="secondary"
            size="sm"
            leftIcon={<FileBadge2 className="h-4 w-4 text-amber-300" />}
          >
            Certificates Vault ({earnedCertificatesCount}/{certificateStatuses.length})
          </ButtonLink>
        }
        badges={
          <>
            <BadgePill tone="cyan" dot icon={<UserCheck className="h-3.5 w-3.5" />}>
              ID: {cadetProfile.cadetId}
            </BadgePill>
            <BadgePill tone="amber" icon={<Sparkles className="h-3.5 w-3.5" />}>
              {stats.currentRank.title}
            </BadgePill>
          </>
        }
      />

      {/* Current Cadet Identity Overview Card */}
      <Card
        variant="accent"
        topAccentClassName="from-sky-400/90 via-cyan-300/60 to-transparent"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <CadetAvatar
              avatarId={cadetProfile.avatarId}
              size="xl"
              className="border-2 border-sky-400/60"
            />
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase tracking-widest text-sky-300">
                CALLSIGN: {cadetProfile.callsign}
              </p>
              <h2 className="mt-1 break-words font-display text-2xl font-bold text-slate-50">
                Cadet {cadetProfile.fullName ?? cadetProfile.firstName}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <BadgePill tone="emerald">{activeSpec.title}</BadgePill>
                <BadgePill tone="neutral">
                  Avatar: {getAvatarLabel(cadetProfile.avatarId)}
                </BadgePill>
                {cadetProfile.ageGroup && (
                  <BadgePill tone="neutral">
                    Age: {cadetProfile.ageGroup}
                  </BadgePill>
                )}
                {cadetProfile.favoriteDestination && (
                  <BadgePill tone="amber">
                    Destination: {cadetProfile.favoriteDestination}
                  </BadgePill>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:shrink-0">
            <div className="rounded-xl border border-space-border/80 bg-space-void/75 px-3.5 py-2.5 text-center">
              <p className="font-mono text-base font-bold text-sky-300">
                {stats.totalXp} XP
              </p>
              <p className="text-[11px] text-slate-400">Earned</p>
            </div>
            <div className="rounded-xl border border-space-border/80 bg-space-void/75 px-3.5 py-2.5 text-center">
              <p className="font-mono text-base font-bold text-emerald-300">
                {stats.completedModulesCount}/{stats.totalModulesCount}
              </p>
              <p className="text-[11px] text-slate-400">Completed</p>
            </div>
            <div className="rounded-xl border border-space-border/80 bg-space-void/75 px-3.5 py-2.5 text-center">
              <p className="font-mono text-base font-bold text-amber-300">
                <Award className="mx-auto mb-0.5 inline h-4 w-4" aria-hidden="true" />{' '}
                {earnedCertificatesCount}
              </p>
              <p className="text-[11px] text-slate-400">Certified</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Cadet Profile Form */}
      <Card
        variant="elevated"
        padding="lg"
        topAccentClassName="from-sky-400/70 via-indigo-400/40 to-transparent"
      >
        <form onSubmit={handleSaveChanges} noValidate className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-50">
              Edit Cadet Details
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Update your name, callsign, specialization track, avatar, or optional preferences anytime.
            </p>
          </div>

          {savedNotice && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2.5 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-3 text-sm font-medium text-emerald-100"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
              <span>{savedNotice}</span>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="profile-first-name"
                className="mb-1.5 block text-sm font-semibold text-slate-100"
              >
                First Name <span className="text-sky-300">*</span>
              </label>
              <input
                id="profile-first-name"
                name="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setSavedNotice(null);
                  if (errors.firstName) {
                    setErrors((prev) => ({ ...prev, firstName: undefined }));
                  }
                }}
                aria-invalid={Boolean(errors.firstName)}
                aria-describedby={
                  errors.firstName ? 'profile-first-name-error' : undefined
                }
                className={`min-h-11 w-full rounded-xl border bg-space-void/90 px-3.5 py-2 text-sm text-slate-50 focus:outline-none ${
                  errors.firstName
                    ? 'border-rose-400 focus:border-rose-400'
                    : 'border-space-border focus:border-sky-400'
                }`}
              />
              {errors.firstName && (
                <p
                  id="profile-first-name-error"
                  role="alert"
                  className="mt-1.5 text-xs font-medium text-rose-300"
                >
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="profile-callsign"
                className="mb-1.5 block text-sm font-semibold text-slate-100"
              >
                Astronaut Callsign <span className="text-sky-300">*</span>
              </label>
              <input
                id="profile-callsign"
                name="callsign"
                type="text"
                required
                value={callsign}
                onChange={(e) => {
                  setCallsign(e.target.value);
                  setSavedNotice(null);
                  if (errors.callsign) {
                    setErrors((prev) => ({ ...prev, callsign: undefined }));
                  }
                }}
                aria-invalid={Boolean(errors.callsign)}
                aria-describedby={
                  errors.callsign ? 'profile-callsign-error' : undefined
                }
                className={`min-h-11 w-full rounded-xl border bg-space-void/90 px-3.5 py-2 font-mono text-sm uppercase text-slate-50 focus:outline-none ${
                  errors.callsign
                    ? 'border-rose-400 focus:border-rose-400'
                    : 'border-space-border focus:border-sky-400'
                }`}
              />
              {errors.callsign && (
                <p
                  id="profile-callsign-error"
                  role="alert"
                  className="mt-1.5 text-xs font-medium text-rose-300"
                >
                  {errors.callsign}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="profile-full-name"
                  className="text-sm font-semibold text-slate-100"
                >
                  Full Name for Certificates{' '}
                  <span className="text-xs font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>
                <span className="font-mono text-[11px] text-slate-400">
                  Used on exported A4 certificates
                </span>
              </div>
              <input
                id="profile-full-name"
                name="fullName"
                type="text"
                maxLength={64}
                placeholder={`e.g. ${cadetProfile.firstName} Ranjan`}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setSavedNotice(null);
                  setFullNameError(null);
                }}
                aria-invalid={Boolean(fullNameError)}
                aria-describedby={
                  fullNameError
                    ? 'profile-full-name-error'
                    : 'profile-full-name-help'
                }
                className={`min-h-11 w-full rounded-xl border bg-space-void/90 px-3.5 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none ${
                  fullNameError
                    ? 'border-rose-400 focus:border-rose-400'
                    : 'border-space-border focus:border-sky-400'
                }`}
              />
              {fullNameError ? (
                <p
                  id="profile-full-name-error"
                  role="alert"
                  className="mt-1.5 text-xs font-medium text-rose-300"
                >
                  {fullNameError}
                </p>
              ) : (
                <p
                  id="profile-full-name-help"
                  className="mt-1.5 text-xs text-slate-400"
                >
                  Displayed on newly earned and printed PDF certificates.
                  Updating your name does not alter previously earned
                  certificates unless you click Reissue in the Certificates Vault.
                </p>
              )}
            </div>
          </div>

          {/* Specialization Selection */}
          <div>
            <p className="mb-2.5 text-sm font-semibold text-slate-100">
              Astronaut Specialization
            </p>
            <div
              role="group"
              aria-label="Edit astronaut specialization"
              className="grid gap-3 sm:grid-cols-2"
            >
              {CADET_SPECIALIZATIONS.map((spec) => {
                const selected = specialization === spec.id;
                return (
                  <button
                    key={spec.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setSpecialization(spec.id);
                      setSavedNotice(null);
                    }}
                    className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                      selected
                        ? `${spec.accentBorder} ${spec.accentBg} ${spec.accentGlow}`
                        : 'border-space-border bg-space-void/70 hover:border-sky-400/40'
                    }`}
                  >
                    <SpecializationArtwork
                      specialization={spec.id}
                      className="h-10 w-10 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-sm font-bold text-slate-50">
                          {spec.title}
                        </span>
                        {selected && (
                          <Check className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-300">
                        {spec.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Avatar Selection */}
          <div>
            <p className="mb-2.5 text-sm font-semibold text-slate-100">
              Profile Avatar{' '}
              <span className="text-xs font-normal text-slate-400">
                (Optional — click again to use default crest)
              </span>
            </p>
            <div
              role="group"
              aria-label="Edit profile avatar"
              className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6"
            >
              {CADET_AVATARS.map((item) => {
                const selected = avatarId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setAvatarId(selected ? undefined : item.id);
                      setSavedNotice(null);
                    }}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all cursor-pointer ${
                      selected
                        ? 'border-sky-400 bg-sky-400/15'
                        : 'border-space-border bg-space-void/70 hover:border-sky-400/40'
                    }`}
                  >
                    <CadetAvatar avatarId={item.id} size="md" />
                    <span className="text-xs font-medium text-slate-200">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Age Group & Destination */}
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-100">
                Age Group{' '}
                <span className="text-xs font-normal text-slate-400">
                  (Optional)
                </span>
              </p>
              <div
                role="group"
                aria-label="Edit age group"
                className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              >
                {AGE_GROUP_OPTIONS.map((group) => {
                  const selected = ageGroup === group;
                  return (
                    <button
                      key={group}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setAgeGroup(selected ? undefined : group);
                        setSavedNotice(null);
                      }}
                      className={`min-h-10 rounded-xl border px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                        selected
                          ? 'border-sky-400/70 bg-sky-400/15 text-sky-100'
                          : 'border-space-border bg-space-void/70 text-slate-300 hover:border-sky-400/40'
                      }`}
                    >
                      {group}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-100">
                Favourite Space Destination{' '}
                <span className="text-xs font-normal text-slate-400">
                  (Optional)
                </span>
              </p>
              <div
                role="group"
                aria-label="Edit favourite space destination"
                className="flex flex-wrap gap-2"
              >
                {FAVORITE_DESTINATIONS.map((dest) => {
                  const selected = favoriteDestination === dest.id;
                  return (
                    <button
                      key={dest.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setFavoriteDestination(selected ? undefined : dest.id);
                        setSavedNotice(null);
                      }}
                      className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        selected
                          ? 'border-sky-400/70 bg-sky-400/15 text-sky-100'
                          : 'border-space-border bg-space-void/70 text-slate-300 hover:border-sky-400/40'
                      }`}
                    >
                      <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                      {dest.id}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-space-border/80 pt-5">
            <Button
              type="submit"
              variant="primary"
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Mission Settings, Export & System Telemetry Diagnostics */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card
          topAccentClassName="from-amber-400/80 via-sky-400/40 to-transparent"
          className="flex min-w-0 flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-slate-50">
                Mission Progression Mode &amp; Backup
              </h2>
              <BadgePill tone={state.guidedProgression ? 'amber' : 'emerald'}>
                {state.guidedProgression ? 'Guided Sequence' : 'Open Exploration'}
              </BadgePill>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
              Enable <strong>Guided Prerequisite Locks</strong> to train in NASA progression order (Academy → Mission Control → Zero-G → Spacewalk → Emergency), or switch to <strong>Open Exploration</strong> anytime.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <Button
                variant={state.guidedProgression ? 'primary' : 'secondary'}
                size="sm"
                leftIcon={
                  state.guidedProgression ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Unlock className="h-4 w-4" />
                  )
                }
                onClick={() => setGuidedProgression(!state.guidedProgression)}
              >
                {state.guidedProgression
                  ? 'Switch to Open Exploration'
                  : 'Enable Guided Prerequisites'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={handleExportTelemetry}
              >
                Export Telemetry JSON
              </Button>
            </div>
            {exportNotice && (
              <p role="status" className="text-xs font-medium text-emerald-300">
                {exportNotice}
              </p>
            )}
          </div>
        </Card>

        <Card
          topAccentClassName="from-cyan-400/80 via-emerald-400/40 to-transparent"
          className="flex min-w-0 flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <h2 className="font-display text-lg font-bold text-slate-50">
              System Telemetry &amp; Privacy Status
            </h2>
            <div className="space-y-2 rounded-xl border border-space-border bg-space-void/75 p-3 text-xs text-slate-300">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5">
                  {isOnline ? (
                    <Wifi className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
                  )}
                  Network Connectivity
                </span>
                <span className="font-mono font-semibold text-slate-100">
                  {isOnline ? 'Online' : 'Offline — Local Storage Active'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Local Persistence</span>
                <span className="font-mono font-semibold text-slate-100">
                  {storageError ? 'Session Memory Fallback' : 'Browser LocalStorage Synced'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>ARIA Coach Privacy</span>
                <span className="font-mono font-semibold text-emerald-300">
                  Zero Client API Keys
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-xs text-slate-400">
              Zero PII collected (no email, password, or tracking).
            </span>
            <ButtonLink
              to="/references"
              variant="ghost"
              size="sm"
              leftIcon={<BookOpen className="h-3.5 w-3.5" />}
            >
              Science &amp; Sources
            </ButtonLink>
          </div>
        </Card>
      </div>

      {/* Reset Cadet Profile Section */}
      <Card
        topAccentClassName="from-rose-400/80 via-amber-400/40 to-transparent"
        className="border-rose-400/30"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-400/35 bg-rose-500/15 text-rose-300">
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-50">
                Reset Cadet Profile
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Start cadet onboarding over with a different name, callsign, or specialization. Your completed missions, XP, and earned patches stay safely saved on this device.
              </p>
            </div>
          </div>

          <Button
            variant="danger"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={() => setResetDialogOpen(true)}
            className="shrink-0"
          >
            Reset Cadet Profile
          </Button>
        </div>
      </Card>

      {/* Accessible Confirmation Dialog */}
      {resetDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-space-void/80 p-4 backdrop-blur-sm"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-profile-dialog-title"
            aria-describedby="reset-profile-dialog-desc"
            className="w-full max-w-md rounded-2xl border border-rose-400/45 bg-space-navy p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-400/35 bg-rose-500/15 text-rose-300">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3
                  id="reset-profile-dialog-title"
                  className="font-display text-lg font-bold text-slate-50"
                >
                  Confirm Cadet Profile Reset
                </h3>
                <p
                  id="reset-profile-dialog-desc"
                  className="mt-2 text-sm leading-relaxed text-slate-300"
                >
                  This clears your current cadet name, callsign ({cadetProfile.callsign}), avatar, and specialization and returns you to the onboarding welcome screen. Your training progress, XP, and earned mission patches will remain preserved.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2.5">
              <Button
                variant="secondary"
                onClick={() => setResetDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmResetProfile}
              >
                Confirm Reset Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
