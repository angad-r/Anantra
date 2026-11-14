import {
  Activity,
  ArrowRight,
  Award,
  CheckCircle2,
  Circle,
  Compass,
  Flame,
  Globe2,
  HeartPulse,
  Orbit,
  Radio,
  Rocket,
  RotateCcw,
  Satellite,
  Shield,
  ShieldAlert,
  Sparkles,
  Target,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { BadgePill } from '../../components/ui/BadgePill';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AcademyDiagram } from './AcademyDiagrams';
import {
  ACADEMY_LESSONS,
  ACADEMY_QUIZ_QUESTIONS,
  type AcademyLessonId,
} from './academyLessonsData';

type AcademyTabId = AcademyLessonId | 'quiz';

const LESSON_ICONS: Record<AcademyTabId, LucideIcon> = {
  'spaceflight-fundamentals': Globe2,
  'rocket-science': Flame,
  'orbital-mechanics': Orbit,
  'moon-exploration': Compass,
  'mars-exploration': Rocket,
  spacesuits: Shield,
  'space-station-ops': Satellite,
  'human-physiology': HeartPulse,
  'radiation-hazards': ShieldAlert,
  'mission-control-ops': Radio,
  quiz: Award,
};

const QUIZ_PASS_THRESHOLD = 7;

export interface AcademyActivityProps {
  onCertifyAcademy?: () => void;
  isCertified?: boolean;
  initialStudiedIds?: string[];
  initialBestQuizScore?: number | null;
  onStudiedChange?: (studiedIds: string[]) => void;
  onQuizFinish?: (score: number, total: number, passed: boolean) => void;
}

function buildInitialExplorerMap(): Record<AcademyLessonId, string> {
  const map = {} as Record<AcademyLessonId, string>;
  for (const lesson of ACADEMY_LESSONS) {
    map[lesson.id] = lesson.explorerItems[0].id;
  }
  return map;
}

export function AcademyActivity({
  onCertifyAcademy,
  isCertified = false,
  initialStudiedIds = [],
  initialBestQuizScore = null,
  onStudiedChange,
  onQuizFinish,
}: AcademyActivityProps = {}) {
  const validLessonIds = new Set<string>(ACADEMY_LESSONS.map((l) => l.id));
  const [activeTab, setActiveTab] = useState<AcademyTabId>(
    ACADEMY_LESSONS[0].id,
  );
  const [completedLessonIds, setCompletedLessonIds] = useState<
    AcademyLessonId[]
  >(() =>
    initialStudiedIds.filter((id): id is AcademyLessonId =>
      validLessonIds.has(id),
    ),
  );
  const [selectedExplorerByLesson, setSelectedExplorerByLesson] = useState<
    Record<AcademyLessonId, string>
  >(buildInitialExplorerMap);
  const [quickCheckChoiceByLesson, setQuickCheckChoiceByLesson] = useState<
    Partial<Record<AcademyLessonId, string>>
  >({});

  // Space Science Mastery Quiz state
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedQuizOptionId, setSelectedQuizOptionId] = useState<
    string | null
  >(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnsweredCount, setQuizAnsweredCount] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [bestQuizScore, setBestQuizScore] = useState<number | null>(
    initialBestQuizScore,
  );

  // Keep synced if parent prop updates asynchronously (e.g., Load Sample Data)
  useEffect(() => {
    const filtered = initialStudiedIds.filter((id): id is AcademyLessonId =>
      validLessonIds.has(id),
    );
    setCompletedLessonIds(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStudiedIds.join(',')]);

  useEffect(() => {
    if (initialBestQuizScore !== null && initialBestQuizScore !== undefined) {
      setBestQuizScore((prev) =>
        prev === null
          ? initialBestQuizScore
          : Math.max(prev, initialBestQuizScore),
      );
    } else if (initialBestQuizScore === null && initialStudiedIds.length === 0) {
      setBestQuizScore(null);
    }
  }, [initialBestQuizScore, initialStudiedIds.length]);

  const activeLessonIndex = ACADEMY_LESSONS.findIndex(
    (l) => l.id === activeTab,
  );
  const activeLesson =
    activeLessonIndex >= 0 ? ACADEMY_LESSONS[activeLessonIndex] : null;

  const updateStudied = (nextList: AcademyLessonId[]) => {
    setCompletedLessonIds(nextList);
    onStudiedChange?.(nextList);
  };

  const markLessonStudied = (lessonId: AcademyLessonId) => {
    if (!completedLessonIds.includes(lessonId)) {
      updateStudied([...completedLessonIds, lessonId]);
    }
  };

  const toggleLessonStudied = (lessonId: AcademyLessonId) => {
    const next = completedLessonIds.includes(lessonId)
      ? completedLessonIds.filter((id) => id !== lessonId)
      : [...completedLessonIds, lessonId];
    updateStudied(next);
  };

  const handleSelectQuickCheck = (
    lessonId: AcademyLessonId,
    optionId: string,
    correctOptionId: string,
  ) => {
    setQuickCheckChoiceByLesson((prev) => ({ ...prev, [lessonId]: optionId }));
    if (optionId === correctOptionId) {
      markLessonStudied(lessonId);
    }
  };

  const handleSelectExplorer = (lessonId: AcademyLessonId, itemId: string) => {
    setSelectedExplorerByLesson((prev) => ({ ...prev, [lessonId]: itemId }));
  };

  const currentQuizQuestion = ACADEMY_QUIZ_QUESTIONS[quizIndex];
  const selectedQuizOption = selectedQuizOptionId
    ? currentQuizQuestion.options.find(
        (opt) => opt.id === selectedQuizOptionId,
      ) ?? null
    : null;
  const isQuizChoiceCorrect =
    selectedQuizOptionId !== null &&
    selectedQuizOptionId === currentQuizQuestion.correctOptionId;

  const handleSelectQuizOption = (optionId: string) => {
    if (selectedQuizOptionId !== null || quizFinished) return;
    setSelectedQuizOptionId(optionId);
    setQuizAnsweredCount((c) => c + 1);
    if (optionId === currentQuizQuestion.correctOptionId) {
      setQuizScore((s) => s + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex >= ACADEMY_QUIZ_QUESTIONS.length - 1) {
      setQuizFinished(true);
      const nextBest =
        bestQuizScore === null ? quizScore : Math.max(bestQuizScore, quizScore);
      setBestQuizScore(nextBest);
      onQuizFinish?.(
        quizScore,
        ACADEMY_QUIZ_QUESTIONS.length,
        quizScore >= QUIZ_PASS_THRESHOLD,
      );
      return;
    }
    setQuizIndex((i) => i + 1);
    setSelectedQuizOptionId(null);
  };

  const handleRetakeQuiz = () => {
    setQuizIndex(0);
    setSelectedQuizOptionId(null);
    setQuizScore(0);
    setQuizAnsweredCount(0);
    setQuizFinished(false);
  };

  const lessonsStudiedPct = Math.round(
    (completedLessonIds.length / ACADEMY_LESSONS.length) * 100,
  );
  const quizProgressPct = Math.round(
    (quizAnsweredCount / ACADEMY_QUIZ_QUESTIONS.length) * 100,
  );
  const quizPassed = quizFinished && quizScore >= QUIZ_PASS_THRESHOLD;

  return (
    <Card
      variant="elevated"
      topAccentClassName="from-sky-400/90 via-cyan-300/70 to-transparent"
      className="space-y-6"
    >
      {/* Header & Study Progress */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <BadgePill tone="cyan" dot>
              10-Topic NASA-Aligned Curriculum &amp; Quiz
            </BadgePill>
            {isCertified && (
              <BadgePill
                tone="emerald"
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              >
                Academy Deck Certified
              </BadgePill>
            )}
            {bestQuizScore !== null && (
              <BadgePill tone="amber" icon={<Award className="h-3.5 w-3.5" />}>
                Quiz Best: {bestQuizScore} / {ACADEMY_QUIZ_QUESTIONS.length}
              </BadgePill>
            )}
          </div>
          <h2 className="mt-2 font-display text-xl font-bold text-slate-50 sm:text-2xl">
            ANANTRA Cadet Learning Center
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Master all 10 astronaut training subjects—from Rocket Science and
            Orbital Mechanics to Radiation Hazards &amp; Mission Control—then
            prove your knowledge in the 10-question Mastery Quiz.
          </p>
        </div>

        <div className="rounded-xl border border-space-border bg-space-void/75 p-3.5 lg:w-64 lg:shrink-0">
          <ProgressBar
            label="Lessons Studied"
            value={lessonsStudiedPct}
            size="sm"
            fillClassName="bg-sky-400"
            helperText={`${completedLessonIds.length} of ${ACADEMY_LESSONS.length} topics checked`}
          />
        </div>
      </div>

      {/* Topic & Quiz Tab Selector (wraps cleanly across 10 modules + Quiz) */}
      <div
        role="tablist"
        aria-label="Astronaut Academy topics"
        className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {ACADEMY_LESSONS.map((lesson, idx) => {
          const Icon = LESSON_ICONS[lesson.id];
          const isSelected = activeTab === lesson.id;
          const isStudied = completedLessonIds.includes(lesson.id);

          return (
            <button
              key={lesson.id}
              id={`academy-tab-${lesson.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls="academy-tabpanel"
              onClick={() => setActiveTab(lesson.id)}
              className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'border-sky-400/75 bg-sky-400/18 text-sky-100 shadow-[0_0_20px_rgba(56,189,248,0.16)]'
                  : 'border-space-border bg-space-void/70 text-slate-300 hover:border-sky-400/40 hover:bg-space-slate'
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  isSelected ? 'text-sky-300' : 'text-slate-400'
                }`}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 whitespace-normal leading-snug">
                {idx + 1}. {lesson.title}
              </span>
              {isStudied && (
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-emerald-300"
                  aria-label="Lesson studied"
                />
              )}
            </button>
          );
        })}

        <button
          id="academy-tab-quiz"
          type="button"
          role="tab"
          aria-selected={activeTab === 'quiz'}
          aria-controls="academy-tabpanel"
          onClick={() => setActiveTab('quiz')}
          className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-all cursor-pointer sm:col-span-2 lg:col-span-2 ${
            activeTab === 'quiz'
              ? 'border-amber-400/75 bg-amber-400/18 text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.16)]'
              : 'border-amber-400/35 bg-space-void/70 text-amber-200 hover:border-amber-400/60 hover:bg-space-slate'
          }`}
        >
          <Award className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
          <span className="min-w-0 flex-1 whitespace-normal leading-snug">
            11. Space Science Mastery Quiz ({ACADEMY_QUIZ_QUESTIONS.length}{' '}
            Questions)
          </span>
        </button>
      </div>

      {/* Active Tab Panel */}
      <div
        id="academy-tabpanel"
        role="tabpanel"
        aria-labelledby={`academy-tab-${activeTab}`}
        className="space-y-6"
      >
        {activeLesson ? (
          <>
            {/* Lesson Header, Objectives, Conceptual Diagram & NASA Example */}
            <div className="rounded-2xl border border-space-border bg-space-void/75 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <BadgePill tone="cyan">{activeLesson.badge}</BadgePill>
                  <h3 className="mt-2 font-display text-lg font-bold text-slate-50 sm:text-xl">
                    {activeLesson.headline}
                  </h3>
                </div>

                <button
                  type="button"
                  aria-pressed={completedLessonIds.includes(activeLesson.id)}
                  onClick={() => toggleLessonStudied(activeLesson.id)}
                  className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    completedLessonIds.includes(activeLesson.id)
                      ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200'
                      : 'border-space-border bg-space-navy text-slate-300 hover:border-sky-400/45'
                  }`}
                >
                  {completedLessonIds.includes(activeLesson.id) ? (
                    <>
                      <CheckCircle2
                        className="h-4 w-4 text-emerald-300"
                        aria-hidden="true"
                      />
                      <span>Lesson Studied</span>
                    </>
                  ) : (
                    <>
                      <Circle
                        className="h-4 w-4 text-slate-400"
                        aria-hidden="true"
                      />
                      <span>Mark Lesson Studied</span>
                    </>
                  )}
                </button>
              </div>

              <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                {activeLesson.summary}
              </p>

              {/* Objectives + Visual Diagram Grid */}
              <div className="mt-4 grid gap-4 lg:grid-cols-12">
                <div className="space-y-3 rounded-xl border border-space-border/80 bg-space-navy/80 p-3.5 lg:col-span-6">
                  <p className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-sky-300">
                    <Target className="h-3.5 w-3.5" aria-hidden="true" />
                    Learning Objectives
                  </p>
                  <ul className="space-y-1.5 text-xs leading-relaxed text-slate-200 sm:text-sm">
                    {activeLesson.learningObjectives.map((obj) => (
                      <li key={obj} className="flex items-start gap-2">
                        <Activity
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300"
                          aria-hidden="true"
                        />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-lg border border-amber-400/25 bg-amber-500/10 p-2.5 text-xs leading-relaxed text-amber-100">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                      Real NASA Mission Example: {activeLesson.nasaExample.missionName}
                    </p>
                    <p className="mt-1">{activeLesson.nasaExample.detail}</p>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <AcademyDiagram lessonId={activeLesson.id} />
                </div>
              </div>

              {/* 3 Science Takeaways */}
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {activeLesson.keyFacts.map((fact) => (
                  <div
                    key={fact.title}
                    className="rounded-xl border border-space-border/80 bg-space-navy/85 p-3.5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                      {fact.title}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-300 sm:text-sm">
                      {fact.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Card Explorer */}
            {(() => {
              const selectedId = selectedExplorerByLesson[activeLesson.id];
              const selectedItem =
                activeLesson.explorerItems.find((i) => i.id === selectedId) ??
                activeLesson.explorerItems[0];

              return (
                <div className="rounded-2xl border border-space-border bg-space-void/75 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="inline-flex items-center gap-2 font-display text-base font-semibold text-slate-50">
                      <Sparkles
                        className="h-4 w-4 text-sky-300"
                        aria-hidden="true"
                      />
                      {activeLesson.explorerTitle}
                    </h4>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                      Interactive Briefing Deck
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {activeLesson.explorerItems.map((item) => {
                      const isActive = item.id === selectedItem.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          aria-pressed={isActive}
                          onClick={() =>
                            handleSelectExplorer(activeLesson.id, item.id)
                          }
                          className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                            isActive
                              ? 'border-sky-400/70 bg-sky-400/15 text-slate-50 shadow-[inset_0_1px_0_rgba(125,211,252,0.2)]'
                              : 'border-space-border bg-space-navy/80 text-slate-300 hover:border-sky-400/40'
                          }`}
                        >
                          <p className="text-xs font-bold sm:text-sm">
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
                            {item.tagline}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 grid gap-4 rounded-xl border border-sky-400/25 bg-space-navy/90 p-4 sm:grid-cols-12 sm:items-center">
                    <div className="rounded-xl border border-space-border bg-space-void/85 p-3.5 sm:col-span-4">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                        {selectedItem.metricLabel}
                      </p>
                      <p className="mt-1 font-mono text-lg font-bold text-sky-300">
                        {selectedItem.metricValue}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {selectedItem.name}
                      </p>
                    </div>

                    <div className="space-y-2 sm:col-span-8">
                      <p className="text-sm leading-relaxed text-slate-200">
                        {selectedItem.scienceNote}
                      </p>
                      <p className="rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-xs leading-relaxed text-emerald-100">
                        <strong className="font-semibold text-emerald-200">
                          Cadet Tip:{' '}
                        </strong>
                        {selectedItem.kidTip}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Lesson Quick Understanding Check */}
            {(() => {
              const qc = activeLesson.quickCheck;
              const chosenId = quickCheckChoiceByLesson[activeLesson.id] ?? null;
              const chosenOption = chosenId
                ? qc.options.find((o) => o.id === chosenId) ?? null
                : null;
              const isRight = chosenId === qc.correctOptionId;

              return (
                <div className="rounded-2xl border border-space-border bg-space-void/75 p-4 sm:p-5">
                  <p className="font-mono text-xs font-semibold uppercase tracking-widest text-amber-300">
                    Lesson Quick Check • {activeLesson.title}
                  </p>
                  <p className="mt-1.5 font-display text-base font-semibold text-slate-50">
                    {qc.question}
                  </p>

                  <div className="mt-3 space-y-2">
                    {qc.options.map((opt) => {
                      const isSelected = chosenId === opt.id;
                      const isCorrectOpt = opt.id === qc.correctOptionId;
                      let optionClasses =
                        'border-space-border bg-space-navy/85 text-slate-200 hover:border-sky-400/50 hover:bg-space-slate';

                      if (isSelected) {
                        optionClasses = isCorrectOpt
                          ? 'border-emerald-400/65 bg-emerald-500/15 text-emerald-100'
                          : 'border-amber-400/65 bg-amber-500/15 text-amber-100';
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() =>
                            handleSelectQuickCheck(
                              activeLesson.id,
                              opt.id,
                              qc.correctOptionId,
                            )
                          }
                          className={`w-full rounded-xl border p-3 text-left text-xs leading-relaxed transition-colors cursor-pointer sm:text-sm ${optionClasses}`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {chosenOption && (
                    <div
                      role="status"
                      aria-live="polite"
                      className={`mt-3 flex items-start gap-2.5 rounded-xl border p-3.5 text-xs leading-relaxed sm:text-sm ${
                        isRight
                          ? 'border-emerald-400/45 bg-emerald-500/12 text-emerald-100'
                          : 'border-amber-400/45 bg-amber-500/12 text-amber-100'
                      }`}
                    >
                      {isRight ? (
                        <CheckCircle2
                          className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300"
                          aria-hidden="true"
                        />
                      ) : (
                        <TriangleAlert
                          className="mt-0.5 h-5 w-5 shrink-0 text-amber-300"
                          aria-hidden="true"
                        />
                      )}
                      <div>
                        <p className="font-semibold">
                          {isRight
                            ? 'Concept Unlocked!'
                            : 'Try Another Option!'}
                        </p>
                        <p className="mt-0.5">
                          {isRight
                            ? qc.correctExplanation
                            : chosenOption.wrongHint}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step Footer Navigation */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-space-border/80 pt-4">
                    <span className="text-xs text-slate-400">
                      {completedLessonIds.length} / {ACADEMY_LESSONS.length}{' '}
                      Academy lessons studied
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                      onClick={() => {
                        const nextLesson =
                          ACADEMY_LESSONS[activeLessonIndex + 1];
                        setActiveTab(nextLesson ? nextLesson.id : 'quiz');
                      }}
                    >
                      {activeLessonIndex < ACADEMY_LESSONS.length - 1
                        ? `Next: ${ACADEMY_LESSONS[activeLessonIndex + 1].title}`
                        : 'Take Space Science Quiz'}
                    </Button>
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          /* Tab 11: Space Science Mastery Quiz (10 Questions) */
          <div className="rounded-2xl border border-space-border bg-space-void/75 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <BadgePill tone="amber" icon={<Award className="h-3.5 w-3.5" />}>
                  10-Topic Academy Assessment (Pass ≥ {QUIZ_PASS_THRESHOLD}/
                  {ACADEMY_QUIZ_QUESTIONS.length})
                </BadgePill>
                <h3 className="mt-2 font-display text-lg font-bold text-slate-50 sm:text-xl">
                  Space Science Mastery Quiz
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <BadgePill tone="emerald">
                  Score: {quizScore} / {ACADEMY_QUIZ_QUESTIONS.length}
                </BadgePill>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<RotateCcw className="h-4 w-4" />}
                  onClick={handleRetakeQuiz}
                >
                  Reset Quiz
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <ProgressBar
                label="Academy Quiz Progress"
                value={quizProgressPct}
                size="sm"
                fillClassName="bg-amber-400"
                helperText={`${quizAnsweredCount} of ${ACADEMY_QUIZ_QUESTIONS.length} questions answered`}
              />
            </div>

            {!quizFinished ? (
              <div className="mt-5 space-y-4">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-widest text-sky-300">
                    Question {quizIndex + 1} of {ACADEMY_QUIZ_QUESTIONS.length}{' '}
                    • {currentQuizQuestion.topic}
                  </p>
                  <p className="mt-1.5 font-display text-base font-semibold text-slate-50 sm:text-lg">
                    {currentQuizQuestion.question}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {currentQuizQuestion.options.map((opt) => {
                    const isSelected = selectedQuizOptionId === opt.id;
                    const isCorrectOpt =
                      opt.id === currentQuizQuestion.correctOptionId;
                    const locked = selectedQuizOptionId !== null;

                    let styleClass =
                      'border-space-border bg-space-navy/90 text-slate-200 hover:border-sky-400/50 hover:bg-space-slate';
                    if (locked) {
                      if (isCorrectOpt) {
                        styleClass =
                          'border-emerald-400/65 bg-emerald-500/15 text-emerald-100';
                      } else if (isSelected) {
                        styleClass =
                          'border-amber-400/65 bg-amber-500/15 text-amber-100';
                      } else {
                        styleClass =
                          'border-space-border/60 bg-space-navy/50 text-slate-400 opacity-75';
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={locked}
                        aria-pressed={isSelected}
                        onClick={() => handleSelectQuizOption(opt.id)}
                        className={`w-full rounded-xl border p-3.5 text-left text-xs leading-relaxed transition-colors sm:text-sm ${
                          locked ? 'cursor-default' : 'cursor-pointer'
                        } ${styleClass}`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {selectedQuizOption && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`space-y-3 rounded-xl border p-4 text-xs leading-relaxed sm:text-sm ${
                      isQuizChoiceCorrect
                        ? 'border-emerald-400/45 bg-emerald-500/12 text-emerald-100'
                        : 'border-amber-400/45 bg-amber-500/12 text-amber-100'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {isQuizChoiceCorrect ? (
                        <CheckCircle2
                          className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300"
                          aria-hidden="true"
                        />
                      ) : (
                        <TriangleAlert
                          className="mt-0.5 h-5 w-5 shrink-0 text-amber-300"
                          aria-hidden="true"
                        />
                      )}
                      <div>
                        <p className="font-semibold">
                          {isQuizChoiceCorrect
                            ? 'Mission Science Correct!'
                            : 'Not quite—here is the real space science:'}
                        </p>
                        <p className="mt-1">
                          {isQuizChoiceCorrect
                            ? currentQuizQuestion.correctFeedback
                            : selectedQuizOption.wrongExplanation}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleNextQuizQuestion}
                      >
                        {quizIndex >= ACADEMY_QUIZ_QUESTIONS.length - 1
                          ? 'See Final Quiz Score'
                          : 'Next Question'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Quiz Results & Explicit Certification CTA */
              <div
                role="status"
                aria-live="polite"
                className={`mt-5 space-y-4 rounded-2xl border p-5 ${
                  quizPassed
                    ? 'border-emerald-400/40 bg-emerald-500/10'
                    : 'border-amber-400/40 bg-amber-500/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  {quizPassed ? (
                    <Sparkles
                      className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300"
                      aria-hidden="true"
                    />
                  ) : (
                    <TriangleAlert
                      className="mt-0.5 h-5 w-5 shrink-0 text-amber-300"
                      aria-hidden="true"
                    />
                  )}
                  <div>
                    <h4
                      className={`font-display text-lg font-bold ${
                        quizPassed ? 'text-emerald-100' : 'text-amber-100'
                      }`}
                    >
                      {quizScore === ACADEMY_QUIZ_QUESTIONS.length
                        ? `Orbital Scholar Perfect Score — ${quizScore} / ${ACADEMY_QUIZ_QUESTIONS.length}!`
                        : quizPassed
                          ? `Academy Quiz Passed: ${quizScore} / ${ACADEMY_QUIZ_QUESTIONS.length}!`
                          : `Quiz Complete: ${quizScore} / ${ACADEMY_QUIZ_QUESTIONS.length} — Review & Retry!`}
                    </h4>
                    <p
                      className={`mt-1 text-sm leading-relaxed ${
                        quizPassed
                          ? 'text-emerald-100/90'
                          : 'text-amber-100/90'
                      }`}
                    >
                      {quizPassed
                        ? 'Strong command across orbital mechanics, rockets, Moon/Mars exploration, life support, physiology, radiation, and flight operations!'
                        : `Score ${QUIZ_PASS_THRESHOLD} or higher (or mark all 10 Academy topics studied) to certify the Orbital Scholar Academy deck.`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<RotateCcw className="h-4 w-4" />}
                    onClick={handleRetakeQuiz}
                  >
                    Retake Quiz
                  </Button>

                  {(quizPassed ||
                    completedLessonIds.length === ACADEMY_LESSONS.length) &&
                    onCertifyAcademy &&
                    !isCertified && (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<CheckCircle2 className="h-4 w-4" />}
                        onClick={onCertifyAcademy}
                      >
                        Save Academy Certification (+XP)
                      </Button>
                    )}

                  {isCertified && (
                    <BadgePill
                      tone="emerald"
                      icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                    >
                      Academy Certification Saved
                    </BadgePill>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
