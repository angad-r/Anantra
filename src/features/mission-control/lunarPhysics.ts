/**
 * ANANTRA Moon Landing Simulator — 2D Lunar Physics Engine
 *
 * Simplified Newtonian 2D point-mass physics model tuned for young learners:
 *
 * 1. Gravity (downward):
 *      a_gravity = -LUNAR_GRAVITY (-1.62 m/s², real lunar surface gravity)
 *
 * 2. Vertical Engine Thrust (upward, proportional to throttle 0..1 when fuel > 0):
 *      a_thrust = throttle * MAX_THRUST_ACCEL (up to +3.80 m/s²)
 *      net_ay   = a_thrust - LUNAR_GRAVITY
 *    Note: Hover balance happens at ~42.6% throttle (1.62 / 3.80).
 *
 * 3. Horizontal RCS Steering (-1 left, 0 neutral, +1 right when fuel > 0):
 *      net_ax = lateralInput * LATERAL_ACCEL (±2.20 m/s²)
 *
 * 4. Fuel Consumption:
 *      fuel_used = (throttle * MAIN_FUEL_BURN_PER_SEC + |lateralInput| * RCS_FUEL_BURN_PER_SEC) * dt
 *    When fuel reaches 0%, thrust cuts off immediately and the lander enters free-fall.
 *
 * 5. Semi-Implicit Euler Integration (per frame dt, clamped <= 0.05s):
 *      vy_next       = vy + net_ay * dt
 *      vx_next       = vx + net_ax * dt
 *      altitude_next = altitude + vy_next * dt
 *      x_next        = clamp(x + vx_next * dt, -WORLD_HALF_WIDTH, WORLD_HALF_WIDTH)
 *
 * 6. Touchdown Evaluation (when altitude_next <= 0):
 *      Safe landing requires:
 *        - |x|  <= PAD_HALF_WIDTH (on the landing pad)
 *        - |vy| <= SAFE_VERTICAL_SPEED (<= 3.5 m/s)
 *        - |vx| <= SAFE_HORIZONTAL_SPEED (<= 2.5 m/s)
 */

export const LUNAR_CONSTANTS = {
  /** Real lunar gravitational acceleration (m/s^2) */
  LUNAR_GRAVITY: 1.62,
  /** Maximum upward acceleration from the main descent engine (m/s^2) */
  MAX_THRUST_ACCEL: 3.8,
  /** Sideways acceleration from RCS attitude thrusters (m/s^2) */
  LATERAL_ACCEL: 2.2,
  /** Fuel percentage consumed per second at 100% main throttle */
  MAIN_FUEL_BURN_PER_SEC: 7.5,
  /** Fuel percentage consumed per second while firing left/right RCS */
  RCS_FUEL_BURN_PER_SEC: 1.8,
  /** Starting altitude above lunar surface (m) */
  INITIAL_ALTITUDE: 120,
  /** Maximum safe vertical speed at touchdown (m/s) */
  SAFE_VERTICAL_SPEED: 3.5,
  /** Maximum safe horizontal speed at touchdown (m/s) */
  SAFE_HORIZONTAL_SPEED: 2.5,
  /** Half-width of the safe lunar landing pad around x = 0 (m) */
  PAD_HALF_WIDTH: 18,
  /** Horizontal playfield half-width from -WORLD_HALF_WIDTH to +WORLD_HALF_WIDTH (m) */
  WORLD_HALF_WIDTH: 58,
  /** Hover throttle percentage where thrust equals lunar gravity */
  HOVER_THROTTLE_PERCENT: Math.round((1.62 / 3.8) * 100),
} as const;

export type LandingPhase =
  | 'ready'
  | 'playing'
  | 'paused'
  | 'landed-safe'
  | 'crashed-hard'
  | 'missed-pad';

export interface LunarControls {
  /** Desired main throttle from 0 to 1 */
  throttle: number;
  /** Desired horizontal steering: -1 (left), 0 (none), +1 (right) */
  lateral: -1 | 0 | 1;
}

export interface MissionScoreBreakdown {
  total: number;
  stars: 1 | 2 | 3;
  baseBonus: number;
  softLandingBonus: number;
  accuracyBonus: number;
  fuelBonus: number;
}

export type LunarMissionMode = 'standard' | 'commander';

export interface LunarModeConfig {
  id: LunarMissionMode;
  label: string;
  badge: string;
  initialAltitude: number;
  initialX: number;
  initialVx: number;
  initialFuel: number;
  safeVerticalSpeed: number;
  safeHorizontalSpeed: number;
  padHalfWidth: number;
}

export const LUNAR_MODE_CONFIGS: Record<LunarMissionMode, LunarModeConfig> = {
  standard: {
    id: 'standard',
    label: 'Cadet Lunar Descent',
    badge: 'Standard Training',
    initialAltitude: LUNAR_CONSTANTS.INITIAL_ALTITUDE,
    initialX: -14,
    initialVx: 0.6,
    initialFuel: 100,
    safeVerticalSpeed: LUNAR_CONSTANTS.SAFE_VERTICAL_SPEED,
    safeHorizontalSpeed: LUNAR_CONSTANTS.SAFE_HORIZONTAL_SPEED,
    padHalfWidth: LUNAR_CONSTANTS.PAD_HALF_WIDTH,
  },
  commander: {
    id: 'commander',
    label: 'Commander Precision',
    badge: 'Tight Pad & Lean Fuel',
    initialAltitude: 125,
    initialX: 22,
    initialVx: -1.3,
    initialFuel: 82,
    safeVerticalSpeed: 2.4,
    safeHorizontalSpeed: 1.6,
    padHalfWidth: 12,
  },
};

export interface LunarSimulationState {
  mode: LunarMissionMode;
  phase: LandingPhase;
  altitude: number;
  x: number;
  vy: number;
  vx: number;
  fuel: number;
  activeThrottle: number;
  activeLateral: -1 | 0 | 1;
  elapsedSeconds: number;
  touchdownSpeed: number | null;
  touchdownHorizontalSpeed: number | null;
  score: MissionScoreBreakdown | null;
}

export function createInitialLunarState(
  mode: LunarMissionMode = 'standard',
): LunarSimulationState {
  const cfg = LUNAR_MODE_CONFIGS[mode];
  return {
    mode,
    phase: 'ready',
    altitude: cfg.initialAltitude,
    x: cfg.initialX,
    vy: 0,
    vx: cfg.initialVx,
    fuel: cfg.initialFuel,
    activeThrottle: 0,
    activeLateral: 0,
    elapsedSeconds: 0,
    touchdownSpeed: null,
    touchdownHorizontalSpeed: null,
    score: null,
  };
}

export function calculateLandingScore(
  touchdownVerticalSpeed: number,
  touchdownX: number,
  remainingFuel: number,
  mode: LunarMissionMode = 'standard',
): MissionScoreBreakdown {
  const cfg = LUNAR_MODE_CONFIGS[mode];
  const baseBonus = mode === 'commander' ? 450 : 400;

  // Up to 250 points for gentler vertical touchdowns closer to 0 m/s
  const speedRatio = Math.max(
    0,
    1 - Math.abs(touchdownVerticalSpeed) / cfg.safeVerticalSpeed,
  );
  const softLandingBonus = Math.round(speedRatio * 250);

  // Up to 200 points for landing close to the pad center (x = 0)
  const padRatio = Math.max(0, 1 - Math.abs(touchdownX) / cfg.padHalfWidth);
  const accuracyBonus = Math.round(padRatio * 200);

  // Up to 150 points for conserving fuel
  const fuelRatio = Math.max(0, Math.min(1, remainingFuel / cfg.initialFuel));
  const fuelBonus = Math.round(fuelRatio * 150);

  const total = Math.min(
    1000,
    baseBonus + softLandingBonus + accuracyBonus + fuelBonus,
  );
  const stars: 1 | 2 | 3 = total >= 820 ? 3 : total >= 650 ? 2 : 1;

  return {
    total,
    stars,
    baseBonus,
    softLandingBonus,
    accuracyBonus,
    fuelBonus,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Advances the 2D lunar landing physics by `rawDt` seconds.
 * Pure deterministic function suitable for requestAnimationFrame and unit tests.
 */
export function stepLunarSimulation(
  prev: LunarSimulationState,
  controls: LunarControls,
  rawDt: number,
): LunarSimulationState {
  if (prev.phase !== 'playing') {
    return prev;
  }

  const dt = clamp(rawDt, 0.001, 0.05);
  const hasFuel = prev.fuel > 0;

  const effectiveThrottle = hasFuel ? clamp(controls.throttle, 0, 1) : 0;
  const effectiveLateral: -1 | 0 | 1 = hasFuel ? controls.lateral : 0;

  const fuelBurn =
    (effectiveThrottle * LUNAR_CONSTANTS.MAIN_FUEL_BURN_PER_SEC +
      Math.abs(effectiveLateral) * LUNAR_CONSTANTS.RCS_FUEL_BURN_PER_SEC) *
    dt;
  const nextFuel = Math.max(0, prev.fuel - fuelBurn);

  const netAy =
    effectiveThrottle * LUNAR_CONSTANTS.MAX_THRUST_ACCEL -
    LUNAR_CONSTANTS.LUNAR_GRAVITY;
  const netAx = effectiveLateral * LUNAR_CONSTANTS.LATERAL_ACCEL;

  const nextVy = prev.vy + netAy * dt;
  const nextVx = prev.vx + netAx * dt;
  const nextAltitude = prev.altitude + nextVy * dt;

  const unclampedX = prev.x + nextVx * dt;
  const nextX = clamp(
    unclampedX,
    -LUNAR_CONSTANTS.WORLD_HALF_WIDTH,
    LUNAR_CONSTANTS.WORLD_HALF_WIDTH,
  );
  const boundedVx = unclampedX !== nextX ? 0 : nextVx;
  const nextElapsed = prev.elapsedSeconds + dt;

  // Check lunar surface touchdown
  const cfg = LUNAR_MODE_CONFIGS[prev.mode ?? 'standard'];
  if (nextAltitude <= 0) {
    const verticalImpact = Math.abs(nextVy);
    const horizontalImpact = Math.abs(boundedVx);
    const onPad = Math.abs(nextX) <= cfg.padHalfWidth;
    const withinSafeSpeed =
      verticalImpact <= cfg.safeVerticalSpeed &&
      horizontalImpact <= cfg.safeHorizontalSpeed;

    let outcome: LandingPhase;
    let score: MissionScoreBreakdown | null = null;

    if (onPad && withinSafeSpeed) {
      outcome = 'landed-safe';
      score = calculateLandingScore(verticalImpact, nextX, nextFuel, prev.mode);
    } else if (!withinSafeSpeed) {
      outcome = 'crashed-hard';
    } else {
      outcome = 'missed-pad';
    }

    return {
      mode: prev.mode,
      phase: outcome,
      altitude: 0,
      x: nextX,
      vy: 0,
      vx: 0,
      fuel: nextFuel,
      activeThrottle: 0,
      activeLateral: 0,
      elapsedSeconds: nextElapsed,
      touchdownSpeed: verticalImpact,
      touchdownHorizontalSpeed: horizontalImpact,
      score,
    };
  }

  return {
    ...prev,
    altitude: nextAltitude,
    x: nextX,
    vy: nextVy,
    vx: boundedVx,
    fuel: nextFuel,
    activeThrottle: effectiveThrottle,
    activeLateral: effectiveLateral,
    elapsedSeconds: nextElapsed,
  };
}
