import { ASTRONAUT_RANKS } from '../data/designTokens';
import type {
  AstronautRank,
  FeatureModuleData,
  ModuleAccent,
  ModuleId,
  ModuleProgress,
  ModuleStatus,
  SkillCategoryId,
  TrainingState,
} from '../types/training';

export interface ModuleCompletionSummary {
  completedCount: number;
  totalCount: number;
  percentage: number;
  status: ModuleStatus;
  earnedXp: number;
  totalPossibleXp: number;
}

export interface SkillMetric {
  id: SkillCategoryId;
  label: string;
  description: string;
  percentage: number;
  accent: ModuleAccent;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  requirement: string;
  earned: boolean;
  accent: ModuleAccent;
}

export interface ModuleUnlockState {
  unlocked: boolean;
  requirementText: string;
}

export interface PerformanceAnalytics {
  totalSimAttempts: number;
  totalPassedRuns: number;
  averageBestScorePercent: number | null;
  academyLessonsStudied: number;
  earnedAchievementsCount: number;
  totalAchievementsCount: number;
}

export interface OverallTrainingStats {
  totalXp: number;
  maxPossibleXp: number;
  completedModulesCount: number;
  inProgressModulesCount: number;
  totalModulesCount: number;
  overallPercentage: number;
  earnedPatches: { moduleId: ModuleId; patchTitle: string }[];
  currentRank: AstronautRank;
  nextRank: AstronautRank | null;
  xpToNextRank: number;
  rankProgressPercent: number;
  skillScores: SkillMetric[];
  achievements: AchievementBadge[];
  analytics: PerformanceAnalytics;
  moduleUnlocks: Record<ModuleId, ModuleUnlockState>;
}

export function getModuleCompletion(
  module: FeatureModuleData,
  progress?: ModuleProgress,
): ModuleCompletionSummary {
  const validTaskIds = new Set(module.tasks.map((task) => task.id));
  const completedIds = new Set(
    (progress?.completedTaskIds ?? []).filter((id) => validTaskIds.has(id)),
  );

  const totalCount = module.tasks.length;
  const completedCount = completedIds.size;
  const percentage =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  let status: ModuleStatus = 'not-started';
  if (totalCount > 0 && completedCount >= totalCount) {
    status = 'completed';
  } else if (completedCount > 0) {
    status = 'in-progress';
  }

  let earnedXp = 0;
  let totalPossibleXp = 0;
  for (const task of module.tasks) {
    totalPossibleXp += task.xpReward;
    if (completedIds.has(task.id)) {
      earnedXp += task.xpReward;
    }
  }

  return {
    completedCount,
    totalCount,
    percentage,
    status,
    earnedXp,
    totalPossibleXp,
  };
}

export function getRankForXp(xp: number): {
  currentRank: AstronautRank;
  nextRank: AstronautRank | null;
  xpToNextRank: number;
  rankProgressPercent: number;
} {
  let currentIndex = 0;
  for (let i = 0; i < ASTRONAUT_RANKS.length; i += 1) {
    if (xp >= ASTRONAUT_RANKS[i].minXp) {
      currentIndex = i;
    }
  }

  const currentRank = ASTRONAUT_RANKS[currentIndex];
  const nextRank = ASTRONAUT_RANKS[currentIndex + 1] ?? null;

  if (!nextRank) {
    return {
      currentRank,
      nextRank: null,
      xpToNextRank: 0,
      rankProgressPercent: 100,
    };
  }

  const span = nextRank.minXp - currentRank.minXp;
  const gainedInRank = Math.max(0, xp - currentRank.minXp);
  const rankProgressPercent =
    span <= 0 ? 100 : Math.min(100, Math.round((gainedInRank / span) * 100));

  return {
    currentRank,
    nextRank,
    xpToNextRank: Math.max(0, nextRank.minXp - xp),
    rankProgressPercent,
  };
}

export function computeSkillMetrics(
  summaryById: Record<ModuleId, ModuleCompletionSummary>,
  state: TrainingState,
): SkillMetric[] {
  const academyPct = summaryById.academy?.percentage ?? 0;
  const lessonBonusPct = Math.round(
    (Math.min(10, state.academyStudiedLessonIds?.length ?? 0) / 10) * 100,
  );
  const mentorPct = summaryById['ai-mentor']?.percentage ?? 0;
  const missionPct = summaryById['mission-control']?.percentage ?? 0;
  const zeroGPct = summaryById['zero-gravity-lab']?.percentage ?? 0;
  const evaPct = summaryById['spacewalk-training']?.percentage ?? 0;
  const emergencyPct = summaryById['emergency-training']?.percentage ?? 0;

  return [
    {
      id: 'orbital-science',
      label: 'Orbital Science',
      description: 'Academy curriculum, quizzes, and ARIA theory mastery',
      percentage: Math.round(academyPct * 0.45 + lessonBonusPct * 0.35 + mentorPct * 0.2),
      accent: 'cyan',
    },
    {
      id: 'flight-piloting',
      label: 'Flight Piloting',
      description: 'Lunar descent control, RCS drift correction, and fuel budgeting',
      percentage: missionPct,
      accent: 'emerald',
    },
    {
      id: 'microgravity-physics',
      label: 'Microgravity Physics',
      description: 'Inertia (F = m×a), momentum conservation, and surface tension',
      percentage: zeroGPct,
      accent: 'violet',
    },
    {
      id: 'eva-operations',
      label: 'EVA Operations',
      description: 'Spacesuit gear checks, dual safety tethers, and O₂ management',
      percentage: evaPct,
      accent: 'cyan',
    },
    {
      id: 'crisis-triage',
      label: 'Crisis Triage',
      description: 'O₂ scrubber, cabin pressure, power, comms, and radiation drills',
      percentage: emergencyPct,
      accent: 'rose',
    },
  ];
}

export function computeModuleUnlocks(
  summaryById: Record<ModuleId, ModuleCompletionSummary>,
  state: TrainingState,
): Record<ModuleId, ModuleUnlockState> {
  const guided = Boolean(state.guidedProgression);
  if (!guided) {
    return {
      academy: { unlocked: true, requirementText: 'Entry Deck — Open to all cadets' },
      'mission-control': { unlocked: true, requirementText: 'Open exploration active' },
      'zero-gravity-lab': { unlocked: true, requirementText: 'Open exploration active' },
      'spacewalk-training': { unlocked: true, requirementText: 'Open exploration active' },
      'emergency-training': { unlocked: true, requirementText: 'Open exploration active' },
      'ai-mentor': { unlocked: true, requirementText: 'Mentor Console always accessible' },
    };
  }

  const academyCompleted = summaryById.academy?.status === 'completed';
  const academyStarted =
    (summaryById.academy?.completedCount ?? 0) > 0 ||
    (state.academyStudiedLessonIds?.length ?? 0) >= 2;
  const missionDone = summaryById['mission-control']?.status === 'completed';
  const zeroGDone = summaryById['zero-gravity-lab']?.status === 'completed';
  const evaDone = summaryById['spacewalk-training']?.status === 'completed';

  return {
    academy: { unlocked: true, requirementText: 'Entry Deck — Open to all cadets' },
    'ai-mentor': { unlocked: true, requirementText: 'Mentor Console always accessible' },
    'mission-control': {
      unlocked: academyStarted,
      requirementText: 'Study 2+ Academy lessons or complete 1 Academy step to unlock Mission Control',
    },
    'zero-gravity-lab': {
      unlocked: academyCompleted || missionDone,
      requirementText: 'Certify Astronaut Academy or land safely in Mission Control to unlock',
    },
    'spacewalk-training': {
      unlocked: zeroGDone,
      requirementText: 'Complete Zero Gravity Lab to unlock EVA Spacewalk Training',
    },
    'emergency-training': {
      unlocked: evaDone,
      requirementText: 'Complete Spacewalk Training to unlock Commander Emergency Triage',
    },
  };
}

export function computeAchievements(
  summaryById: Record<ModuleId, ModuleCompletionSummary>,
  state: TrainingState,
  completedModulesCount: number,
  totalModulesCount: number,
  totalXp: number,
): AchievementBadge[] {
  const records = state.moduleRecords ?? {};
  const academyStudied = state.academyStudiedLessonIds?.length ?? 0;

  return [
    {
      id: 'ach-first-step',
      title: 'First Telemetry Pulse',
      description: 'Logged your first verified training task or simulator run.',
      requirement: 'Earn any XP or log any simulator attempt',
      earned: totalXp > 0 || Object.values(records).some((r) => (r?.attempts ?? 0) > 0),
      accent: 'cyan',
    },
    {
      id: 'ach-academy-scholar',
      title: 'Academy Honor Scholar',
      description: 'Completed all 10 Academy topics or scored 7/10+ on the Academy quiz.',
      requirement: 'Study all 10 Academy topics or score ≥ 7/10 in Academy Quiz',
      earned: academyStudied >= 10 || (state.academyBestQuizScore ?? 0) >= 7,
      accent: 'cyan',
    },
    {
      id: 'ach-eagle-touchdown',
      title: 'Eagle Touchdown Pilot',
      description: 'Achieved a safe lunar landing inside the glowing landing pad.',
      requirement: 'Complete a safe Moon Landing Simulator run',
      earned:
        (records['mission-control']?.passedCount ?? 0) > 0 ||
        summaryById['mission-control']?.status === 'completed',
      accent: 'emerald',
    },
    {
      id: 'ach-zero-g',
      title: 'Newton’s Apprentice',
      description: 'Mastered inertia, momentum, and microgravity containment physics.',
      requirement: 'Complete all Zero Gravity Lab challenges',
      earned:
        (records['zero-gravity-lab']?.passedCount ?? 0) > 0 ||
        summaryById['zero-gravity-lab']?.status === 'completed',
      accent: 'violet',
    },
    {
      id: 'ach-eva-discipline',
      title: 'Tether Discipline',
      description: 'Completed an exterior solar repair while preserving oxygen reserves.',
      requirement: 'Pass Spacewalk Training EVA repair',
      earned:
        (records['spacewalk-training']?.passedCount ?? 0) > 0 ||
        summaryById['spacewalk-training']?.status === 'completed',
      accent: 'cyan',
    },
    {
      id: 'ach-calm-commander',
      title: 'Calm Crisis Triage',
      description: 'Stabilized orbital emergencies in crew-first safety order.',
      requirement: 'Complete Emergency Training alert drill',
      earned:
        (records['emergency-training']?.passedCount ?? 0) > 0 ||
        summaryById['emergency-training']?.status === 'completed',
      accent: 'rose',
    },
    {
      id: 'ach-mentor-quiz',
      title: 'ARIA Science Fellow',
      description: 'Demonstrated strong spaceflight mastery in the ARIA Mentor Quiz.',
      requirement: 'Score ≥ 4/5 on the ARIA Cadet Knowledge Quiz',
      earned: (state.mentorBestQuizScore ?? 0) >= 4,
      accent: 'amber',
    },
    {
      id: 'ach-all-decks',
      title: 'Junior Mission Commander',
      description: 'Certified all six ANANTRA training decks.',
      requirement: `Complete all ${totalModulesCount} curriculum decks`,
      earned: totalModulesCount > 0 && completedModulesCount >= totalModulesCount,
      accent: 'amber',
    },
  ];
}

export function getOverallTrainingStats(
  modules: FeatureModuleData[],
  state: TrainingState,
): OverallTrainingStats {
  let totalXp = 0;
  let maxPossibleXp = 0;
  let totalTasks = 0;
  let totalCompletedTasks = 0;
  let completedModulesCount = 0;
  let inProgressModulesCount = 0;
  const earnedPatches: { moduleId: ModuleId; patchTitle: string }[] = [];
  const summaryById = {} as Record<ModuleId, ModuleCompletionSummary>;

  for (const mod of modules) {
    const summary = getModuleCompletion(mod, state.progressByModule[mod.id]);
    summaryById[mod.id] = summary;
    totalXp += summary.earnedXp;
    maxPossibleXp += summary.totalPossibleXp;
    totalTasks += summary.totalCount;
    totalCompletedTasks += summary.completedCount;

    if (summary.status === 'completed') {
      completedModulesCount += 1;
      earnedPatches.push({ moduleId: mod.id, patchTitle: mod.patchTitle });
    } else if (summary.status === 'in-progress') {
      inProgressModulesCount += 1;
    }
  }

  const overallPercentage =
    totalTasks === 0 ? 0 : Math.round((totalCompletedTasks / totalTasks) * 100);

  const rankInfo = getRankForXp(totalXp);
  const skillScores = computeSkillMetrics(summaryById, state);
  const achievements = computeAchievements(
    summaryById,
    state,
    completedModulesCount,
    modules.length,
    totalXp,
  );
  const moduleUnlocks = computeModuleUnlocks(summaryById, state);

  const records = Object.values(state.moduleRecords ?? {}).filter(
    (r): r is NonNullable<typeof r> => Boolean(r),
  );
  const totalSimAttempts = records.reduce((acc, r) => acc + r.attempts, 0);
  const totalPassedRuns = records.reduce((acc, r) => acc + r.passedCount, 0);
  const scoreRatios = records
    .filter(
      (r) =>
        typeof r.bestScore === 'number' &&
        typeof r.maxScore === 'number' &&
        r.maxScore > 0,
    )
    .map((r) => Math.min(100, Math.round(((r.bestScore ?? 0) / (r.maxScore ?? 1)) * 100)));
  const averageBestScorePercent =
    scoreRatios.length > 0
      ? Math.round(scoreRatios.reduce((a, b) => a + b, 0) / scoreRatios.length)
      : null;

  return {
    totalXp,
    maxPossibleXp,
    completedModulesCount,
    inProgressModulesCount,
    totalModulesCount: modules.length,
    overallPercentage,
    earnedPatches,
    ...rankInfo,
    skillScores,
    achievements,
    analytics: {
      totalSimAttempts,
      totalPassedRuns,
      averageBestScorePercent,
      academyLessonsStudied: state.academyStudiedLessonIds?.length ?? 0,
      earnedAchievementsCount: achievements.filter((a) => a.earned).length,
      totalAchievementsCount: achievements.length,
    },
    moduleUnlocks,
  };
}
