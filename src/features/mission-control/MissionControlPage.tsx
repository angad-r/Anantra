import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModuleSandbox } from '../../components/module-template/ModuleSandbox';
import { useTraining } from '../../context/TrainingContext';
import { getModuleCompletion } from '../../utils/progress';
import {
  MoonLandingSimulator,
  type LunarOutcomeReport,
} from './MoonLandingSimulator';
import { missionControlData } from './missionControlData';

export function MissionControlPage() {
  const navigate = useNavigate();
  const { state, completeModule, recordModuleAttempt } = useTraining();
  const summary = getModuleCompletion(
    missionControlData,
    state.progressByModule['mission-control'],
  );

  const handleMissionComplete = useCallback(() => {
    completeModule('mission-control');
  }, [completeModule]);

  const handleMissionOutcome = useCallback(
    (report: LunarOutcomeReport) => {
      recordModuleAttempt({
        moduleId: 'mission-control',
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

  const handleDebriefWithMentor = useCallback(() => {
    navigate('/ai-mentor?debrief=mission-control');
  }, [navigate]);

  return (
    <ModuleSandbox module={missionControlData}>
      <MoonLandingSimulator
        onMissionComplete={handleMissionComplete}
        onMissionOutcome={handleMissionOutcome}
        onDebriefWithMentor={handleDebriefWithMentor}
        missionCompleted={summary.status === 'completed'}
      />
    </ModuleSandbox>
  );
}
