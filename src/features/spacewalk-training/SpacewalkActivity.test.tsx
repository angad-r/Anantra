import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SpacewalkActivity } from './SpacewalkActivity';

describe('SpacewalkActivity EVA tool & oxygen challenge', () => {
  it('validates space-certified tools and completes the 4-step solar repair with suit integrity & oxygen remaining', () => {
    render(<SpacewalkActivity />);

    expect(
      screen.getByRole('heading', { name: /Spacewalk Solar Array Repair Mission/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Suit Integrity: 100%/i)).toBeInTheDocument();

    // Try packing an unsafe tool first
    fireEvent.click(screen.getByRole('button', { name: /Dual Safety Tether/i }));
    fireEvent.click(screen.getByRole('button', { name: /EVA Pistol-Grip Driver/i }));
    fireEvent.click(screen.getByRole('button', { name: /Heavy Steel Hammer/i }));
    fireEvent.click(
      screen.getByRole('button', { name: /Verify Kit & Exit Airlock/i }),
    );

    expect(screen.getByText(/Unsafe for EVA/i)).toBeInTheDocument();
    expect(screen.getByText(/Suit Oxygen: 94%/i)).toBeInTheDocument();

    // Swap Heavy Steel Hammer for Insulated Torque Wrench
    fireEvent.click(screen.getByRole('button', { name: /Heavy Steel Hammer/i }));
    fireEvent.click(screen.getByRole('button', { name: /Insulated Torque Wrench/i }));
    fireEvent.click(
      screen.getByRole('button', { name: /Verify Kit & Exit Airlock/i }),
    );

    // Complete all 4 repair steps cleanly
    fireEvent.click(
      screen.getByRole('button', { name: /Clip Dual Safety Tether Hooks/i }),
    );
    expect(screen.getByText(/Tether: Dual-Hook Locked/i)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Use EVA Pistol-Grip Driver/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Tighten with Insulated Torque Wrench/i }),
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: /Confirm Telemetry, Enter Airlock, Then Unclip/i,
      }),
    );

    expect(
      screen.getByText(/Solar Array Repaired! Spacewalk Complete/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/37% O₂/i)).toBeInTheDocument();
  });

  it('completes Mission 2 EVA Cooling & Micrometeoroid Anomaly scenario cleanly', () => {
    render(<SpacewalkActivity />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /Mission 2: EVA Cooling & Micrometeoroid Anomaly/i,
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: /Dual Safety Tether/i }));
    fireEvent.click(screen.getByRole('button', { name: /EVA Pistol-Grip Driver/i }));
    fireEvent.click(screen.getByRole('button', { name: /Insulated Torque Wrench/i }));
    fireEvent.click(
      screen.getByRole('button', { name: /Verify Kit & Exit Airlock/i }),
    );

    fireEvent.click(
      screen.getByRole('button', { name: /open backup cooling loop/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /check helmet gauge stability/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Engage second waist tether hook/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Inspect tool lanyard inventory/i }),
    );

    expect(
      screen.getByText(/EVA Emergency Managed! Spacewalk Complete/i),
    ).toBeInTheDocument();
  });

  it('triggers oxygen depleted retry state after repeated wrong tool actions and resets cleanly', () => {
    render(<SpacewalkActivity />);

    fireEvent.click(screen.getByRole('button', { name: /Dual Safety Tether/i }));
    fireEvent.click(screen.getByRole('button', { name: /EVA Pistol-Grip Driver/i }));
    fireEvent.click(screen.getByRole('button', { name: /Insulated Torque Wrench/i }));
    fireEvent.click(
      screen.getByRole('button', { name: /Verify Kit & Exit Airlock/i }),
    );

    // Repeatedly pick wrong action (-18% O2 each) until depleted
    for (let i = 0; i < 6; i += 1) {
      const wrongBtn = screen.queryByRole('button', {
        name: /Hook Wrench Around Handrail/i,
      });
      if (wrongBtn) {
        fireEvent.click(wrongBtn);
      }
    }

    expect(
      screen.getByText(/Oxygen Depleted — Airlock Recall/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Retry Spacewalk/i }));
    expect(screen.getByText(/Suit Oxygen: 100%/i)).toBeInTheDocument();
  });
});
