import { MotionConfig } from 'framer-motion';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../../App';
import { TrainingProvider } from '../../context/TrainingContext';
import type { CadetProfile } from '../../types/cadetProfile';
import {
  clearCadetProfile,
  saveCadetProfile,
} from '../../utils/cadetProfileStorage';
import { clearTrainingState } from '../../utils/storage';

async function renderDashboard(cadet: CadetProfile) {
  saveCadetProfile(cadet);
  render(
    <MotionConfig reducedMotion="always">
      <TrainingProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <AppRoutes />
        </MemoryRouter>
      </TrainingProvider>
    </MotionConfig>,
  );
  await screen.findByText('Completed Missions', undefined, { timeout: 5000 });
}

const LONG_SPEC_CADET: CadetProfile = {
  version: 1,
  cadetId: 'ANT-SP7-904',
  firstName: 'Aarav',
  callsign: 'STARWING-07',
  specialization: 'space-station-specialist',
  avatarId: 'orbit-helmet',
  ageGroup: '10–13',
  favoriteDestination: 'International Space Station',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Dashboard responsive & non-truncation layout safeguards', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearCadetProfile();
    clearTrainingState();
  });

  it('renders full specialization and rank without single-line truncation classes in Sidebar Cadet Dossier and Mobile Drawer', async () => {
    await renderDashboard(LONG_SPEC_CADET);

    const aside = document.querySelector('aside');
    expect(aside).not.toBeNull();
    if (!aside) return;

    const sidebarSpec = within(aside).getByText('SPACE STATION SPECIALIST');
    const sidebarRank = within(aside).getByText('Orbital Apprentice');

    expect(sidebarSpec).not.toHaveClass('truncate');
    expect(sidebarRank).not.toHaveClass('truncate');
    expect(sidebarSpec.className).toContain('break-words');
    expect(sidebarRank.className).toContain('break-words');

    // Open mobile drawer and verify full specialization & callsign remain non-truncated
    fireEvent.click(
      screen.getByRole('button', { name: /Open navigation menu/i }),
    );
    const mobileNav = screen.getByRole('navigation', {
      name: /Mobile navigation/i,
    });
    const drawerSpec = within(mobileNav).getByText('SPACE STATION SPECIALIST');
    const drawerCallsign = within(mobileNav).getByText('STARWING-07');

    expect(drawerSpec).not.toHaveClass('truncate');
    expect(drawerCallsign).not.toHaveClass('truncate');
    expect(drawerSpec.className).toContain('break-words');
  });

  it('uses adaptive grid/flex wrapping so statistics cards and Mission Patch Rack fit inside parent cards without shrink-0 overflow', async () => {
    await renderDashboard(LONG_SPEC_CADET);

    const main = screen.getByRole('main');
    const completedLabel = within(main).getByText('Completed Missions');
    const missionLogLabel = within(main).getByText('Mission Log');

    const statsGrid = completedLabel.closest('.grid');
    expect(statsGrid).not.toBeNull();
    expect(statsGrid?.className).toContain('grid-cols-1');
    expect(statsGrid?.className).not.toContain('sm:shrink-0');
    expect(missionLogLabel.closest('div')).toHaveClass('min-w-0');

    // Verify primary profile card itself uses min-w-0 on the xl:col-span-7 track
    const profileCard = statsGrid?.closest('[class*="xl:col-span-7"]');
    expect(profileCard).not.toBeNull();
    expect(profileCard?.className).toContain('min-w-0');

    // Verify Mission Patch Rack buttons allow multiline wrapping rather than hard truncating
    const microgravityPatch = within(main).getByText('Microgravity Scientist');
    expect(microgravityPatch).not.toHaveClass('truncate');
    expect(microgravityPatch.className).toContain('whitespace-normal');
  });

  it('aligns top navigation breakpoint with sidebar breakpoint (lg:) so tablet 768px does not double-render horizontal nav and hamburger toggle', async () => {
    await renderDashboard(LONG_SPEC_CADET);

    const primaryNav = screen.getByRole('navigation', { name: 'Primary' });
    const menuToggle = screen.getByRole('button', {
      name: /Open navigation menu/i,
    });

    expect(primaryNav.className).toContain('lg:flex');
    expect(primaryNav.className).not.toContain('md:flex');
    expect(menuToggle.className).toContain('lg:hidden');

    // Ensure Module Card headers support wrapping across narrow 2-col tablet widths
    const academyHeading = within(screen.getByRole('main')).getByRole(
      'heading',
      { name: 'Astronaut Academy' },
    );
    const cardHeader = academyHeading.closest('.flex-wrap');
    expect(cardHeader).not.toBeNull();
  });
});
