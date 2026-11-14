import { useCallback } from 'react';
import { ModuleSandbox } from '../../components/module-template/ModuleSandbox';
import { useTraining } from '../../context/TrainingContext';
import { getModuleCompletion } from '../../utils/progress';
import { AcademyActivity } from './AcademyActivity';
import { academyData } from './academyData';

export function AcademyPage() {
  const {
    state,
    completeModule,
    saveAcademyProgress,
    recordModuleAttempt,
  } = useTraining();
  const summary = getModuleCompletion(
    academyData,
    state.progressByModule.academy,
  );

  const handleCertifyAcademy = useCallback(() => {
    completeModule('academy');
  }, [completeModule]);

  const handleStudiedChange = useCallback(
    (studiedIds: string[]) => {
      saveAcademyProgress(studiedIds, state.academyBestQuizScore ?? null);
    },
    [saveAcademyProgress, state.academyBestQuizScore],
  );

  const handleQuizFinish = useCallback(
    (score: number, total: number, passed: boolean) => {
      const nextBest =
        state.academyBestQuizScore != null
          ? Math.max(state.academyBestQuizScore, score)
          : score;
      saveAcademyProgress(state.academyStudiedLessonIds ?? [], nextBest);
      recordModuleAttempt({
        moduleId: 'academy',
        outcome: passed ? 'success' : 'retry',
        score,
        maxScore: total,
        summary: passed
          ? `Academy Mastery Quiz passed (${score}/${total})`
          : `Academy Mastery Quiz completed (${score}/${total} — aim for 7+ to certify)`,
        failureReason: passed
          ? undefined
          : `Scored ${score}/${total} on 10-topic Space Science Mastery Quiz (passing threshold is 7/${total}).`,
        telemetrySummary: `${(state.academyStudiedLessonIds ?? []).length}/10 topics studied • Quiz score ${score}/${total}`,
        autoCompleteModule: passed,
      });
    },
    [
      recordModuleAttempt,
      saveAcademyProgress,
      state.academyBestQuizScore,
      state.academyStudiedLessonIds,
    ],
  );

  return (
    <ModuleSandbox module={academyData}>
      <AcademyActivity
        onCertifyAcademy={handleCertifyAcademy}
        isCertified={summary.status === 'completed'}
        initialStudiedIds={state.academyStudiedLessonIds ?? []}
        initialBestQuizScore={state.academyBestQuizScore ?? null}
        onStudiedChange={handleStudiedChange}
        onQuizFinish={handleQuizFinish}
      />
    </ModuleSandbox>
  );
}
