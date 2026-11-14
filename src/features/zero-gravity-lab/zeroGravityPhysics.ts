/**
 * ANANTRA Zero Gravity Lab — Inertia & Motion Physics Model
 *
 * Demonstrates Newton's First and Second Laws:
 *  - Acceleration from a push: a = F / m (lighter objects speed up faster!)
 *  - Microgravity mode: zero floor friction, so objects keep gliding at constant velocity
 *  - Earth comparison mode: surface friction slows sliding objects until they stop
 */

export type EnvironmentMode = 'microgravity' | 'earth';

export interface LabObjectSpec {
  id: 'water-pouch' | 'toolbox' | 'supply-crate';
  name: string;
  massKg: number;
  emojiLabel: string;
  description: string;
}

export const LAB_OBJECTS: LabObjectSpec[] = [
  {
    id: 'water-pouch',
    name: 'Water Pouch',
    massKg: 1,
    emojiLabel: '1 kg',
    description: 'Light mass — accelerates quickly even with a gentle push.',
  },
  {
    id: 'toolbox',
    name: 'EVA Toolbox',
    massKg: 3,
    emojiLabel: '3 kg',
    description: 'Medium mass — steady inertia, easier to control.',
  },
  {
    id: 'supply-crate',
    name: 'Supply Crate',
    massKg: 6,
    emojiLabel: '6 kg',
    description: 'Heavy mass — high inertia! Needs stronger force to get moving.',
  },
];

export const LAB_CONSTANTS = {
  CHAMBER_LENGTH_M: 20,
  START_X_M: 1.5,
  DOCK_MIN_M: 14.0,
  DOCK_MAX_M: 18.2,
  WALL_X_M: 19.2,
  SAFE_DOCK_SPEED: 2.5,
  EARTH_FRICTION_DECEL: 1.2,
  PUSH_DURATION_SEC: 0.8,
  ASTRONAUT_MASS_KG: 45,
} as const;

export type LabOutcome =
  | 'idle'
  | 'gliding'
  | 'docked-success'
  | 'bounced-retry'
  | 'stopped-short';

export interface LabMotionState {
  x: number;
  velocity: number;
  recoilVelocity: number;
  lastAcceleration: number;
  outcome: LabOutcome;
  pushCount: number;
}

export function createInitialLabMotion(): LabMotionState {
  return {
    x: LAB_CONSTANTS.START_X_M,
    velocity: 0,
    recoilVelocity: 0,
    lastAcceleration: 0,
    outcome: 'idle',
    pushCount: 0,
  };
}

/**
 * Applies a push force (Newtons) to the floating object using a = F / m,
 * plus Newton's 3rd Law recoil on the astronaut.
 */
export function applyPushImpulse(
  state: LabMotionState,
  forceNewtons: number,
  massKg: number,
  mode: EnvironmentMode = 'microgravity',
): LabMotionState {
  const acceleration = forceNewtons / massKg;
  const deltaV = acceleration * LAB_CONSTANTS.PUSH_DURATION_SEC;
  // On Earth tabletop experiments, floor static friction keeps the experimenter planted;
  // in microgravity free-fall, Newton's 3rd Law imparts equal-and-opposite momentum to the astronaut.
  const recoilDeltaV =
    mode === 'earth'
      ? 0
      : -(forceNewtons / LAB_CONSTANTS.ASTRONAUT_MASS_KG) *
        LAB_CONSTANTS.PUSH_DURATION_SEC;

  return {
    ...state,
    velocity: state.velocity + deltaV,
    recoilVelocity: Number((state.recoilVelocity + recoilDeltaV).toFixed(2)),
    lastAcceleration: Number(acceleration.toFixed(2)),
    outcome: 'gliding',
    pushCount: state.pushCount + 1,
  };
}

/**
 * Applies a gentle handheld braking force to slow a moving object.
 * If inside the Velcro Dock at safe speed, it locks the object safely.
 */
export function applyBrakeOrCatch(state: LabMotionState): LabMotionState {
  const inDock =
    state.x >= LAB_CONSTANTS.DOCK_MIN_M &&
    state.x <= LAB_CONSTANTS.DOCK_MAX_M;

  if (inDock && Math.abs(state.velocity) <= LAB_CONSTANTS.SAFE_DOCK_SPEED) {
    return {
      ...state,
      velocity: 0,
      lastAcceleration: 0,
      outcome: 'docked-success',
    };
  }

  // Slow velocity toward 0 by 1.4 m/s per brake tap
  const speed = Math.abs(state.velocity);
  const nextSpeed = Math.max(0, speed - 1.4);
  const nextVelocity =
    state.velocity >= 0 ? nextSpeed : -nextSpeed;

  if (nextSpeed === 0 && !inDock) {
    return {
      ...state,
      velocity: 0,
      outcome: 'stopped-short',
    };
  }

  return {
    ...state,
    velocity: nextVelocity,
    outcome: 'gliding',
  };
}

/**
 * Advances object motion by `rawDt` seconds under Microgravity or Earth friction.
 */
export function stepLabMotion(
  prev: LabMotionState,
  mode: EnvironmentMode,
  rawDt: number,
): LabMotionState {
  if (prev.outcome !== 'gliding') {
    return prev;
  }

  const dt = Math.max(0.001, Math.min(0.05, rawDt));
  let nextVelocity = prev.velocity;

  if (mode === 'earth' && Math.abs(nextVelocity) > 0) {
    const sign = Math.sign(nextVelocity);
    const reduced = Math.max(
      0,
      Math.abs(nextVelocity) - LAB_CONSTANTS.EARTH_FRICTION_DECEL * dt,
    );
    nextVelocity = sign * reduced;
  }

  let nextX = prev.x + nextVelocity * dt;

  // Check if Earth friction stopped the object
  if (mode === 'earth' && Math.abs(nextVelocity) <= 0.02) {
    const stoppedInDock =
      nextX >= LAB_CONSTANTS.DOCK_MIN_M &&
      nextX <= LAB_CONSTANTS.DOCK_MAX_M;
    return {
      ...prev,
      x: nextX,
      velocity: 0,
      outcome: stoppedInDock ? 'docked-success' : 'stopped-short',
    };
  }

  // Uncaught object colliding with the far station bulkhead always rebounds (no magic auto-dock)
  if (nextX >= LAB_CONSTANTS.WALL_X_M) {
    nextX = LAB_CONSTANTS.WALL_X_M;
    return {
      ...prev,
      x: nextX,
      velocity: -Math.max(0.4, Math.abs(nextVelocity) * 0.55),
      outcome: 'bounced-retry',
    };
  }

  // Clamp left wall
  if (nextX <= LAB_CONSTANTS.START_X_M && nextVelocity < 0) {
    nextX = LAB_CONSTANTS.START_X_M;
    nextVelocity = 0;
  }

  return {
    ...prev,
    x: nextX,
    velocity: nextVelocity,
  };
}
