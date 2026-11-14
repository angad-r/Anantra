import {
  Activity,
  Bot,
  CheckCircle2,
  Info,
  Radio,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Wind,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BadgePill } from '../../components/ui/BadgePill';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import {
  EMERGENCY_SCENARIOS,
  EXTENDED_CRISIS_SCENARIOS,
  type EmergencyDeckId,
} from './emergencyChallengeData';

type DrillStatus = 'active' | 'passed' | 'retry-needed';

interface DecisionLogItem {
  alertCode: string;
  choiceLabel: string;
  correct: boolean;
  feedback: string;
}

export interface EmergencyOutcomeReport {
  outcome: 'success' | 'retry';
  deckId: EmergencyDeckId;
  score: number;
  maxScore: number;
  summary: string;
  failureReason?: string;
  telemetrySummary: string;
}

export interface EmergencyMiniChallengeProps {
  onTaskUnlocked?: (taskId: 'emg-1' | 'emg-2' | 'emg-3') => void;
  onDrillOutcome?: (report: EmergencyOutcomeReport) => void;
  onDebriefWithMentor?: () => void;
  isCertified?: boolean;
}

export function EmergencyMiniChallenge({
  onTaskUnlocked,
  onDrillOutcome,
  onDebriefWithMentor,
  isCertified = false,
}: EmergencyMiniChallengeProps = {}) {
  const [deckId, setDeckId] = useState<EmergencyDeckId>('core-triad');
  const [scenarioIndex, setScenarioIndex] = useState<number>(0);
  const [safety, setSafety] = useState<number>(100);
  const [score, setScore] = useState<number>(0);
  const [status, setStatus] = useState<DrillStatus>('active');
  const [decisionLog, setDecisionLog] = useState<DecisionLogItem[]>([]);
  const [showModelInfo, setShowModelInfo] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    tone: 'info' | 'success' | 'warning';
    text: string;
  }>({
    tone: 'info',
    text: 'Follow real astronaut checklist priorities: protect crew life support first, stabilize systems, and confirm.',
  });

  const activeScenarios =
    deckId === 'full-crisis' ? EXTENDED_CRISIS_SCENARIOS : EMERGENCY_SCENARIOS;
  const maxPossibleScore = activeScenarios.length * 100;
  const current = activeScenarios[scenarioIndex];
  const prevStatusRef = useRef<DrillStatus>(status);

  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    if (prev === status || status === 'active') return;

    const errorsLogged = decisionLog.filter((item) => !item.correct).length;
    onDrillOutcome?.({
      outcome: status === 'passed' ? 'success' : 'retry',
      deckId,
      score,
      maxScore: maxPossibleScore,
      summary:
        status === 'passed'
          ? `Stabilized ${activeScenarios.length}/${activeScenarios.length} station alerts (${safety}% safety)`
          : 'Emergency safety threshold breached (< 25%) — review life-support triage',
      failureReason:
        status === 'retry-needed'
          ? `Station safety dropped to ${safety}% after ${errorsLogged} high-risk triage decision${errorsLogged === 1 ? '' : 's'}.`
          : undefined,
      telemetrySummary: `Deck=${deckId} | Score=${score}/${maxPossibleScore} | Safety=${safety}%`,
    });
  }, [
    activeScenarios.length,
    decisionLog,
    deckId,
    maxPossibleScore,
    onDrillOutcome,
    safety,
    score,
    status,
  ]);

  const handleDecision = (optionId: string) => {
    if (status !== 'active') return;
    const chosen = current.options.find((o) => o.id === optionId);
    if (!chosen) return;

    const isRight = optionId === current.correctActionId;
    const nextSafety = Math.max(0, safety + chosen.safetyDelta);
    setSafety(nextSafety);
    setDecisionLog((prev) => [
      ...prev,
      {
        alertCode: current.alertCode,
        choiceLabel: chosen.label,
        correct: isRight,
        feedback: chosen.feedback,
      },
    ]);

    if (!isRight) {
      if (nextSafety < 25) {
        setStatus('retry-needed');
        setFeedback({
          tone: 'warning',
          text: `${chosen.feedback} Station safety dropped too low—reset and run the checklist calmly!`,
        });
      } else {
        setFeedback({
          tone: 'warning',
          text: `${chosen.feedback} (${chosen.safetyDelta}% safety)`,
        });
      }
      return;
    }

    if (current.id === 'emg-power') onTaskUnlocked?.('emg-1');
    if (current.id === 'emg-pressure') onTaskUnlocked?.('emg-2');
    if (current.id === 'emg-radiation') onTaskUnlocked?.('emg-3');

    const nextScore = score + 100;
    setScore(nextScore);

    if (scenarioIndex >= activeScenarios.length - 1) {
      setStatus('passed');
      setFeedback({
        tone: 'success',
        text: chosen.feedback,
      });
      return;
    }

    setScenarioIndex((idx) => idx + 1);
    setFeedback({
      tone: 'success',
      text: `${chosen.feedback} (+100 pts)`,
    });
  };

  const resetForDeck = (nextDeck: EmergencyDeckId) => {
    setDeckId(nextDeck);
    setScenarioIndex(0);
    setSafety(100);
    setScore(0);
    setStatus('active');
    setDecisionLog([]);
    setFeedback({
      tone: 'info',
      text: 'Follow real astronaut checklist priorities: protect crew life support first, stabilize systems, and confirm.',
    });
  };

  const handleRestart = () => {
    resetForDeck(deckId);
  };

  // Live station telemetry gauge estimates based on remaining active fault
  const pressureKpa =
    status === 'passed'
      ? '101.3 kPa'
      : current.telemetryDomain === 'pressure'
        ? '94.8 kPa ↓'
        : '101.1 kPa';
  const o2Status =
    status === 'passed'
      ? '21.0% Nominal'
      : current.telemetryDomain === 'oxygen'
        ? 'CO₂ Rising!'
        : '20.9% Nominal';
  const powerBus =
    status === 'passed'
      ? '118 kW Nominal'
      : current.telemetryDomain === 'power'
        ? '56 kW Low Bus'
        : '112 kW Steady';
  const commsLink =
    status === 'passed'
      ? 'TDRS Locked'
      : current.telemetryDomain === 'comms'
        ? 'HGA Stall!'
        : 'S-Band Nominal';

  return (
    <Card
      variant="elevated"
      topAccentClassName="from-rose-400/85 via-amber-300/70 to-transparent"
      className="space-y-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <BadgePill tone={status === 'passed' ? 'emerald' : 'rose'} dot>
              Emergency Response Mini-Challenge
            </BadgePill>
            {isCertified && (
              <BadgePill
                tone="emerald"
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              >
                Deck Certified
              </BadgePill>
            )}
            <BadgePill tone="amber">
              Score: {score} / {maxPossibleScore} pts
            </BadgePill>
          </div>
          <h2 className="mt-2 font-display text-xl font-bold text-slate-50">
            Orbital Alert Priority Drill
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Respond calmly to {activeScenarios.length} simulated station anomalies
            without letting station safety fall below 25%.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-space-border bg-space-void/75 p-3 sm:w-64">
          <div className="min-w-0 flex-1">
            <ProgressBar
              label="Station Safety"
              value={safety}
              fillClassName={
                safety <= 35
                  ? 'bg-rose-400'
                  : safety <= 70
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
              }
              size="sm"
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={handleRestart}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Mode Switcher & Live Station Telemetry Matrix */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-space-border bg-space-void/70 p-3">
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Emergency drill difficulty deck"
        >
          <button
            type="button"
            aria-pressed={deckId === 'core-triad'}
            onClick={() => resetForDeck('core-triad')}
            className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              deckId === 'core-triad'
                ? 'border-sky-400/60 bg-sky-400/18 text-sky-100'
                : 'border-space-border bg-space-navy text-slate-300 hover:border-sky-400/40'
            }`}
          >
            Drill 1: Core Triad (3 Alerts • 300 pts)
          </button>
          <button
            type="button"
            aria-pressed={deckId === 'full-crisis'}
            onClick={() => resetForDeck('full-crisis')}
            className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              deckId === 'full-crisis'
                ? 'border-rose-400/60 bg-rose-500/18 text-rose-100'
                : 'border-space-border bg-space-navy text-slate-300 hover:border-rose-400/40'
            }`}
          >
            Drill 2: Full Station Crisis (O₂ + Comms • 500 pts)
          </button>
        </div>

        <button
          type="button"
          aria-expanded={showModelInfo}
          onClick={() => setShowModelInfo((v) => !v)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-space-border bg-space-navy px-2.5 py-1 text-[11px] font-medium text-sky-300 hover:border-sky-400/45"
        >
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          {showModelInfo ? 'Hide Model Note' : 'Simplified Triage Model'}
        </button>
      </div>

      {showModelInfo && (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/8 p-3.5 text-xs leading-relaxed text-slate-200">
          <strong className="text-rose-200">
            Scientific Grounding vs. Classroom Model:
          </strong>{' '}
          Real NASA ISS Flight Rules track live pressure curves, partial O₂/CO₂
          mmHg readings, and multi-console voice loops. ANANTRA simplifies
          emergency triage into sequential decision scenarios using clear
          life-support-first priorities with zero unfair countdown timers.
        </div>
      )}

      {/* Station Telemetry Board */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-xl border border-space-border bg-space-void/70 p-2.5 text-xs">
          <p className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">
            <Activity className="h-3 w-3 text-sky-300" aria-hidden="true" />
            Cabin Pressure
          </p>
          <p
            className={`mt-1 font-mono font-bold ${
              pressureKpa.includes('↓') ? 'text-rose-300' : 'text-emerald-300'
            }`}
          >
            {pressureKpa}
          </p>
        </div>
        <div className="rounded-xl border border-space-border bg-space-void/70 p-2.5 text-xs">
          <p className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">
            <Wind className="h-3 w-3 text-cyan-300" aria-hidden="true" />
            O₂ / Scrubbers
          </p>
          <p
            className={`mt-1 font-mono font-bold ${
              o2Status.includes('Rising') ? 'text-rose-300' : 'text-emerald-300'
            }`}
          >
            {o2Status}
          </p>
        </div>
        <div className="rounded-xl border border-space-border bg-space-void/70 p-2.5 text-xs">
          <p className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">
            <Zap className="h-3 w-3 text-amber-300" aria-hidden="true" />
            Power Bus
          </p>
          <p
            className={`mt-1 font-mono font-bold ${
              powerBus.includes('Low') ? 'text-amber-300' : 'text-emerald-300'
            }`}
          >
            {powerBus}
          </p>
        </div>
        <div className="rounded-xl border border-space-border bg-space-void/70 p-2.5 text-xs">
          <p className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">
            <Radio className="h-3 w-3 text-violet-300" aria-hidden="true" />
            Comms Link
          </p>
          <p
            className={`mt-1 font-mono font-bold ${
              commsLink.includes('Stall') ? 'text-rose-300' : 'text-emerald-300'
            }`}
          >
            {commsLink}
          </p>
        </div>
      </div>

      {/* Feedback Banner */}
      <div
        role="status"
        aria-live="polite"
        className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm ${
          feedback.tone === 'success'
            ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
            : feedback.tone === 'warning'
              ? 'border-rose-400/45 bg-rose-500/12 text-rose-100'
              : 'border-sky-400/35 bg-sky-500/10 text-sky-100'
        }`}
      >
        {feedback.tone === 'success' ? (
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300"
            aria-hidden="true"
          />
        ) : feedback.tone === 'warning' ? (
          <TriangleAlert
            className="mt-0.5 h-5 w-5 shrink-0 text-rose-300"
            aria-hidden="true"
          />
        ) : (
          <ShieldAlert
            className="mt-0.5 h-5 w-5 shrink-0 text-sky-300"
            aria-hidden="true"
          />
        )}
        <p>{feedback.text}</p>
      </div>

      {status === 'active' && (
        <div className="space-y-4 rounded-2xl border border-space-border bg-space-void/65 p-5">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-rose-300">
              {current.alertCode} ({scenarioIndex + 1}/{activeScenarios.length})
            </p>
            <h3 className="mt-1 font-display text-lg font-bold text-slate-50">
              {current.title}
            </h3>
            <p className="mt-1.5 text-sm text-slate-300">{current.situation}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {current.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleDecision(opt.id)}
                className="cursor-pointer rounded-xl border border-space-border bg-space-navy/90 p-4 text-left text-sm font-medium text-slate-100 transition-colors hover:border-sky-400/50 hover:bg-space-slate"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {status === 'passed' && (
        <div
          role="status"
          aria-live="polite"
          className="space-y-4 rounded-2xl border border-emerald-400/45 bg-emerald-500/12 p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Sparkles
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-display text-lg font-bold text-emerald-100">
                  All Alerts Stabilized! Calm Crisis Commander
                </h3>
                <p className="mt-1 text-sm text-emerald-100/90">
                  You completed every emergency checklist with{' '}
                  <strong className="font-mono">{safety}%</strong> station
                  safety and <strong className="font-mono">{score} pts</strong>.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {deckId === 'core-triad' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => resetForDeck('full-crisis')}
                >
                  Try 5-Alert Full Crisis
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                leftIcon={<RotateCcw className="h-4 w-4" />}
                onClick={handleRestart}
              >
                Run Drill Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {status === 'retry-needed' && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col gap-4 rounded-2xl border border-rose-400/45 bg-rose-500/12 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-rose-300"
              aria-hidden="true"
            />
            <div>
              <h3 className="font-display text-lg font-bold text-rose-100">
                Safety Threshold Breached — Retry Drill
              </h3>
              <p className="mt-1 text-sm text-rose-100/90">
                In space emergencies, protecting breathable air, power for life
                support, communications, and radiation shielding always come
                first!
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
              onClick={handleRestart}
            >
              Retry Emergency Drill
            </Button>
          </div>
        </div>
      )}

      {/* Decision Triage Review Log (helps learners review right vs wrong steps) */}
      {decisionLog.length > 0 && (
        <div className="rounded-xl border border-space-border bg-space-void/65 p-4">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Flight Rule Triage Review ({decisionLog.length} logged)
          </p>
          <ul className="mt-2.5 space-y-2">
            {decisionLog.map((item, idx) => (
              <li
                key={`${item.alertCode}-${idx}`}
                className={`rounded-lg border p-2.5 text-xs ${
                  item.correct
                    ? 'border-emerald-400/30 bg-emerald-500/8 text-emerald-100'
                    : 'border-rose-400/30 bg-rose-500/8 text-rose-100'
                }`}
              >
                <p className="font-semibold">
                  {item.correct ? 'PASS' : 'UNSAFE'} • {item.alertCode}:{' '}
                  {item.choiceLabel}
                </p>
                <p className="mt-0.5 text-slate-300">{item.feedback}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
