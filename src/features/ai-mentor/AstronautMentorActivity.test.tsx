import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TrainingProvider } from '../../context/TrainingContext';
import { createBlankTrainingState } from '../../data/traineeSeed';
import { clearTrainingState, saveTrainingState } from '../../utils/storage';
import { AstronautMentorActivity } from './AstronautMentorActivity';
import {
  buildMissionDebriefReply,
  buildMissionHintReply,
  matchMentorQuery,
  type MentorProgressSnapshot,
} from './mentorKnowledgeBase';

const SAMPLE_SNAPSHOT: MentorProgressSnapshot = {
  traineeName: 'Maya Vance',
  cadetTitle: 'Cadet Explorer',
  completedModules: 0,
  totalModules: 6,
  percentage: 17,
  totalEarnedXp: 190,
  nextIncompleteModule: {
    id: 'academy',
    title: 'Astronaut Academy',
    route: '/academy',
    nextTaskTitle: 'Inspect Crew Cabin Essentials',
  },
};

function renderMentor(initialEntry = '/ai-mentor') {
  return render(
    <TrainingProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <AstronautMentorActivity />
      </MemoryRouter>
    </TrainingProvider>,
  );
}

describe('mentorKnowledgeBase deterministic Q&A matcher', () => {
  it('matches space science topics deterministically and explains physics', () => {
    const reply = matchMentorQuery(
      'How do I control thrust and land safely on the Moon?',
      SAMPLE_SNAPSHOT,
    );

    expect(reply.topicLabel).toMatch(/Moon Landing/i);
    expect(reply.text).toMatch(/1\.62 m\/s²/i);
    expect(reply.text).toMatch(/75% Brake/i);
    expect(reply.actionRoute).toBe('/mission-control');
    expect(reply.matchedKeywords?.length).toBeGreaterThan(0);
  });

  it('builds dynamic mission hints from trainee readiness snapshot', () => {
    const hint = buildMissionHintReply(SAMPLE_SNAPSHOT);
    expect(hint.category).toBe('hint');
    expect(hint.text).toContain('Maya Vance');
    expect(hint.text).toContain('Astronaut Academy');
    expect(hint.actionRoute).toBe('/academy');
  });

  it('supports multi-turn follow-up depth and mission telemetry debriefing', () => {
    const initial = matchMentorQuery('Why do astronauts float on the ISS?', SAMPLE_SNAPSHOT);
    const followUp = matchMentorQuery('tell me more', SAMPLE_SNAPSHOT, {
      lastEntryId: initial.entryId,
    });
    expect(followUp.topicLabel).toMatch(/Deeper Dive/i);
    expect(followUp.text).toMatch(/92 minutes/i);

    const state = createBlankTrainingState();
    state.moduleRecords = {
      ...(state.moduleRecords ?? {}),
      'mission-control': {
        attempts: 2,
        passedCount: 0,
        bestScore: 52,
        maxScore: 100,
        lastScore: 52,
        lastOutcome: 'retry',
        lastFailureReason: 'Touchdown vertical speed 6.1 m/s exceeded 3.5 m/s limit',
      },
    };
    const debrief = buildMissionDebriefReply('mission-control', state, SAMPLE_SNAPSHOT);
    expect(debrief.category).toBe('debrief');
    expect(debrief.text).toContain('6.1 m/s');
  });

  it('returns an honest deterministic offline fallback for unknown queries', () => {
    const reply = matchMentorQuery('What is your favorite dinosaur pizza?', SAMPLE_SNAPSHOT);
    expect(reply.category).toBe('fallback');
    expect(reply.text).toMatch(/deterministic local Q&A prototype/i);
  });
});

describe('AstronautMentorActivity interactive Q&A and knowledge quiz', () => {
  beforeEach(() => {
    clearTrainingState();
    vi.restoreAllMocks();
  });

  it('shows the honest offline prototype disclosure and answers typed questions, readiness hints, progressive hints, and reset', () => {
    renderMentor();

    const disclosure = screen.getByRole('note');
    expect(disclosure).toHaveTextContent(/offline educational mentor prototype/i);
    expect(disclosure).toHaveTextContent(/not a live AI model/i);

    const input = screen.getByLabelText(
      /Ask ARIA About Space Science or Any Training Mission/i,
    );
    fireEvent.change(input, {
      target: { value: 'Why do astronauts float on the ISS?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Ask ARIA/i }));

    expect(
      screen.getByText(/continuous free fall around Earth/i),
    ).toBeInTheDocument();

    // Multi-turn Tell Me More follow-up
    fireEvent.click(screen.getByRole('button', { name: /Tell Me More/i }));
    expect(screen.getByText(/92 minutes/i)).toBeInTheDocument();

    // Progressive Hints Step 1 -> Step 2 without skipping straight to spoiler checklist
    fireEvent.click(screen.getByRole('button', { name: /Hint Step 1\/3/i }));
    expect(screen.getByText(/Progressive Hint \(1\/3\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hint Step 2\/3/i })).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Get My Readiness Hint/i }),
    );
    expect(
      screen.getByText(/Next Mission Hint: Astronaut Academy/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Chat/i }));
    expect(
      screen.queryByText(/continuous free fall around Earth/i),
    ).not.toBeInTheDocument();
  });

  it('auto-debriefs failed simulator runs via ?debrief query param and gracefully falls back if Cloud AI returns 503', async () => {
    const state = createBlankTrainingState();
    state.moduleRecords = {
      ...(state.moduleRecords ?? {}),
      'mission-control': {
        attempts: 1,
        passedCount: 0,
        bestScore: 44,
        maxScore: 100,
        lastScore: 44,
        lastOutcome: 'retry',
        lastFailureReason: 'Landed off the landing pad in Sector Alpha',
      },
    };
    saveTrainingState(state);

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ configured: false, error: 'Key missing' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    renderMentor('/ai-mentor?debrief=mission-control');

    expect(
      screen.getByText(/Landed off the landing pad in Sector Alpha/i),
    ).toBeInTheDocument();

    // Enable Try Cloud AI and verify graceful fallback when endpoint returns 503
    fireEvent.click(screen.getByRole('button', { name: /Try Cloud AI/i }));
    await screen.findByText(/No server AI key configured/i);

    const input = screen.getByLabelText(
      /Ask ARIA About Space Science or Any Training Mission/i,
    );
    fireEvent.change(input, {
      target: { value: 'Why is landing on Mars harder?' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Ask ARIA/i }));

    expect(
      await screen.findByText(/carbon dioxide air/i),
    ).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('explains wrong quiz answers specifically, tracks score across all 5 questions, and resets cleanly', () => {
    renderMentor();

    // Q1: Pick wrong option deliberately to check misconception feedback + deeper explanation action
    fireEvent.click(
      screen.getByRole('button', {
        name: /Earth’s gravity vanishes completely right above the clouds/i,
      }),
    );
    expect(
      screen.getByText(/Earth’s gravity at ISS altitude is still ~90% as strong/i),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: /Explain Deeper in Chat/i }),
    );
    expect(
      screen.getByText(/Can you explain "Orbital Free-Fall" from the quiz\?/i),
    ).toBeInTheDocument();

    // Advance Q2 - Q5 choosing correct options
    fireEvent.click(screen.getByRole('button', { name: /Next Question/i }));
    fireEvent.click(
      screen.getByRole('button', {
        name: /Moon has almost no air, so there is no air resistance/i,
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: /Next Question/i }));
    fireEvent.click(
      screen.getByRole('button', {
        name: /1 kg pouch accelerates much faster/i,
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: /Next Question/i }));
    fireEvent.click(
      screen.getByRole('button', {
        name: /Keep two safety tether points clipped/i,
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: /Next Question/i }));
    fireEvent.click(
      screen.getByRole('button', {
        name: /Move inside the water-wall shielded shelter zone/i,
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: /See Final Quiz Score/i }),
    );

    expect(
      screen.getByText(/Solid Spaceflight Score: 4 \/ 5!/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Retake Quiz/i }));
    expect(screen.getByText(/Score: 0 \/ 5/i)).toBeInTheDocument();
  });
});
