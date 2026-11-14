import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { MODULE_BY_ID, TRAINING_MODULES } from '../data/modules';
import {
  createBlankTrainingState,
  createSampleTrainingState,
} from '../data/traineeSeed';
import {
  evaluateAllCertificates,
  reconcileIssuedCertificates,
  reissueCertificateRecord,
  verifyCertificateById,
} from '../features/certificates/certificateService';
import {
  generateCadetId,
  normalizeCallsign,
  normalizeFirstName,
} from '../features/onboarding/cadetProfileData';
import type {
  CadetProfile,
  CadetRegistrationInput,
} from '../types/cadetProfile';
import type {
  CertificateKey,
  CertificateStatusItem,
  CertificateVerificationResult,
} from '../types/certificate';
import type {
  MissionHistoryEntry,
  ModuleId,
  ModulePerformanceRecord,
  TrainingState,
} from '../types/training';
import {
  clearCadetProfile,
  loadCadetProfile,
  saveCadetProfile,
} from '../utils/cadetProfileStorage';
import {
  getOverallTrainingStats,
  type OverallTrainingStats,
} from '../utils/progress';
import {
  STORAGE_KEY,
  clearTrainingState,
  loadTrainingState,
  saveTrainingState,
} from '../utils/storage';

export interface RecordModuleAttemptInput {
  moduleId: ModuleId;
  outcome: 'success' | 'retry' | 'milestone';
  score?: number;
  maxScore?: number;
  summary: string;
  failureReason?: string;
  telemetrySummary?: string;
  completeTaskIds?: string[];
  autoCompleteModule?: boolean;
}

interface TrainingContextValue {
  status: 'loading' | 'ready' | 'error';
  isOnline: boolean;
  storageError: string | null;
  profileError: string | null;
  cadetProfile: CadetProfile | null;
  awaitingMissionControlEntry: boolean;
  state: TrainingState;
  stats: OverallTrainingStats;
  certificateStatuses: CertificateStatusItem[];
  earnedCertificatesCount: number;
  toggleTask: (moduleId: ModuleId, taskId: string) => void;
  completeModule: (moduleId: ModuleId) => void;
  resetModule: (moduleId: ModuleId) => void;
  markModuleVisited: (moduleId: ModuleId) => void;
  recordModuleAttempt: (input: RecordModuleAttemptInput) => void;
  saveAcademyProgress: (studiedLessonIds: string[], bestQuizScore?: number | null) => void;
  saveMentorQuizBest: (score: number) => void;
  setGuidedProgression: (enabled: boolean) => void;
  reissueCertificate: (certificateKey: CertificateKey) => void;
  verifyCertificate: (certificateId: string) => CertificateVerificationResult;
  restoreSampleProgress: () => void;
  resetAllProgress: () => void;
  dismissStorageError: () => void;
  registerCadetProfile: (input: CadetRegistrationInput) => CadetProfile;
  updateCadetProfile: (input: CadetRegistrationInput) => CadetProfile | null;
  resetCadetProfile: () => void;
  enterMissionControl: () => void;
  dismissProfileError: () => void;
}

const TrainingContext = createContext<TrainingContextValue | null>(null);

function syncTrainingProfileMetadata(
  base: TrainingState,
  profile: CadetProfile,
): TrainingState {
  return {
    ...base,
    profile: {
      ...base.profile,
      id: profile.cadetId,
      name: profile.firstName,
      callsign: profile.callsign,
    },
  };
}

function normalizeOptionalFullName(raw?: string): string | undefined {
  if (!raw) return undefined;
  const cleaned = raw.trim().replace(/\s+/g, ' ');
  return cleaned ? cleaned.slice(0, 60) : undefined;
}

function withReconciledCertificates(
  baseState: TrainingState,
  profile: CadetProfile | null,
): TrainingState {
  const reconciled = reconcileIssuedCertificates(baseState, profile);
  if (!reconciled.changed) {
    return baseState;
  }
  return {
    ...baseState,
    issuedCertificates: reconciled.certificates,
  };
}

interface InitialBootstrap {
  status: 'ready' | 'error';
  storageError: string | null;
  profileError: string | null;
  cadetProfile: CadetProfile | null;
  trainingState: TrainingState;
  hasPersisted: boolean;
}

function readInitialBootstrap(): InitialBootstrap {
  const profileResult = loadCadetProfile();
  let loadedProfile: CadetProfile | null = null;
  let profileErr: string | null = null;

  if (!profileResult.ok) {
    profileErr = profileResult.error;
  } else {
    loadedProfile = profileResult.profile;
  }

  const result = loadTrainingState();
  if (!result.ok) {
    const fallback = createSampleTrainingState();
    const synced = loadedProfile
      ? syncTrainingProfileMetadata(fallback, loadedProfile)
      : fallback;
    return {
      status: 'error',
      storageError: result.error,
      profileError: profileErr,
      cadetProfile: loadedProfile,
      trainingState: withReconciledCertificates(synced, loadedProfile),
      hasPersisted: false,
    };
  }

  if (result.state) {
    const synced = loadedProfile
      ? syncTrainingProfileMetadata(result.state, loadedProfile)
      : result.state;
    return {
      status: 'ready',
      storageError: null,
      profileError: profileErr,
      cadetProfile: loadedProfile,
      trainingState: withReconciledCertificates(synced, loadedProfile),
      hasPersisted: true,
    };
  }

  const seeded = createSampleTrainingState();
  const synced = loadedProfile
    ? syncTrainingProfileMetadata(seeded, loadedProfile)
    : seeded;
  return {
    status: 'ready',
    storageError: null,
    profileError: profileErr,
    cadetProfile: loadedProfile,
    trainingState: withReconciledCertificates(synced, loadedProfile),
    hasPersisted: false,
  };
}

export function TrainingProvider({ children }: { children: ReactNode }) {
  const initialRef = useRef<InitialBootstrap | null>(null);
  if (initialRef.current === null) {
    initialRef.current = readInitialBootstrap();
  }
  const boot = initialRef.current;

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(boot.status);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine !== false : true,
  );
  const [storageError, setStorageError] = useState<string | null>(boot.storageError);
  const [profileError, setProfileError] = useState<string | null>(boot.profileError);
  const [cadetProfile, setCadetProfile] = useState<CadetProfile | null>(
    boot.cadetProfile,
  );
  const [awaitingMissionControlEntry, setAwaitingMissionControlEntry] =
    useState(false);
  const [state, setState] = useState<TrainingState>(boot.trainingState);
  const hasPersistedTrainingRef = useRef<boolean>(boot.hasPersisted);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (status === 'error' || !hasPersistedTrainingRef.current) {
      return;
    }
    const saved = saveTrainingState(state);
    if (!saved) {
      setStorageError(
        'Browser storage is unavailable right now. Progress will persist for this session only.',
      );
    }
  }, [state, status]);

  const toggleTask = useCallback(
    (moduleId: ModuleId, taskId: string) => {
      const now = new Date().toISOString();
      hasPersistedTrainingRef.current = true;
      setState((prev) => {
        const current = prev.progressByModule[moduleId];
        const exists = current.completedTaskIds.includes(taskId);
        const nextCompleted = exists
          ? current.completedTaskIds.filter((id) => id !== taskId)
          : [...current.completedTaskIds, taskId];

        return withReconciledCertificates(
          {
            ...prev,
            updatedAt: now,
            progressByModule: {
              ...prev.progressByModule,
              [moduleId]: {
                ...current,
                completedTaskIds: nextCompleted,
                lastVisitedAt: now,
              },
            },
          },
          cadetProfile,
        );
      });
    },
    [cadetProfile],
  );

  const completeModule = useCallback(
    (moduleId: ModuleId) => {
      const now = new Date().toISOString();
      const mod = MODULE_BY_ID[moduleId];
      const moduleTasks = mod.tasks.map((t) => t.id);
      hasPersistedTrainingRef.current = true;
      setState((prev) => {
        const existingIds = prev.progressByModule[moduleId]?.completedTaskIds ?? [];
        const alreadyCertified =
          moduleTasks.length > 0 &&
          moduleTasks.every((id) => existingIds.includes(id));

        const historyEntry: MissionHistoryEntry | null = alreadyCertified
          ? null
          : {
              id: `hist-${moduleId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              moduleId,
              moduleTitle: mod.title,
              outcome: 'milestone',
              summary: `Completed "${mod.patchTitle}" deck checklist steps for ${mod.title}.`,
              timestamp: now,
            };

        return withReconciledCertificates(
          {
            ...prev,
            updatedAt: now,
            progressByModule: {
              ...prev.progressByModule,
              [moduleId]: {
                ...prev.progressByModule[moduleId],
                completedTaskIds: moduleTasks,
                lastVisitedAt: now,
              },
            },
            activityHistory: historyEntry
              ? [historyEntry, ...(prev.activityHistory ?? [])].slice(0, 30)
              : prev.activityHistory,
          },
          cadetProfile,
        );
      });
    },
    [cadetProfile],
  );

  const resetModule = useCallback((moduleId: ModuleId) => {
    const now = new Date().toISOString();
    hasPersistedTrainingRef.current = true;
    setState((prev) => ({
      ...prev,
      updatedAt: now,
      progressByModule: {
        ...prev.progressByModule,
        [moduleId]: {
          ...prev.progressByModule[moduleId],
          completedTaskIds: [],
          lastVisitedAt: now,
        },
      },
    }));
  }, []);

  const markModuleVisited = useCallback((moduleId: ModuleId) => {
    const now = new Date().toISOString();
    hasPersistedTrainingRef.current = true;
    setState((prev) => ({
      ...prev,
      updatedAt: now,
      progressByModule: {
        ...prev.progressByModule,
        [moduleId]: {
          ...prev.progressByModule[moduleId],
          lastVisitedAt: now,
        },
      },
    }));
  }, []);

  const recordModuleAttempt = useCallback(
    (input: RecordModuleAttemptInput) => {
      const now = new Date().toISOString();
      const mod = MODULE_BY_ID[input.moduleId];
      hasPersistedTrainingRef.current = true;

      setState((prev) => {
        const existingProgress = prev.progressByModule[input.moduleId];
        const nextCompleted = new Set(existingProgress.completedTaskIds);
        if (input.completeTaskIds) {
          for (const id of input.completeTaskIds) nextCompleted.add(id);
        }
        if (input.autoCompleteModule) {
          for (const t of mod.tasks) nextCompleted.add(t.id);
        }

        const prevRecord: ModulePerformanceRecord = prev.moduleRecords?.[
          input.moduleId
        ] ?? {
          attempts: 0,
          passedCount: 0,
          bestScore: null,
          maxScore: input.maxScore ?? null,
          lastScore: null,
          lastOutcome: null,
        };

        const nextBestScore =
          typeof input.score === 'number'
            ? prevRecord.bestScore === null
              ? input.score
              : Math.max(prevRecord.bestScore, input.score)
            : prevRecord.bestScore;

        const isPass = input.outcome === 'success';
        const nextRecord: ModulePerformanceRecord = {
          attempts: prevRecord.attempts + 1,
          passedCount: prevRecord.passedCount + (isPass ? 1 : 0),
          bestScore: nextBestScore,
          maxScore: input.maxScore ?? prevRecord.maxScore,
          lastScore:
            typeof input.score === 'number' ? input.score : prevRecord.lastScore,
          lastOutcome: input.outcome === 'retry' ? 'retry' : 'success',
          lastFailureReason:
            input.outcome === 'retry' ? input.failureReason : undefined,
          lastTelemetrySummary:
            input.telemetrySummary ?? prevRecord.lastTelemetrySummary,
          lastAttemptAt: now,
        };

        const historyEntry: MissionHistoryEntry = {
          id: `hist-${input.moduleId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          moduleId: input.moduleId,
          moduleTitle: mod.title,
          outcome: input.outcome,
          ...(typeof input.score === 'number' ? { score: input.score } : {}),
          ...(typeof input.maxScore === 'number'
            ? { maxScore: input.maxScore }
            : {}),
          summary: input.summary,
          timestamp: now,
        };

        return withReconciledCertificates(
          {
            ...prev,
            updatedAt: now,
            progressByModule: {
              ...prev.progressByModule,
              [input.moduleId]: {
                completedTaskIds: Array.from(nextCompleted),
                lastVisitedAt: now,
              },
            },
            moduleRecords: {
              ...prev.moduleRecords,
              [input.moduleId]: nextRecord,
            },
            activityHistory: [
              historyEntry,
              ...(prev.activityHistory ?? []),
            ].slice(0, 30),
          },
          cadetProfile,
        );
      });
    },
    [cadetProfile],
  );

  const saveAcademyProgress = useCallback(
    (studiedLessonIds: string[], bestQuizScore?: number | null) => {
      const now = new Date().toISOString();
      hasPersistedTrainingRef.current = true;
      setState((prev) => {
        const prevBest = prev.academyBestQuizScore ?? null;
        const nextBest =
          typeof bestQuizScore === 'number'
            ? prevBest === null
              ? bestQuizScore
              : Math.max(prevBest, bestQuizScore)
            : prevBest;

        const mergedTasks = new Set(prev.progressByModule.academy.completedTaskIds);
        if (studiedLessonIds.length >= 2) mergedTasks.add('academy-1');
        if (studiedLessonIds.length >= 5) mergedTasks.add('academy-2');
        if (studiedLessonIds.length >= 10 || (nextBest ?? 0) >= 7) {
          mergedTasks.add('academy-1');
          mergedTasks.add('academy-2');
          mergedTasks.add('academy-3');
        }

        return withReconciledCertificates(
          {
            ...prev,
            updatedAt: now,
            academyStudiedLessonIds: Array.from(new Set(studiedLessonIds)),
            academyBestQuizScore: nextBest,
            progressByModule: {
              ...prev.progressByModule,
              academy: {
                completedTaskIds: Array.from(mergedTasks),
                lastVisitedAt: now,
              },
            },
          },
          cadetProfile,
        );
      });
    },
    [cadetProfile],
  );

  const saveMentorQuizBest = useCallback(
    (score: number) => {
      const now = new Date().toISOString();
      hasPersistedTrainingRef.current = true;
      setState((prev) => {
        const prevBest = prev.mentorBestQuizScore ?? null;
        const nextBest = prevBest === null ? score : Math.max(prevBest, score);
        return withReconciledCertificates(
          {
            ...prev,
            updatedAt: now,
            mentorBestQuizScore: nextBest,
          },
          cadetProfile,
        );
      });
    },
    [cadetProfile],
  );

  const setGuidedProgression = useCallback((enabled: boolean) => {
    const now = new Date().toISOString();
    hasPersistedTrainingRef.current = true;
    setState((prev) => ({
      ...prev,
      updatedAt: now,
      guidedProgression: enabled,
    }));
  }, []);

  const restoreSampleProgress = useCallback(() => {
    clearTrainingState();
    const seeded = createSampleTrainingState();
    const nextState = cadetProfile
      ? syncTrainingProfileMetadata(seeded, cadetProfile)
      : seeded;
    hasPersistedTrainingRef.current = true;
    saveTrainingState(nextState);
    setState(nextState);
    setStorageError(null);
    setStatus('ready');
  }, [cadetProfile]);

  const resetAllProgress = useCallback(() => {
    clearTrainingState();
    const blank = createBlankTrainingState();
    const nextState = cadetProfile
      ? syncTrainingProfileMetadata(blank, cadetProfile)
      : blank;
    hasPersistedTrainingRef.current = true;
    saveTrainingState(nextState);
    setState(nextState);
    setStorageError(null);
    setStatus('ready');
  }, [cadetProfile]);

  const dismissStorageError = useCallback(() => {
    setStorageError(null);
    setStatus('ready');
  }, []);

  const registerCadetProfile = useCallback(
    (input: CadetRegistrationInput): CadetProfile => {
      const now = new Date().toISOString();
      const fullName = normalizeOptionalFullName(input.fullName);
      const newProfile: CadetProfile = {
        version: 1,
        cadetId: generateCadetId(),
        firstName: normalizeFirstName(input.firstName),
        ...(fullName ? { fullName } : {}),
        callsign: normalizeCallsign(input.callsign),
        specialization: input.specialization,
        ...(input.avatarId ? { avatarId: input.avatarId } : {}),
        ...(input.ageGroup ? { ageGroup: input.ageGroup } : {}),
        ...(input.favoriteDestination
          ? { favoriteDestination: input.favoriteDestination }
          : {}),
        createdAt: now,
        updatedAt: now,
      };

      const saved = saveCadetProfile(newProfile);
      if (!saved) {
        setProfileError(
          'Browser storage is unavailable right now. Your cadet badge is active for this session only.',
        );
      } else {
        setProfileError(null);
      }

      setCadetProfile(newProfile);
      setAwaitingMissionControlEntry(true);

      let hasExistingProgress = false;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const rawExisting = window.localStorage.getItem(STORAGE_KEY);
          if (rawExisting) {
            const existingResult = loadTrainingState();
            hasExistingProgress =
              existingResult.ok && existingResult.state !== null;
          }
        }
      } catch {
        hasExistingProgress = false;
      }

      hasPersistedTrainingRef.current = true;
      setState((prev) => {
        const base = hasExistingProgress ? prev : createBlankTrainingState();
        const synced = withReconciledCertificates(
          syncTrainingProfileMetadata(base, newProfile),
          newProfile,
        );
        saveTrainingState(synced);
        return synced;
      });

      return newProfile;
    },
    [],
  );

  const updateCadetProfile = useCallback(
    (input: CadetRegistrationInput): CadetProfile | null => {
      const now = new Date().toISOString();
      const fullName = normalizeOptionalFullName(input.fullName);
      const updated: CadetProfile = {
        version: 1,
        cadetId: cadetProfile?.cadetId ?? generateCadetId(),
        firstName: normalizeFirstName(input.firstName),
        ...(fullName ? { fullName } : {}),
        callsign: normalizeCallsign(input.callsign),
        specialization: input.specialization,
        ...(input.avatarId ? { avatarId: input.avatarId } : {}),
        ...(input.ageGroup ? { ageGroup: input.ageGroup } : {}),
        ...(input.favoriteDestination
          ? { favoriteDestination: input.favoriteDestination }
          : {}),
        createdAt: cadetProfile?.createdAt ?? now,
        updatedAt: now,
      };

      const saved = saveCadetProfile(updated);
      if (!saved) {
        setProfileError(
          'Could not save profile updates to browser storage. Changes apply to this session only.',
        );
      } else {
        setProfileError(null);
      }

      setCadetProfile(updated);
      // Do NOT overwrite or reissue existing earned certificates on profile edits;
      // previously issued certificates preserve their original recipient snapshot.
      setState((prev) => syncTrainingProfileMetadata(prev, updated));
      return updated;
    },
    [cadetProfile],
  );

  const reissueCertificate = useCallback(
    (certificateKey: CertificateKey) => {
      const now = new Date().toISOString();
      hasPersistedTrainingRef.current = true;
      setState((prev) => ({
        ...prev,
        updatedAt: now,
        issuedCertificates: reissueCertificateRecord(
          prev,
          certificateKey,
          cadetProfile,
          now,
        ),
      }));
    },
    [cadetProfile],
  );

  const verifyCertificate = useCallback(
    (certificateId: string): CertificateVerificationResult =>
      verifyCertificateById(certificateId, state),
    [state],
  );

  const resetCadetProfile = useCallback(() => {
    clearCadetProfile();
    setCadetProfile(null);
    setAwaitingMissionControlEntry(false);
    setProfileError(null);
  }, []);

  const enterMissionControl = useCallback(() => {
    setAwaitingMissionControlEntry(false);
  }, []);

  const dismissProfileError = useCallback(() => {
    clearCadetProfile();
    setProfileError(null);
  }, []);

  const stats = useMemo(
    () => getOverallTrainingStats(TRAINING_MODULES, state),
    [state],
  );

  const certificateStatuses = useMemo(
    () => evaluateAllCertificates(state, cadetProfile),
    [state, cadetProfile],
  );

  const earnedCertificatesCount = useMemo(
    () => certificateStatuses.filter((item) => item.issuedRecord !== null).length,
    [certificateStatuses],
  );

  const value = useMemo<TrainingContextValue>(
    () => ({
      status,
      isOnline,
      storageError,
      profileError,
      cadetProfile,
      awaitingMissionControlEntry,
      state,
      stats,
      certificateStatuses,
      earnedCertificatesCount,
      toggleTask,
      completeModule,
      resetModule,
      markModuleVisited,
      recordModuleAttempt,
      saveAcademyProgress,
      saveMentorQuizBest,
      setGuidedProgression,
      reissueCertificate,
      verifyCertificate,
      restoreSampleProgress,
      resetAllProgress,
      dismissStorageError,
      registerCadetProfile,
      updateCadetProfile,
      resetCadetProfile,
      enterMissionControl,
      dismissProfileError,
    }),
    [
      status,
      isOnline,
      storageError,
      profileError,
      cadetProfile,
      awaitingMissionControlEntry,
      state,
      stats,
      certificateStatuses,
      earnedCertificatesCount,
      toggleTask,
      completeModule,
      resetModule,
      markModuleVisited,
      recordModuleAttempt,
      saveAcademyProgress,
      saveMentorQuizBest,
      setGuidedProgression,
      reissueCertificate,
      verifyCertificate,
      restoreSampleProgress,
      resetAllProgress,
      dismissStorageError,
      registerCadetProfile,
      updateCadetProfile,
      resetCadetProfile,
      enterMissionControl,
      dismissProfileError,
    ],
  );

  return (
    <TrainingContext.Provider value={value}>
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining(): TrainingContextValue {
  const ctx = useContext(TrainingContext);
  if (!ctx) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return ctx;
}
