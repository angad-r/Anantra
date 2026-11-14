import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmergencyMiniChallenge } from './EmergencyMiniChallenge';

describe('EmergencyMiniChallenge', () => {
  it('completes all three core orbital alerts and renders live telemetry matrix', () => {
    render(<EmergencyMiniChallenge />);

    expect(screen.getByText(/Cabin Pressure/i)).toBeInTheDocument();
    expect(screen.getByText(/O₂ \/ Scrubbers/i)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /close the isolation hatch/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /keep oxygen scrubbers powered/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /water-wall shielded shelter/i }),
    );

    expect(
      screen.getByText(/All Alerts Stabilized! Calm Crisis Commander/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Score: 300 / 300 pts')).toBeInTheDocument();
  });

  it('completes Drill 2 Full Station Crisis (5 alerts including O₂ Scrubber & Comms Blackout)', () => {
    render(<EmergencyMiniChallenge />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /Drill 2: Full Station Crisis \(O₂ \+ Comms • 500 pts\)/i,
      }),
    );

    fireEvent.click(
      screen.getByRole('button', { name: /close the isolation hatch/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Activate redundant CO₂ scrubber channel/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /keep oxygen scrubbers powered/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Fail over to omnidirectional S-Band antenna/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /water-wall shielded shelter/i }),
    );

    expect(screen.getByText('Score: 500 / 500 pts')).toBeInTheDocument();
    expect(
      screen.getByText(/All Alerts Stabilized! Calm Crisis Commander/i),
    ).toBeInTheDocument();
  });

  it('triggers retry state when unsafe choices drop station safety too low and recovers on retry', () => {
    render(<EmergencyMiniChallenge />);

    const badBtn = screen.getByRole('button', {
      name: /Open the exterior airlock hatch/i,
    });
    fireEvent.click(badBtn);
    fireEvent.click(badBtn);

    expect(
      screen.getByText(/Safety Threshold Breached — Retry Drill/i),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Retry Emergency Drill/i }),
    );
    expect(screen.getByText('Score: 0 / 300 pts')).toBeInTheDocument();
  });
});
