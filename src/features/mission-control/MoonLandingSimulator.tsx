import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  Bot,
  CheckCircle2,
  Flame,
  Fuel,
  Gauge,
  Info,
  Lock,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  TriangleAlert,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BadgePill } from '../../components/ui/BadgePill';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import {
  LUNAR_CONSTANTS,
  LUNAR_MODE_CONFIGS,
  createInitialLunarState,
  stepLunarSimulation,
  type LandingPhase,
  type LunarControls,
  type LunarMissionMode,
  type LunarSimulationState,
} from './lunarPhysics';

const SCENE_WIDTH = 600;
const SCENE_HEIGHT = 360;
const GROUND_Y = 314;
const TOP_MARGIN_Y = 36;
const MAX_VISUAL_ALTITUDE = 135;

function worldXToSvg(x: number): number {
  const ratio =
    (x + LUNAR_CONSTANTS.WORLD_HALF_WIDTH) /
    (LUNAR_CONSTANTS.WORLD_HALF_WIDTH * 2);
  return 44 + ratio * (SCENE_WIDTH - 88);
}

function altitudeToSvgY(altitude: number): number {
  const clampedAlt = Math.max(0, Math.min(MAX_VISUAL_ALTITUDE, altitude));
  const ratio = clampedAlt / MAX_VISUAL_ALTITUDE;
  return GROUND_Y - ratio * (GROUND_Y - TOP_MARGIN_Y);
}

const THROTTLE_PRESETS = [
  { label: '0% Off', value: 0 },
  { label: '43% Hover', value: LUNAR_CONSTANTS.HOVER_THROTTLE_PERCENT / 100 },
  { label: '75% Brake', value: 0.75 },
  { label: '100% Max', value: 1 },
] as const;

export interface LunarOutcomeReport {
  outcome: 'success' | 'retry';
  mode: LunarMissionMode;
  score: number;
  maxScore: number;
  summary: string;
  failureReason?: string;
  telemetrySummary: string;
}

export interface MoonLandingSimulatorProps {
  onMissionComplete?: () => void;
  onMissionOutcome?: (report: LunarOutcomeReport) => void;
  onDebriefWithMentor?: () => void;
  missionCompleted?: boolean;
}

export function MoonLandingSimulator({
  onMissionComplete,
  onMissionOutcome,
  onDebriefWithMentor,
  missionCompleted = false,
}: MoonLandingSimulatorProps = {}) {
  const [selectedMode, setSelectedMode] = useState<LunarMissionMode>('standard');
  const [sim, setSim] = useState<LunarSimulationState>(() =>
    createInitialLunarState('standard'),
  );
  const [presetThrottle, setPresetThrottle] = useState<number>(0);
  const [boostHeld, setBoostHeld] = useState<boolean>(false);
  const [lateralHeld, setLateralHeld] = useState<-1 | 0 | 1>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [safeLandingsCount, setSafeLandingsCount] = useState<number>(0);
  const [showModelInfo, setShowModelInfo] = useState<boolean>(false);

  const commanderUnlocked = missionCompleted || safeLandingsCount > 0;
  const modeConfig = LUNAR_MODE_CONFIGS[sim.mode];

  const keyStateRef = useRef({
    up: false,
    left: false,
    right: false,
  });
  const pointerStateRef = useRef({
    boost: false,
    left: false,
    right: false,
  });
  const controlsRef = useRef<LunarControls>({ throttle: 0, lateral: 0 });
  const rafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const prevPhaseRef = useRef<LandingPhase>(sim.phase);

  const syncControls = useCallback(
    (nextPreset: number) => {
      const boostActive =
        keyStateRef.current.up || pointerStateRef.current.boost;
      const leftActive =
        keyStateRef.current.left || pointerStateRef.current.left;
      const rightActive =
        keyStateRef.current.right || pointerStateRef.current.right;

      const lateral: -1 | 0 | 1 =
        leftActive && !rightActive ? -1 : rightActive && !leftActive ? 1 : 0;

      controlsRef.current = {
        throttle: boostActive ? 1 : nextPreset,
        lateral,
      };
      setBoostHeld(boostActive);
      setLateralHeld(lateral);
    },
    [],
  );

  const startMission = useCallback(() => {
    setSim((prev) => {
      if (prev.phase === 'ready' || prev.phase === 'paused') {
        return { ...prev, phase: 'playing' };
      }
      return { ...createInitialLunarState(selectedMode), phase: 'playing' };
    });
  }, [selectedMode]);

  const pauseMission = useCallback(() => {
    setSim((prev) =>
      prev.phase === 'playing' ? { ...prev, phase: 'paused' } : prev,
    );
  }, []);

  const restartMission = useCallback(
    (overrideMode?: LunarMissionMode) => {
      const nextMode = overrideMode ?? selectedMode;
      keyStateRef.current = { up: false, left: false, right: false };
      pointerStateRef.current = { boost: false, left: false, right: false };
      setPresetThrottle(0);
      setBoostHeld(false);
      setLateralHeld(0);
      controlsRef.current = { throttle: 0, lateral: 0 };
      lastFrameTimeRef.current = null;
      setSim({
        ...createInitialLunarState(nextMode),
        phase: overrideMode ? 'ready' : 'playing',
      });
    },
    [selectedMode],
  );

  const switchMode = (nextMode: LunarMissionMode) => {
    if (nextMode === 'commander' && !commanderUnlocked) return;
    setSelectedMode(nextMode);
    restartMission(nextMode);
  };

  // Sync preset throttle into controlsRef
  useEffect(() => {
    syncControls(presetThrottle);
  }, [presetThrottle, syncControls]);

  // Animation loop while simulation is active
  useEffect(() => {
    if (sim.phase !== 'playing') {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastFrameTimeRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = timestamp;
      }
      const dt = (timestamp - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = timestamp;

      setSim((prev) => {
        if (prev.phase !== 'playing') return prev;
        return stepLunarSimulation(prev, controlsRef.current, dt);
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [sim.phase]);

  // Record best score, safe landings counter, outcome telemetry, and curriculum completion outside state updaters
  useEffect(() => {
    const prevPhase = prevPhaseRef.current;
    prevPhaseRef.current = sim.phase;

    if (prevPhase !== 'playing') return;

    const vSpeed = sim.touchdownSpeed ?? Math.abs(sim.vy);
    const hSpeed = sim.touchdownHorizontalSpeed ?? Math.abs(sim.vx);
    const cfg = LUNAR_MODE_CONFIGS[sim.mode];
    const telemetrySummary = `${cfg.label}: V=${vSpeed.toFixed(1)} m/s, H=${hSpeed.toFixed(1)} m/s, Offset=${Math.abs(sim.x).toFixed(1)}m, Fuel=${Math.round(sim.fuel)}%`;

    if (sim.phase === 'landed-safe' && sim.score) {
      const total = sim.score.total;
      setBestScore((b) => Math.max(b, total));
      setSafeLandingsCount((c) => c + 1);
      onMissionComplete?.();
      onMissionOutcome?.({
        outcome: 'success',
        mode: sim.mode,
        score: total,
        maxScore: 1000,
        summary: `Safe lunar touchdown on pad (${total} pts, ${Math.round(sim.fuel)}% fuel left)`,
        telemetrySummary,
      });
    } else if (sim.phase === 'crashed-hard' || sim.phase === 'missed-pad') {
      const reason =
        sim.phase === 'missed-pad'
          ? `Touched down ${Math.abs(sim.x).toFixed(1)} m off pad center (limit ±${cfg.padHalfWidth} m).`
          : vSpeed > cfg.safeVerticalSpeed && hSpeed > cfg.safeHorizontalSpeed
            ? `Vertical impact (${vSpeed.toFixed(1)} m/s) and sideways drift (${hSpeed.toFixed(1)} m/s) both exceeded safe tolerances.`
            : vSpeed > cfg.safeVerticalSpeed
              ? `Vertical touchdown speed reached ${vSpeed.toFixed(1)} m/s (safe ≤ ${cfg.safeVerticalSpeed} m/s).`
              : `Horizontal sideways drift reached ${hSpeed.toFixed(1)} m/s (safe ≤ ${cfg.safeHorizontalSpeed} m/s).`;

      onMissionOutcome?.({
        outcome: 'retry',
        mode: sim.mode,
        score: 0,
        maxScore: 1000,
        summary:
          sim.phase === 'crashed-hard'
            ? `Hard lunar touchdown on ${cfg.label}`
            : `Missed lunar landing pad on ${cfg.label}`,
        failureReason: reason,
        telemetrySummary,
      });
    }
  }, [sim, onMissionComplete, onMissionOutcome]);

  // Keyboard controls: Space/ArrowUp/W for thrust, ArrowLeft/A & ArrowRight/D for steering, R for restart
  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) =>
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();
      if (key === 'r') {
        event.preventDefault();
        restartMission();
        return;
      }

      const isUp = key === 'arrowup' || key === 'w' || event.code === 'Space';
      const isLeft = key === 'arrowleft' || key === 'a';
      const isRight = key === 'arrowright' || key === 'd';

      if (!isUp && !isLeft && !isRight) return;

      // Avoid hijacking Space/Enter when a user explicitly tabs onto a non-thrust button
      if (
        event.code === 'Space' &&
        event.target instanceof HTMLButtonElement &&
        event.target.dataset.simThrust !== 'true'
      ) {
        return;
      }

      event.preventDefault();

      if (sim.phase === 'ready' && isUp) {
        startMission();
      }

      if (isUp) keyStateRef.current.up = true;
      if (isLeft) keyStateRef.current.left = true;
      if (isRight) keyStateRef.current.right = true;
      syncControls(presetThrottle);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'arrowup' || key === 'w' || event.code === 'Space') {
        keyStateRef.current.up = false;
      }
      if (key === 'arrowleft' || key === 'a') {
        keyStateRef.current.left = false;
      }
      if (key === 'arrowright' || key === 'd') {
        keyStateRef.current.right = false;
      }
      syncControls(presetThrottle);
    };

    const handleWindowBlur = () => {
      keyStateRef.current = { up: false, left: false, right: false };
      pointerStateRef.current = { boost: false, left: false, right: false };
      syncControls(presetThrottle);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [presetThrottle, restartMission, sim.phase, startMission, syncControls]);

  const setPointerThrust = (active: boolean) => {
    if (active && sim.phase === 'ready') {
      startMission();
    }
    pointerStateRef.current.boost = active;
    syncControls(presetThrottle);
  };

  const setPointerLateral = (dir: 'left' | 'right', active: boolean) => {
    if (active && sim.phase === 'ready') {
      startMission();
    }
    pointerStateRef.current[dir] = active;
    syncControls(presetThrottle);
  };

  const landerSvgX = worldXToSvg(sim.x);
  const landerSvgY = altitudeToSvgY(sim.altitude);
  const padLeftX = worldXToSvg(-modeConfig.padHalfWidth);
  const padRightX = worldXToSvg(modeConfig.padHalfWidth);
  const padWidth = padRightX - padLeftX;

  const isEnded =
    sim.phase === 'landed-safe' ||
    sim.phase === 'crashed-hard' ||
    sim.phase === 'missed-pad';

  const overPad = Math.abs(sim.x) <= modeConfig.padHalfWidth;
  const activeVerticalSpeed =
    isEnded && sim.touchdownSpeed !== null
      ? sim.touchdownSpeed
      : Math.abs(sim.vy);
  const activeHorizontalSpeed =
    isEnded && sim.touchdownHorizontalSpeed !== null
      ? sim.touchdownHorizontalSpeed
      : Math.abs(sim.vx);

  const isVerticalSafe =
    activeVerticalSpeed <= modeConfig.safeVerticalSpeed;
  const isHorizontalSafe =
    activeHorizontalSpeed <= modeConfig.safeHorizontalSpeed;
  const isSafeSpeed = isVerticalSafe && isHorizontalSafe;

  const speedHudLabel = isSafeSpeed
    ? sim.phase === 'landed-safe'
      ? `SAFE TOUCHDOWN (V ${activeVerticalSpeed.toFixed(1)} • H ${activeHorizontalSpeed.toFixed(1)} m/s)`
      : `SAFE SPEED (V ≤ ${modeConfig.safeVerticalSpeed} • H ≤ ${modeConfig.safeHorizontalSpeed} m/s)`
    : !isVerticalSafe && !isHorizontalSafe
      ? `TOO FAST! V ${activeVerticalSpeed.toFixed(1)} • H ${activeHorizontalSpeed.toFixed(1)} m/s`
      : !isVerticalSafe
        ? `${!isEnded && sim.vy > 0 ? 'CLIMB' : 'VERTICAL'} TOO FAST (${activeVerticalSpeed.toFixed(1)} m/s)`
        : `SIDE DRIFT TOO FAST (${activeHorizontalSpeed.toFixed(1)} m/s)`;

  const effectiveDisplayThrottle =
    sim.fuel <= 0 ? 0 : boostHeld ? 1 : presetThrottle;
  const fuelDepleted = sim.fuel <= 0;

  const alignmentText = overPad
    ? 'Over Pad'
    : sim.x < 0
      ? `${Math.abs(sim.x).toFixed(1)} m Left`
      : `${Math.abs(sim.x).toFixed(1)} m Right`;

  const crashedVertTooFast =
    (sim.touchdownSpeed ?? 0) > modeConfig.safeVerticalSpeed;
  const crashedHorizTooFast =
    (sim.touchdownHorizontalSpeed ?? 0) > modeConfig.safeHorizontalSpeed;
  const crashedOffPad = !overPad;

  return (
    <Card
      variant="elevated"
      topAccentClassName="from-emerald-400/85 via-sky-400/75 to-transparent"
      className="space-y-6"
    >
      {/* Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <BadgePill tone="emerald" dot>
              Interactive 2D Flight Sim
            </BadgePill>
            {missionCompleted && (
              <BadgePill
                tone="emerald"
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              >
                Deck Certified
              </BadgePill>
            )}
            {bestScore > 0 && (
              <BadgePill tone="amber" icon={<Award className="h-3.5 w-3.5" />}>
                Best Score: {bestScore} pts ({safeLandingsCount} safe)
              </BadgePill>
            )}
          </div>
          <h2 className="mt-2 font-display text-xl font-bold text-slate-50 sm:text-2xl">
            Moon Landing Simulator
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Touch down gently on the glowing lunar landing pad with vertical speed{' '}
            <strong className="font-mono text-emerald-300">
              ≤ {modeConfig.safeVerticalSpeed} m/s
            </strong>{' '}
            and sideways drift{' '}
            <strong className="font-mono text-emerald-300">
              ≤ {modeConfig.safeHorizontalSpeed} m/s
            </strong>{' '}
            before your fuel runs out.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {sim.phase === 'ready' || sim.phase === 'paused' ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Play className="h-4 w-4" />}
              onClick={startMission}
            >
              {sim.phase === 'paused' ? 'Resume Descent' : 'Launch Lander'}
            </Button>
          ) : sim.phase === 'playing' ? (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Pause className="h-4 w-4" />}
              onClick={pauseMission}
            >
              Pause
            </Button>
          ) : null}

          <Button
            variant={isEnded ? 'primary' : 'secondary'}
            size="sm"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={() => restartMission()}
          >
            {isEnded ? 'Play Again' : 'Restart'}
          </Button>
        </div>
      </div>

      {/* Mission Difficulty Tier & Physics Model Disclosure */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-space-border bg-space-void/70 p-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Lunar descent difficulty mode">
          <button
            type="button"
            aria-pressed={selectedMode === 'standard'}
            onClick={() => switchMode('standard')}
            className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedMode === 'standard'
                ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-100'
                : 'border-space-border bg-space-navy text-slate-300 hover:border-sky-400/40'
            }`}
          >
            1. Cadet Descent (100% Fuel)
          </button>

          <button
            type="button"
            disabled={!commanderUnlocked}
            aria-pressed={selectedMode === 'commander'}
            onClick={() => switchMode('commander')}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              !commanderUnlocked
                ? 'cursor-not-allowed border-space-border/60 bg-space-navy/40 text-slate-500'
                : selectedMode === 'commander'
                  ? 'cursor-pointer border-amber-400/60 bg-amber-500/15 text-amber-100'
                  : 'cursor-pointer border-space-border bg-space-navy text-slate-300 hover:border-amber-400/40'
            }`}
          >
            {!commanderUnlocked && <Lock className="h-3.5 w-3.5" aria-hidden="true" />}
            2. Commander Precision{' '}
            {!commanderUnlocked ? '(Land Safely Once to Unlock)' : '(82% Fuel)'}
          </button>
        </div>

        <button
          type="button"
          aria-expanded={showModelInfo}
          onClick={() => setShowModelInfo((v) => !v)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-space-border bg-space-navy px-2.5 py-1 text-[11px] font-medium text-sky-300 hover:border-sky-400/45"
        >
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          {showModelInfo ? 'Hide Model Note' : 'Simplified Physics Note'}
        </button>
      </div>

      {showModelInfo && (
        <div className="rounded-xl border border-sky-400/30 bg-sky-500/8 p-3.5 text-xs leading-relaxed text-slate-200">
          <strong className="text-sky-200">Scientific Grounding vs. Classroom Model:</strong>{' '}
          Downward acceleration uses real lunar surface gravity ({LUNAR_CONSTANTS.LUNAR_GRAVITY} m/s²)
          inside an airless vacuum (no parachute drag). To keep manual piloting intuitive,
          ANANTRA assumes constant lander mass rather than decreasing propellant weight
          (Tsiolkovsky rocket mass ratio) and simulates 2D translation without rotational pitch torque.
        </div>
      )}

      {/* Fuel Depletion Alert */}
      {fuelDepleted && sim.phase === 'playing' && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 rounded-xl border border-rose-400/50 bg-rose-500/15 px-4 py-3 text-sm text-rose-100"
        >
          <TriangleAlert className="h-5 w-5 shrink-0 text-rose-300" aria-hidden="true" />
          <span>
            <strong>Fuel Tank Empty!</strong> Main engine and steering thrusters are offline—Moon gravity is pulling the lander down.
          </span>
        </div>
      )}

      {/* 2D Lunar Descent Viewport + Live Telemetry */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* 2D SVG Lunar Viewport */}
        <div className="relative overflow-hidden rounded-2xl border border-space-border bg-space-void lg:col-span-8">
          {/* On-screen HUD Status Pill */}
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full border border-space-border bg-space-void/85 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-sky-300 backdrop-blur-sm">
              {sim.phase === 'ready' && 'Ready For Descent'}
              {sim.phase === 'playing' && 'Descent Active'}
              {sim.phase === 'paused' && 'Simulation Paused'}
              {sim.phase === 'landed-safe' && 'Safe Touchdown!'}
              {sim.phase === 'crashed-hard' && 'Impact Too Fast'}
              {sim.phase === 'missed-pad' && 'Missed Landing Pad'}
            </span>

            <span
              className={`rounded-full border px-3 py-1 font-mono text-[11px] font-semibold backdrop-blur-sm ${
                isSafeSpeed
                  ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                  : 'border-rose-400/45 bg-rose-500/20 text-rose-200'
              }`}
            >
              {speedHudLabel}
            </span>
          </div>

          <svg
            viewBox={`0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`}
            role="img"
            aria-label={`2D Moon Landing simulation view. Altitude ${sim.altitude.toFixed(1)} meters, vertical velocity ${sim.vy.toFixed(1)} meters per second, horizontal speed ${sim.vx.toFixed(1)} meters per second, fuel ${Math.round(sim.fuel)} percent.`}
            className="block h-auto w-full select-none"
          >
            <defs>
              <linearGradient id="lunarSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#030712" />
                <stop offset="70%" stopColor="#08132a" />
                <stop offset="100%" stopColor="#101d3b" />
              </linearGradient>
              <linearGradient id="lunarSurface" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="thrusterFlame" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="50%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="rgba(251,113,133,0)" />
              </linearGradient>
            </defs>

            {/* Sky */}
            <rect width={SCENE_WIDTH} height={SCENE_HEIGHT} fill="url(#lunarSky)" />

            {/* Subtle Starfield */}
            <g fill="#e2e8f0" opacity="0.7">
              <circle cx="54" cy="48" r="1.2" />
              <circle cx="122" cy="86" r="1" />
              <circle cx="194" cy="38" r="1.4" />
              <circle cx="268" cy="64" r="1" />
              <circle cx="348" cy="42" r="1.3" />
              <circle cx="412" cy="96" r="1.1" />
              <circle cx="486" cy="54" r="1.5" />
              <circle cx="554" cy="112" r="1" />
              <circle cx="88" cy="144" r="1.1" />
              <circle cx="452" cy="164" r="1.2" />
            </g>

            {/* Distant Earth in lunar sky */}
            <g transform="translate(520, 72)">
              <circle r="18" fill="#0284c7" opacity="0.85" />
              <path
                d="M -8 -14 A 18 18 0 0 1 14 10 A 15 15 0 0 0 -8 -14 Z"
                fill="#7dd3fc"
                opacity="0.55"
              />
              <circle r="21" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.25" />
            </g>

            {/* Background Lunar Crater Ridges */}
            <path
              d={`M 0 ${GROUND_Y} L 0 288 Q 55 270 112 292 T 215 ${GROUND_Y} L 385 ${GROUND_Y} Q 445 276 508 294 T 600 282 L 600 ${GROUND_Y} Z`}
              fill="#1e293b"
              opacity="0.85"
            />

            {/* Main Lunar Ground */}
            <rect
              x="0"
              y={GROUND_Y}
              width={SCENE_WIDTH}
              height={SCENE_HEIGHT - GROUND_Y}
              fill="url(#lunarSurface)"
            />
            <line
              x1="0"
              y1={GROUND_Y}
              x2={SCENE_WIDTH}
              y2={GROUND_Y}
              stroke="#64748b"
              strokeWidth="1.5"
            />

            {/* Surface Craters (outside landing pad) */}
            <ellipse cx="95" cy="336" rx="28" ry="6" fill="#0f172a" opacity="0.55" />
            <ellipse cx="495" cy="338" rx="34" ry="7" fill="#0f172a" opacity="0.55" />

            {/* Alignment Drop Guide Line from Lander to Surface */}
            <line
              x1={landerSvgX}
              y1={landerSvgY + 14}
              x2={landerSvgX}
              y2={GROUND_Y}
              stroke={overPad ? '#34d399' : '#fbbf24'}
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.45"
            />

            {/* Landing Pad */}
            <g>
              {/* Soft landing beacon glow */}
              <rect
                x={padLeftX}
                y={GROUND_Y - 3}
                width={padWidth}
                height="9"
                rx="3"
                fill={overPad ? '#10b981' : '#0284c7'}
                opacity="0.35"
              />
              {/* Pad platform */}
              <rect
                x={padLeftX}
                y={GROUND_Y - 2}
                width={padWidth}
                height="6"
                rx="2"
                fill="#0f172a"
                stroke={overPad ? '#34d399' : '#38bdf8'}
                strokeWidth="2"
              />
              {/* Pad center chevron & beacons */}
              <circle cx={padLeftX + 6} cy={GROUND_Y - 5} r="3" fill="#38bdf8" />
              <circle cx={padRightX - 6} cy={GROUND_Y - 5} r="3" fill="#38bdf8" />
              <text
                x={(padLeftX + padRightX) / 2}
                y={GROUND_Y + 22}
                textAnchor="middle"
                fill={overPad ? '#6ee7b7' : '#7dd3fc'}
                fontSize="11"
                fontFamily="monospace"
                fontWeight="700"
              >
                LANDING PAD
              </text>
            </g>

            {/* 2D Lunar Lander Spacecraft */}
            <g transform={`translate(${landerSvgX}, ${landerSvgY})`}>
              {/* Outcome highlight ring */}
              {sim.phase === 'landed-safe' && (
                <circle
                  cx="0"
                  cy="-10"
                  r="34"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
              )}
              {(sim.phase === 'crashed-hard' || sim.phase === 'missed-pad') && (
                <circle
                  cx="0"
                  cy="-10"
                  r="34"
                  fill="rgba(251, 113, 133, 0.14)"
                  stroke="#fb7185"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
              )}

              {/* Main Thruster Flame */}
              {sim.activeThrottle > 0 && sim.fuel > 0 && (
                <polygon
                  points={`-6,0 6,0 0,${14 + sim.activeThrottle * 30}`}
                  fill="url(#thrusterFlame)"
                />
              )}

              {/* Side RCS Puffs */}
              {sim.activeLateral === -1 && sim.fuel > 0 && (
                <polygon points="14,-14 14,-9 28,-11.5" fill="#7dd3fc" opacity="0.85" />
              )}
              {sim.activeLateral === 1 && sim.fuel > 0 && (
                <polygon points="-14,-14 -14,-9 -28,-11.5" fill="#7dd3fc" opacity="0.85" />
              )}

              {/* Landing Struts */}
              <line x1="-10" y1="-4" x2="-19" y2="6" stroke="#94a3b8" strokeWidth="2.2" />
              <line x1="10" y1="-4" x2="19" y2="6" stroke="#94a3b8" strokeWidth="2.2" />
              <line x1="-22" y1="6" x2="-15" y2="6" stroke="#cbd5e1" strokeWidth="2.5" />
              <line x1="15" y1="6" x2="22" y2="6" stroke="#cbd5e1" strokeWidth="2.5" />

              {/* Engine Nozzle */}
              <polygon points="-5,-2 5,-2 7,2 -7,2" fill="#475569" />

              {/* Descent Stage (Gold Foil) */}
              <rect
                x="-13"
                y="-11"
                width="26"
                height="9"
                rx="2"
                fill="#f59e0b"
                stroke="#fde68a"
                strokeWidth="1"
              />

              {/* Crew Ascent Cabin */}
              <path
                d="M -10 -11 L -8 -23 L 8 -23 L 10 -11 Z"
                fill="#e2e8f0"
                stroke="#94a3b8"
                strokeWidth="1"
              />
              {/* Crew Viewport */}
              <rect x="-5" y="-20" width="10" height="5" rx="1.5" fill="#0ea5e9" />
              {/* Comms Antenna */}
              <line x1="0" y1="-23" x2="0" y2="-29" stroke="#cbd5e1" strokeWidth="1.5" />
              <circle cx="0" cy="-30" r="1.8" fill="#38bdf8" />
            </g>
          </svg>
        </div>

        {/* Live Telemetry Readouts + Controls */}
        <div className="flex flex-col justify-between gap-4 lg:col-span-4">
          {/* Telemetry Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-space-border bg-space-void/75 p-3.5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                Altitude
              </p>
              <p className="mt-1 font-mono text-xl font-bold text-sky-300">
                {sim.altitude.toFixed(1)} m
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {sim.altitude === 0 ? 'Surface contact' : 'Above Moon surface'}
              </p>
            </div>

            <div className="rounded-xl border border-space-border bg-space-void/75 p-3.5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                Vertical Speed
              </p>
              <p
                className={`mt-1 font-mono text-xl font-bold ${
                  isVerticalSafe ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {isEnded && sim.touchdownSpeed !== null
                  ? `${sim.touchdownSpeed.toFixed(1)} m/s`
                  : `${sim.vy.toFixed(1)} m/s`}
              </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {isEnded && sim.touchdownSpeed !== null
                ? isVerticalSafe
                  ? 'Safe touchdown rate'
                  : `Exceeded ≤ ${modeConfig.safeVerticalSpeed} m/s`
                : sim.vy > 0.15
                  ? 'Climbing'
                  : sim.vy < -0.15
                    ? 'Descending'
                    : 'Steady'}
            </p>
            </div>

            <div className="rounded-xl border border-space-border bg-space-void/75 p-3.5">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  Fuel
                </p>
                <Fuel
                  className={`h-3.5 w-3.5 ${
                    sim.fuel <= 0
                      ? 'text-rose-300'
                      : sim.fuel < 30
                        ? 'text-amber-300'
                        : 'text-sky-300'
                  }`}
                  aria-hidden="true"
                />
              </div>
              <p
                className={`mt-1 font-mono text-xl font-bold ${
                  sim.fuel <= 0
                    ? 'text-rose-300'
                    : sim.fuel < 30
                      ? 'text-amber-300'
                      : 'text-slate-100'
                }`}
              >
                {Math.round(sim.fuel)}%
              </p>
              <div className="mt-1.5">
                <ProgressBar
                  label="Fuel Remaining"
                  value={sim.fuel}
                  showPercentage={false}
                  size="sm"
                  fillClassName={
                    sim.fuel <= 0
                      ? 'bg-rose-400'
                      : sim.fuel < 30
                        ? 'bg-amber-400'
                        : 'bg-sky-400'
                  }
                />
              </div>
            </div>

            <div className="rounded-xl border border-space-border bg-space-void/75 p-3.5">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  Pad Target
                </p>
                <Target
                  className={`h-3.5 w-3.5 ${
                    overPad ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                  aria-hidden="true"
                />
              </div>
              <p
                className={`mt-1 font-mono text-base font-bold ${
                  overPad ? 'text-emerald-300' : 'text-amber-300'
                }`}
              >
                {alignmentText}
              </p>
              <p
                className={`mt-0.5 text-[11px] ${
                  !isHorizontalSafe
                    ? 'font-semibold text-rose-300'
                    : isEnded && sim.touchdownHorizontalSpeed !== null
                      ? 'text-emerald-300'
                      : 'text-slate-400'
                }`}
              >
                H-Speed:{' '}
                {(isEnded && sim.touchdownHorizontalSpeed !== null
                  ? sim.touchdownHorizontalSpeed
                  : sim.vx
                ).toFixed(1)}{' '}
                m/s (safe ≤ {modeConfig.safeHorizontalSpeed})
              </p>
            </div>
          </div>

          {/* Thrust & Steering Controls */}
          <div className="space-y-3 rounded-xl border border-space-border bg-space-void/75 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-200">
                <Flame className="h-4 w-4 text-amber-300" aria-hidden="true" />
                Engine & Steering Controls
              </span>
              <span className="font-mono text-sky-300">
                Thrust: {Math.round(effectiveDisplayThrottle * 100)}%
              </span>
            </div>

            {/* Hold-to-Boost Main Thruster Button */}
            <button
              type="button"
              data-sim-thrust="true"
              disabled={fuelDepleted || isEnded}
              onPointerDown={() => setPointerThrust(true)}
              onPointerUp={() => setPointerThrust(false)}
              onPointerLeave={() => setPointerThrust(false)}
              onPointerCancel={() => setPointerThrust(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setPointerThrust(true);
              }}
              onKeyUp={(e) => {
                if (e.key === 'Enter') setPointerThrust(false);
              }}
              className={`touch-none flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed select-none ${
                boostHeld && !fuelDepleted
                  ? 'border-amber-300 bg-amber-400 text-slate-950 shadow-[0_0_24px_rgba(251,191,36,0.45)]'
                  : 'border-sky-300/60 bg-sky-400 text-slate-950 hover:bg-sky-300'
              }`}
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
              {fuelDepleted ? 'Fuel Empty (Engines Off)' : 'Hold to Fire Thruster (100%)'}
            </button>

            {/* Steering Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={fuelDepleted || isEnded}
                onPointerDown={() => setPointerLateral('left', true)}
                onPointerUp={() => setPointerLateral('left', false)}
                onPointerLeave={() => setPointerLateral('left', false)}
                onPointerCancel={() => setPointerLateral('left', false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setPointerLateral('left', true);
                }}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') setPointerLateral('left', false);
                }}
                className={`touch-none flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed select-none ${
                  lateralHeld === -1 && !fuelDepleted
                    ? 'border-sky-300 bg-sky-400/25 text-sky-100'
                    : 'border-space-border bg-space-slate text-slate-200 hover:border-sky-400/45'
                }`}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Steer Left
              </button>

              <button
                type="button"
                disabled={fuelDepleted || isEnded}
                onPointerDown={() => setPointerLateral('right', true)}
                onPointerUp={() => setPointerLateral('right', false)}
                onPointerLeave={() => setPointerLateral('right', false)}
                onPointerCancel={() => setPointerLateral('right', false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setPointerLateral('right', true);
                }}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') setPointerLateral('right', false);
                }}
                className={`touch-none flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed select-none ${
                  lateralHeld === 1 && !fuelDepleted
                    ? 'border-sky-300 bg-sky-400/25 text-sky-100'
                    : 'border-space-border bg-space-slate text-slate-200 hover:border-sky-400/45'
                }`}
              >
                Steer Right
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Tap Throttle Presets (Great for keyboard-clickers & mobile taps) */}
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-slate-400">
                Or tap a steady throttle level:
              </p>
              <div
                role="group"
                aria-label="Steady throttle presets"
                className="grid grid-cols-4 gap-1.5"
              >
                {THROTTLE_PRESETS.map((preset) => {
                  const isActive = Math.abs(presetThrottle - preset.value) < 0.02;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      aria-pressed={isActive}
                      disabled={fuelDepleted || isEnded}
                      onClick={() => {
                        if (sim.phase === 'ready') startMission();
                        setPresetThrottle(preset.value);
                      }}
                      className={`min-h-9 rounded-lg border px-1.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                        isActive
                          ? 'border-sky-400/60 bg-sky-400/20 text-sky-200'
                          : 'border-space-border bg-space-navy text-slate-300 hover:border-sky-400/35'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Outcome & Score Breakdown */}
      {sim.phase === 'landed-safe' && sim.score && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-emerald-400/45 bg-emerald-500/12 p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-300" aria-hidden="true" />
                <h3 className="font-display text-lg font-bold text-emerald-100">
                  Eagle Touchdown! Safe Lunar Landing
                </h3>
              </div>
              <p className="mt-1 text-sm text-emerald-100/90">
                Touchdown was{' '}
                <strong className="font-mono">
                  {sim.touchdownSpeed?.toFixed(2)} m/s
                </strong>{' '}
                vertically and{' '}
                <strong className="font-mono">
                  {sim.touchdownHorizontalSpeed?.toFixed(2)} m/s
                </strong>{' '}
                sideways, with{' '}
                <strong className="font-mono">{Math.round(sim.fuel)}%</strong>{' '}
                fuel remaining.
                {missionCompleted &&
                  ' Mission Control progress saved to your Cadet Dashboard!'}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-emerald-400/35 bg-space-void/70 px-4 py-2.5">
              <div className="flex items-center gap-0.5 text-amber-300" aria-label={`${sim.score.stars} out of 3 stars`}>
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s <= sim.score!.stars ? 'fill-amber-300' : 'text-slate-600'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="font-mono text-lg font-bold text-emerald-200">
                {sim.score.total} pts
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-xl border border-emerald-400/25 bg-space-void/60 p-2.5 text-xs">
              <p className="text-slate-400">Safe Landing</p>
              <p className="font-mono font-bold text-emerald-300">
                +{sim.score.baseBonus} pts
              </p>
            </div>
            <div className="rounded-xl border border-emerald-400/25 bg-space-void/60 p-2.5 text-xs">
              <p className="text-slate-400">Soft Speed Bonus</p>
              <p className="font-mono font-bold text-emerald-300">
                +{sim.score.softLandingBonus} pts
              </p>
            </div>
            <div className="rounded-xl border border-emerald-400/25 bg-space-void/60 p-2.5 text-xs">
              <p className="text-slate-400">Pad Bullseye</p>
              <p className="font-mono font-bold text-emerald-300">
                +{sim.score.accuracyBonus} pts
              </p>
            </div>
            <div className="rounded-xl border border-emerald-400/25 bg-space-void/60 p-2.5 text-xs">
              <p className="text-slate-400">Fuel Saved</p>
              <p className="font-mono font-bold text-emerald-300">
                +{sim.score.fuelBonus} pts
              </p>
            </div>
          </div>
        </div>
      )}

      {(sim.phase === 'crashed-hard' || sim.phase === 'missed-pad') && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col gap-4 rounded-2xl border border-rose-400/45 bg-rose-500/12 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" aria-hidden="true" />
            <div>
              <h3 className="font-display text-lg font-bold text-rose-100">
                {sim.phase === 'crashed-hard'
                  ? 'Hard Landing — Lander Struts Damaged'
                  : 'Missed the Landing Pad'}
              </h3>
              <p className="mt-1 text-sm text-rose-100/90">
                {sim.phase === 'crashed-hard'
                  ? !crashedVertTooFast && crashedHorizTooFast
                    ? `Your vertical descent was gentle (${sim.touchdownSpeed?.toFixed(1)} m/s), but sideways H-Speed was ${sim.touchdownHorizontalSpeed?.toFixed(1)} m/s (safe limit ≤ ${modeConfig.safeHorizontalSpeed} m/s). Fire Steer Left / Right earlier to cancel sideways drift${crashedOffPad ? ' over the pad' : ''}!`
                    : crashedVertTooFast && crashedHorizTooFast
                      ? `Both vertical speed (${sim.touchdownSpeed?.toFixed(1)} m/s; safe ≤ ${modeConfig.safeVerticalSpeed} m/s) and sideways H-Speed (${sim.touchdownHorizontalSpeed?.toFixed(1)} m/s; safe ≤ ${modeConfig.safeHorizontalSpeed} m/s) exceeded safe limits! Brake earlier and steady horizontal drift${crashedOffPad ? ' above the glowing pad' : ''}.`
                      : `You touched down at ${sim.touchdownSpeed?.toFixed(1)} m/s vertically (sideways ${sim.touchdownHorizontalSpeed?.toFixed(1)} m/s). Fire your engine earlier to keep vertical speed at ${modeConfig.safeVerticalSpeed} m/s or slower${crashedOffPad ? ' and aim inside the glowing pad' : ''}!`
                  : `Your landing speeds were safe (${sim.touchdownSpeed?.toFixed(1)} m/s vertical, ${sim.touchdownHorizontalSpeed?.toFixed(1)} m/s sideways), but you touched down ${Math.abs(sim.x).toFixed(1)} m from pad center. Use Steer Left / Right to stay inside the glowing pad!`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
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
              variant="primary"
              size="sm"
              leftIcon={<RotateCcw className="h-4 w-4" />}
              onClick={() => restartMission()}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Child-Friendly Physics Guide + Keyboard Shortcuts */}
      <div className="rounded-2xl border border-space-border/90 bg-space-void/65 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="inline-flex items-center gap-2 font-display text-base font-semibold text-slate-50">
            <Gauge className="h-4 w-4 text-sky-300" aria-hidden="true" />
            How Lunar Landing Physics Works
          </h3>
          <p className="font-mono text-[11px] text-slate-400">
            Keys: W / ↑ / Space = Thrust • A / ← = Left • D / → = Right • R = Restart
          </p>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-space-border/80 bg-space-navy/80 p-3">
            <p className="text-xs font-semibold text-sky-300">
              1. Moon Gravity ({LUNAR_CONSTANTS.LUNAR_GRAVITY} m/s²)
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              The Moon pulls you down 6× gentler than Earth—so you fall in slow motion, but still speed up every second!
            </p>
          </div>
          <div className="rounded-xl border border-space-border/80 bg-space-navy/80 p-3">
            <p className="text-xs font-semibold text-amber-300">
              2. Engine Thrust (Up to {LUNAR_CONSTANTS.MAX_THRUST_ACCEL} m/s²)
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              Hot exhaust pushes down to push your ship up (Newton’s 3rd Law). About{' '}
              <strong>{LUNAR_CONSTANTS.HOVER_THROTTLE_PERCENT}% thrust</strong>{' '}
              balances gravity to hover!
            </p>
          </div>
          <div className="rounded-xl border border-space-border/80 bg-space-navy/80 p-3">
            <p className="text-xs font-semibold text-rose-300">
              3. Fuel Budget (100%)
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              Firing thrusters burns fuel. If the tank hits 0%, engines shut off completely and gravity takes over!
            </p>
          </div>
          <div className="rounded-xl border border-space-border/80 bg-space-navy/80 p-3">
            <p className="text-xs font-semibold text-emerald-300">
              4. Safe Touchdown (V ≤ {LUNAR_CONSTANTS.SAFE_VERTICAL_SPEED} • H ≤ {LUNAR_CONSTANTS.SAFE_HORIZONTAL_SPEED} m/s)
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              Center over the glowing pad with vertical speed ≤ {LUNAR_CONSTANTS.SAFE_VERTICAL_SPEED} m/s and sideways drift ≤ {LUNAR_CONSTANTS.SAFE_HORIZONTAL_SPEED} m/s to protect the lander’s legs!
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
