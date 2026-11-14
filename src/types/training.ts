import type { IssuedCertificateRecord } from './certificate';

export type ModuleId =
  | 'academy'
  | 'mission-control'
  | 'zero-gravity-lab'
  | 'spacewalk-training'
  | 'emergency-training'
  | 'ai-mentor';

export type ModuleStatus = 'not-started' | 'in-progress' | 'completed';

export type ModuleAccent = 'cyan' | 'emerald' | 'violet' | 'amber' | 'rose';

export type SkillCategoryId =
  | 'orbital-science'
  | 'flight-piloting'
  | 'microgravity-physics'
  | 'eva-operations'
  | 'crisis-triage';

export interface TrainingTask {
  id: string;
  title: string;
  description: string;
  xpReward: number;
}

export interface FunFact {
  title: string;
  detail: string;
}

export interface FeatureModuleData {
  id: ModuleId;
  title: string;
  shortTitle: string;
  route: string;
  tagline: string;
  description: string;
  estimatedMinutes: number;
  difficulty: 'Cadet' | 'Explorer' | 'Commander';
  patchTitle: string;
  accent: ModuleAccent;
  missionBrief: string;
  learningGoals: string[];
  funFacts: FunFact[];
  tasks: TrainingTask[];
  teamNotes: string;
  nextRecommendedModuleId?: ModuleId;
}

export interface TraineeProfile {
  id: string;
  name: string;
  callsign: string;
  cohort: string;
  missionDay: number;
}

export interface ModuleProgress {
  completedTaskIds: string[];
  lastVisitedAt?: string;
}

export interface ModulePerformanceRecord {
  attempts: number;
  passedCount: number;
  bestScore: number | null;
  maxScore: number | null;
  lastScore: number | null;
  lastOutcome: 'success' | 'retry' | null;
  lastFailureReason?: string;
  lastTelemetrySummary?: string;
  lastAttemptAt?: string;
}

export interface MissionHistoryEntry {
  id: string;
  moduleId: ModuleId;
  moduleTitle: string;
  outcome: 'success' | 'retry' | 'milestone';
  score?: number;
  maxScore?: number;
  summary: string;
  timestamp: string;
}

export interface TrainingState {
  version: number;
  profile: TraineeProfile;
  progressByModule: Record<ModuleId, ModuleProgress>;
  moduleRecords?: Partial<Record<ModuleId, ModulePerformanceRecord>>;
  activityHistory?: MissionHistoryEntry[];
  academyStudiedLessonIds?: string[];
  academyBestQuizScore?: number | null;
  mentorBestQuizScore?: number | null;
  guidedProgression?: boolean;
  issuedCertificates?: IssuedCertificateRecord[];
  updatedAt: string;
}

export interface AstronautRank {
  level: number;
  title: string;
  minXp: number;
}
