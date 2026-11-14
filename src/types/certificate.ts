import type { ModuleAccent, ModuleId } from './training';

export type CertificateKey =
  | 'orbital-scholar'
  | 'flight-director'
  | 'microgravity-scientist'
  | 'eva-pioneer'
  | 'crisis-responder'
  | 'curious-explorer';

export interface CertificateRequirementItem {
  id: string;
  label: string;
  met: boolean;
  progressText: string;
}

export interface CertificateDefinition {
  key: CertificateKey;
  moduleId: ModuleId;
  code: 'OS' | 'FD' | 'MS' | 'EP' | 'CR' | 'CE';
  title: string;
  category: string;
  description: string;
  unlockSummary: string;
  authorizedDesignation: string;
  accent: ModuleAccent;
  route: string;
}

export interface CertificateEligibility {
  eligible: boolean;
  requirements: CertificateRequirementItem[];
  metCount: number;
  totalCount: number;
  progressPercent: number;
  remainingRequirements: string[];
  evidenceSummary: string;
}

export interface IssuedCertificateRecord {
  version: number;
  certificateId: string;
  certificateKey: CertificateKey;
  moduleId: ModuleId;
  title: string;
  category: string;
  description: string;
  cadetId: string;
  recipientName: string;
  recipientCallsign: string;
  recipientSpecializationTitle: string;
  issuedAt: string;
  reissuedAt?: string;
  reissueCount?: number;
  supersededIds?: string[];
  evidenceSummary: string;
  authorizedDesignation: string;
  verificationMode: 'local-browser-record';
}

export interface CertificateStatusItem {
  definition: CertificateDefinition;
  eligibility: CertificateEligibility;
  issuedRecord: IssuedCertificateRecord | null;
  profileMismatch: boolean;
}

export type CertificateVerificationStatus =
  | 'verified'
  | 'superseded'
  | 'not-found'
  | 'empty';

export interface CertificateVerificationResult {
  status: CertificateVerificationStatus;
  queriedId: string;
  record: IssuedCertificateRecord | null;
  message: string;
  honestScopeNote: string;
}
