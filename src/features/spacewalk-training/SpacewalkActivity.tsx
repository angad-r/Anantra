import {
  AlertCircle,
  Award,
  Bot,
  CheckCircle2,
  Compass,
  Info,
  Link2,
  RotateCcw,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Wind,
  Wrench,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BadgePill } from '../../components/ui/BadgePill';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import {
  EVA_EMERGENCY_STAGES,
  EVA_TOOL_LOCKER,
  REPAIR_STAGES,
  calculateSpacewalkScore,
  type SpacewalkScenarioId,
  type SpacewalkScore,
} from './spacewalkChallengeData';

type EvaPhase =
  | 'tool-prep'
  | 'repair-walk'
  | 'completed'
  | 'oxygen-depleted'
  | 'suit-breached';

type TetherStatus = 'airlock-standby' | 'dual-locked' | 'warning-unclipped' | 'airlock-sealed';

export interface SpacewalkOutcomeReport {
  outcome: 'success' | 'retry';
  scenarioId: SpacewalkScenarioId;
  score: number;
  maxScore: number;
  summary: string;
  failureReason?: string;
  telemetrySummary: string;
}

export interface SpacewalkActivityProps {
  onTaskUnlocked?: (taskId: 'eva-1' | 'eva-2' | 'eva-3') => void;
  onEvaOutcome?: (report: SpacewalkOutcomeReport) => void;
  onDebriefWithMentor?: () => void;
  isCertified?: boolean;
}

export function SpacewalkActivity({
  onTaskUnlocked,
  onEvaOutcome,
  onDebriefWithMentor,
  isCertified = false,
}: SpacewalkActivityProps = {}) {
  const [scenarioId, setScenarioId] =
    useState<SpacewalkScenarioId>('solar-repair');
  const [phase, setPhase] = useState<EvaPhase>('tool-prep');
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [oxygen, setOxygen] = useState<number>(100);
  const [suitIntegrity, setSuitIntegrity] = useState<number>(100);
  const [tetherStatus, setTetherStatus] =
    useState<TetherStatus>('airlock-standby');
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [showModelInfo, setShowModelInfo] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    tone: 'info' | 'success' | 'warning';
    text: string;
  }>({
    tone: 'info',
    text: 'Choose 3 space-certified tools for your EVA tool belt before opening the airlock.',
  });
  const [finalScore, setFinalScore] = useState<SpacewalkScore | null>(null);

  const prevPhaseRef = useRef<EvaPhase>(phase);
  const activeStages =
    scenarioId === 'eva-emergency' ? EVA_EMERGENCY_STAGES : REPAIR_STAGES;

  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;
    if (prev === phase) return;

    if (phase === 'completed' && finalScore) {
      onTaskUnlocked?.('eva-3');
      onEvaOutcome?.({
        outcome: 'success',
        scenarioId,
        score: finalScore.total,
        maxScore: 1440,
        summary: `${
          scenarioId === 'eva-emergency'
            ? 'EVA Emergency Cooling & Debris Drill'
            : 'Solar Array EVA Repair'
        } completed (${finalScore.total} pts, ${oxygen}% O₂ reserve)`,
        telemetrySummary: `Scenario=${scenarioId} | O2=${oxygen}% | Suit=${suitIntegrity}% | Mistakes=${mistakesCount}`,
      });
    } else if (phase === 'oxygen-depleted' || phase === 'suit-breached') {
      onEvaOutcome?.({
        outcome: 'retry',
        scenarioId,
        score: 0,
        maxScore: 1440,
        summary:
          phase === 'suit-breached'
            ? 'EVA aborted: Suit safety integrity dropped below threshold'
            : 'EVA recalled: Suit oxygen reserve exhausted',
        failureReason:
          phase === 'suit-breached'
            ? `Suit structural/thermal safety dropped to ${suitIntegrity}% from unsafe EVA maneuvers or unclipped tethers.`
            : `Suit O₂ depleted (${mistakesCount} non-optimal actions consumed reserve oxygen).`,
        telemetrySummary: `Scenario=${scenarioId} | O2=${oxygen}% | Suit=${suitIntegrity}% | Mistakes=${mistakesCount}`,
      });
    }
  }, [
    finalScore,
    mistakesCount,
    onEvaOutcome,
    onTaskUnlocked,
    oxygen,
    phase,
    scenarioId,
    suitIntegrity,
  ]);

  const toggleTool = (toolId: string) => {
    setSelectedToolIds((prev) => {
      if (prev.includes(toolId)) {
        return prev.filter((id) => id !== toolId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, toolId];
    });
  };

  const handleExitAirlock = () => {
    if (selectedToolIds.length !== 3) {
      setFeedback({
        tone: 'warning',
        text: 'Select exactly 3 tools for your EVA belt before stepping outside!',
      });
      return;
    }

    const pickedTools = EVA_TOOL_LOCKER.filter((t) =>
      selectedToolIds.includes(t.id),
    );
    const unsafeTool = pickedTools.find((t) => !t.spaceCertified);

    if (unsafeTool) {
      const nextO2 = Math.max(0, oxygen - 6);
      setOxygen(nextO2);
      setMistakesCount((m) => m + 1);
      if (nextO2 <= 0) {
        setPhase('oxygen-depleted');
      }
      setFeedback({
        tone: 'warning',
        text: `${unsafeTool.name}: ${unsafeTool.prepFeedback} (Pre-flight check cost 6% O₂.)`,
      });
      return;
    }

    onTaskUnlocked?.('eva-1');
    setPhase('repair-walk');
    setFeedback({
      tone: 'success',
      text: 'All 3 space-rated tools packed! Airlock open—begin Step 1 along the station truss.',
    });
  };

  const handleStageChoice = (optionId: string) => {
    if (phase !== 'repair-walk') return;
    const stage = activeStages[stageIndex];
    const chosen = stage.options.find((o) => o.id === optionId);
    if (!chosen) return;

    const nextOxygen = Math.max(0, oxygen - chosen.oxygenCost);
    const integrityLoss =
      optionId !== stage.correctOptionId
        ? chosen.integrityDelta ??
          (optionId.includes('unclip') || optionId.includes('open') ? -35 : -10)
        : 0;
    const nextIntegrity = Math.max(0, suitIntegrity + integrityLoss);

    setOxygen(nextOxygen);
    setSuitIntegrity(nextIntegrity);

    if (optionId === 'dual-tether' || optionId === 'step-cooling') {
      setTetherStatus('dual-locked');
      onTaskUnlocked?.('eva-2');
    } else if (optionId.includes('unclip') || optionId.includes('push-free')) {
      setTetherStatus('warning-unclipped');
    }

    if (nextIntegrity <= 25 && optionId !== stage.correctOptionId) {
      setMistakesCount((m) => m + 1);
      setPhase('suit-breached');
      setFeedback({
        tone: 'warning',
        text: `${chosen.feedback} Suit safety integrity dropped below 25%—emergency abort to airlock!`,
      });
      return;
    }

    if (nextOxygen <= 0 && optionId !== stage.correctOptionId) {
      setMistakesCount((m) => m + 1);
      setPhase('oxygen-depleted');
      setFeedback({
        tone: 'warning',
        text: `${chosen.feedback} Your suit oxygen tank hit 0%—emergency airlock recall activated!`,
      });
      return;
    }

    if (optionId !== stage.correctOptionId) {
      setMistakesCount((m) => m + 1);
      if (nextOxygen <= 0) {
        setPhase('oxygen-depleted');
      }
      setFeedback({
        tone: 'warning',
        text: `${chosen.feedback} (-${chosen.oxygenCost}% O₂)`,
      });
      return;
    }

    // Correct choice!
    const isLastStage = stageIndex >= activeStages.length - 1;
    if (isLastStage) {
      if (nextOxygen <= 0) {
        setPhase('oxygen-depleted');
        setFeedback({
          tone: 'warning',
          text: 'You finished the repair right as your oxygen hit 0%! Retry and aim to conserve reserve oxygen.',
        });
        return;
      }
      setTetherStatus('airlock-sealed');
      const computed = calculateSpacewalkScore(nextOxygen, mistakesCount);
      setFinalScore(computed);
      setPhase('completed');
      setFeedback({
        tone: 'success',
        text: chosen.feedback,
      });
      return;
    }

    if (nextOxygen <= 0) {
      setPhase('oxygen-depleted');
      setFeedback({
        tone: 'warning',
        text: 'Oxygen tank hit 0% before completing all repair steps! Retry with accurate tool choices.',
      });
      return;
    }

    setStageIndex((idx) => idx + 1);
    setFeedback({
      tone: 'success',
      text: `${chosen.feedback} (-${chosen.oxygenCost}% O₂)`,
    });
  };

  const resetForScenario = (nextScenario: SpacewalkScenarioId) => {
    setScenarioId(nextScenario);
    setPhase('tool-prep');
    setSelectedToolIds([]);
    setOxygen(100);
    setSuitIntegrity(100);
    setTetherStatus('airlock-standby');
    setStageIndex(0);
    setMistakesCount(0);
    setFinalScore(null);
    setFeedback({
      tone: 'info',
      text: 'Choose 3 space-certified tools for your EVA tool belt before opening the airlock.',
    });
  };

  const handleRetry = () => {
    resetForScenario(scenarioId);
  };

  const currentStage = activeStages[stageIndex];

  return (
    <Card
      variant="elevated"
      topAccentClassName="from-sky-400/85 via-cyan-300/75 to-transparent"
      className="space-y-6"
    >
      {/* Header + Live Oxygen, Suit Integrity & Tether HUD */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <BadgePill
              tone="cyan"
              dot
              icon={<Compass className="h-3.5 w-3.5" />}
            >
              Interactive EVA Repair Challenge
            </BadgePill>
            {isCertified && (
              <BadgePill
                tone="emerald"
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              >
                Deck Certified
              </BadgePill>
            )}
            <BadgePill
              tone={oxygen <= 25 ? 'rose' : 'emerald'}
              icon={<Wind className="h-3.5 w-3.5" />}
            >
              Suit Oxygen: {oxygen}%
            </BadgePill>
            <BadgePill
              tone={suitIntegrity <= 50 ? 'amber' : 'cyan'}
              icon={<Shield className="h-3.5 w-3.5" />}
            >
              Suit Integrity: {suitIntegrity}%
            </BadgePill>
            <BadgePill
              tone={
                tetherStatus === 'warning-unclipped'
                  ? 'rose'
                  : tetherStatus === 'dual-locked' ||
                      tetherStatus === 'airlock-sealed'
                    ? 'emerald'
                    : 'neutral'
              }
              icon={<Link2 className="h-3.5 w-3.5" />}
            >
              Tether:{' '}
              {tetherStatus === 'airlock-standby'
                ? 'Airlock Standby'
                : tetherStatus === 'dual-locked'
                  ? 'Dual-Hook Locked'
                  : tetherStatus === 'warning-unclipped'
                    ? 'UNCLIPPED WARNING'
                    : 'Inside Airlock Seal'}
            </BadgePill>
          </div>
          <h2 className="mt-2 font-display text-xl font-bold text-slate-50 sm:text-2xl">
            Spacewalk Solar Array Repair Mission
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Pack the right space-rated tools, lock your dual safety tether, and
            protect both suit oxygen and thermal/hull integrity!
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-space-border bg-space-void/75 p-3.5 lg:w-72">
          <div className="min-w-0 flex-1">
            <ProgressBar
              label="Oxygen Tank (O₂)"
              value={oxygen}
              fillClassName={
                oxygen <= 20
                  ? 'bg-rose-400'
                  : oxygen <= 45
                    ? 'bg-amber-400'
                    : 'bg-sky-400'
              }
              helperText={
                oxygen <= 20
                  ? 'Critical reserve — choose carefully!'
                  : `${mistakesCount} mistake${mistakesCount === 1 ? '' : 's'} logged`
              }
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={handleRetry}
            aria-label="Restart Spacewalk"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Scenario Switcher & Simplified Model Disclosure */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-space-border bg-space-void/70 p-3">
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Spacewalk mission scenario"
        >
          <button
            type="button"
            aria-pressed={scenarioId === 'solar-repair'}
            onClick={() => resetForScenario('solar-repair')}
            className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              scenarioId === 'solar-repair'
                ? 'border-sky-400/60 bg-sky-400/18 text-sky-100'
                : 'border-space-border bg-space-navy text-slate-300 hover:border-sky-400/40'
            }`}
          >
            Mission 1: Solar Array Repair
          </button>
          <button
            type="button"
            aria-pressed={scenarioId === 'eva-emergency'}
            onClick={() => resetForScenario('eva-emergency')}
            className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              scenarioId === 'eva-emergency'
                ? 'border-amber-400/60 bg-amber-400/18 text-amber-100'
                : 'border-space-border bg-space-navy text-slate-300 hover:border-amber-400/40'
            }`}
          >
            Mission 2: EVA Cooling &amp; Micrometeoroid Anomaly
          </button>
        </div>

        <button
          type="button"
          aria-expanded={showModelInfo}
          onClick={() => setShowModelInfo((v) => !v)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-space-border bg-space-navy px-2.5 py-1 text-[11px] font-medium text-sky-300 hover:border-sky-400/45"
        >
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          {showModelInfo ? 'Hide Model Note' : 'Simplified EVA Model'}
        </button>
      </div>

      {showModelInfo && (
        <div className="rounded-xl border border-sky-400/30 bg-sky-500/8 p-3.5 text-xs leading-relaxed text-slate-200">
          <strong className="text-sky-200">
            Scientific Grounding vs. Classroom Model:
          </strong>{' '}
          Real NASA EMUs run at ~29.6 kPa pure O₂ with continuous LCVG chilled
          water cooling across 6–8 hour EVAs. ANANTRA compresses those protocols
          into a 4-stage tactical simulation using discrete O₂ reserve %, Suit
          Integrity %, and Dual-Hook Tether checks so safety priorities stay
          crystal clear.
        </div>
      )}

      {/* Station Progress Stepper */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <div
          className={`rounded-xl border px-3 py-2 text-xs ${
            phase === 'tool-prep'
              ? 'border-sky-400/60 bg-sky-400/15 font-semibold text-sky-100'
              : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
          }`}
        >
          <span className="font-mono text-[10px] uppercase">Prep</span>
          <p className="truncate">Pack EVA Belt</p>
        </div>
        {activeStages.map((st, idx) => {
          const isCurrent = phase === 'repair-walk' && idx === stageIndex;
          const isDone =
            phase === 'completed' ||
            (phase === 'repair-walk' && idx < stageIndex);
          return (
            <div
              key={st.id}
              className={`rounded-xl border px-3 py-2 text-xs ${
                isDone
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                  : isCurrent
                    ? 'border-sky-400/60 bg-sky-400/15 font-semibold text-sky-100'
                    : 'border-space-border bg-space-void/55 text-slate-400'
              }`}
            >
              <span className="font-mono text-[10px] uppercase">
                Step 0{st.stepNumber}
              </span>
              <p className="truncate">{st.stationName}</p>
            </div>
          );
        })}
      </div>

      {/* Live Feedback Banner */}
      <div
        role="status"
        aria-live="polite"
        className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm ${
          feedback.tone === 'success'
            ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
            : feedback.tone === 'warning'
              ? 'border-amber-400/45 bg-amber-500/12 text-amber-100'
              : 'border-sky-400/35 bg-sky-500/10 text-sky-100'
        }`}
      >
        {feedback.tone === 'success' ? (
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300"
            aria-hidden="true"
          />
        ) : feedback.tone === 'warning' ? (
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-300"
            aria-hidden="true"
          />
        ) : (
          <Wrench
            className="mt-0.5 h-5 w-5 shrink-0 text-sky-300"
            aria-hidden="true"
          />
        )}
        <p>{feedback.text}</p>
      </div>

      {/* PHASE 1: Tool Belt Preparation */}
      {phase === 'tool-prep' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-50">
                Airlock Locker: Select 3 Space-Certified Tools
              </h3>
              <p className="text-xs text-slate-400">
                Selected: {selectedToolIds.length} / 3 slots filled
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              disabled={selectedToolIds.length !== 3}
              leftIcon={<ShieldCheck className="h-4 w-4" />}
              onClick={handleExitAirlock}
            >
              Verify Kit &amp; Exit Airlock
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {EVA_TOOL_LOCKER.map((tool) => {
              const selected = selectedToolIds.includes(tool.id);
              const maxReached = selectedToolIds.length >= 3 && !selected;
              return (
                <button
                  key={tool.id}
                  type="button"
                  aria-pressed={selected}
                  disabled={maxReached}
                  onClick={() => toggleTool(tool.id)}
                  className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 ${
                    selected
                      ? 'border-sky-400 bg-sky-400/15 text-slate-50 shadow-[inset_0_1px_0_rgba(125,211,252,0.2)]'
                      : 'border-space-border bg-space-void/70 text-slate-200 hover:border-sky-400/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-sky-300">
                        {tool.category}
                      </span>
                      {selected && (
                        <CheckCircle2
                          className="h-4 w-4 text-sky-300"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <p className="mt-1 font-display text-base font-semibold">
                      {tool.name}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">
                      {tool.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PHASE 2: 4-Stage EVA Walk */}
      {phase === 'repair-walk' && (
        <div className="space-y-4 rounded-2xl border border-space-border bg-space-void/65 p-5">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-sky-300">
              Repair Step {currentStage.stepNumber} of {activeStages.length} •{' '}
              {currentStage.stationName}
            </p>
            <h3 className="mt-1 font-display text-lg font-bold text-slate-50">
              {currentStage.prompt}
            </h3>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {currentStage.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleStageChoice(opt.id)}
                className="flex cursor-pointer flex-col justify-between rounded-xl border border-space-border bg-space-navy/90 p-4 text-left transition-all hover:border-sky-400/55 hover:bg-space-slate"
              >
                <span className="text-sm font-semibold text-slate-100">
                  {opt.label}
                </span>
                <span className="mt-3 font-mono text-xs text-sky-300">
                  Est. O₂ cost: -{opt.oxygenCost}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PHASE 3: Mission Success State */}
      {phase === 'completed' && finalScore && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-emerald-400/45 bg-emerald-500/12 p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles
                  className="h-5 w-5 text-emerald-300"
                  aria-hidden="true"
                />
                <h3 className="font-display text-lg font-bold text-emerald-100">
                  {scenarioId === 'eva-emergency'
                    ? 'EVA Emergency Managed! Spacewalk Complete'
                    : 'Solar Array Repaired! Spacewalk Complete'}
                </h3>
              </div>
              <p className="mt-1 text-sm text-emerald-100/90">
                You returned safely to the airlock with{' '}
                <strong className="font-mono">{oxygen}% O₂</strong> and{' '}
                <strong className="font-mono">{suitIntegrity}%</strong> suit
                integrity remaining.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-emerald-400/35 bg-space-void/70 px-4 py-2.5">
              <div
                className="flex items-center gap-0.5 text-amber-300"
                aria-label={`${finalScore.stars} out of 3 stars`}
              >
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s <= finalScore.stars
                        ? 'fill-amber-300'
                        : 'text-slate-600'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="font-mono text-lg font-bold text-emerald-200">
                {finalScore.total} pts
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-400/25 bg-space-void/60 p-2.5 text-xs">
              <p className="text-slate-400">EVA Completed</p>
              <p className="font-mono font-bold text-emerald-300">
                +{finalScore.completionBonus} pts
              </p>
            </div>
            <div className="rounded-xl border border-emerald-400/25 bg-space-void/60 p-2.5 text-xs">
              <p className="text-slate-400">Oxygen Conserved</p>
              <p className="font-mono font-bold text-emerald-300">
                +{finalScore.oxygenBonus} pts
              </p>
            </div>
            <div className="rounded-xl border border-emerald-400/25 bg-space-void/60 p-2.5 text-xs">
              <p className="text-slate-400">Tool Accuracy</p>
              <p className="font-mono font-bold text-emerald-300">
                +{finalScore.accuracyBonus} pts
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<RotateCcw className="h-4 w-4" />}
              onClick={handleRetry}
            >
              Replay Spacewalk
            </Button>
            {scenarioId === 'solar-repair' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => resetForScenario('eva-emergency')}
              >
                Try EVA Emergency Scenario
              </Button>
            )}
          </div>
        </div>
      )}

      {/* PHASE 4: Oxygen Depleted or Suit Integrity Breached */}
      {(phase === 'oxygen-depleted' || phase === 'suit-breached') && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col gap-4 rounded-2xl border border-rose-400/45 bg-rose-500/12 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <Award
              className="mt-0.5 h-5 w-5 shrink-0 text-rose-300"
              aria-hidden="true"
            />
            <div>
              <h3 className="font-display text-lg font-bold text-rose-100">
                {phase === 'suit-breached'
                  ? 'Suit Safety Threshold Breached — Airlock Abort'
                  : 'Oxygen Depleted — Airlock Recall'}
              </h3>
              <p className="mt-1 text-sm text-rose-100/90">
                {phase === 'suit-breached'
                  ? 'Unsafe EVA maneuvers damaged suit safety margins below 25%. Keep Dual Tethers locked and use only certified EVA hardware!'
                  : 'Your suit’s O₂ tank hit 0% before completing the spacewalk. Review each tool’s purpose and try again with a fresh tank!'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {onDebriefWithMentor && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Bot className="h-4 w-4" />}
                onClick={onDebriefWithMentor}
              >
                Debrief With ARIA
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              leftIcon={<RotateCcw className="h-4 w-4" />}
              onClick={handleRetry}
            >
              Retry Spacewalk
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
