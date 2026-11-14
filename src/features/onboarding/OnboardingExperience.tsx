import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Compass,
  Rocket,
  ShieldCheck,
  SkipForward,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgePill } from '../../components/ui/BadgePill';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/StateFeedback';
import { StarfieldBackground } from '../../components/ui/StarfieldBackground';
import { useTraining } from '../../context/TrainingContext';
import type {
  AgeGroup,
  AvatarId,
  SpaceDestination,
  SpecializationId,
} from '../../types/cadetProfile';
import { CadetAvatar, getAvatarLabel } from './CadetAvatar';
import {
  WelcomeOrbitalHeroArtwork,
  SpecializationArtwork,
} from './SpecializationArtwork';
import {
  AGE_GROUP_OPTIONS,
  CADET_AVATARS,
  CADET_SPECIALIZATIONS,
  CALLSIGN_SUGGESTIONS,
  FAVORITE_DESTINATIONS,
  SPECIALIZATION_BY_ID,
  type CadetIdentityValidationErrors,
  validateCadetIdentity,
} from './cadetProfileData';

type OnboardingStep =
  | 'welcome'
  | 'identity'
  | 'preferences'
  | 'specialization'
  | 'confirmation';

const REGISTRATION_STEPS: { id: OnboardingStep; number: number; label: string }[] = [
  { id: 'identity', number: 1, label: 'Cadet Identity' },
  { id: 'preferences', number: 2, label: 'Preferences' },
  { id: 'specialization', number: 3, label: 'Specialization' },
];

export function OnboardingExperience() {
  const navigate = useNavigate();
  const {
    cadetProfile,
    profileError,
    awaitingMissionControlEntry,
    registerCadetProfile,
    enterMissionControl,
    dismissProfileError,
  } = useTraining();

  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [firstName, setFirstName] = useState('');
  const [callsign, setCallsign] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup | undefined>(undefined);
  const [avatarId, setAvatarId] = useState<AvatarId | undefined>(undefined);
  const [favoriteDestination, setFavoriteDestination] = useState<
    SpaceDestination | undefined
  >(undefined);
  const [specialization, setSpecialization] = useState<
    SpecializationId | undefined
  >(undefined);

  const [identityErrors, setIdentityErrors] =
    useState<CadetIdentityValidationErrors>({});
  const [specializationError, setSpecializationError] = useState<string | null>(
    null,
  );

  const activeStep: OnboardingStep =
    awaitingMissionControlEntry && cadetProfile ? 'confirmation' : step;

  const handleIdentityContinue = (event: FormEvent) => {
    event.preventDefault();
    const validation = validateCadetIdentity(firstName, callsign);
    setIdentityErrors(validation);
    if (validation.firstName || validation.callsign) {
      return;
    }
    setStep('preferences');
  };

  const handleSkipOptionalPreferences = () => {
    setAgeGroup(undefined);
    setAvatarId(undefined);
    setFavoriteDestination(undefined);
    setStep('specialization');
  };

  const handleCompleteRegistration = () => {
    const validation = validateCadetIdentity(firstName, callsign);
    if (validation.firstName || validation.callsign) {
      setIdentityErrors(validation);
      setStep('identity');
      return;
    }
    if (!specialization) {
      setSpecializationError(
        'Please select one of the four astronaut specializations to continue.',
      );
      return;
    }
    setSpecializationError(null);
    registerCadetProfile({
      firstName,
      callsign,
      specialization,
      ...(avatarId ? { avatarId } : {}),
      ...(ageGroup ? { ageGroup } : {}),
      ...(favoriteDestination ? { favoriteDestination } : {}),
    });
    setStep('confirmation');
  };

  const handleEnterMissionControl = () => {
    enterMissionControl();
    navigate('/dashboard');
  };

  const currentRegStepIndex = REGISTRATION_STEPS.findIndex(
    (s) => s.id === activeStep,
  );

  return (
    <div className="relative flex min-h-screen flex-col text-slate-100">
      <StarfieldBackground />

      {/* Top Academy Identity Strip */}
      <header className="relative z-10 border-b border-space-border/60 bg-space-void/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-400/45 bg-gradient-to-br from-sky-400/20 to-sky-500/5 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.22)]">
              <Rocket className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <span className="block font-display text-base font-bold tracking-wider text-slate-50">
                ANANTRA
              </span>
              <span className="block text-[11px] font-medium text-slate-400">
                Junior Astronaut Mission Trainer
              </span>
            </div>
          </div>

          <BadgePill tone="cyan" dot icon={<ShieldCheck className="h-3.5 w-3.5" />}>
            Cadet Onboarding // Private & Local
          </BadgePill>
        </div>
      </header>

      <main
        id="main-content"
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
      >
        {profileError && (
          <div className="mb-6">
            <ErrorState
              title="Cadet Profile Recovery Needed"
              message={profileError}
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={dismissProfileError}
                >
                  Dismiss Notice
                </Button>
              }
            />
          </div>
        )}

        {/* SCREEN 0: FIRST-TIME WELCOME */}
        {activeStep === 'welcome' && (
          <section
            aria-labelledby="welcome-headline"
            className="grid items-center gap-10 lg:grid-cols-12"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6 lg:col-span-7"
            >
              <BadgePill
                tone="cyan"
                dot
                icon={<Sparkles className="h-3.5 w-3.5" />}
              >
                ANANTRA Space Academy • New Recruit Orientation
              </BadgePill>

              <h1
                id="welcome-headline"
                className="font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
              >
                YOUR JOURNEY TO THE STARS BEGINS HERE.
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Every great astronaut starts somewhere. Your mission begins today.
              </p>

              <div className="flex flex-wrap gap-2.5 text-xs text-slate-300">
                <span className="rounded-full border border-space-border bg-space-navy/85 px-3.5 py-1.5">
                  No Email or Password Needed
                </span>
                <span className="rounded-full border border-space-border bg-space-navy/85 px-3.5 py-1.5">
                  Saved Safely on This Device
                </span>
                <span className="rounded-full border border-space-border bg-space-navy/85 px-3.5 py-1.5">
                  6 Interactive Training Simulations
                </span>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  onClick={() => setStep('identity')}
                >
                  START YOUR TRAINING
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.45,
                delay: 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex justify-center lg:col-span-5"
            >
              <Card
                variant="accent"
                padding="lg"
                topAccentClassName="from-sky-400/90 via-cyan-300/60 to-indigo-400/50"
                className="flex w-full max-w-md flex-col items-center text-center"
              >
                <div className="mb-2 flex w-full items-center justify-between font-mono text-[11px] uppercase tracking-widest text-sky-300">
                  <span>ORBITAL LINK: ONLINE</span>
                  <span>SECTOR: EARTH-LEO</span>
                </div>
                <WelcomeOrbitalHeroArtwork />
                <p className="mt-2 font-mono text-xs text-slate-400">
                  Complete quick cadet enrollment to unlock your Flight Pass & Mission Control.
                </p>
              </Card>
            </motion.div>
          </section>
        )}

        {/* STEPS 1–3: MULTI-STEP REGISTRATION */}
        {(activeStep === 'identity' ||
          activeStep === 'preferences' ||
          activeStep === 'specialization') && (
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-3xl space-y-6"
          >
            {/* Multi-step Progress Header */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-sky-300">
                  Cadet Enrollment • Step {currentRegStepIndex + 1} of{' '}
                  {REGISTRATION_STEPS.length}
                </span>
                <span className="text-xs text-slate-400">
                  Private local badge • No email or password required
                </span>
              </div>

              <ol
                aria-label="Registration steps"
                className="grid grid-cols-3 gap-2.5"
              >
                {REGISTRATION_STEPS.map((item, idx) => {
                  const isCurrent = item.id === activeStep;
                  const isDone = idx < currentRegStepIndex;
                  return (
                    <li
                      key={item.id}
                      aria-current={isCurrent ? 'step' : undefined}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
                        isCurrent
                          ? 'border-sky-400/60 bg-sky-400/15 text-sky-100'
                          : isDone
                            ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                            : 'border-space-border bg-space-navy/70 text-slate-400'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold ${
                          isCurrent
                            ? 'bg-sky-400 text-slate-950'
                            : isDone
                              ? 'bg-emerald-400 text-slate-950'
                              : 'bg-space-slate text-slate-300'
                        }`}
                      >
                        {isDone ? (
                          <Check className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          item.number
                        )}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* STEP 1: REQUIRED IDENTITY */}
            {activeStep === 'identity' && (
              <Card
                variant="elevated"
                padding="lg"
                topAccentClassName="from-sky-400/85 via-cyan-300/60 to-transparent"
              >
                <form
                  onSubmit={handleIdentityContinue}
                  noValidate
                  className="space-y-6"
                >
                  <div>
                    <h1 className="font-display text-2xl font-bold text-slate-50 sm:text-3xl">
                      Create Your Cadet Callsign
                    </h1>
                    <p className="mt-1.5 text-sm text-slate-300">
                      Tell Mission Control what to call you on your Flight Pass and Dashboard.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Required: First Name */}
                    <div>
                      <label
                        htmlFor="onboarding-first-name"
                        className="mb-1.5 flex items-center justify-between text-sm font-semibold text-slate-100"
                      >
                        <span>
                          First Name{' '}
                          <span className="text-sky-300" aria-hidden="true">
                            *
                          </span>
                        </span>
                        <span className="font-mono text-[11px] font-normal text-sky-300">
                          Required
                        </span>
                      </label>
                      <input
                        id="onboarding-first-name"
                        name="firstName"
                        type="text"
                        required
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (identityErrors.firstName) {
                            setIdentityErrors((prev) => ({
                              ...prev,
                              firstName: undefined,
                            }));
                          }
                        }}
                        aria-invalid={Boolean(identityErrors.firstName)}
                        aria-describedby={
                          identityErrors.firstName
                            ? 'first-name-error'
                            : 'first-name-hint'
                        }
                        placeholder="e.g. Leo or Priya"
                        className={`min-h-12 w-full rounded-xl border bg-space-void/90 px-4 py-2.5 text-base text-slate-50 placeholder:text-slate-500 focus:outline-none ${
                          identityErrors.firstName
                            ? 'border-rose-400 focus:border-rose-400'
                            : 'border-space-border focus:border-sky-400'
                        }`}
                      />
                      {identityErrors.firstName ? (
                        <p
                          id="first-name-error"
                          role="alert"
                          className="mt-1.5 text-xs font-medium text-rose-300"
                        >
                          {identityErrors.firstName}
                        </p>
                      ) : (
                        <p
                          id="first-name-hint"
                          className="mt-1.5 text-xs text-slate-400"
                        >
                          Only your first name is needed — no last name, email, or password.
                        </p>
                      )}
                    </div>

                    {/* Required: Astronaut Callsign */}
                    <div>
                      <label
                        htmlFor="onboarding-callsign"
                        className="mb-1.5 flex items-center justify-between text-sm font-semibold text-slate-100"
                      >
                        <span>
                          Astronaut Callsign{' '}
                          <span className="text-sky-300" aria-hidden="true">
                            *
                          </span>
                        </span>
                        <span className="font-mono text-[11px] font-normal text-sky-300">
                          Required
                        </span>
                      </label>
                      <input
                        id="onboarding-callsign"
                        name="callsign"
                        type="text"
                        required
                        value={callsign}
                        onChange={(e) => {
                          setCallsign(e.target.value);
                          if (identityErrors.callsign) {
                            setIdentityErrors((prev) => ({
                              ...prev,
                              callsign: undefined,
                            }));
                          }
                        }}
                        aria-invalid={Boolean(identityErrors.callsign)}
                        aria-describedby={
                          identityErrors.callsign
                            ? 'callsign-error'
                            : 'callsign-hint'
                        }
                        placeholder="e.g. ORION-7 or STARWALKER"
                        className={`min-h-12 w-full rounded-xl border bg-space-void/90 px-4 py-2.5 font-mono text-base uppercase text-slate-50 placeholder:normal-case placeholder:text-slate-500 focus:outline-none ${
                          identityErrors.callsign
                            ? 'border-rose-400 focus:border-rose-400'
                            : 'border-space-border focus:border-sky-400'
                        }`}
                      />
                      {identityErrors.callsign ? (
                        <p
                          id="callsign-error"
                          role="alert"
                          className="mt-1.5 text-xs font-medium text-rose-300"
                        >
                          {identityErrors.callsign}
                        </p>
                      ) : (
                        <p
                          id="callsign-hint"
                          className="mt-1.5 text-xs text-slate-400"
                        >
                          Your radio code name during Moon landings and EVA missions.
                        </p>
                      )}

                      {/* Quick Callsign Inspiration Chips */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-400">
                          Ideas:
                        </span>
                        {CALLSIGN_SUGGESTIONS.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              setCallsign(suggestion);
                              setIdentityErrors((prev) => ({
                                ...prev,
                                callsign: undefined,
                              }));
                            }}
                            className="rounded-full border border-space-border bg-space-navy px-2.5 py-1 font-mono text-[11px] font-medium text-sky-300 transition-colors hover:border-sky-400/50 hover:bg-space-slate cursor-pointer"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-space-border/80 pt-5">
                    <Button
                      variant="ghost"
                      leftIcon={<ArrowLeft className="h-4 w-4" />}
                      onClick={() => setStep('welcome')}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Continue to Preferences
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* STEP 2: OPTIONAL DETAILS */}
            {activeStep === 'preferences' && (
              <Card
                variant="elevated"
                padding="lg"
                topAccentClassName="from-amber-400/80 via-sky-400/60 to-transparent"
                className="space-y-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <BadgePill tone="neutral" className="mb-2">
                      Optional — Skip Anytime
                    </BadgePill>
                    <h1 className="font-display text-2xl font-bold text-slate-50 sm:text-3xl">
                      Customize Your Space Gear
                    </h1>
                    <p className="mt-1 text-sm text-slate-300">
                      Pick an avatar badge, age group, and dream space destination — or skip straight to your specialization.
                    </p>
                  </div>
                </div>

                {/* Age Group (Optional) */}
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-100">
                    Age Group{' '}
                    <span className="text-xs font-normal text-slate-400">
                      (Optional)
                    </span>
                  </p>
                  <div
                    role="group"
                    aria-label="Age group"
                    className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
                  >
                    {AGE_GROUP_OPTIONS.map((group) => {
                      const selected = ageGroup === group;
                      return (
                        <button
                          key={group}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            setAgeGroup(selected ? undefined : group)
                          }
                          className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
                            selected
                              ? 'border-sky-400/70 bg-sky-400/15 text-sky-100 shadow-[0_0_18px_rgba(56,189,248,0.16)]'
                              : 'border-space-border bg-space-void/70 text-slate-300 hover:border-sky-400/40 hover:text-slate-100'
                          }`}
                        >
                          {group}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Profile Avatar Selection (Optional) */}
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-100">
                    Profile Avatar{' '}
                    <span className="text-xs font-normal text-slate-400">
                      (Optional)
                    </span>
                  </p>
                  <div
                    role="group"
                    aria-label="Profile avatar selection"
                    className="grid grid-cols-2 gap-3 sm:grid-cols-3"
                  >
                    {CADET_AVATARS.map((item) => {
                      const selected = avatarId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            setAvatarId(selected ? undefined : item.id)
                          }
                          className={`relative flex items-center gap-3 rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                            selected
                              ? 'border-sky-400 bg-sky-400/15 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                              : 'border-space-border bg-space-void/75 hover:border-sky-400/40 hover:bg-space-slate/70'
                          }`}
                        >
                          <CadetAvatar avatarId={item.id} size="md" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-100">
                              {item.label}
                            </p>
                            <p className="line-clamp-1 text-[11px] text-slate-400">
                              {item.tagline}
                            </p>
                          </div>
                          {selected && (
                            <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-400 text-slate-950">
                              <Check className="h-3 w-3" aria-hidden="true" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Favourite Space Destination (Optional) */}
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-100">
                    Favourite Space Destination{' '}
                    <span className="text-xs font-normal text-slate-400">
                      (Optional)
                    </span>
                  </p>
                  <div
                    role="group"
                    aria-label="Favourite space destination"
                    className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {FAVORITE_DESTINATIONS.map((dest) => {
                      const selected = favoriteDestination === dest.id;
                      return (
                        <button
                          key={dest.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            setFavoriteDestination(
                              selected ? undefined : dest.id,
                            )
                          }
                          className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left transition-all cursor-pointer ${
                            selected
                              ? 'border-sky-400/70 bg-sky-400/15 text-sky-100'
                              : 'border-space-border bg-space-void/70 text-slate-300 hover:border-sky-400/40 hover:text-slate-100'
                          }`}
                        >
                          <Compass
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              selected ? 'text-sky-300' : 'text-slate-400'
                            }`}
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">{dest.id}</p>
                            <p className="text-[11px] text-slate-400">
                              {dest.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-space-border/80 pt-5">
                  <Button
                    variant="ghost"
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                    onClick={() => setStep('identity')}
                  >
                    Back
                  </Button>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Button
                      variant="secondary"
                      leftIcon={<SkipForward className="h-4 w-4" />}
                      onClick={handleSkipOptionalPreferences}
                    >
                      Skip Optional Details
                    </Button>
                    <Button
                      variant="primary"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                      onClick={() => setStep('specialization')}
                    >
                      Continue to Specialization
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* STEP 3: FOUR SPECIALIZATION CARDS */}
            {activeStep === 'specialization' && (
              <Card
                variant="elevated"
                padding="lg"
                topAccentClassName="from-emerald-400/80 via-sky-400/70 to-transparent"
                className="space-y-6"
              >
                <div>
                  <h1 className="font-display text-2xl font-bold text-slate-50 sm:text-3xl">
                    Choose Your Astronaut Specialization
                  </h1>
                  <p className="mt-1 text-sm text-slate-300">
                    Pick the mission track that excites you most. All six training decks remain open to explore.
                  </p>
                </div>

                {specializationError && (
                  <p
                    role="alert"
                    className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-2.5 text-sm font-medium text-rose-200"
                  >
                    {specializationError}
                  </p>
                )}

                <div
                  role="group"
                  aria-label="Astronaut specialization tracks"
                  className="grid gap-4 sm:grid-cols-2"
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
                          setSpecializationError(null);
                        }}
                        className={`group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all cursor-pointer ${
                          selected
                            ? `${spec.accentBorder} ${spec.accentBg} ${spec.accentGlow}`
                            : 'border-space-border bg-space-void/75 hover:border-sky-400/45 hover:bg-space-slate/65'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3.5">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-space-border/80 bg-space-navy/90 p-1.5">
                                <SpecializationArtwork
                                  specialization={spec.id}
                                  className="h-11 w-11"
                                />
                              </div>
                              <div>
                                <p
                                  className={`font-mono text-[11px] font-semibold uppercase tracking-widest ${spec.accentText}`}
                                >
                                  {spec.code}
                                </p>
                                <h2 className="mt-0.5 font-display text-base font-bold text-slate-50">
                                  {spec.title}
                                </h2>
                              </div>
                            </div>

                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                selected
                                  ? 'border-sky-300 bg-sky-400 text-slate-950'
                                  : 'border-space-border bg-space-navy text-transparent'
                              }`}
                              aria-hidden="true"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          </div>

                          <p className="mt-3 text-sm leading-relaxed text-slate-300">
                            {spec.description}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-space-border/70 pt-3 text-xs">
                          <span className="text-slate-400">{spec.badgeFocus}</span>
                          <span
                            className={`font-mono font-semibold ${
                              selected ? spec.accentText : 'text-slate-400'
                            }`}
                          >
                            {selected ? 'SELECTED' : 'SELECT TRACK'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-space-border/80 pt-5">
                  <Button
                    variant="ghost"
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                    onClick={() => setStep('preferences')}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={<CheckCircle2 className="h-5 w-5" />}
                    onClick={handleCompleteRegistration}
                  >
                    Complete Registration
                  </Button>
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {/* SCREEN 4: POST-REGISTRATION CONFIRMATION */}
        {activeStep === 'confirmation' && cadetProfile && (
          <motion.section
            aria-labelledby="welcome-aboard-heading"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-2xl"
          >
            <Card
              variant="accent"
              padding="lg"
              topAccentClassName="from-emerald-400/90 via-sky-400/80 to-cyan-300/60"
              className="space-y-6 text-center"
            >
              <div className="flex justify-center">
                <BadgePill
                  tone="emerald"
                  dot
                  icon={<UserCheck className="h-3.5 w-3.5" />}
                >
                  Official ANANTRA Cadet Badge Issued
                </BadgePill>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <CadetAvatar
                    avatarId={cadetProfile.avatarId}
                    size="xl"
                    className="border-2 border-sky-400/80 shadow-[0_0_32px_rgba(56,189,248,0.3)]"
                  />
                  <span
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-space-void bg-emerald-400 text-slate-950"
                    aria-hidden="true"
                  >
                    <Check className="h-4 w-4" />
                  </span>
                </div>

                <div>
                  <h1
                    id="welcome-aboard-heading"
                    className="font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl"
                  >
                    WELCOME ABOARD, CADET {cadetProfile.firstName.toUpperCase()}!
                  </h1>
                  <p className="mt-2 text-sm text-slate-300 sm:text-base">
                    Your local Cadet Credentials are active. You are cleared for mission simulations.
                  </p>
                </div>
              </div>

              {/* Issued Cadet Credentials Panel */}
              <div className="grid gap-3 rounded-2xl border border-space-border bg-space-void/80 p-4 text-left sm:grid-cols-2">
                <div className="rounded-xl border border-space-border/80 bg-space-navy/70 p-3">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    Astronaut Callsign
                  </p>
                  <p className="mt-1 font-mono text-base font-bold text-sky-300">
                    {cadetProfile.callsign}
                  </p>
                </div>

                <div className="rounded-xl border border-space-border/80 bg-space-navy/70 p-3">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    Cadet Identification Number
                  </p>
                  <p className="mt-1 font-mono text-base font-bold text-emerald-300">
                    {cadetProfile.cadetId}
                  </p>
                </div>

                <div className="rounded-xl border border-space-border/80 bg-space-navy/70 p-3">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    Selected Specialization
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <SpecializationArtwork
                      specialization={cadetProfile.specialization}
                      className="h-6 w-6 shrink-0"
                    />
                    <span className="font-display text-sm font-bold text-slate-100">
                      {SPECIALIZATION_BY_ID[cadetProfile.specialization].title}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-space-border/80 bg-space-navy/70 p-3">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    Avatar Insignia
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-100">
                    {getAvatarLabel(cadetProfile.avatarId)}
                  </p>
                </div>

                {(cadetProfile.ageGroup || cadetProfile.favoriteDestination) && (
                  <div className="flex flex-wrap gap-2 rounded-xl border border-space-border/80 bg-space-navy/70 p-3 sm:col-span-2">
                    {cadetProfile.ageGroup && (
                      <BadgePill tone="neutral">
                        Age Group: {cadetProfile.ageGroup}
                      </BadgePill>
                    )}
                    {cadetProfile.favoriteDestination && (
                      <BadgePill tone="amber">
                        Target Destination: {cadetProfile.favoriteDestination}
                      </BadgePill>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<Rocket className="h-5 w-5" />}
                  onClick={handleEnterMissionControl}
                  className="w-full sm:w-auto"
                >
                  ENTER MISSION CONTROL
                </Button>
              </div>
            </Card>
          </motion.section>
        )}
      </main>
    </div>
  );
}
