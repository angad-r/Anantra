import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  Bot,
  CheckCircle2,
  Cloud,
  CloudOff,
  Compass,
  HelpCircle,
  Lightbulb,
  MessageSquarePlus,
  RotateCcw,
  Send,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BadgePill } from '../../components/ui/BadgePill';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useTraining } from '../../context/TrainingContext';
import { TRAINING_MODULES } from '../../data/modules';
import type { ModuleId } from '../../types/training';
import {
  MENTOR_KNOWLEDGE_BASE,
  MENTOR_QUIZ_QUESTIONS,
  PROGRESSIVE_HINT_TRACKS,
  buildMissionDebriefReply,
  buildMissionHintReply,
  buildProgressSnapshot,
  buildProgressiveHintReply,
  buildScoreExplanationReply,
  matchMentorQuery,
  type HintLevel,
  type MentorReply,
} from './mentorKnowledgeBase';

interface ChatMessage {
  id: string;
  sender: 'cadet' | 'mentor';
  text: string;
  reply?: MentorReply;
}

const VALID_DEBRIEF_MODULES: ReadonlySet<string> = new Set([
  'academy',
  'mission-control',
  'zero-gravity-lab',
  'spacewalk-training',
  'emergency-training',
  'ai-mentor',
]);

const CATEGORY_META: Record<
  MentorReply['category'],
  { label: string; tone: 'cyan' | 'amber' | 'emerald' | 'violet' | 'rose' | 'neutral' }
> = {
  science: { label: 'Space Science Guide', tone: 'cyan' },
  hint: { label: 'Mission Readiness Hint', tone: 'amber' },
  debrief: { label: 'Telemetry Debrief', tone: 'rose' },
  encouragement: { label: 'Cadet Encouragement', tone: 'emerald' },
  'quiz-review': { label: 'Quiz Concept Review', tone: 'violet' },
  'live-ai': { label: 'Live Cloud AI Coach', tone: 'emerald' },
  fallback: { label: 'Offline Handbook Notice', tone: 'neutral' },
};

function createGreetingMessage(
  traineeName: string,
  percentage: number,
  completedModules: number,
  totalModules: number,
): ChatMessage {
  return {
    id: 'mentor-greeting',
    sender: 'mentor',
    text: `Welcome back to the Mentor Console, ${traineeName}! You are currently at ${percentage}% mission readiness (${completedModules}/${totalModules} decks certified). Ask me any space science question, step through progressive hints without spoilers, debrief a tough simulation run, or master the 5-question quiz!`,
    reply: {
      topicLabel: 'ARIA Offline Mentor Ready',
      category: 'encouragement',
      text: `Welcome back to the Mentor Console, ${traineeName}! You are currently at ${percentage}% mission readiness (${completedModules}/${totalModules} decks certified). Ask me any space science question, step through progressive hints without spoilers, debrief a tough simulation run, or master the 5-question quiz!`,
      encouragedNote:
        'Try asking a science question and then typing "tell me more" for multi-turn follow-up depth.',
    },
  };
}

export function AstronautMentorActivity() {
  const {
    cadetProfile,
    state,
    stats,
    isOnline,
    recordModuleAttempt,
    saveMentorQuizBest,
  } = useTraining();
  const [searchParams] = useSearchParams();
  const activeTraineeName = cadetProfile?.firstName ?? state.profile.name;

  const snapshot = useMemo(
    () =>
      buildProgressSnapshot(
        activeTraineeName,
        stats,
        TRAINING_MODULES,
        state.progressByModule,
      ),
    [activeTraineeName, state.progressByModule, stats],
  );

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createGreetingMessage(
      snapshot.traineeName,
      snapshot.percentage,
      snapshot.completedModules,
      snapshot.totalModules,
    ),
  ]);
  const [draftQuery, setDraftQuery] = useState<string>('');
  const nextSeqRef = useRef<number>(1);
  const autoDebriefHandledRef = useRef<string | null>(null);

  // Multi-turn & progressive hint state
  const [lastEntryId, setLastEntryId] = useState<string | undefined>(undefined);
  const [selectedHintModule, setSelectedHintModule] = useState<
    Exclude<ModuleId, 'ai-mentor'>
  >(() =>
    snapshot.nextIncompleteModule &&
    snapshot.nextIncompleteModule.id !== 'ai-mentor'
      ? (snapshot.nextIncompleteModule.id as Exclude<ModuleId, 'ai-mentor'>)
      : 'mission-control',
  );
  const [hintStepByTopic, setHintStepByTopic] = useState<
    Partial<Record<Exclude<ModuleId, 'ai-mentor'>, HintLevel>>
  >({});

  // Optional Server Live Cloud AI toggle + graceful fallback status
  const [liveAiRequested, setLiveAiRequested] = useState<boolean>(false);
  const [liveAiStatusNote, setLiveAiStatusNote] = useState<string | null>(null);
  const [isQueryingCloud, setIsQueryingCloud] = useState<boolean>(false);

  // Knowledge Quiz state
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnsweredCount, setQuizAnsweredCount] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [missedTopics, setMissedTopics] = useState<string[]>([]);

  const completedMentorTaskIds =
    state.progressByModule['ai-mentor']?.completedTaskIds ?? [];

  useEffect(() => {
    setMessages((prev) => {
      if (prev[0]?.id !== 'mentor-greeting') return prev;
      const updatedGreeting = createGreetingMessage(
        snapshot.traineeName,
        snapshot.percentage,
        snapshot.completedModules,
        snapshot.totalModules,
      );
      return [updatedGreeting, ...prev.slice(1)];
    });
  }, [
    snapshot.traineeName,
    snapshot.percentage,
    snapshot.completedModules,
    snapshot.totalModules,
  ]);

  const appendQaTurn = (userPrompt: string, reply: MentorReply) => {
    const seq = nextSeqRef.current;
    nextSeqRef.current += 1;
    if (reply.entryId) {
      setLastEntryId(reply.entryId);
    }
    if (reply.hintTopicId && reply.hintStep) {
      const topic = reply.hintTopicId;
      const step = reply.hintStep;
      setSelectedHintModule(topic);
      setHintStepByTopic((prev) => ({ ...prev, [topic]: step }));
    }
    setMessages((prev) => [
      ...prev,
      { id: `cadet-${seq}`, sender: 'cadet', text: userPrompt },
      { id: `mentor-${seq}`, sender: 'mentor', text: reply.text, reply },
    ]);
  };

  // Auto-open debrief when navigated from a simulator or Mission Sandbox via ?debrief=<moduleId>
  const debriefParam = searchParams.get('debrief');
  useEffect(() => {
    if (!debriefParam || !VALID_DEBRIEF_MODULES.has(debriefParam)) return;
    if (autoDebriefHandledRef.current === debriefParam) return;
    autoDebriefHandledRef.current = debriefParam;

    const modId = debriefParam as ModuleId;
    if (modId !== 'ai-mentor') {
      setSelectedHintModule(modId);
    }
    const reply = buildMissionDebriefReply(modId, state, snapshot);
    appendQaTurn(`Debrief my latest ${reply.topicLabel.replace(/^.*?: /, '')} run`, reply);
  }, [debriefParam, snapshot, state]);

  const syncQaMilestoneIfNeeded = () => {
    if (!completedMentorTaskIds.includes('ai-1')) {
      recordModuleAttempt({
        moduleId: 'ai-mentor',
        outcome: 'milestone',
        completeTaskIds: ['ai-1'],
        summary: 'Explored space science Q&A in ARIA Mentor Console.',
      });
    }
  };

  const syncHintMilestoneIfNeeded = () => {
    if (!completedMentorTaskIds.includes('ai-2')) {
      recordModuleAttempt({
        moduleId: 'ai-mentor',
        outcome: 'milestone',
        completeTaskIds: ['ai-2'],
        summary: 'Requested personalized readiness coaching & progressive hints from ARIA.',
      });
    }
  };

  const runLocalQuery = (cleanedQuery: string): MentorReply => {
    return matchMentorQuery(cleanedQuery, snapshot, {
      lastEntryId,
      lastHintTopicId: selectedHintModule,
      lastHintStep: hintStepByTopic[selectedHintModule],
      state,
      stats,
    });
  };

  const handleToggleLiveAi = async () => {
    if (!isOnline) {
      setLiveAiRequested(false);
      setLiveAiStatusNote(
        'Device is offline — ARIA remains in deterministic local mentor mode.',
      );
      return;
    }
    const nextState = !liveAiRequested;
    setLiveAiRequested(nextState);
    if (!nextState) {
      setLiveAiStatusNote(null);
      return;
    }

    try {
      const probe = await fetch('/api/mentor', { method: 'GET' });
      const data = (await probe.json().catch(() => null)) as {
        configured?: boolean;
        provider?: string;
      } | null;

      if (!probe.ok) {
        if (data?.configured === false) {
          setLiveAiStatusNote(
            'No server AI key configured on this deployment — automatically using Offline ARIA.',
          );
          return;
        }
        setLiveAiStatusNote(
          'Cloud mentor endpoint returned unavailable status — questions will automatically use Offline ARIA.',
        );
        return;
      }

      if (data?.configured) {
        setLiveAiStatusNote(
          `Connected to server Cloud Mentor (${data.provider ?? 'cloud'}). Local ARIA remains active on fallback.`,
        );
      } else {
        setLiveAiStatusNote(
          'No server AI key configured on this deployment — automatically using Offline ARIA.',
        );
      }
    } catch {
      setLiveAiStatusNote(
        'Server /api/mentor unreachable right now — automatically using Offline ARIA.',
      );
    }
  };

  const handleSubmitQuestion = async (event: FormEvent) => {
    event.preventDefault();
    const cleaned = draftQuery.trim();
    if (!cleaned || isQueryingCloud) return;

    setDraftQuery('');
    syncQaMilestoneIfNeeded();

    if (liveAiRequested && isOnline) {
      setIsQueryingCloud(true);
      try {
        const recentHistory = messages.slice(-6).map((m) => ({
          sender: m.sender,
          text: m.text,
        }));
        const cadetSummary = `Name: ${snapshot.traineeName}, Rank: ${snapshot.cadetTitle}, Readiness: ${snapshot.percentage}%, Best Academy Quiz: ${state.academyBestQuizScore ?? 'none'}`;
        const response = await fetch('/api/mentor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: cleaned,
            history: recentHistory,
            cadetSummary,
          }),
        });

        if (response.ok) {
          const payload = (await response.json()) as {
            configured?: boolean;
            provider?: string;
            reply?: string;
          };
          if (payload.configured && payload.reply) {
            appendQaTurn(cleaned, {
              topicLabel: `Cloud Space Coach (${payload.provider ?? 'Server AI'})`,
              category: 'live-ai',
              text: payload.reply,
              encouragedNote:
                'Server-side Cloud Mentor reply — verify physics inside the ANANTRA simulators!',
            });
            setIsQueryingCloud(false);
            return;
          }
        }
        setLiveAiStatusNote(
          'Cloud AI endpoint unavailable or unconfigured — answered seamlessly using Offline ARIA.',
        );
      } catch {
        setLiveAiStatusNote(
          'Could not reach Cloud AI endpoint — answered seamlessly using Offline ARIA.',
        );
      } finally {
        setIsQueryingCloud(false);
      }
    }

    const reply = runLocalQuery(cleaned);
    appendQaTurn(cleaned, reply);
  };

  const handleQuickPrompt = (questionText: string) => {
    const reply = runLocalQuery(questionText);
    syncQaMilestoneIfNeeded();
    appendQaTurn(questionText, reply);
  };

  const handleMissionHint = () => {
    const reply = buildMissionHintReply(snapshot);
    syncHintMilestoneIfNeeded();
    appendQaTurn('What is my next mission readiness hint?', reply);
  };

  const handleNextProgressiveHint = () => {
    const currentStep = hintStepByTopic[selectedHintModule] ?? 0;
    const nextStep: HintLevel =
      currentStep >= 3 ? 1 : ((currentStep + 1) as HintLevel);
    const reply = buildProgressiveHintReply(
      selectedHintModule,
      nextStep,
      snapshot,
    );
    syncHintMilestoneIfNeeded();
    appendQaTurn(
      `Give me Progressive Hint Step ${nextStep}/3 for ${selectedHintModule.replace(/-/g, ' ')}`,
      reply,
    );
  };

  const handleExplainScores = () => {
    const reply = buildScoreExplanationReply(stats, state, snapshot);
    syncHintMilestoneIfNeeded();
    appendQaTurn('Explain my readiness scores, skills, and weakest area.', reply);
  };

  const handleDebriefSelected = () => {
    const reply = buildMissionDebriefReply(selectedHintModule, state, snapshot);
    syncHintMilestoneIfNeeded();
    appendQaTurn(
      `Debrief my logged ${selectedHintModule.replace(/-/g, ' ')} telemetry.`,
      reply,
    );
  };

  const handleResetChat = () => {
    setLastEntryId(undefined);
    setHintStepByTopic({});
    setMessages([
      createGreetingMessage(
        snapshot.traineeName,
        snapshot.percentage,
        snapshot.completedModules,
        snapshot.totalModules,
      ),
    ]);
    setDraftQuery('');
  };

  const currentQuestion = MENTOR_QUIZ_QUESTIONS[quizIndex];
  const selectedOption = selectedOptionId
    ? currentQuestion.options.find((opt) => opt.id === selectedOptionId) ?? null
    : null;
  const isCorrectSelection =
    selectedOptionId !== null &&
    selectedOptionId === currentQuestion.correctOptionId;

  const handleSelectQuizOption = (optionId: string) => {
    if (selectedOptionId !== null || quizFinished) return;
    setSelectedOptionId(optionId);
    setQuizAnsweredCount((c) => c + 1);

    if (optionId === currentQuestion.correctOptionId) {
      setQuizScore((s) => s + 1);
    } else {
      setMissedTopics((prev) =>
        prev.includes(currentQuestion.topicLabel)
          ? prev
          : [...prev, currentQuestion.topicLabel],
      );
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex >= MENTOR_QUIZ_QUESTIONS.length - 1) {
      setQuizFinished(true);
      saveMentorQuizBest(quizScore);
      const passed = quizScore >= 3;
      recordModuleAttempt({
        moduleId: 'ai-mentor',
        outcome: passed ? 'success' : 'retry',
        score: quizScore,
        maxScore: MENTOR_QUIZ_QUESTIONS.length,
        completeTaskIds: passed ? ['ai-3'] : [],
        telemetrySummary: `ARIA Quiz ${quizScore}/${MENTOR_QUIZ_QUESTIONS.length}`,
        failureReason: !passed
          ? `Scored ${quizScore}/${MENTOR_QUIZ_QUESTIONS.length} — review ${missedTopics.join(', ') || 'flight science basics'}`
          : undefined,
        summary: `Completed ARIA Cadet Knowledge Quiz (${quizScore}/${MENTOR_QUIZ_QUESTIONS.length}).`,
      });
      return;
    }
    setQuizIndex((idx) => idx + 1);
    setSelectedOptionId(null);
  };

  const handleResetQuiz = () => {
    setQuizIndex(0);
    setSelectedOptionId(null);
    setQuizScore(0);
    setQuizAnsweredCount(0);
    setQuizFinished(false);
    setMissedTopics([]);
  };

  const handleAskAriaQuizWhy = (topicLabel: string, relatedQuery: string) => {
    const reply = runLocalQuery(relatedQuery);
    appendQaTurn(`Can you explain "${topicLabel}" from the quiz?`, {
      ...reply,
      category: 'quiz-review',
    });
  };

  const quizProgressPct = Math.round(
    (quizAnsweredCount / MENTOR_QUIZ_QUESTIONS.length) * 100,
  );
  const currentModuleHintStep = hintStepByTopic[selectedHintModule] ?? 0;
  const nextProgressiveStep: HintLevel =
    currentModuleHintStep >= 3 ? 1 : ((currentModuleHintStep + 1) as HintLevel);

  return (
    <Card
      variant="elevated"
      topAccentClassName="from-amber-400/85 via-sky-400/75 to-transparent"
      className="space-y-6"
    >
      {/* Header + Honest Offline Prototype Notice */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <BadgePill tone="amber" dot icon={<Bot className="h-3.5 w-3.5" />}>
                Offline Educational Mentor Prototype
              </BadgePill>
              <BadgePill tone="cyan" icon={<BookOpen className="h-3.5 w-3.5" />}>
                10-Topic Handbook • Progressive Hints
              </BadgePill>
              {isOnline ? (
                <BadgePill
                  tone={liveAiRequested ? 'emerald' : 'neutral'}
                  icon={<Cloud className="h-3.5 w-3.5" />}
                >
                  {liveAiRequested ? 'Optional Cloud Relay Active' : 'Local Safe Mode'}
                </BadgePill>
              ) : (
                <BadgePill tone="rose" icon={<CloudOff className="h-3.5 w-3.5" />}>
                  Offline Mode Active
                </BadgePill>
              )}
            </div>
            <h2 className="mt-2 font-display text-xl font-bold text-slate-50 sm:text-2xl">
              ARIA — Cadet Q&amp;A, Telemetry Debrief &amp; Space Coach
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Compass className="h-4 w-4" />}
              onClick={handleMissionHint}
            >
              Get My Readiness Hint
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleLiveAi}
              disabled={!isOnline}
            >
              {liveAiRequested ? 'Use Local ARIA' : 'Try Cloud AI'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw className="h-4 w-4" />}
              onClick={handleResetChat}
            >
              Reset Chat
            </Button>
          </div>
        </div>

        <div
          role="note"
          className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-2.5 text-xs leading-relaxed text-amber-100 sm:text-sm"
        >
          <strong className="font-semibold text-amber-200">
            Transparent Prototype Note:
          </strong>{' '}
          By default, ARIA is an <strong>offline educational mentor prototype</strong>, not a
          live AI model. Answers, 3-step progressive hints, telemetry debriefs, and
          quiz explanations come from a deterministic local knowledge base with zero
          browser API keys.{' '}
          {liveAiStatusNote && (
            <span className="mt-1 block font-medium text-sky-200">
              Cloud Relay Status: {liveAiStatusNote}
            </span>
          )}
        </div>
      </div>

      {/* Main Two-Column Activity Area */}
      <div className="grid gap-6 xl:grid-cols-12">
        {/* LEFT COLUMN: Interactive Q&A Console */}
        <div className="min-w-0 space-y-4 xl:col-span-7">
          {/* Quick Topic Chips */}
          <div className="rounded-2xl border border-space-border bg-space-void/70 p-4">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Try a Guided Question or Simulator Topic
            </p>
            <div className="flex flex-wrap gap-2">
              {MENTOR_KNOWLEDGE_BASE.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => handleQuickPrompt(entry.sampleQuestion)}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-space-border bg-space-navy/90 px-3 py-1 text-left text-xs font-medium text-slate-200 transition-colors hover:border-sky-400/50 hover:bg-space-slate hover:text-sky-100 cursor-pointer"
                >
                  <MessageSquarePlus
                    className="h-3.5 w-3.5 shrink-0 text-amber-300"
                    aria-hidden="true"
                  />
                  <span>{entry.topicLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Progressive Hint & Telemetry Coaching Toolbar */}
          <div className="rounded-2xl border border-space-border bg-space-void/70 p-4 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-200">
                <Lightbulb className="h-4 w-4 text-amber-300" aria-hidden="true" />
                <span>Progressive Coach &amp; Run Debrief</span>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <span>Focus Deck:</span>
                <select
                  aria-label="Focus module for progressive hints and debrief"
                  value={selectedHintModule}
                  onChange={(e) =>
                    setSelectedHintModule(
                      e.target.value as Exclude<ModuleId, 'ai-mentor'>,
                    )
                  }
                  className="rounded-lg border border-space-border bg-space-navy px-2.5 py-1 text-xs text-slate-100 focus:border-sky-400 focus:outline-none"
                >
                  {PROGRESSIVE_HINT_TRACKS.map((track) => (
                    <option key={track.topicId} value={track.topicId}>
                      {track.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Lightbulb className="h-3.5 w-3.5 text-amber-300" />}
                onClick={handleNextProgressiveHint}
              >
                Hint Step {nextProgressiveStep}/3
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Activity className="h-3.5 w-3.5 text-rose-300" />}
                onClick={handleDebriefSelected}
              >
                Debrief My Telemetry
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<BarChart3 className="h-3.5 w-3.5 text-sky-300" />}
                onClick={handleExplainScores}
              >
                Explain My Scores
              </Button>
            </div>
          </div>

          {/* Conversation Transcript */}
          <div
            role="log"
            aria-label="Astronaut mentor conversation"
            aria-live="polite"
            className="max-h-[430px] space-y-3 overflow-y-auto rounded-2xl border border-space-border bg-space-void/85 p-4"
          >
            {messages.map((msg) => {
              if (msg.sender === 'cadet') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-sky-400/35 bg-sky-500/15 px-4 py-2.5 text-sm text-sky-50">
                      <p className="mb-0.5 font-mono text-[10px] uppercase tracking-wider text-sky-300">
                        {snapshot.traineeName}
                      </p>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                );
              }

              const reply = msg.reply;
              const meta = reply
                ? CATEGORY_META[reply.category]
                : CATEGORY_META.science;

              return (
                <div
                  key={msg.id}
                  className="rounded-2xl rounded-bl-sm border border-space-border/90 bg-space-navy/90 p-4 text-sm text-slate-200"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <BadgePill tone={meta.tone}>{meta.label}</BadgePill>
                      {reply && (
                        <span className="font-display text-xs font-semibold text-slate-300">
                          {reply.topicLabel}
                        </span>
                      )}
                    </div>
                    {reply?.matchedKeywords && reply.matchedKeywords.length > 0 && (
                      <span className="font-mono text-[11px] text-slate-400">
                        Matched: {reply.matchedKeywords.join(', ')}
                      </span>
                    )}
                  </div>

                  <p className="leading-relaxed text-slate-100">{msg.text}</p>

                  {reply?.scienceHighlight && (
                    <div className="mt-2.5 rounded-xl border border-sky-400/25 bg-sky-500/10 px-3 py-2 text-xs leading-relaxed text-sky-100">
                      <strong className="font-semibold text-sky-200">
                        Science Spotlight:{' '}
                      </strong>
                      {reply.scienceHighlight}
                    </div>
                  )}

                  {reply?.recommendedAcademyTopic && (
                    <p className="mt-2 text-xs text-cyan-200">
                      <strong className="font-semibold">Academy Study Match:</strong>{' '}
                      {reply.recommendedAcademyTopic}
                    </p>
                  )}

                  {reply?.encouragedNote && (
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-emerald-200">
                      <Sparkles
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300"
                        aria-hidden="true"
                      />
                      <span>{reply.encouragedNote}</span>
                    </p>
                  )}

                  {(reply?.actionRoute || reply?.entryId || (reply?.hintTopicId && (reply.hintStep ?? 0) < 3)) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {reply?.actionRoute && reply.actionLabel && (
                        <ButtonLink
                          to={reply.actionRoute}
                          variant="secondary"
                          size="sm"
                        >
                          {reply.actionLabel}
                        </ButtonLink>
                      )}
                      {reply?.entryId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuickPrompt('Tell me more')}
                        >
                          Tell Me More
                        </Button>
                      )}
                      {reply?.hintTopicId && (reply.hintStep ?? 0) < 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleQuickPrompt('Give me the next hint step')
                          }
                        >
                          Next Hint Clue
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Question Input Form */}
          <form
            onSubmit={handleSubmitQuestion}
            className="rounded-2xl border border-space-border bg-space-void/70 p-3.5"
          >
            <label
              htmlFor="mentor-question-input"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300"
            >
              Ask ARIA About Space Science or Any Training Mission
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="mentor-question-input"
                type="text"
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                placeholder="Ask a science question, 'tell me more', or 'explain my scores'..."
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-space-border bg-space-navy px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!draftQuery.trim() || isQueryingCloud}
                rightIcon={<Send className="h-4 w-4" />}
              >
                {isQueryingCloud ? 'Asking...' : 'Ask ARIA'}
              </Button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Space Knowledge Quiz */}
        <div className="min-w-0 rounded-2xl border border-space-border bg-space-void/75 p-4 sm:p-5 xl:col-span-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-300" aria-hidden="true" />
              <h3 className="font-display text-lg font-bold text-slate-50">
                Cadet Knowledge Quiz
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <BadgePill tone="emerald">
                Score: {quizScore} / {MENTOR_QUIZ_QUESTIONS.length}
              </BadgePill>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetQuiz}
                aria-label="Reset Knowledge Quiz"
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="mt-3">
            <ProgressBar
              label="Quiz Progress"
              value={quizProgressPct}
              size="sm"
              fillClassName="bg-amber-400"
              helperText={`${quizAnsweredCount} of ${MENTOR_QUIZ_QUESTIONS.length} questions answered${
                typeof state.mentorBestQuizScore === 'number'
                  ? ` • Best: ${state.mentorBestQuizScore}/${MENTOR_QUIZ_QUESTIONS.length}`
                  : ''
              }`}
            />
          </div>

          {!quizFinished ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-widest text-amber-300">
                  Question {quizIndex + 1} of {MENTOR_QUIZ_QUESTIONS.length} •{' '}
                  {currentQuestion.topicLabel}
                </p>
                <p className="mt-1.5 font-display text-base font-semibold leading-snug text-slate-100">
                  {currentQuestion.question}
                </p>
              </div>

              <div className="space-y-2.5">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  const isCorrectOpt = opt.id === currentQuestion.correctOptionId;
                  const locked = selectedOptionId !== null;

                  let styleClass =
                    'border-space-border bg-space-navy/90 text-slate-200 hover:border-sky-400/50 hover:bg-space-slate';
                  if (locked) {
                    if (isCorrectOpt) {
                      styleClass =
                        'border-emerald-400/60 bg-emerald-500/15 text-emerald-100';
                    } else if (isSelected) {
                      styleClass =
                        'border-amber-400/60 bg-amber-500/15 text-amber-100';
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
                      className={`w-full rounded-xl border p-3 text-left text-xs leading-relaxed transition-colors sm:text-sm ${
                        locked ? 'cursor-default' : 'cursor-pointer'
                      } ${styleClass}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* Immediate Quiz Feedback (Correct OR Specific Misconception Explanation) */}
              {selectedOption && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`space-y-3 rounded-xl border p-3.5 text-xs leading-relaxed sm:text-sm ${
                    isCorrectSelection
                      ? 'border-emerald-400/45 bg-emerald-500/12 text-emerald-100'
                      : 'border-amber-400/45 bg-amber-500/12 text-amber-100'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {isCorrectSelection ? (
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
                    <div className="space-y-1.5">
                      <p className="font-semibold">
                        {isCorrectSelection
                          ? 'Great thinking, Cadet!'
                          : 'Not quite—here is what really happens in space:'}
                      </p>
                      <p>
                        {isCorrectSelection
                          ? currentQuestion.correctFeedback
                          : selectedOption.wrongExplanation}
                      </p>
                      {!isCorrectSelection && (
                        <p className="text-emerald-200">
                          Keep going! Every wrong guess helps lock in the real
                          science.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {!isCorrectSelection && (
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<HelpCircle className="h-4 w-4" />}
                        onClick={() =>
                          handleAskAriaQuizWhy(
                            currentQuestion.topicLabel,
                            currentQuestion.relatedQuery,
                          )
                        }
                      >
                        Explain Deeper in Chat
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleNextQuizQuestion}
                      className="ml-auto"
                    >
                      {quizIndex >= MENTOR_QUIZ_QUESTIONS.length - 1
                        ? 'See Final Quiz Score'
                        : 'Next Question'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Final Quiz Summary State */
            <div
              role="status"
              aria-live="polite"
              className="mt-4 space-y-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4"
            >
              <div className="flex items-start gap-3">
                <Sparkles
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300"
                  aria-hidden="true"
                />
                <div>
                  <h4 className="font-display text-base font-bold text-emerald-100">
                    {quizScore === MENTOR_QUIZ_QUESTIONS.length
                      ? 'Flight Director Honors — 5 / 5!'
                      : quizScore >= 3
                        ? `Solid Spaceflight Score: ${quizScore} / ${MENTOR_QUIZ_QUESTIONS.length}!`
                        : `Good Effort: ${quizScore} / ${MENTOR_QUIZ_QUESTIONS.length} — Keep Exploring!`}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-100/90 sm:text-sm">
                    {quizScore === MENTOR_QUIZ_QUESTIONS.length
                      ? `Outstanding science mastery, ${snapshot.traineeName}! You are ready to lead every ANANTRA mission deck.`
                      : missedTopics.length > 0
                        ? `Review ${missedTopics.join(', ')} with ARIA in the Q&A console, then retake the quiz to aim for 5/5!`
                        : 'Great curiosity, Cadet! Retake anytime or explore more topics with ARIA.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<RotateCcw className="h-4 w-4" />}
                  onClick={handleResetQuiz}
                >
                  Retake Quiz
                </Button>
                {missedTopics.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleMissionHint}
                  >
                    Get Study Hint
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
