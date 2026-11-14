import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModuleSandbox } from '../../components/module-template/ModuleSandbox';
import { useTraining } from '../../context/TrainingContext';
import { getModuleCompletion } from '../../utils/progress';
import {
  SpacewalkActivity,
  type SpacewalkOutcomeReport,
} from './SpacewalkActivity';
import { spacewalkData } from './spacewalkData';

export function SpacewalkTrainingPage() {
  const navigate = useNavigate();
  const { state, recordModuleAttempt, toggleTask } = useTraining();
  const summary = getModuleCompletion(
    spacewalkData,
    state.progressByModule['spacewalk-training'],
  );

  const handleTaskUnlocked = useCallback(
    (taskId: 'eva-1' | 'eva-2' | 'eva-3') => {
      const done =
        state.progressByModule['spacewalk-training'].completedTaskIds ?? [];
      if (!done.includes(taskId)) {
        toggleTask('spacewalk-training', taskId);
      }
    },
    [state.progressByModule, toggleTask],
  );

  const handleEvaOutcome = useCallback(
    (report: SpacewalkOutcomeReport) => {
      recordModuleAttempt({
        moduleId: 'spacewalk-training',
        outcome: report.outcome,
        score: report.score,
        maxScore: report.maxScore,
        summary: report.summary,
        failureReason: report.failureReason,
        telemetrySummary: report.telemetrySummary,
        autoCompleteModule: report.outcome === 'success',
      });
    },
    [recordModuleAttempt],
  );

  const handleDebrief = useCallback(() => {
    navigate('/ai-mentor?debrief=spacewalk-training');
  }, [navigate]);

  return (
    <ModuleSandbox module={spacewalkData}>
      <SpacewalkActivity
        onTaskUnlocked={handleTaskUnlocked}
        onEvaOutcome={handleEvaOutcome}
        onDebriefWithMentor={handleDebrief}
        isCertified={summary.status === 'completed'}
      />
    </ModuleSandbox>
  );
}
