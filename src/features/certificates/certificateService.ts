import type { CadetProfile } from '../../types/cadetProfile';
import type {
  CertificateDefinition,
  CertificateKey,
  CertificateStatusItem,
  CertificateVerificationResult,
  IssuedCertificateRecord,
} from '../../types/certificate';
import type { TrainingState } from '../../types/training';
import { SPECIALIZATION_BY_ID } from '../onboarding/cadetProfileData';
import {
  CERTIFICATE_BY_KEY,
  CERTIFICATE_DEFINITIONS,
  evaluateCertificateEligibility,
} from './certificateCatalog';

export interface ResolvedCadetCertificateIdentity {
  cadetId: string;
  recipientName: string;
  recipientCallsign: string;
  recipientSpecializationTitle: string;
  usedFallbackName: boolean;
}

export function resolveCadetCertificateIdentity(
  cadetProfile: CadetProfile | null,
  fallbackProfile?: TrainingState['profile'],
): ResolvedCadetCertificateIdentity {
  const rawName =
    cadetProfile?.fullName?.trim() ||
    cadetProfile?.firstName?.trim() ||
    fallbackProfile?.name?.trim() ||
    '';
  const rawCallsign =
    cadetProfile?.callsign?.trim() || fallbackProfile?.callsign?.trim() || '';
  const cadetId =
    cadetProfile?.cadetId?.trim() || fallbackProfile?.id?.trim() || 'ANT-LOCAL-01';
  const specializationTitle = cadetProfile
    ? SPECIALIZATION_BY_ID[cadetProfile.specialization]?.title ?? 'CADET EXPLORER'
    : 'CADET EXPLORER';

  return {
    cadetId,
    recipientName: rawName || 'Junior Astronaut Cadet',
    recipientCallsign: rawCallsign || 'CADET-01',
    recipientSpecializationTitle: specializationTitle,
    usedFallbackName: rawName.length === 0,
  };
}

export function generateCertificateId(
  code: CertificateDefinition['code'],
  issuedAtIso: string,
  existingIds: ReadonlySet<string> = new Set(),
): string {
  const compactDate = issuedAtIso.slice(0, 10).replace(/-/g, '') || '20260101';
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  for (let attempt = 0; attempt < 12; attempt += 1) {
    let suffix = '';
    if (
      typeof globalThis !== 'undefined' &&
      globalThis.crypto &&
      typeof globalThis.crypto.getRandomValues === 'function'
    ) {
      const bytes = new Uint8Array(6);
      globalThis.crypto.getRandomValues(bytes);
      for (let i = 0; i < bytes.length; i += 1) {
        suffix += alphabet[bytes[i] % alphabet.length];
      }
    } else {
      for (let i = 0; i < 6; i += 1) {
        suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }

    const candidate = `ANANTRA-${code}-${compactDate}-${suffix}`;
    if (!existingIds.has(candidate)) {
      return candidate;
    }
  }

  return `ANANTRA-${code}-${compactDate}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export function reconcileIssuedCertificates(
  state: TrainingState,
  cadetProfile: CadetProfile | null,
  nowIso: string = new Date().toISOString(),
): {
  changed: boolean;
  certificates: IssuedCertificateRecord[];
} {
  const existing = state.issuedCertificates ?? [];
  const existingByKey = new Map<CertificateKey, IssuedCertificateRecord>();
  const usedIds = new Set<string>();

  for (const cert of existing) {
    existingByKey.set(cert.certificateKey, cert);
    usedIds.add(cert.certificateId);
    for (const oldId of cert.supersededIds ?? []) {
      usedIds.add(oldId);
    }
  }

  const nextCertificates = [...existing];
  let changed = false;
  const identity = resolveCadetCertificateIdentity(cadetProfile, state.profile);

  for (const def of CERTIFICATE_DEFINITIONS) {
    if (existingByKey.has(def.key)) {
      // Never duplicate or silently overwrite existing certificates!
      continue;
    }

    const eligibility = evaluateCertificateEligibility(def, state);
    if (!eligibility.eligible) {
      continue;
    }

    const certificateId = generateCertificateId(def.code, nowIso, usedIds);
    usedIds.add(certificateId);

    nextCertificates.push({
      version: 1,
      certificateId,
      certificateKey: def.key,
      moduleId: def.moduleId,
      title: def.title,
      category: def.category,
      description: def.description,
      cadetId: identity.cadetId,
      recipientName: identity.recipientName,
      recipientCallsign: identity.recipientCallsign,
      recipientSpecializationTitle: identity.recipientSpecializationTitle,
      issuedAt: nowIso,
      evidenceSummary: eligibility.evidenceSummary,
      authorizedDesignation: def.authorizedDesignation,
      verificationMode: 'local-browser-record',
    });
    changed = true;
  }

  return { changed, certificates: nextCertificates };
}

export function reissueCertificateRecord(
  state: TrainingState,
  certificateKey: CertificateKey,
  cadetProfile: CadetProfile | null,
  nowIso: string = new Date().toISOString(),
): IssuedCertificateRecord[] {
  const existing = state.issuedCertificates ?? [];
  const target = existing.find((c) => c.certificateKey === certificateKey);
  const def = CERTIFICATE_BY_KEY[certificateKey];
  if (!target || !def) return existing;

  const eligibility = evaluateCertificateEligibility(def, state);
  const identity = resolveCadetCertificateIdentity(cadetProfile, state.profile);

  const usedIds = new Set<string>();
  for (const cert of existing) {
    usedIds.add(cert.certificateId);
    for (const oldId of cert.supersededIds ?? []) {
      usedIds.add(oldId);
    }
  }

  const nextId = generateCertificateId(def.code, nowIso, usedIds);
  const priorIds = Array.from(
    new Set([...(target.supersededIds ?? []), target.certificateId]),
  );

  return existing.map((cert) =>
    cert.certificateKey === certificateKey
      ? {
          ...cert,
          certificateId: nextId,
          cadetId: identity.cadetId,
          recipientName: identity.recipientName,
          recipientCallsign: identity.recipientCallsign,
          recipientSpecializationTitle: identity.recipientSpecializationTitle,
          reissuedAt: nowIso,
          reissueCount: (cert.reissueCount ?? 0) + 1,
          supersededIds: priorIds,
          evidenceSummary: eligibility.eligible
            ? eligibility.evidenceSummary
            : cert.evidenceSummary,
        }
      : cert,
  );
}

export function evaluateAllCertificates(
  state: TrainingState,
  cadetProfile: CadetProfile | null,
): CertificateStatusItem[] {
  const issuedMap = new Map<CertificateKey, IssuedCertificateRecord>();
  for (const cert of state.issuedCertificates ?? []) {
    issuedMap.set(cert.certificateKey, cert);
  }

  const currentIdentity = resolveCadetCertificateIdentity(
    cadetProfile,
    state.profile,
  );

  return CERTIFICATE_DEFINITIONS.map((definition) => {
    const eligibility = evaluateCertificateEligibility(definition, state);
    const issuedRecord = issuedMap.get(definition.key) ?? null;
    const profileMismatch = Boolean(
      issuedRecord &&
        (issuedRecord.recipientName !== currentIdentity.recipientName ||
          issuedRecord.recipientCallsign !== currentIdentity.recipientCallsign),
    );

    return {
      definition,
      eligibility,
      issuedRecord,
      profileMismatch,
    };
  });
}

export function verifyCertificateById(
  rawId: string,
  state: TrainingState,
): CertificateVerificationResult {
  const normalized = rawId.trim().toUpperCase();
  const honestScopeNote =
    'Verification Note: ANANTRA checks certificate IDs solely against training records saved in this browser’s localStorage. Because ANANTRA has no central accreditation server or private cryptographic signing authority, this confirms local browser training history only — not independent third-party or official NASA certification.';

  if (!normalized) {
    return {
      status: 'empty',
      queriedId: '',
      record: null,
      message: 'Enter a Certificate ID (for example, ANANTRA-OS-20261111-XXXXXX) to check local records.',
      honestScopeNote,
    };
  }

  const records = state.issuedCertificates ?? [];
  const exactMatch = records.find(
    (c) => c.certificateId.toUpperCase() === normalized,
  );
  if (exactMatch) {
    return {
      status: 'verified',
      queriedId: normalized,
      record: exactMatch,
      message: `Certificate ID ${exactMatch.certificateId} matches an active earned training record in this browser.`,
      honestScopeNote,
    };
  }

  const supersededMatch = records.find((c) =>
    (c.supersededIds ?? []).some((old) => old.toUpperCase() === normalized),
  );
  if (supersededMatch) {
    return {
      status: 'superseded',
      queriedId: normalized,
      record: supersededMatch,
      message: `Certificate ID ${normalized} was superseded after a deliberate profile reissue. The current active ID for this credential is ${supersededMatch.certificateId}.`,
      honestScopeNote,
    };
  }

  return {
    status: 'not-found',
    queriedId: normalized,
    record: null,
    message: `No record matching "${normalized}" exists in this browser’s local ANANTRA certificate store.`,
    honestScopeNote,
  };
}

export function formatCertificateDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown Date';
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function sanitizeFilenameSegment(raw: string, fallback: string): string {
  const cleaned = raw
    .trim()
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return cleaned || fallback;
}

export function formatCertificatePdfFilename(
  certTitle: string,
  recipientName: string,
): string {
  const titlePart = sanitizeFilenameSegment(certTitle, 'Certification');
  const namePart = sanitizeFilenameSegment(recipientName, 'Cadet');
  return `ANANTRA_${titlePart}_${namePart}.pdf`;
}

export function formatAllCertificatesPdfFilename(recipientName: string): string {
  const namePart = sanitizeFilenameSegment(recipientName, 'Cadet');
  return `ANANTRA_All_Earned_Certificates_${namePart}.pdf`;
}
