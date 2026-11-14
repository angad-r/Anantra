import { MotionConfig } from 'framer-motion';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../App';
import { TrainingProvider } from '../context/TrainingContext';
import { createBlankTrainingState } from '../data/traineeSeed';
import type { CadetProfile } from '../types/cadetProfile';
import {
  clearCadetProfile,
  saveCadetProfile,
} from '../utils/cadetProfileStorage';
import {
  STORAGE_KEY,
  clearTrainingState,
  saveTrainingState,
} from '../utils/storage';

function renderAtRoute(initialRoute: string) {
  return render(
    <MotionConfig reducedMotion="always">
      <TrainingProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <AppRoutes />
        </MemoryRouter>
      </TrainingProvider>
    </MotionConfig>,
  );
}

function seedOnboardedCadet(): CadetProfile {
  const now = new Date().toISOString();
  const profile: CadetProfile = {
    version: 1,
    cadetId: 'ANT-TST-001',
    firstName: 'Sam',
    callsign: 'VEGA-04',
    specialization: 'lunar-explorer',
    avatarId: 'orbit-helmet',
    ageGroup: '10–13',
    favoriteDestination: 'Moon',
    createdAt: now,
    updatedAt: now,
  };
  saveCadetProfile(profile);
  return profile;
}

describe('ANANTRA application flows', () => {
  beforeEach(() => {
    clearTrainingState();
    clearCadetProfile();
  });

  it('shows first-time onboarding screen when no cadet profile exists', () => {
    renderAtRoute('/');

    expect(
      screen.getByRole('heading', {
        name: /YOUR JOURNEY TO THE STARS BEGINS HERE\./i,
      }),
    ).toBeInTheDocument();
  });

  it('renders the landing page with onboarded cadet data and all 6 module routes', async () => {
    seedOnboardedCadet();
    renderAtRoute('/');

    expect(
      await screen.findByRole(
        'heading',
        { name: /Train Like a Junior Astronaut/i },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Cadet Sam/i)).toBeInTheDocument();
    expect(screen.getAllByText('VEGA-04').length).toBeGreaterThanOrEqual(1);

    expect(
      screen.getByRole('heading', { name: 'Astronaut Academy' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Mission Control' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Zero Gravity Lab' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Spacewalk Training' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Emergency Training' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'AI Astronaut Mentor' }),
    ).toBeInTheDocument();
  });

  it('shows empty state on Dashboard when filtering Completed with none finished and recovers on reset', async () => {
    seedOnboardedCadet();
    renderAtRoute('/dashboard');

    const completedFilter = await screen.findByRole(
      'button',
      {
        name: /Completed \(0\)/i,
      },
      { timeout: 5000 },
    );
    fireEvent.click(completedFilter);

    expect(
      screen.getByText('No Training Modules Match This Filter'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Show All Modules' }));
    expect(
      screen.getByRole('heading', { name: 'Astronaut Academy' }),
    ).toBeInTheDocument();
  });

  it('persists checklist task completion in a training module', async () => {
    seedOnboardedCadet();
    renderAtRoute('/academy');

    const remainingTask = await screen.findByRole(
      'button',
      {
        name: /Inspect Crew Cabin Essentials/i,
      },
      { timeout: 5000 },
    );
    expect(remainingTask).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(remainingTask);
    expect(remainingTask).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('progressbar', { name: 'Module Readiness' }),
    ).toHaveAttribute('aria-valuenow', '100');

    const savedRaw = window.localStorage.getItem(STORAGE_KEY);
    expect(savedRaw).toContain('academy-3');
  });

  it('recovers gracefully when localStorage telemetry is corrupted', async () => {
    seedOnboardedCadet();
    window.localStorage.setItem(STORAGE_KEY, '{broken-json');
    renderAtRoute('/dashboard');

    const alert = await screen.findByRole('alert', undefined, { timeout: 5000 });
    expect(
      within(alert).getByText(/Telemetry Link Interrupted/i),
    ).toBeInTheDocument();

    fireEvent.click(
      within(alert).getByRole('button', { name: /Restore Sample Telemetry/i }),
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a helpful 404 screen for unknown routes and supports mobile navigation toggle', async () => {
    seedOnboardedCadet();
    renderAtRoute('/unknown-sector');

    expect(
      await screen.findByRole(
        'heading',
        { name: /Orbital Coordinates Not Found/i },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();

    const menuButton = screen.getByRole('button', {
      name: /Open navigation menu/i,
    });
    fireEvent.click(menuButton);
    expect(
      screen.getByRole('navigation', { name: /Mobile navigation/i }),
    ).toBeInTheDocument();
  });

  it('renders every training module route, NASA references route, and cadet profile route cleanly', async () => {
    seedOnboardedCadet();
    const routes = [
      ['/academy', 'Astronaut Academy'],
      ['/mission-control', 'Mission Control'],
      ['/zero-gravity-lab', 'Zero Gravity Lab'],
      ['/spacewalk-training', 'Spacewalk Training'],
      ['/emergency-training', 'Emergency Training'],
      ['/ai-mentor', 'AI Astronaut Mentor'],
      ['/certificates', 'ANANTRA Certificates Vault'],
      ['/references', 'Science, Models & NASA References'],
      ['/profile', 'Cadet Profile'],
    ] as const;

    for (const [route, expectedHeading] of routes) {
      const { unmount } = renderAtRoute(route);
      expect(
        await screen.findByRole(
          'heading',
          { name: expectedHeading },
          { timeout: 5000 },
        ),
      ).toBeInTheDocument();
      unmount();
    }
  }, 15000);

  it('allows resetting all progress to 0% and restoring sample data on Dashboard', async () => {
    seedOnboardedCadet();
    renderAtRoute('/dashboard');

    fireEvent.click(
      await screen.findByRole(
        'button',
        { name: /Start Fresh \(0%\)/i },
        { timeout: 5000 },
      ),
    );
    expect(
      screen.getByRole('progressbar', { name: 'Curriculum Completion' }),
    ).toHaveAttribute('aria-valuenow', '0');

    fireEvent.click(screen.getByRole('button', { name: /Load Sample Data/i }));
    const progressValue = Number(
      screen
        .getByRole('progressbar', { name: 'Curriculum Completion' })
        .getAttribute('aria-valuenow'),
    );
    expect(progressValue).toBeGreaterThan(0);
  });

  it('enforces guided prerequisite lock gate when guidedProgression is enabled and unlocks on Free Explore', async () => {
    seedOnboardedCadet();
    const blank = createBlankTrainingState();
    blank.guidedProgression = true;
    saveTrainingState(blank);

    renderAtRoute('/spacewalk-training');

    expect(
      await screen.findByRole(
        'heading',
        { name: /Spacewalk Training Is Currently Locked/i },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Complete Zero Gravity Lab to unlock EVA Spacewalk Training/i),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Unlock Free Explore Mode/i }),
    );
    expect(
      await screen.findByRole(
        'heading',
        { name: /Spacewalk Solar Array Repair Mission/i },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
  });

  it('displays offline status banner when browser goes offline', async () => {
    seedOnboardedCadet();
    renderAtRoute('/dashboard');
    await screen.findByRole(
      'heading',
      { name: 'Training Modules' },
      { timeout: 5000 },
    );

    fireEvent(window, new Event('offline'));
    expect(
      screen.getByText(/Offline Telemetry Mode:/i),
    ).toBeInTheDocument();

    fireEvent(window, new Event('online'));
    expect(
      screen.queryByText(/Offline Telemetry Mode:/i),
    ).not.toBeInTheDocument();
  });
});
