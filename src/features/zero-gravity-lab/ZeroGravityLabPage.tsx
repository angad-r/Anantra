import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModuleSandbox } from '../../components/module-template/ModuleSandbox';
import { useTraining } from '../../context/TrainingContext';
import { getModuleCompletion } from '../../utils/progress';
import {
  ZeroGravityLabActivity,
  type ZeroGOutcomeReport,
} from './ZeroGravityLabActivity';
import { zeroGravityLabData } from './zeroGravityData';

export function ZeroGravityLabPage() {
  const navigate = useNavigate();
  const { state, recordModuleAttempt, toggleTask } = useTraining();
  const summary = getModuleCompletion(
    zeroGravityLabData,
    state.progressByModule['zero-gravity-lab'],
  );

  const handleTaskUnlocked = useCallback(
    (taskId: 'zg-1' | 'zg-2' | 'zg-3') => {
      const done =
        state.progressByModule['zero-gravity-lab'].completedTaskIds ?? [];
      if (!done.includes(taskId)) {
        toggleTask('zero-gravity-lab', taskId);
      }
    },
    [state.progressByModule, toggleTask],
  );

  const handleLabOutcome = useCallback(
    (report: ZeroGOutcomeReport) => {
      recordModuleAttempt({
        moduleId: 'zero-gravity-lab',
        outcome: report.outcome,
        score: report.score,
        maxScore: report.maxScore,
        summary: report.summary,
        failureReason: report.failureReason,
        telemetrySummary: report.telemetrySummary,
        autoCompleteModule: report.allChallengesMastered,
      });
    },
    [recordModuleAttempt],
  );

  const handleDebrief = useCallback(() => {
    navigate('/ai-mentor?debrief=zero-gravity-lab');
  }, [navigate]);

  return (
    <ModuleSandbox module={zeroGravityLabData}>
      <ZeroGravityLabActivity
        onTaskUnlocked={handleTaskUnlocked}
        onLabOutcome={handleLabOutcome}
        onDebriefWithMentor={handleDebrief}
        isCertified={summary.status === 'completed'}
      />
    </ModuleSandbox>
  );
}
