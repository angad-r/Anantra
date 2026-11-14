import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ZeroGravityLabActivity } from './ZeroGravityLabActivity';
import {
  LAB_CONSTANTS,
  applyBrakeOrCatch,
  applyPushImpulse,
  createInitialLabMotion,
  stepLabMotion,
} from './zeroGravityPhysics';

describe('zeroGravityPhysics inertia & friction model', () => {
  it('accelerates lighter objects faster than heavy objects under equal force and applies zero recoil on Earth bench', () => {
    const start = createInitialLabMotion();
    const light = applyPushImpulse(start, 6, 1, 'microgravity');
    const heavy = applyPushImpulse(start, 6, 6, 'microgravity');
    const earthPush = applyPushImpulse(start, 6, 3, 'earth');

    expect(light.velocity).toBeGreaterThan(heavy.velocity);
    expect(light.recoilVelocity).toBeLessThan(0);
    expect(earthPush.recoilVelocity).toBe(0);
  });

  it('maintains constant velocity in microgravity and slows down under Earth friction', () => {
    const moving = applyPushImpulse(createInitialLabMotion(), 6, 3, 'microgravity');
    const spaceStep = stepLabMotion(moving, 'microgravity', 0.05);
    const earthStep = stepLabMotion(moving, 'earth', 0.05);

    expect(spaceStep.velocity).toBeCloseTo(moving.velocity, 5);
    expect(earthStep.velocity).toBeLessThan(moving.velocity);
  });

  it('docks when caught inside the Velcro Dock and always bounces if hitting bulkhead (even slowly)', () => {
    const insideDock = {
      ...createInitialLabMotion(),
      x: (LAB_CONSTANTS.DOCK_MIN_M + LAB_CONSTANTS.DOCK_MAX_M) / 2,
      velocity: 1.5,
      outcome: 'gliding' as const,
    };
    expect(applyBrakeOrCatch(insideDock).outcome).toBe('docked-success');

    const fastAtWall = {
      ...createInitialLabMotion(),
      x: LAB_CONSTANTS.WALL_X_M - 0.01,
      velocity: 4.5,
      outcome: 'gliding' as const,
    };
    const fastHit = stepLabMotion(fastAtWall, 'microgravity', 0.05);
    expect(fastHit.outcome).toBe('bounced-retry');
    expect(fastHit.velocity).toBeLessThan(0);

    // Regression check: slow wall contact must rebound rather than auto-docking
    const slowAtWall = {
      ...createInitialLabMotion(),
      x: LAB_CONSTANTS.WALL_X_M - 0.01,
      velocity: 0.4,
      outcome: 'gliding' as const,
    };
    const slowHit = stepLabMotion(slowAtWall, 'microgravity', 0.05);
    expect(slowHit.outcome).toBe('bounced-retry');
    expect(slowHit.velocity).toBeLessThan(0);
  });
});

describe('ZeroGravityLabActivity interactive controls', () => {
  it('lets cadets switch objects, toggle environment, push, inspect momentum & water spheres, and reset', () => {
    render(<ZeroGravityLabActivity />);

    expect(
      screen.getByRole('heading', {
        name: /Newton’s Zero-Gravity Motion Chamber/i,
      }),
    ).toBeInTheDocument();

    const supplyCrateBtn = screen.getByRole('button', { name: /Supply Crate/i });
    fireEvent.click(supplyCrateBtn);
    expect(supplyCrateBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('0.50 m/s²')).toBeInTheDocument();
    expect(screen.getByText(/Momentum \(p\s*=\s*m·v\)/i)).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /Supply Crate at 1\.5 meters/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Earth Lab/i }));
    expect(
      screen.getByText(/ENVIRONMENT: EARTH LAB/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Push Object/i }));
    expect(screen.getByRole('button', { name: /Catch \/ Brake/i })).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Reset Object/i }));
    expect(screen.getByRole('button', { name: /Catch \/ Brake/i })).toBeDisabled();

    // Test interactive Water Sphere & Surface Tension mini-lab toggle
    fireEvent.click(screen.getByRole('button', { name: /Earth Gravity Cup/i }));
    expect(
      screen.getByRole('img', {
        name: /Water pooled flat at the bottom of a glass/i,
      }),
    ).toBeInTheDocument();
  });
});
