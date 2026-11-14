import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TrainingProvider } from '../../context/TrainingContext';
import { STORAGE_KEY, clearTrainingState } from '../../utils/storage';
import { AcademyActivity } from './AcademyActivity';
import { AcademyPage } from './AcademyPage';
import { ACADEMY_LESSONS, ACADEMY_QUIZ_QUESTIONS } from './academyLessonsData';

function answerAllQuizQuestionsCorrectly() {
  for (let i = 0; i < ACADEMY_QUIZ_QUESTIONS.length; i++) {
    const q = ACADEMY_QUIZ_QUESTIONS[i];
    const correctOption = q.options.find((o) => o.id === q.correctOptionId)!;
    fireEvent.click(screen.getByRole('button', { name: correctOption.label }));
    const nextLabel =
      i < ACADEMY_QUIZ_QUESTIONS.length - 1
        ? /Next Question/i
        : /See Final Quiz Score/i;
    fireEvent.click(screen.getByRole('button', { name: nextLabel }));
  }
}

describe('AcademyActivity 10-topic interactive curriculum and quiz', () => {
  beforeEach(() => {
    clearTrainingState();
  });

  it('includes all 10 structured curriculum topics with objectives, diagrams, NASA examples, and quick checks', () => {
    render(<AcademyActivity />);

    expect(ACADEMY_LESSONS).toHaveLength(10);
    expect(ACADEMY_QUIZ_QUESTIONS).toHaveLength(10);

    expect(
      screen.getByRole('heading', { name: /ANANTRA Cadet Learning Center/i }),
    ).toBeInTheDocument();

    // Verify all 10 curriculum tabs exist
    for (const lesson of ACADEMY_LESSONS) {
      expect(
        screen.getByRole('tab', { name: new RegExp(lesson.title, 'i') }),
      ).toBeInTheDocument();
    }

    // Topic 1: Spaceflight Fundamentals explorer, diagram, NASA example, and quick check
    expect(
      screen.getByRole('img', { name: /inner rocky planets/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/NASA Voyager/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /The Moon/i }));
    expect(screen.getByText(/1\.62 m\/s² \(~1\/6 Earth\)/i)).toBeInTheDocument();

    // Wrong quick-check answer gives hint without unlocking
    fireEvent.click(
      screen.getByRole('button', {
        name: /Because half of an astronaut’s atoms evaporate/i,
      }),
    );
    expect(screen.getByText(/Try Another Option!/i)).toBeInTheDocument();

    // Correct quick-check answer marks lesson studied
    fireEvent.click(
      screen.getByRole('button', {
        name: /Because lunar surface gravity \(1\.62 m\/s²\) pulls about 1\/6/i,
      }),
    );
    expect(screen.getByText(/Concept Unlocked!/i)).toBeInTheDocument();
    expect(screen.getByText(/1 of 10 topics checked/i)).toBeInTheDocument();

    // Jump through Rocket Science, Orbital Mechanics, Radiation, and Mission Control Ops
    fireEvent.click(
      screen.getByRole('button', { name: /Next: Rocket Science/i }),
    );
    expect(
      screen.getByRole('heading', {
        name: /Newton’s Third Law, Specific Impulse & Multi-Stage Rockets/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('tab', { name: /Radiation & Space Hazards/i }),
    );
    expect(
      screen.getByRole('heading', {
        name: /Solar Storms, Cosmic Rays, Orbital Debris & Water Shielding/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('tab', { name: /Mission Control Operations/i }),
    );
    expect(
      screen.getByRole('heading', {
        name: /Flight Director Consoles, Go\/No-Go Polls & Calm Priority Triage/i,
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Mark Lesson Studied/i }));
    expect(screen.getByText(/2 of 10 topics checked/i)).toBeInTheDocument();
  });

  it('scores the 10-question quiz, explains misconceptions, shows amber state on fail, and triggers certification on pass', () => {
    const onCertify = vi.fn();
    render(<AcademyActivity onCertifyAcademy={onCertify} />);

    fireEvent.click(
      screen.getByRole('tab', { name: /Space Science Mastery Quiz/i }),
    );
    expect(
      screen.getByRole('heading', { name: /Space Science Mastery Quiz/i }),
    ).toBeInTheDocument();

    // Complete entire quiz with all wrong options -> verify amber non-passing banner (no certification CTA yet)
    for (let i = 0; i < ACADEMY_QUIZ_QUESTIONS.length; i++) {
      const q = ACADEMY_QUIZ_QUESTIONS[i];
      const wrongOpt = q.options.find((o) => o.id !== q.correctOptionId)!;
      fireEvent.click(screen.getByRole('button', { name: wrongOpt.label }));
      const nextLabel =
        i < ACADEMY_QUIZ_QUESTIONS.length - 1
          ? /Next Question/i
          : /See Final Quiz Score/i;
      fireEvent.click(screen.getByRole('button', { name: nextLabel }));
    }

    expect(
      screen.getByRole('heading', { name: /Review & Retry!/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Save Academy Certification/i }),
    ).not.toBeInTheDocument();

    // Retake cleanly and answer all 10 correctly
    fireEvent.click(screen.getByRole('button', { name: /Retake Quiz/i }));
    answerAllQuizQuestionsCorrectly();

    expect(
      screen.getByRole('heading', {
        name: /Orbital Scholar Perfect Score — 10 \/ 10!/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Save Academy Certification/i }),
    );
    expect(onCertify).toHaveBeenCalledTimes(1);
  });

  it('persists Academy best quiz score, module record, and certification to localStorage via AcademyPage', () => {
    render(
      <TrainingProvider>
        <MemoryRouter initialEntries={['/academy']}>
          <AcademyPage />
        </MemoryRouter>
      </TrainingProvider>,
    );

    expect(
      screen.queryByText(/Team Feature Workspace Ready/i),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('tab', { name: /Space Science Mastery Quiz/i }),
    );
    answerAllQuizQuestionsCorrectly();

    expect(
      screen.getByRole('progressbar', { name: 'Module Readiness' }),
    ).toHaveAttribute('aria-valuenow', '100');

    const stored = window.localStorage.getItem(STORAGE_KEY) ?? '';
    expect(stored).toContain('academy-3');
    expect(stored).toContain('"academyBestQuizScore":10');
  });
});
