import type { TrainingState } from '../types/training';

export function createSampleTrainingState(): TrainingState {
  const now = new Date().toISOString();
  return {
    version: 2,
    profile: {
      id: 'cadet-nova-07',
      name: 'Maya Vance',
      callsign: 'NOVA-07',
      cohort: 'Artemis Junior Cadets',
      missionDay: 3,
    },
    progressByModule: {
      academy: {
        completedTaskIds: ['academy-1', 'academy-2'],
        lastVisitedAt: now,
      },
      'mission-control': {
        completedTaskIds: ['mc-1'],
        lastVisitedAt: now,
      },
      'zero-gravity-lab': {
        completedTaskIds: [],
      },
      'spacewalk-training': {
        completedTaskIds: [],
      },
      'emergency-training': {
        completedTaskIds: [],
      },
      'ai-mentor': {
        completedTaskIds: [],
      },
    },
    moduleRecords: {},
    activityHistory: [],
    academyStudiedLessonIds: ['spaceflight-fundamentals', 'rocket-science', 'orbital-mechanics'],
    academyBestQuizScore: null,
    mentorBestQuizScore: null,
    guidedProgression: false,
    issuedCertificates: [],
    updatedAt: now,
  };
}

export function createBlankTrainingState(): TrainingState {
  const now = new Date().toISOString();
  return {
    version: 2,
    profile: {
      id: 'cadet-nova-07',
      name: 'Maya Vance',
      callsign: 'NOVA-07',
      cohort: 'Artemis Junior Cadets',
      missionDay: 1,
    },
    progressByModule: {
      academy: { completedTaskIds: [] },
      'mission-control': { completedTaskIds: [] },
      'zero-gravity-lab': { completedTaskIds: [] },
      'spacewalk-training': { completedTaskIds: [] },
      'emergency-training': { completedTaskIds: [] },
      'ai-mentor': { completedTaskIds: [] },
    },
    moduleRecords: {},
    activityHistory: [],
    academyStudiedLessonIds: [],
    academyBestQuizScore: null,
    mentorBestQuizScore: null,
    guidedProgression: false,
    issuedCertificates: [],
    updatedAt: now,
  };
}
