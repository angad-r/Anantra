import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModuleSandbox } from '../../components/module-template/ModuleSandbox';
import { useTraining } from '../../context/TrainingContext';
import { getModuleCompletion } from '../../utils/progress';
import {
  EmergencyMiniChallenge,
  type EmergencyOutcomeReport,
} from './EmergencyMiniChallenge';
import { emergencyData } from './emergencyData';

export function EmergencyTrainingPage() {
  const navigate = useNavigate();
  const { state, recordModuleAttempt, toggleTask } = useTraining();
  const summary = getModuleCompletion(
    emergencyData,
    state.progressByModule['emergency-training'],
  );

  const handleTaskUnlocked = useCallback(
    (taskId: 'emg-1' | 'emg-2' | 'emg-3') => {
      const done =
        state.progressByModule['emergency-training'].completedTaskIds ?? [];
      if (!done.includes(taskId)) {
        toggleTask('emergency-training', taskId);
      }
    },
    [state.progressByModule, toggleTask],
  );

  const handleDrillOutcome = useCallback(
    (report: EmergencyOutcomeReport) => {
      recordModuleAttempt({
        moduleId: 'emergency-training',
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
    navigate('/ai-mentor?debrief=emergency-training');
  }, [navigate]);

  return (
    <ModuleSandbox module={emergencyData}>
      <EmergencyMiniChallenge
        onTaskUnlocked={handleTaskUnlocked}
        onDrillOutcome={handleDrillOutcome}
        onDebriefWithMentor={handleDebrief}
        isCertified={summary.status === 'completed'}
      />
    </ModuleSandbox>
  );
}
