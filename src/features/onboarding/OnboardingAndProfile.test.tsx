import { MotionConfig } from 'framer-motion';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../../App';
import { TrainingProvider } from '../../context/TrainingContext';
import { createBlankTrainingState } from '../../data/traineeSeed';
import type { CadetProfile } from '../../types/cadetProfile';
import {
  CADET_PROFILE_STORAGE_KEY,
  clearCadetProfile,
  loadCadetProfile,
  saveCadetProfile,
} from '../../utils/cadetProfileStorage';
import {
  STORAGE_KEY,
  clearTrainingState,
  loadTrainingState,
  saveTrainingState,
} from '../../utils/storage';

function renderApp(initialRoute = '/') {
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

function createSampleSavedCadet(overrides?: Partial<CadetProfile>): CadetProfile {
  const now = new Date().toISOString();
  return {
    version: 1,
    cadetId: 'ANT-OR7-42K',
    firstName: 'Leo',
    callsign: 'ORION-7',
    specialization: 'mars-pioneer',
    avatarId: 'saturn-pilot',
    ageGroup: '10–13',
    favoriteDestination: 'Mars',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('Cadet Onboarding & Profile Management', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearCadetProfile();
    clearTrainingState();
  });

  it('1. shows cinematic first-time onboarding screen for new users without a cadet profile', () => {
    renderApp('/');

    expect(
      screen.getByRole('heading', {
        name: 'YOUR JOURNEY TO THE STARS BEGINS HERE.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Every great astronaut starts somewhere. Your mission begins today.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /START YOUR TRAINING/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/ANANTRA/i).length).toBeGreaterThanOrEqual(1);

    // Direct navigation attempts while unregistered stay in onboarding
    const { unmount } = renderApp('/dashboard');
    expect(
      screen.getAllByRole('button', { name: /START YOUR TRAINING/i }).length,
    ).toBeGreaterThanOrEqual(1);
    unmount();
  });

  it('2. skips onboarding immediately for an existing saved cadet user', async () => {
    const existing = createSampleSavedCadet();
    saveCadetProfile(existing);

    renderApp('/');

    expect(
      await screen.findByRole(
        'heading',
        { name: /Train Like a Junior Astronaut/i },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {
        name: 'YOUR JOURNEY TO THE STARS BEGINS HERE.',
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Cadet Leo')).toBeInTheDocument();
    expect(screen.getAllByText('ORION-7').length).toBeGreaterThanOrEqual(1);
  });

  it('3. validates required First Name and Astronaut Callsign fields and avoids sensitive PII inputs', () => {
    renderApp('/');

    fireEvent.click(
      screen.getByRole('button', { name: /START YOUR TRAINING/i }),
    );

    // Ensure no email, phone, password, or address fields are ever presented
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/phone/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/address/i)).not.toBeInTheDocument();

    // Empty submission shows clear validation messages
    fireEvent.click(
      screen.getByRole('button', { name: /Continue to Preferences/i }),
    );
    expect(
      screen.getByText(/Please enter your first name to create your cadet badge/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Please choose an Astronaut Callsign/i),
    ).toBeInTheDocument();

    // Email or 1-char name shows child-friendly guidance
    const nameInput = screen.getByLabelText(/First Name/i);
    const callsignInput = screen.getByLabelText(/Astronaut Callsign/i);

    fireEvent.change(nameInput, { target: { value: 'leo@space.org' } });
    fireEvent.change(callsignInput, { target: { value: 'A' } });
    fireEvent.click(
      screen.getByRole('button', { name: /Continue to Preferences/i }),
    );

    expect(
      screen.getByText(/No email needed! Please enter only your first name/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Astronaut callsign must be at least 2 characters/i),
    ).toBeInTheDocument();

    // Valid values advance smoothly
    fireEvent.change(nameInput, { target: { value: 'Maya-Kate' } });
    fireEvent.change(callsignInput, { target: { value: 'ORION-7' } });
    fireEvent.click(
      screen.getByRole('button', { name: /Continue to Preferences/i }),
    );

    expect(
      screen.getByRole('heading', { name: /Customize Your Space Gear/i }),
    ).toBeInTheDocument();
  });

  it('4. allows skipping all optional fields (age group, avatar, favourite destination)', () => {
    renderApp('/');
    fireEvent.click(
      screen.getByRole('button', { name: /START YOUR TRAINING/i }),
    );
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: 'Zara' },
    });
    fireEvent.change(screen.getByLabelText(/Astronaut Callsign/i), {
      target: { value: 'COMET-9' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /Continue to Preferences/i }),
    );

    // Pick then skip optional fields to confirm skipping works cleanly
    fireEvent.click(
      screen.getByRole('button', { name: /Skip Optional Details/i }),
    );

    expect(
      screen.getByRole('heading', {
        name: /Choose Your Astronaut Specialization/i,
      }),
    ).toBeInTheDocument();

    // Select Cosmic Scientist & finish
    fireEvent.click(
      screen.getByRole('button', { name: /COSMIC SCIENTIST/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Complete Registration/i }),
    );

    expect(
      screen.getByRole('heading', { name: 'WELCOME ABOARD, CADET ZARA!' }),
    ).toBeInTheDocument();

    const loaded = loadCadetProfile();
    expect(loaded.ok).toBe(true);
    if (loaded.ok) {
      expect(loaded.profile?.firstName).toBe('Zara');
      expect(loaded.profile?.callsign).toBe('COMET-9');
      expect(loaded.profile?.ageGroup).toBeUndefined();
      expect(loaded.profile?.avatarId).toBeUndefined();
      expect(loaded.profile?.favoriteDestination).toBeUndefined();
    }
  });

  it('5. presents all 4 interactive specialization cards and validates missing choice', () => {
    renderApp('/');
    fireEvent.click(
      screen.getByRole('button', { name: /START YOUR TRAINING/i }),
    );
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: 'Noah' },
    });
    fireEvent.change(screen.getByLabelText(/Astronaut Callsign/i), {
      target: { value: 'STAR-3' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /Continue to Preferences/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Skip Optional Details/i }),
    );

    // Submitting without choosing shows validation error
    fireEvent.click(
      screen.getByRole('button', { name: /Complete Registration/i }),
    );
    expect(
      screen.getByText(/Please select one of the four astronaut specializations/i),
    ).toBeInTheDocument();

    const lunarCard = screen.getByRole('button', { name: /LUNAR EXPLORER/i });
    const marsCard = screen.getByRole('button', { name: /MARS PIONEER/i });
    const stationCard = screen.getByRole('button', {
      name: /SPACE STATION SPECIALIST/i,
    });
    const cosmicCard = screen.getByRole('button', { name: /COSMIC SCIENTIST/i });

    expect(lunarCard).toHaveTextContent(
      'Specialize in lunar missions, Moon exploration, and landing challenges.',
    );
    expect(marsCard).toHaveTextContent(
      'Specialize in Mars exploration, planetary science, and rover missions.',
    );
    expect(stationCard).toHaveTextContent(
      'Specialize in spacecraft systems, orbital operations, and spacewalks.',
    );
    expect(cosmicCard).toHaveTextContent(
      'Specialize in astronomy, space science, and scientific experiments.',
    );

    fireEvent.click(lunarCard);
    expect(lunarCard).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(stationCard);
    expect(lunarCard).toHaveAttribute('aria-pressed', 'false');
    expect(stationCard).toHaveAttribute('aria-pressed', 'true');
  });

  it('6. saves profile with unique generated Cadet ID, shows confirmation screen, and enters Mission Control', async () => {
    renderApp('/');
    fireEvent.click(
      screen.getByRole('button', { name: /START YOUR TRAINING/i }),
    );
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: 'Leo' },
    });
    fireEvent.change(screen.getByLabelText(/Astronaut Callsign/i), {
      target: { value: 'orion-7' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /Continue to Preferences/i }),
    );

    // Choose optional preferences
    fireEvent.click(screen.getByRole('button', { name: '10–13' }));
    fireEvent.click(screen.getByRole('button', { name: /Lunar Rover/i }));
    fireEvent.click(
      screen.getByRole('button', { name: /International Space Station/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Continue to Specialization/i }),
    );

    fireEvent.click(
      screen.getByRole('button', { name: /MARS PIONEER/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Complete Registration/i }),
    );

    expect(
      screen.getByRole('heading', { name: 'WELCOME ABOARD, CADET LEO!' }),
    ).toBeInTheDocument();
    expect(screen.getByText('ORION-7')).toBeInTheDocument();
    expect(screen.getByText('MARS PIONEER')).toBeInTheDocument();
    expect(screen.getByText('Lunar Rover')).toBeInTheDocument();
    expect(screen.getByText(/^ANT-[A-Z0-9]{3}-[A-Z0-9]{3}$/)).toBeInTheDocument();

    // Enter Mission Control routes to Dashboard
    fireEvent.click(
      screen.getByRole('button', { name: /ENTER MISSION CONTROL/i }),
    );

    expect(
      await screen.findByRole(
        'heading',
        {
          name: 'GOOD TO SEE YOU AGAIN, CADET LEO.',
        },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
  });

  it('7. persists registered cadet profile across full remount / simulated browser refresh', async () => {
    const saved = createSampleSavedCadet({
      firstName: 'Priya',
      callsign: 'PHOENIX-5',
      specialization: 'space-station-specialist',
    });
    saveCadetProfile(saved);

    const { unmount } = renderApp('/dashboard');
    expect(
      await screen.findByRole(
        'heading',
        {
          name: 'GOOD TO SEE YOU AGAIN, CADET PRIYA.',
        },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    unmount();

    // Simulate reload by re-rendering app fresh from localStorage
    renderApp('/dashboard');
    expect(
      await screen.findByRole(
        'heading',
        {
          name: 'GOOD TO SEE YOU AGAIN, CADET PRIYA.',
        },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('CALLSIGN: PHOENIX-5')).toBeInTheDocument();
    expect(
      screen.getAllByText('SPACE STATION SPECIALIST').length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('8. displays customized Dashboard identity, avatar, specialization, progress, completed missions, and achievements', async () => {
    const profile = createSampleSavedCadet();
    saveCadetProfile(profile);

    // Seed training state with 1 genuinely completed & quiz-verified mission ('academy')
    const progress = createBlankTrainingState();
    progress.progressByModule.academy.completedTaskIds = [
      'academy-1',
      'academy-2',
      'academy-3',
    ];
    progress.academyBestQuizScore = 9;
    progress.moduleRecords = {
      academy: {
        attempts: 1,
        passedCount: 1,
        bestScore: 9,
        maxScore: 10,
        lastScore: 9,
        lastOutcome: 'success',
      },
    };
    saveTrainingState(progress);

    renderApp('/dashboard');

    expect(
      await screen.findByRole(
        'heading',
        {
          name: 'GOOD TO SEE YOU AGAIN, CADET LEO.',
        },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('CALLSIGN: ORION-7')).toBeInTheDocument();
    expect(screen.getAllByText('MARS PIONEER').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('img', { name: 'Saturn Pilot' }).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByRole('progressbar', { name: 'Curriculum Completion' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Completed Missions')).toBeInTheDocument();
    expect(screen.getByText('Earned Certifications')).toBeInTheDocument();
    expect(screen.getByText('1/6 Earned')).toBeInTheDocument();
  });

  it('9. allows editing cadet profile on /profile including multiple consecutive updates', async () => {
    saveCadetProfile(createSampleSavedCadet());
    renderApp('/profile');

    const nameField = await screen.findByLabelText(/First Name/i, undefined, {
      timeout: 5000,
    });
    const callsignField = screen.getByLabelText(/Astronaut Callsign/i);

    // First edit
    fireEvent.change(nameField, { target: { value: 'Elena' } });
    fireEvent.change(callsignField, { target: { value: 'comet-12' } });
    fireEvent.click(
      screen.getByRole('button', { name: /COSMIC SCIENTIST/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: /Orbit Helmet/i }));
    fireEvent.click(
      screen.getByRole('button', { name: /Save Profile Changes/i }),
    );

    expect(
      screen.getByText(/Cadet badge updated for CADET ELENA \(COMET-12\)/i),
    ).toBeInTheDocument();

    // Second consecutive edit
    fireEvent.change(nameField, { target: { value: 'Elena-Rose' } });
    fireEvent.click(
      screen.getByRole('button', { name: /Save Profile Changes/i }),
    );

    const persisted = loadCadetProfile();
    expect(persisted.ok).toBe(true);
    if (persisted.ok) {
      expect(persisted.profile?.firstName).toBe('Elena-Rose');
      expect(persisted.profile?.callsign).toBe('COMET-12');
      expect(persisted.profile?.specialization).toBe('cosmic-scientist');
      expect(persisted.profile?.avatarId).toBe('orbit-helmet');
    }
  });

  it('10. prompts confirmation dialog before resetting cadet profile and supports cancelling safely', async () => {
    saveCadetProfile(createSampleSavedCadet());
    renderApp('/profile');

    fireEvent.click(
      await screen.findByRole(
        'button',
        { name: /Reset Cadet Profile/i },
        { timeout: 5000 },
      ),
    );

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByText('Confirm Cadet Profile Reset'),
    ).toBeInTheDocument();

    // Cancel preserves profile
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(loadCadetProfile().ok).toBe(true);
    expect(
      window.localStorage.getItem(CADET_PROFILE_STORAGE_KEY),
    ).not.toBeNull();
  });

  it('11. resetting cadet profile preserves separate training progress, XP, and earned patches', async () => {
    saveCadetProfile(createSampleSavedCadet());
    const progress = createBlankTrainingState();
    progress.progressByModule.academy.completedTaskIds = [
      'academy-1',
      'academy-2',
      'academy-3',
    ];
    progress.academyBestQuizScore = 9;
    progress.moduleRecords = {
      academy: {
        attempts: 1,
        passedCount: 1,
        bestScore: 9,
        maxScore: 10,
        lastScore: 9,
        lastOutcome: 'success',
      },
    };
    saveTrainingState(progress);

    renderApp('/profile');

    fireEvent.click(
      await screen.findByRole(
        'button',
        { name: /Reset Cadet Profile/i },
        { timeout: 5000 },
      ),
    );
    const dialog = screen.getByRole('dialog');
    fireEvent.click(
      within(dialog).getByRole('button', { name: /Confirm Reset Profile/i }),
    );

    // Returned to onboarding welcome screen
    expect(
      screen.getByRole('heading', {
        name: 'YOUR JOURNEY TO THE STARS BEGINS HERE.',
      }),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem(CADET_PROFILE_STORAGE_KEY)).toBeNull();

    // Training progress in separate key remained completely intact!
    const storedProgress = loadTrainingState();
    expect(storedProgress.ok).toBe(true);
    if (storedProgress.ok) {
      expect(
        storedProgress.state?.progressByModule.academy.completedTaskIds,
      ).toEqual(['academy-1', 'academy-2', 'academy-3']);
    }

    // Re-registering a new cadet keeps that preserved training progress & badge!
    fireEvent.click(
      screen.getByRole('button', { name: /START YOUR TRAINING/i }),
    );
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: 'Nia' },
    });
    fireEvent.change(screen.getByLabelText(/Astronaut Callsign/i), {
      target: { value: 'LUNA-8' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /Continue to Preferences/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Skip Optional Details/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /LUNAR EXPLORER/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Complete Registration/i }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /ENTER MISSION CONTROL/i }),
    );

    expect(
      await screen.findByRole(
        'heading',
        {
          name: 'GOOD TO SEE YOU AGAIN, CADET NIA.',
        },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('1/6 Earned')).toBeInTheDocument();
  });

  it('13. supports toggling Guided Progression Mode and exporting non-sensitive telemetry on /profile', async () => {
    saveCadetProfile(createSampleSavedCadet());
    renderApp('/profile');

    const toggleBtn = await screen.findByRole(
      'button',
      {
        name: /Enable Guided Prerequisites/i,
      },
      { timeout: 5000 },
    );
    fireEvent.click(toggleBtn);

    expect(
      screen.getByRole('button', { name: /Switch to Open Exploration/i }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Export Telemetry JSON/i }),
    );
    expect(
      screen.getByText(/Exported non-sensitive cadet mission log/i),
    ).toBeInTheDocument();
  });

  it('12. handles corrupted cadet profile JSON & schema safely without losing training data', () => {
    const progress = createBlankTrainingState();
    progress.progressByModule['mission-control'].completedTaskIds = ['mc-1'];
    saveTrainingState(progress);

    // Case A: corrupted JSON syntax
    window.localStorage.setItem(CADET_PROFILE_STORAGE_KEY, '{corrupt-profile');
    const { unmount } = renderApp('/');

    expect(
      within(screen.getByRole('alert')).getByText(/Cadet Profile Recovery Needed/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'YOUR JOURNEY TO THE STARS BEGINS HERE.',
      }),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain('mc-1');
    unmount();

    // Case B: valid JSON but invalid schema fields
    window.localStorage.setItem(
      CADET_PROFILE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        cadetId: 'ANT-BAD',
        firstName: 'A',
        callsign: 'OK-1',
        specialization: 'invalid-spec',
      }),
    );
    renderApp('/dashboard');
    expect(
      within(screen.getByRole('alert')).getByText(/Cadet Profile Recovery Needed/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Dismiss Notice/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Ensure separate training progress still survived untouched
    const intactTraining = loadTrainingState();
    expect(intactTraining.ok).toBe(true);
    if (intactTraining.ok) {
      expect(
        intactTraining.state?.progressByModule['mission-control']
          .completedTaskIds,
      ).toEqual(['mc-1']);
    }
  });
});
