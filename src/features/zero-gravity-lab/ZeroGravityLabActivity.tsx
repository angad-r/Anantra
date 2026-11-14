import {
  Award,
  Bot,
  CheckCircle2,
  Droplets,
  Hand,
  Info,
  Orbit,
  Play,
  RotateCcw,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BadgePill } from '../../components/ui/BadgePill';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
  LAB_CONSTANTS,
  LAB_OBJECTS,
  applyBrakeOrCatch,
  applyPushImpulse,
  createInitialLabMotion,
  stepLabMotion,
  type EnvironmentMode,
  type LabMotionState,
  type LabObjectSpec,
} from './zeroGravityPhysics';

interface LabChallenge {
  id: string;
  title: string;
  goalText: string;
  requiredObjectId: LabObjectSpec['id'];
  requiredMode: EnvironmentMode;
  points: number;
}

const LAB_CHALLENGES: LabChallenge[] = [
  {
    id: 'zg-c1',
    title: 'Challenge 1: Gentle Glide (Light Mass)',
    goalText:
      'In Microgravity, push the 1 kg Water Pouch and press Catch / Brake inside the Velcro Dock.',
    requiredObjectId: 'water-pouch',
    requiredMode: 'microgravity',
    points: 100,
  },
  {
    id: 'zg-c2',
    title: 'Challenge 2: Heavy Inertia (6 kg Crate)',
    goalText:
      'Switch to the 6 kg Supply Crate in Microgravity—notice it needs more push force—and dock it safely!',
    requiredObjectId: 'supply-crate',
    requiredMode: 'microgravity',
    points: 120,
  },
  {
    id: 'zg-c3',
    title: 'Challenge 3: Earth Friction vs. Space',
    goalText:
      'Switch to Earth Lab mode, push the 3 kg EVA Toolbox, and watch surface friction stop it!',
    requiredObjectId: 'toolbox',
    requiredMode: 'earth',
    points: 100,
  },
];

const FORCE_OPTIONS = [
  { label: 'Gentle (3 N)', value: 3 },
  { label: 'Medium (6 N)', value: 6 },
  { label: 'Strong (10 N)', value: 10 },
] as const;

export interface ZeroGOutcomeReport {
  outcome: 'success' | 'retry';
  score: number;
  maxScore: number;
  summary: string;
  failureReason?: string;
  telemetrySummary: string;
  allChallengesMastered: boolean;
}

export interface ZeroGravityLabActivityProps {
  onTaskUnlocked?: (taskId: 'zg-1' | 'zg-2' | 'zg-3') => void;
  onLabOutcome?: (report: ZeroGOutcomeReport) => void;
  onDebriefWithMentor?: () => void;
  isCertified?: boolean;
}

export function ZeroGravityLabActivity({
  onTaskUnlocked,
  onLabOutcome,
  onDebriefWithMentor,
  isCertified = false,
}: ZeroGravityLabActivityProps = {}) {
  const [selectedObjId, setSelectedObjId] =
    useState<LabObjectSpec['id']>('water-pouch');
  const [mode, setMode] = useState<EnvironmentMode>('microgravity');
  const [forceNewtons, setForceNewtons] = useState<number>(3);
  const [motion, setMotion] = useState<LabMotionState>(() =>
    createInitialLabMotion(),
  );
  const [completedChallengeIds, setCompletedChallengeIds] = useState<string[]>(
    [],
  );
  const [earthTested, setEarthTested] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [waterSampleMode, setWaterSampleMode] = useState<'space' | 'earth'>(
    'space',
  );
  const [dropletDisturbance, setDropletDisturbance] = useState<number>(0);
  const [showModelInfo, setShowModelInfo] = useState<boolean>(false);

  const modeRef = useRef<EnvironmentMode>(mode);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const prevOutcomeRef = useRef(motion.outcome);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const selectedObj =
    LAB_OBJECTS.find((o) => o.id === selectedObjId) ?? LAB_OBJECTS[0];

  // Evaluate challenge unlocks & task completion synchronously via effect
  useEffect(() => {
    if (motion.pushCount > 0) {
      onTaskUnlocked?.('zg-1');
    }

    if (
      !earthTested &&
      mode === 'earth' &&
      selectedObjId === 'toolbox' &&
      (motion.outcome === 'stopped-short' || motion.outcome === 'docked-success')
    ) {
      setEarthTested(true);
    }

    const newlyCompleted: LabChallenge[] = [];
    for (const ch of LAB_CHALLENGES) {
      if (completedChallengeIds.includes(ch.id)) continue;
      if (ch.id === 'zg-c3') {
        if (
          mode === 'earth' &&
          selectedObjId === 'toolbox' &&
          motion.pushCount > 0 &&
          (motion.outcome === 'stopped-short' ||
            motion.outcome === 'docked-success')
        ) {
          newlyCompleted.push(ch);
        }
      } else if (
        motion.outcome === 'docked-success' &&
        selectedObjId === ch.requiredObjectId &&
        mode === ch.requiredMode
      ) {
        newlyCompleted.push(ch);
      }
    }

    const nextIds =
      newlyCompleted.length > 0
        ? [...completedChallengeIds, ...newlyCompleted.map((c) => c.id)]
        : completedChallengeIds;
    const nextScore =
      newlyCompleted.length > 0
        ? score + newlyCompleted.reduce((sum, c) => sum + c.points, 0)
        : score;

    if (newlyCompleted.length > 0) {
      setCompletedChallengeIds(nextIds);
      setScore(nextScore);
      if (nextIds.length >= 1) {
        onTaskUnlocked?.('zg-3');
      }
    }

    // Record run telemetry whenever an active glide concludes
    const prevOut = prevOutcomeRef.current;
    prevOutcomeRef.current = motion.outcome;
    if (
      prevOut === 'gliding' &&
      motion.outcome !== 'gliding' &&
      motion.outcome !== 'idle'
    ) {
      const momentum = (selectedObj.massKg * Math.abs(motion.velocity)).toFixed(
        2,
      );
      const isEarthToolboxWin =
        motion.outcome === 'stopped-short' &&
        mode === 'earth' &&
        selectedObjId === 'toolbox';
      const isSuccess = motion.outcome === 'docked-success' || isEarthToolboxWin;

      onLabOutcome?.({
        outcome: isSuccess ? 'success' : 'retry',
        score: nextScore,
        maxScore: 320,
        summary: isSuccess
          ? `Zero Gravity Lab experiment succeeded (${selectedObj.name} in ${mode} mode)`
          : `${selectedObj.name} ${
              motion.outcome === 'bounced-retry'
                ? 'rebounded off the bulkhead'
                : 'stopped short of the 14.0 m dock'
            }`,
        failureReason: isSuccess
          ? undefined
          : motion.outcome === 'bounced-retry'
            ? `In frictionless microgravity, ${selectedObj.name} kept moving until striking 19.2 m without hitting Catch / Brake inside 14.0–18.2 m.`
            : `In ${mode} mode, ${selectedObj.name} stopped at ${motion.x.toFixed(1)} m before reaching the 14.0–18.2 m Velcro Dock.`,
        telemetrySummary: `${mode} | ${selectedObj.name} (${selectedObj.massKg} kg) | p=${momentum} kg·m/s | Challenges ${nextIds.length}/${LAB_CHALLENGES.length}`,
        allChallengesMastered: nextIds.length === LAB_CHALLENGES.length,
      });
    }
  }, [
    completedChallengeIds,
    earthTested,
    mode,
    motion,
    onLabOutcome,
    onTaskUnlocked,
    score,
    selectedObj.massKg,
    selectedObj.name,
    selectedObjId,
  ]);

  // Animation loop while object is gliding
  useEffect(() => {
    if (motion.outcome !== 'gliding') {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const step = (ts: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = ts;
      }
      const dt = (ts - lastTimeRef.current) / 1000;
      lastTimeRef.current = ts;

      setMotion((prev) => stepLabMotion(prev, modeRef.current, dt));
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [motion.outcome]);

  const handlePush = () => {
    if (motion.outcome === 'gliding') return;
    setMotion((prev) => {
      const base =
        prev.outcome === 'docked-success' || prev.outcome === 'bounced-retry'
          ? createInitialLabMotion()
          : prev;
      return applyPushImpulse(base, forceNewtons, selectedObj.massKg, mode);
    });
  };

  const handleBrake = () => {
    setMotion((prev) => applyBrakeOrCatch(prev));
  };

  const handleReset = () => {
    setMotion(createInitialLabMotion());
  };

  const handleRestartAll = () => {
    setMotion(createInitialLabMotion());
    setCompletedChallengeIds([]);
    setEarthTested(false);
    setScore(0);
  };

  const handleInspectWaterLab = (nextSampleMode: 'space' | 'earth') => {
    setWaterSampleMode(nextSampleMode);
    setDropletDisturbance((d) => (d + 1) % 3);
    onTaskUnlocked?.('zg-2');
  };

  const inDockZone =
    motion.x >= LAB_CONSTANTS.DOCK_MIN_M &&
    motion.x <= LAB_CONSTANTS.DOCK_MAX_M;
  const xPercent = (motion.x / LAB_CONSTANTS.CHAMBER_LENGTH_M) * 100;
  const dockLeftPct =
    (LAB_CONSTANTS.DOCK_MIN_M / LAB_CONSTANTS.CHAMBER_LENGTH_M) * 100;
  const dockWidthPct =
    ((LAB_CONSTANTS.DOCK_MAX_M - LAB_CONSTANTS.DOCK_MIN_M) /
      LAB_CONSTANTS.CHAMBER_LENGTH_M) *
    100;

  const predictedAccel = (forceNewtons / selectedObj.massKg).toFixed(2);
  const objectMomentum = (selectedObj.massKg * motion.velocity).toFixed(2);
  const allChallengesDone =
    completedChallengeIds.length === LAB_CHALLENGES.length;
  const isEarthChallengeWin =
    motion.outcome === 'stopped-short' &&
    mode === 'earth' &&
    selectedObjId === 'toolbox';

  return (
    <Card
      variant="elevated"
      topAccentClassName="from-violet-400/85 via-sky-400/75 to-transparent"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <BadgePill tone="violet" dot>
              Interactive Inertia &amp; Momentum Lab
            </BadgePill>
            {isCertified && (
              <BadgePill
                tone="emerald"
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              >
                Deck Certified
              </BadgePill>
            )}
            <BadgePill tone="amber" icon={<Award className="h-3.5 w-3.5" />}>
              Lab Score: {score} pts ({completedChallengeIds.length}/
              {LAB_CHALLENGES.length} Challenges)
            </BadgePill>
          </div>
          <h2 className="mt-2 font-display text-xl font-bold text-slate-50 sm:text-2xl">
            Newton’s Zero-Gravity Motion Chamber
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Test how mass and force shape acceleration (F = m × a) and linear
            momentum (p = m × v), and compare frictionless orbital free-fall vs.
            Earth tabletop friction.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            aria-expanded={showModelInfo}
            onClick={() => setShowModelInfo((v) => !v)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-space-border bg-space-navy px-2.5 py-1.5 text-[11px] font-medium text-sky-300 hover:border-sky-400/45"
          >
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
            {showModelInfo ? 'Hide Model Note' : 'Simplified Physics Note'}
          </button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={handleReset}
          >
            Reset Object
          </Button>
          {completedChallengeIds.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleRestartAll}>
              Restart Lab Score
            </Button>
          )}
        </div>
      </div>

      {showModelInfo && (
        <div className="rounded-xl border border-violet-400/30 bg-violet-500/8 p-3.5 text-xs leading-relaxed text-slate-200">
          <strong className="text-violet-200">
            Scientific Grounding vs. Classroom Model:
          </strong>{' '}
          Astronauts float in Low Earth Orbit because station and crew fall
          continuously around Earth in free fall (~89% gravity still acts!), not
          because gravity disappeared. ANANTRA isolates 1D linear motion (a =
          F/m, p = m·v, 0.8 s push impulse, 45 kg cadet recoil) without 3D
          tumbling torques so young scientists grasp inertia cleanly.
        </div>
      )}

      {/* 2D Microgravity Bay SVG */}
      <div className="relative overflow-hidden rounded-2xl border border-space-border bg-space-void p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-violet-300">
            <Orbit className="h-4 w-4" aria-hidden="true" />
            {mode === 'microgravity'
              ? 'ENVIRONMENT: MICROGRAVITY (NO FRICTION)'
              : 'ENVIRONMENT: EARTH LAB (FLOOR FRICTION ON)'}
          </span>
          <span
            className={`font-mono font-semibold ${
              inDockZone ? 'text-emerald-300' : 'text-sky-300'
            }`}
          >
            Position: {motion.x.toFixed(1)} m / {LAB_CONSTANTS.CHAMBER_LENGTH_M}{' '}
            m • Speed: {motion.velocity.toFixed(2)} m/s
          </span>
        </div>

        <div className="relative h-44 w-full overflow-hidden rounded-xl border border-space-border/90 bg-gradient-to-b from-[#070f24] to-[#0a142d]">
          {/* Chamber Grid Lines */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(167, 139, 250, 0.25) 1px, transparent 1px)',
              backgroundSize: '10% 100%',
            }}
          />

          {/* Velcro Catch Dock Zone */}
          <div
            style={{
              left: `${dockLeftPct}%`,
              width: `${dockWidthPct}%`,
            }}
            className={`absolute inset-y-3 flex flex-col items-center justify-between rounded-xl border-2 border-dashed p-2 transition-colors ${
              inDockZone
                ? 'border-emerald-400 bg-emerald-500/15'
                : 'border-sky-400/50 bg-sky-400/10'
            }`}
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-sky-200">
              Velcro Dock
            </span>
            <span className="font-mono text-[10px] text-slate-300">
              ≤ {LAB_CONSTANTS.SAFE_DOCK_SPEED} m/s
            </span>
          </div>

          {/* Earth Tabletop Floor Indicator */}
          {mode === 'earth' && (
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-4 border-t border-amber-400/50 bg-amber-500/15"
            />
          )}

          {/* Moving Object */}
          <div
            role="img"
            aria-label={`${selectedObj.name} at ${motion.x.toFixed(1)} meters moving at ${motion.velocity.toFixed(1)} meters per second`}
            style={{
              left: `calc(${Math.max(4, Math.min(92, xPercent))}% - 28px)`,
            }}
            className={`absolute top-1/2 flex h-16 w-16 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border-2 shadow-lg transition-colors ${
              motion.outcome === 'docked-success'
                ? 'border-emerald-300 bg-emerald-500/25 text-emerald-100'
                : motion.outcome === 'bounced-retry'
                  ? 'border-rose-400 bg-rose-500/25 text-rose-100'
                  : 'border-violet-300/80 bg-space-slate text-slate-100'
            }`}
          >
            <span className="font-mono text-xs font-bold">
              {selectedObj.massKg} kg
            </span>
            <span className="mt-0.5 max-w-[56px] truncate text-[10px] text-slate-300">
              {selectedObj.name.split(' ')[0]}
            </span>
          </div>

          {/* Bulkhead Wall */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-2.5 border-l border-slate-500 bg-slate-700/80"
          />
        </div>

        {/* Physics Telemetry Readouts including Momentum */}
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          <div className="rounded-xl border border-space-border/80 bg-space-navy/85 p-2.5 text-xs">
            <p className="text-slate-400">Object Mass (m)</p>
            <p className="font-mono text-sm font-bold text-slate-100">
              {selectedObj.massKg} kg
            </p>
          </div>
          <div className="rounded-xl border border-space-border/80 bg-space-navy/85 p-2.5 text-xs">
            <p className="text-slate-400">Push Accel (F/m)</p>
            <p className="font-mono text-sm font-bold text-violet-300">
              {predictedAccel} m/s²
            </p>
          </div>
          <div className="rounded-xl border border-space-border/80 bg-space-navy/85 p-2.5 text-xs">
            <p className="text-slate-400">Momentum (p = m·v)</p>
            <p className="font-mono text-sm font-bold text-amber-300">
              {objectMomentum} kg·m/s
            </p>
          </div>
          <div className="rounded-xl border border-space-border/80 bg-space-navy/85 p-2.5 text-xs">
            <p className="text-slate-400">Cadet Recoil (3rd Law)</p>
            <p className="font-mono text-sm font-bold text-sky-300">
              {motion.recoilVelocity.toFixed(2)} m/s
            </p>
          </div>
          <div className="col-span-2 rounded-xl border border-space-border/80 bg-space-navy/85 p-2.5 text-xs sm:col-span-1">
            <p className="text-slate-400">Dock Target Zone</p>
            <p className="font-mono text-sm font-bold text-emerald-300">
              14.0 – 18.2 m
            </p>
          </div>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          {/* 1. Environment Switch */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              1. Choose Lab Environment
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                aria-pressed={mode === 'microgravity'}
                onClick={() => {
                  setMode('microgravity');
                  handleReset();
                }}
                className={`min-h-11 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors cursor-pointer ${
                  mode === 'microgravity'
                    ? 'border-violet-400/60 bg-violet-400/15 text-violet-100'
                    : 'border-space-border bg-space-void/70 text-slate-300 hover:border-sky-400/35'
                }`}
              >
                <span className="block">Microgravity (Space)</span>
                <span className="mt-0.5 block font-normal text-slate-400">
                  Zero friction — keeps gliding!
                </span>
              </button>

              <button
                type="button"
                aria-pressed={mode === 'earth'}
                onClick={() => {
                  setMode('earth');
                  handleReset();
                }}
                className={`min-h-11 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors cursor-pointer ${
                  mode === 'earth'
                    ? 'border-amber-400/60 bg-amber-400/15 text-amber-100'
                    : 'border-space-border bg-space-void/70 text-slate-300 hover:border-sky-400/35'
                }`}
              >
                <span className="block">Earth Lab (Tabletop)</span>
                <span className="mt-0.5 block font-normal text-slate-400">
                  Floor friction slows objects down
                </span>
              </button>
            </div>
          </div>

          {/* 2. Object Selection */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              2. Pick Object Mass
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {LAB_OBJECTS.map((obj) => {
                const active = obj.id === selectedObjId;
                return (
                  <button
                    key={obj.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setSelectedObjId(obj.id);
                      handleReset();
                    }}
                    className={`rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                      active
                        ? 'border-sky-400/60 bg-sky-400/15 text-sky-100'
                        : 'border-space-border bg-space-void/70 text-slate-300 hover:border-sky-400/35'
                    }`}
                  >
                    <p className="text-xs font-bold">{obj.name}</p>
                    <p className="font-mono text-[11px] text-sky-300">
                      Mass: {obj.emojiLabel}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Force & Action Buttons */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              3. Choose Push Force &amp; Run Experiment
            </p>
            <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {FORCE_OPTIONS.map((opt) => {
                const active = forceNewtons === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setForceNewtons(opt.value)}
                    className={`min-h-9 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      active
                        ? 'border-emerald-400/60 bg-emerald-400/15 text-emerald-100'
                        : 'border-space-border bg-space-void/70 text-slate-300 hover:border-sky-400/35'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Play className="h-4 w-4" />}
                disabled={motion.outcome === 'gliding'}
                onClick={handlePush}
              >
                Push Object ({forceNewtons} N)
              </Button>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Hand className="h-4 w-4" />}
                disabled={motion.outcome !== 'gliding'}
                onClick={handleBrake}
              >
                Catch / Brake
              </Button>
            </div>
          </div>
        </div>

        {/* Guided Challenges List */}
        <div className="space-y-3 rounded-2xl border border-space-border bg-space-void/70 p-4 lg:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-base font-semibold text-slate-50">
              Guided Lab Challenges
            </h3>
            <span className="font-mono text-xs text-violet-300">
              {completedChallengeIds.length}/{LAB_CHALLENGES.length}
            </span>
          </div>

          <ul className="space-y-2.5">
            {LAB_CHALLENGES.map((ch) => {
              const done = completedChallengeIds.includes(ch.id);
              return (
                <li
                  key={ch.id}
                  className={`rounded-xl border p-3 text-xs ${
                    done
                      ? 'border-emerald-400/45 bg-emerald-500/12 text-emerald-100'
                      : 'border-space-border/80 bg-space-navy/85 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 ${
                          done ? 'text-emerald-300' : 'text-slate-500'
                        }`}
                        aria-hidden="true"
                      />
                      {ch.title}
                    </span>
                    <span className="font-mono text-sky-300">+{ch.points}</span>
                  </div>
                  <p className="mt-1 leading-relaxed text-slate-300">
                    {ch.goalText}
                  </p>
                </li>
              );
            })}
          </ul>
          {earthTested && !allChallengesDone && (
            <p className="text-[11px] text-amber-200">
              Tip: Notice how Earth friction stops sliding objects, while in
              Microgravity you must use Catch / Brake inside the Velcro Dock!
            </p>
          )}
        </div>
      </div>

      {/* Feedback Banner (Success / Retry States) */}
      {(motion.outcome === 'docked-success' || isEarthChallengeWin) && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col gap-3 rounded-2xl border border-emerald-400/45 bg-emerald-500/12 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <Sparkles
              className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300"
              aria-hidden="true"
            />
            <div>
              <h3 className="font-display text-base font-bold text-emerald-100">
                {allChallengesDone
                  ? 'All Zero-G Inertia Challenges Mastered!'
                  : motion.outcome === 'stopped-short'
                    ? 'Surface Friction Stopped the Toolbox!'
                    : 'Safely Anchored in the Velcro Dock!'}
              </h3>
              <p className="mt-0.5 text-sm text-emerald-100/90">
                {motion.outcome === 'stopped-short'
                  ? 'Challenge 3 complete! On Earth, surface friction absorbs motion energy and stops sliding tools—unlike microgravity in space.'
                  : `Great control! In space, catching a floating ${selectedObj.name.toLowerCase()} with a counter-force stops its inertia cleanly.`}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleReset}
            className="shrink-0"
          >
            Test Another Object
          </Button>
        </div>
      )}

      {(motion.outcome === 'bounced-retry' ||
        (motion.outcome === 'stopped-short' && !isEarthChallengeWin)) && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col gap-3 rounded-2xl border border-amber-400/45 bg-amber-500/12 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <TriangleAlert
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-300"
              aria-hidden="true"
            />
            <div>
              <h3 className="font-display text-base font-bold text-amber-100">
                {motion.outcome === 'bounced-retry'
                  ? 'Bounced Off the Far Bulkhead!'
                  : 'Stopped Short of the Velcro Dock'}
              </h3>
              <p className="mt-0.5 text-sm text-amber-100/90">
                {motion.outcome === 'bounced-retry'
                  ? 'In microgravity, uncaught objects glide straight into the wall! Even slow objects rebound instead of docking automatically — press Catch / Brake between 14.0 and 18.2 m.'
                  : mode === 'earth'
                    ? 'Floor friction absorbed your push energy before reaching 14 m! Try a stronger push in Earth mode, or compare in Microgravity.'
                    : 'You braked to a stop before reaching the dock. Give it another gentle push to glide into 14–18.2 m!'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {onDebriefWithMentor && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Bot className="h-4 w-4" />}
                onClick={onDebriefWithMentor}
              >
                Debrief With ARIA
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
            >
              Retry Experiment
            </Button>
          </div>
        </div>
      )}

      {/* Microgravity Water Sphere & Surface Tension Mini-Lab */}
      <div className="rounded-2xl border border-sky-400/25 bg-space-void/75 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-sky-300">
              <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
              Fluid Physics Station • Surface Tension Demo
            </p>
            <h3 className="mt-1 font-display text-base font-semibold text-slate-50">
              How Water Behaves in Microgravity vs. Earth
            </h3>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              aria-pressed={waterSampleMode === 'space'}
              onClick={() => handleInspectWaterLab('space')}
              className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                waterSampleMode === 'space'
                  ? 'border-sky-400/60 bg-sky-400/15 text-sky-100'
                  : 'border-space-border bg-space-navy text-slate-300'
              }`}
            >
              ISS Water Sphere
            </button>
            <button
              type="button"
              aria-pressed={waterSampleMode === 'earth'}
              onClick={() => handleInspectWaterLab('earth')}
              className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                waterSampleMode === 'earth'
                  ? 'border-amber-400/60 bg-amber-400/15 text-amber-100'
                  : 'border-space-border bg-space-navy text-slate-300'
              }`}
            >
              Earth Gravity Cup
            </button>
          </div>
        </div>

        <div className="mt-3 grid gap-4 sm:grid-cols-12 sm:items-center">
          <div className="flex h-28 items-center justify-center rounded-xl border border-space-border bg-space-navy/90 sm:col-span-4">
            {waterSampleMode === 'space' ? (
              <svg viewBox="0 0 120 90" className="h-24 w-28" role="img" aria-label="Floating water sphere held together by surface tension">
                <ellipse
                  cx="60"
                  cy="45"
                  rx={24 + (dropletDisturbance === 1 ? 3 : 0)}
                  ry={24 - (dropletDisturbance === 1 ? 2 : 0)}
                  fill="#0284c7"
                  opacity="0.7"
                  stroke="#7dd3fc"
                  strokeWidth="2"
                />
                <circle cx="52" cy="36" r="5" fill="#bae6fd" opacity="0.7" />
              </svg>
            ) : (
              <svg viewBox="0 0 120 90" className="h-24 w-28" role="img" aria-label="Water pooled flat at the bottom of a glass under Earth gravity">
                <rect x="34" y="22" width="52" height="52" rx="4" fill="none" stroke="#94a3b8" strokeWidth="2" />
                <rect x="36" y="48" width="48" height="24" fill="#0284c7" opacity="0.75" />
                <line x1="36" y1="48" x2="84" y2="48" stroke="#7dd3fc" strokeWidth="2" />
              </svg>
            )}
          </div>

          <p className="text-xs leading-relaxed text-slate-300 sm:col-span-8 sm:text-sm">
            {waterSampleMode === 'space'
              ? 'Inside free-fall microgravity, downward weight disappears so cohesive surface tension between H₂O molecules pulls free liquid into a floating sphere! Touching a dry towel lets capillary action wick it gently without spilling droplets into electronics.'
              : 'On Earth, 9.81 m/s² gravity pulls molecules firmly flat against the bottom of cups and bowls—that is why astronauts use sealed drink pouches with straw clamps instead of open glasses!'}
          </p>
        </div>
      </div>
    </Card>
  );
}
