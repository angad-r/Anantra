import {
  AGE_GROUP_OPTIONS,
  CADET_AVATARS,
  CADET_SPECIALIZATIONS,
  FAVORITE_DESTINATIONS,
} from '../features/onboarding/cadetProfileData';
import type { CadetProfile } from '../types/cadetProfile';

export const CADET_PROFILE_STORAGE_KEY = 'anantra.cadet.profile.v1';

const VALID_SPECIALIZATIONS = new Set<string>(
  CADET_SPECIALIZATIONS.map((item) => item.id),
);
const VALID_AVATARS = new Set<string>(CADET_AVATARS.map((item) => item.id));
const VALID_AGE_GROUPS = new Set<string>(AGE_GROUP_OPTIONS);
const VALID_DESTINATIONS = new Set<string>(
  FAVORITE_DESTINATIONS.map((item) => item.id),
);

export type CadetProfileLoadResult =
  | { ok: true; profile: CadetProfile | null }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isValidCadetProfile(value: unknown): value is CadetProfile {
  if (!isRecord(value)) return false;
  if (value.version !== 1) return false;
  if (typeof value.cadetId !== 'string' || value.cadetId.trim().length < 3) {
    return false;
  }
  if (
    typeof value.firstName !== 'string' ||
    value.firstName.trim().length < 2
  ) {
    return false;
  }
  if (
    value.fullName !== undefined &&
    (typeof value.fullName !== 'string' || value.fullName.trim().length > 60)
  ) {
    return false;
  }
  if (
    typeof value.callsign !== 'string' ||
    value.callsign.trim().length < 2
  ) {
    return false;
  }
  if (
    typeof value.specialization !== 'string' ||
    !VALID_SPECIALIZATIONS.has(value.specialization)
  ) {
    return false;
  }
  if (
    value.avatarId !== undefined &&
    (typeof value.avatarId !== 'string' || !VALID_AVATARS.has(value.avatarId))
  ) {
    return false;
  }
  if (
    value.ageGroup !== undefined &&
    (typeof value.ageGroup !== 'string' || !VALID_AGE_GROUPS.has(value.ageGroup))
  ) {
    return false;
  }
  if (
    value.favoriteDestination !== undefined &&
    (typeof value.favoriteDestination !== 'string' ||
      !VALID_DESTINATIONS.has(value.favoriteDestination))
  ) {
    return false;
  }
  if (typeof value.createdAt !== 'string' || typeof value.updatedAt !== 'string') {
    return false;
  }

  return true;
}

export function loadCadetProfile(): CadetProfileLoadResult {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ok: true, profile: null };
    }
    const raw = window.localStorage.getItem(CADET_PROFILE_STORAGE_KEY);
    if (!raw) {
      return { ok: true, profile: null };
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isValidCadetProfile(parsed)) {
      return {
        ok: false,
        error:
          'Saved cadet profile looked damaged or incomplete. Your training progress is safe — please create a fresh cadet badge below.',
      };
    }
    return { ok: true, profile: parsed };
  } catch {
    return {
      ok: false,
      error:
        'Could not read your saved cadet profile from browser storage. Your training progress is safe — register below to restore access.',
    };
  }
}

export function saveCadetProfile(profile: CadetProfile): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    window.localStorage.setItem(
      CADET_PROFILE_STORAGE_KEY,
      JSON.stringify(profile),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearCadetProfile(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(CADET_PROFILE_STORAGE_KEY);
    }
  } catch {
    // Ignore browser storage restrictions during cleanup
  }
}
