import { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TrainingProvider } from '../../context/TrainingContext';
import { STORAGE_KEY, clearTrainingState } from '../../utils/storage';
import { MissionControlPage } from './MissionControlPage';
import { MoonLandingSimulator } from './MoonLandingSimulator';
import { missionControlData } from './missionControlData';
import {
  LUNAR_CONSTANTS,
  calculateLandingScore,
  createInitialLunarState,
  stepLunarSimulation,
} from './lunarPhysics';

describe('lunarPhysics simulation model', () => {
  it('accelerates downward under lunar gravity when throttle is zero', () => {
    const start = { ...createInitialLunarState(), phase: 'playing' as const };
    const next = stepLunarSimulation(start, { throttle: 0, lateral: 0 }, 0.05);

    expect(next.vy).toBeCloseTo(-LUNAR_CONSTANTS.LUNAR_GRAVITY * 0.05, 5);
    expect(next.altitude).toBeLessThan(start.altitude);
    expect(next.fuel).toBe(100);
  });

  it('produces net upward acceleration at 100% thrust and burns fuel', () => {
    const start = { ...createInitialLunarState(), phase: 'playing' as const };
    const next = stepLunarSimulation(start, { throttle: 1, lateral: 0 }, 0.05);

    const expectedVy =
      (LUNAR_CONSTANTS.MAX_THRUST_ACCEL - LUNAR_CONSTANTS.LUNAR_GRAVITY) * 0.05;
    expect(next.vy).toBeCloseTo(expectedVy, 5);
    expect(next.fuel).toBeCloseTo(
      100 - LUNAR_CONSTANTS.MAIN_FUEL_BURN_PER_SEC * 0.05,
      5,
    );
  });

  it('cuts off thrust and lateral RCS immediately when fuel reaches zero', () => {
    const emptyFuelState = {
      ...createInitialLunarState(),
      phase: 'playing' as const,
      fuel: 0,
      vy: -1,
    };

    const next = stepLunarSimulation(
      emptyFuelState,
      { throttle: 1, lateral: 1 },
      0.05,
    );

    expect(next.activeThrottle).toBe(0);
    expect(next.activeLateral).toBe(0);
    expect(next.vy).toBeCloseTo(
      -1 - LUNAR_CONSTANTS.LUNAR_GRAVITY * 0.05,
      5,
    );
  });

  it('detects safe touchdown on pad and calculates mission score breakdown', () => {
    const nearPad = {
      ...createInitialLunarState(),
      phase: 'playing' as const,
      altitude: 0.04,
      x: 2,
      vy: -1.5,
      vx: 0.2,
      fuel: 60,
    };

    const landed = stepLunarSimulation(nearPad, { throttle: 0, lateral: 0 }, 0.05);
    expect(landed.phase).toBe('landed-safe');
    expect(landed.altitude).toBe(0);
    expect(landed.score).not.toBeNull();
    expect(landed.score!.total).toBeGreaterThan(600);

    const sampleScore = calculateLandingScore(1.0, 0, 80);
    expect(sampleScore.stars).toBe(3);
  });

  it('detects hard impact crashes when vertical speed exceeds safe limit', () => {
    const fastDescent = {
      ...createInitialLunarState(),
      phase: 'playing' as const,
      altitude: 0.1,
      x: 0,
      vy: -6.2,
      vx: 0,
      fuel: 40,
    };

    const crashed = stepLunarSimulation(
      fastDescent,
      { throttle: 0, lateral: 0 },
      0.05,
    );
    expect(crashed.phase).toBe('crashed-hard');
    expect(crashed.score).toBeNull();
  });

  it('detects missed landing pad when touching down gently outside pad bounds', () => {
    const offPad = {
      ...createInitialLunarState(),
      phase: 'playing' as const,
      altitude: 0.03,
      x: LUNAR_CONSTANTS.PAD_HALF_WIDTH + 8,
      vy: -1.2,
      vx: 0,
      fuel: 50,
    };

    const missed = stepLunarSimulation(offPad, { throttle: 0, lateral: 0 }, 0.05);
    expect(missed.phase).toBe('missed-pad');
    expect(missed.score).toBeNull();
  });
});

describe('MoonLandingSimulator interactive UI', () => {
  it('renders telemetry, physics guide, and button/keyboard thrust & restart controls', () => {
    render(<MoonLandingSimulator />);

    expect(
      screen.getByRole('heading', { name: 'Moon Landing Simulator' }),
    ).toBeInTheDocument();
    expect(screen.getByText('120.0 m')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /How Lunar Landing Physics Works/i }),
    ).toBeInTheDocument();

    // Launch and Pause/Resume flow
    fireEvent.click(screen.getByRole('button', { name: /Launch Lander/i }));
    expect(screen.getByText('Descent Active')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Pause/i }));
    expect(screen.getByText('Simulation Paused')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Resume Descent/i }));
    expect(screen.getByText('Descent Active')).toBeInTheDocument();

    // Button throttle preset & Hold-to-Thrust pointer control
    fireEvent.click(screen.getByRole('button', { name: /43% Hover/i }));
    expect(screen.getByText('Thrust: 43%')).toBeInTheDocument();

    const thrustBtn = screen.getByRole('button', {
      name: /Hold to Fire Thruster/i,
    });
    fireEvent.pointerDown(thrustBtn);
    expect(screen.getByText('Thrust: 100%')).toBeInTheDocument();
    fireEvent.pointerUp(thrustBtn);
    expect(screen.getByText('Thrust: 43%')).toBeInTheDocument();

    // Keyboard thrust & restart
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    expect(screen.getByText('Thrust: 100%')).toBeInTheDocument();
    fireEvent.keyUp(window, { key: 'ArrowUp' });

    fireEvent.keyDown(window, { key: 'r' });
    expect(screen.getByText('120.0 m')).toBeInTheDocument();
    expect(screen.getByText('Thrust: 0%')).toBeInTheDocument();
  });
});

function setupManualRaf() {
  let nextId = 1;
  let queued: Array<{ id: number; cb: FrameRequestCallback }> = [];

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    const id = nextId++;
    queued.push({ id, cb });
    return id;
  });

  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    queued = queued.filter((item) => item.id !== id);
  });

  const advanceFrames = (count: number, startTimeMs = 1000, stepMs = 50) => {
    let time = startTimeMs;
    act(() => {
      for (let i = 0; i < count; i++) {
        const batch = queued;
        queued = [];
        for (const item of batch) {
          item.cb(time);
        }
        time += stepMs;
      }
    });
    return time;
  };

  return { advanceFrames };
}

function flySafeLanding(advanceFrames: (count: number, startMs?: number) => number) {
  fireEvent.click(screen.getByRole('button', { name: /Launch Lander/i }));

  // Frame 1 initializes clock; next 179 frames = 8.95s freefall (alt ~54.9m, vy ~-14.5m/s)
  let t = advanceFrames(180, 1000);

  // Fire 100% Max thrust for 120 frames = 6.0s (vy rises to ~-1.42 m/s, alt ~7.1m)
  fireEvent.click(screen.getByRole('button', { name: /100% Max/i }));
  t = advanceFrames(120, t);

  // Switch to 43% Hover until touchdown (up to 160 frames = 8s)
  fireEvent.click(screen.getByRole('button', { name: /43% Hover/i }));
  for (let i = 0; i < 16; i++) {
    t = advanceFrames(10, t);
    if (screen.queryByText('Safe Touchdown!')) break;
  }
}

describe('Mission Control briefing and telemetry alignment', () => {
  it('describes lunar descent and Moon Landing tasks rather than liftoff countdowns', () => {
    expect(missionControlData.missionBrief).toMatch(/Moon|lunar/i);
    expect(missionControlData.missionBrief).not.toMatch(/Go\/No-Go|countdown sequence/i);
    expect(missionControlData.tasks.map((t) => t.id)).toEqual(['mc-1', 'mc-2', 'mc-3']);
    expect(missionControlData.tasks.some((t) => /Touchdown|Lunar/i.test(t.title))).toBe(true);
  });
});

describe('MoonLandingSimulator velocity feedback, StrictMode safety, and progress sync', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    clearTrainingState();
  });

  it('distinguishes excessive horizontal drift from vertical speed in HUD and crash messages', () => {
    const { advanceFrames } = setupManualRaf();
    render(<MoonLandingSimulator />);

    fireEvent.click(screen.getByRole('button', { name: /Launch Lander/i }));
    // Hold 43% Hover so vertical speed stays near 0 while steering right pushes |vx| > 2.5 m/s
    fireEvent.click(screen.getByRole('button', { name: /43% Hover/i }));
    const steerRightBtn = screen.getByRole('button', { name: /Steer Right/i });
    fireEvent.pointerDown(steerRightBtn);

    let t = advanceFrames(35, 1000);
    fireEvent.pointerUp(steerRightBtn);

    expect(screen.getByText(/SIDE DRIFT TOO FAST/i)).toBeInTheDocument();

    // Restart cleanly, descend quickly at 0% throttle to save fuel, brake near surface,
    // then boost sideways speed > 2.5 m/s right before touchdown
    fireEvent.click(screen.getByRole('button', { name: /Restart/i }));
    t = advanceFrames(170, t + 50); // 8.45s freefall (alt ~62m, vy ~-13.7 m/s, 100% fuel)

    fireEvent.click(screen.getByRole('button', { name: /100% Max/i }));
    t = advanceFrames(112, t); // 5.6s max burn -> vy ~-1.5 m/s, alt ~19m, fuel ~58%

    fireEvent.click(screen.getByRole('button', { name: /43% Hover/i }));
    const steerRightAfterRestart = screen.getByRole('button', {
      name: /Steer Right/i,
    });
    fireEvent.pointerDown(steerRightAfterRestart);
    t = advanceFrames(30, t); // 1.5s sideways thrust -> vx ~3.9 m/s > 2.5 m/s
    fireEvent.pointerUp(steerRightAfterRestart);

    for (let i = 0; i < 30; i++) {
      t = advanceFrames(10, t);
      if (screen.queryByText('Impact Too Fast')) break;
    }

    expect(screen.getByText('Impact Too Fast')).toBeInTheDocument();
    expect(screen.getByText(/SIDE DRIFT TOO FAST/i)).toBeInTheDocument();
    expect(
      screen.getByText(/vertical descent was gentle/i),
    ).toBeInTheDocument();
  }, 15000);

  it('increments safeLandingsCount once per landing inside StrictMode and invokes onMissionComplete once', () => {
    const { advanceFrames } = setupManualRaf();
    const onMissionComplete = vi.fn();

    render(
      <StrictMode>
        <MoonLandingSimulator onMissionComplete={onMissionComplete} />
      </StrictMode>,
    );

    flySafeLanding(advanceFrames);

    expect(screen.getByText('Safe Touchdown!')).toBeInTheDocument();
    expect(screen.getByText(/\(1 safe\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/\(2 safe\)/i)).not.toBeInTheDocument();
    expect(onMissionComplete).toHaveBeenCalledTimes(1);
  }, 15000);

  it('updates Mission Control readiness to 100% and persists to localStorage upon safe touchdown', () => {
    const { advanceFrames } = setupManualRaf();
    clearTrainingState();

    render(
      <TrainingProvider>
        <MemoryRouter initialEntries={['/mission-control']}>
          <MissionControlPage />
        </MemoryRouter>
      </TrainingProvider>,
    );

    expect(
      screen.getByRole('button', { name: /Complete a Safe Moon Pad Touchdown/i }),
    ).toHaveAttribute('aria-pressed', 'false');

    flySafeLanding(advanceFrames);

    expect(screen.getByText('Safe Touchdown!')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Module Readiness' }),
    ).toHaveAttribute('aria-valuenow', '100');
    expect(
      screen.getByRole('button', { name: /Complete a Safe Moon Pad Touchdown/i }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain('mc-3');
  });
});
