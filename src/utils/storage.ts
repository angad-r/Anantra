import type {
  CertificateKey,
  IssuedCertificateRecord,
} from '../types/certificate';
import type {
  MissionHistoryEntry,
  ModuleId,
  ModulePerformanceRecord,
  TrainingState,
} from '../types/training';

export const STORAGE_KEY = 'anantra.training.state.v1';

const REQUIRED_MODULE_IDS: ModuleId[] = [
  'academy',
  'mission-control',
  'zero-gravity-lab',
  'spacewalk-training',
  'emergency-training',
  'ai-mentor',
];

export type StorageLoadResult =
  | { ok: true; state: TrainingState | null }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isModuleId(value: unknown): value is ModuleId {
  return (
    typeof value === 'string' &&
    REQUIRED_MODULE_IDS.includes(value as ModuleId)
  );
}

function sanitizeModuleRecords(
  raw: unknown,
): Partial<Record<ModuleId, ModulePerformanceRecord>> {
  if (!isRecord(raw)) return {};
  const result: Partial<Record<ModuleId, ModulePerformanceRecord>> = {};
  for (const id of REQUIRED_MODULE_IDS) {
    const entry = raw[id];
    if (!isRecord(entry)) continue;
    if (typeof entry.attempts !== 'number' || typeof entry.passedCount !== 'number') {
      continue;
    }
    result[id] = {
      attempts: Math.max(0, entry.attempts),
      passedCount: Math.max(0, entry.passedCount),
      bestScore: typeof entry.bestScore === 'number' ? entry.bestScore : null,
      maxScore: typeof entry.maxScore === 'number' ? entry.maxScore : null,
      lastScore: typeof entry.lastScore === 'number' ? entry.lastScore : null,
      lastOutcome:
        entry.lastOutcome === 'success' || entry.lastOutcome === 'retry'
          ? entry.lastOutcome
          : null,
      ...(typeof entry.lastFailureReason === 'string'
        ? { lastFailureReason: entry.lastFailureReason }
        : {}),
      ...(typeof entry.lastTelemetrySummary === 'string'
        ? { lastTelemetrySummary: entry.lastTelemetrySummary }
        : {}),
      ...(typeof entry.lastAttemptAt === 'string'
        ? { lastAttemptAt: entry.lastAttemptAt }
        : {}),
    };
  }
  return result;
}

function sanitizeActivityHistory(raw: unknown): MissionHistoryEntry[] {
  if (!Array.isArray(raw)) return [];
  const valid: MissionHistoryEntry[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    if (
      typeof item.id !== 'string' ||
      !isModuleId(item.moduleId) ||
      typeof item.moduleTitle !== 'string' ||
      (item.outcome !== 'success' &&
        item.outcome !== 'retry' &&
        item.outcome !== 'milestone') ||
      typeof item.summary !== 'string' ||
      typeof item.timestamp !== 'string'
    ) {
      continue;
    }
    valid.push({
      id: item.id,
      moduleId: item.moduleId,
      moduleTitle: item.moduleTitle,
      outcome: item.outcome,
      ...(typeof item.score === 'number' ? { score: item.score } : {}),
      ...(typeof item.maxScore === 'number' ? { maxScore: item.maxScore } : {}),
      summary: item.summary,
      timestamp: item.timestamp,
    });
  }
  return valid.slice(0, 30);
}

const VALID_CERTIFICATE_KEYS: ReadonlySet<string> = new Set([
  'orbital-scholar',
  'flight-director',
  'microgravity-scientist',
  'eva-pioneer',
  'crisis-responder',
  'curious-explorer',
]);

function sanitizeIssuedCertificates(raw: unknown): IssuedCertificateRecord[] {
  if (!Array.isArray(raw)) return [];
  const valid: IssuedCertificateRecord[] = [];
  const seenKeys = new Set<string>();
  for (const item of raw) {
    if (!isRecord(item)) continue;
    if (
      typeof item.certificateId !== 'string' ||
      !item.certificateId.trim() ||
      typeof item.certificateKey !== 'string' ||
      !VALID_CERTIFICATE_KEYS.has(item.certificateKey) ||
      !isModuleId(item.moduleId) ||
      typeof item.title !== 'string' ||
      typeof item.category !== 'string' ||
      typeof item.description !== 'string' ||
      typeof item.cadetId !== 'string' ||
      typeof item.recipientName !== 'string' ||
      typeof item.recipientCallsign !== 'string' ||
      typeof item.recipientSpecializationTitle !== 'string' ||
      typeof item.issuedAt !== 'string' ||
      typeof item.evidenceSummary !== 'string' ||
      typeof item.authorizedDesignation !== 'string'
    ) {
      continue;
    }
    if (seenKeys.has(item.certificateKey)) continue;
    seenKeys.add(item.certificateKey);
    valid.push({
      version: typeof item.version === 'number' ? item.version : 1,
      certificateId: item.certificateId,
      certificateKey: item.certificateKey as CertificateKey,
      moduleId: item.moduleId,
      title: item.title,
      category: item.category,
      description: item.description,
      cadetId: item.cadetId,
      recipientName: item.recipientName,
      recipientCallsign: item.recipientCallsign,
      recipientSpecializationTitle: item.recipientSpecializationTitle,
      issuedAt: item.issuedAt,
      ...(typeof item.reissuedAt === 'string'
        ? { reissuedAt: item.reissuedAt }
        : {}),
      ...(typeof item.reissueCount === 'number'
        ? { reissueCount: item.reissueCount }
        : {}),
      ...(Array.isArray(item.supersededIds)
        ? {
            supersededIds: item.supersededIds.filter(
              (s): s is string => typeof s === 'string',
            ),
          }
        : {}),
      evidenceSummary: item.evidenceSummary,
      authorizedDesignation: item.authorizedDesignation,
      verificationMode: 'local-browser-record',
    });
  }
  return valid;
}

export function normalizeTrainingState(state: TrainingState): TrainingState {
  return {
    ...state,
    version: Math.max(2, state.version),
    moduleRecords: sanitizeModuleRecords(state.moduleRecords),
    activityHistory: sanitizeActivityHistory(state.activityHistory),
    issuedCertificates: sanitizeIssuedCertificates(state.issuedCertificates),
    academyStudiedLessonIds: Array.isArray(state.academyStudiedLessonIds)
      ? state.academyStudiedLessonIds.filter(
          (id): id is string => typeof id === 'string',
        )
      : [],
    academyBestQuizScore:
      typeof state.academyBestQuizScore === 'number'
        ? state.academyBestQuizScore
        : null,
    mentorBestQuizScore:
      typeof state.mentorBestQuizScore === 'number'
        ? state.mentorBestQuizScore
        : null,
    guidedProgression: Boolean(state.guidedProgression),
  };
}

export function isValidTrainingState(value: unknown): value is TrainingState {
  if (!isRecord(value)) return false;
  if (typeof value.version !== 'number') return false;
  if (!isRecord(value.profile)) return false;
  if (
    typeof value.profile.name !== 'string' ||
    typeof value.profile.callsign !== 'string' ||
    typeof value.profile.cohort !== 'string' ||
    typeof value.profile.missionDay !== 'number'
  ) {
    return false;
  }

  if (!isRecord(value.progressByModule)) return false;

  for (const id of REQUIRED_MODULE_IDS) {
    const entry = value.progressByModule[id];
    if (!isRecord(entry) || !Array.isArray(entry.completedTaskIds)) {
      return false;
    }
    if (!entry.completedTaskIds.every((item) => typeof item === 'string')) {
      return false;
    }
  }

  return true;
}

export function loadTrainingState(): StorageLoadResult {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ok: true, state: null };
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ok: true, state: null };
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isValidTrainingState(parsed)) {
      return {
        ok: false,
        error:
          'Saved mission telemetry looked damaged. You can safely restore the sample cadet profile.',
      };
    }
    return { ok: true, state: normalizeTrainingState(parsed) };
  } catch {
    return {
      ok: false,
      error:
        'Could not read local mission telemetry from your browser storage.',
    };
  }
}

export function saveTrainingState(state: TrainingState): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearTrainingState(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage restriction errors during cleanup
  }
}
