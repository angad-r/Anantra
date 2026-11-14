import {
  AlertTriangle,
  Award,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileBadge2,
  Info,
  Lock,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { BadgePill } from '../../components/ui/BadgePill';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useTraining } from '../../context/TrainingContext';
import type {
  CertificateKey,
  CertificateStatusItem,
  CertificateVerificationResult,
} from '../../types/certificate';
import {
  CertificatePreviewModal,
  LockedCertificateModal,
} from './CertificateModals';
import {
  generatePortfolioCertificatesPdf,
  generateSingleCertificatePdf,
} from './certificatePdf';
import {
  formatCertificateDate,
  resolveCadetCertificateIdentity,
} from './certificateService';

interface CertificatesPageProps {
  initialFocusVerify?: boolean;
}

export function CertificatesPage({
  initialFocusVerify = false,
}: CertificatesPageProps) {
  const [searchParams] = useSearchParams();
  const {
    cadetProfile,
    state,
    certificateStatuses,
    earnedCertificatesCount,
    reissueCertificate,
    verifyCertificate,
  } = useTraining();

  const currentIdentity = useMemo(
    () => resolveCadetCertificateIdentity(cadetProfile, state.profile),
    [cadetProfile, state.profile],
  );

  const earnedRecords = useMemo(
    () =>
      certificateStatuses
        .map((s) => s.issuedRecord)
        .filter((r): r is NonNullable<typeof r> => r !== null),
    [certificateStatuses],
  );

  const [previewKey, setPreviewKey] = useState<CertificateKey | null>(null);
  const [lockedModalKey, setLockedModalKey] = useState<CertificateKey | null>(
    null,
  );
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<CertificateKey | null>(
    null,
  );
  const [actionBanner, setActionBanner] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Verification console state
  const urlQueryId = searchParams.get('id') ?? '';
  const [verifyInput, setVerifyInput] = useState<string>(urlQueryId);
  const [verificationResult, setVerificationResult] =
    useState<CertificateVerificationResult | null>(() =>
      urlQueryId.trim() ? verifyCertificate(urlQueryId) : null,
    );

  useEffect(() => {
    if (urlQueryId.trim()) {
      setVerifyInput(urlQueryId);
      setVerificationResult(verifyCertificate(urlQueryId));
    }
  }, [urlQueryId, verifyCertificate]);

  const activePreviewItem: CertificateStatusItem | null = useMemo(() => {
    if (!previewKey) return null;
    return (
      certificateStatuses.find((s) => s.definition.key === previewKey) ?? null
    );
  }, [previewKey, certificateStatuses]);

  const activeLockedItem: CertificateStatusItem | null = useMemo(() => {
    if (!lockedModalKey) return null;
    return (
      certificateStatuses.find((s) => s.definition.key === lockedModalKey) ??
      null
    );
  }, [lockedModalKey, certificateStatuses]);

  const handleDownloadSingle = async (item: CertificateStatusItem) => {
    if (!item.issuedRecord) return;
    setDownloadingKey(item.definition.key);
    setActionBanner(null);
    try {
      const res = await generateSingleCertificatePdf(item.issuedRecord, {
        download: true,
      });
      setActionBanner(`Downloaded A4 landscape PDF: ${res.filename}`);
    } catch {
      setActionBanner(
        'Unable to generate PDF in this browser. Open Preview and use Print Certificate instead.',
      );
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleDownloadAll = async () => {
    if (earnedRecords.length === 0) return;
    setDownloadingAll(true);
    setActionBanner(null);
    try {
      const res = await generatePortfolioCertificatesPdf(
        earnedRecords,
        currentIdentity.recipientName,
        { download: true },
      );
      setActionBanner(
        `Downloaded ${res.pageCount}-page A4 landscape portfolio PDF: ${res.filename}`,
      );
    } catch {
      setActionBanner(
        'Could not export portfolio PDF right now. Try downloading individual certificates.',
      );
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleCopyId = async (certId: string) => {
    let copied = false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(certId);
        copied = true;
      }
    } catch {
      copied = false;
    }
    if (!copied && typeof document !== 'undefined') {
      const ta = document.createElement('textarea');
      ta.value = certId;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        copied = document.execCommand('copy');
      } catch {
        copied = false;
      }
      document.body.removeChild(ta);
    }
    setCopiedId(certId);
    setActionBanner(
      copied
        ? `Copied Certificate ID: ${certId}`
        : `Certificate ID ready: ${certId}`,
    );
  };

  const handleVerifySubmit = (e: FormEvent) => {
    e.preventDefault();
    setVerificationResult(verifyCertificate(verifyInput));
  };

  return (
    <>
      <div className="space-y-6 sm:space-y-8 print:hidden">
      <PageHeader
        eyebrow="CREDENTIALS, PDF EXPORT & LOCAL VERIFICATION"
        title="ANANTRA Certificates Vault"
        subtitle="Open earned A4 landscape certificates, download print-ready PDFs, verify certificate IDs against local browser records, and inspect exact requirements for locked credentials."
        backTo={{ label: 'Back to Dashboard', to: '/dashboard' }}
        badges={
          <>
            <BadgePill
              tone={earnedCertificatesCount > 0 ? 'amber' : 'neutral'}
              icon={<Award className="h-3.5 w-3.5" />}
            >
              {earnedCertificatesCount}/{certificateStatuses.length} Earned
            </BadgePill>
            <BadgePill tone="cyan" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
              Local Record Registry
            </BadgePill>
          </>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            disabled={earnedRecords.length === 0 || downloadingAll}
            onClick={handleDownloadAll}
          >
            {downloadingAll
              ? 'Building Portfolio PDF…'
              : `Download All Earned (${earnedRecords.length})`}
          </Button>
        }
      />

      {currentIdentity.usedFallbackName && (
        <Card className="border-amber-400/40 bg-amber-500/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-300"
                aria-hidden="true"
              />
              <div className="text-xs text-amber-100 sm:text-sm">
                <p className="font-semibold text-amber-200">
                  Fallback Cadet Name Active
                </p>
                <p>
                  No full name is currently set on your Cadet Profile. New
                  certificates will fall back to{' '}
                  <strong>{currentIdentity.recipientName}</strong> until you add
                  your full name in Cadet Profile.
                </p>
              </div>
            </div>
            <ButtonLink to="/profile" variant="secondary" size="sm">
              Update Cadet Name
            </ButtonLink>
          </div>
        </Card>
      )}

      {actionBanner && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2.5 rounded-xl border border-emerald-400/40 bg-emerald-500/12 px-4 py-3 text-xs font-medium text-emerald-100 sm:text-sm"
        >
          <CheckCircle2
            className="h-4 w-4 shrink-0 text-emerald-300"
            aria-hidden="true"
          />
          <span>{actionBanner}</span>
        </div>
      )}

      {/* Certificate Verification Section (placed first if opened directly via /certificates/verify) */}
      <Card
        topAccentClassName="from-sky-400/80 via-cyan-400/60 to-transparent"
        className={initialFocusVerify ? 'ring-1 ring-sky-400/50' : ''}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-sky-300">
              Certificate ID Lookup
            </p>
            <h2 className="mt-0.5 font-display text-lg font-semibold text-slate-50">
              Verify an ANANTRA Certificate
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-300 sm:text-sm">
              Enter a Certificate ID to inspect issue date, cadet snapshot,
              qualification evidence, and current validity status inside this
              browser’s records.
            </p>
          </div>

          <div className="rounded-xl border border-space-border bg-space-void/75 px-3.5 py-2.5 text-xs text-slate-300 lg:max-w-sm">
            <p className="font-semibold text-sky-200">
              Local Verification vs. Server Accreditation
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
              Checks IDs stored in browser{' '}
              <code className="font-mono text-slate-300">localStorage</code>{' '}
              only. Not cryptographically signed or backed by a central server
              or NASA database.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleVerifySubmit}
          className="mt-4 flex flex-col gap-2.5 sm:flex-row"
        >
          <label htmlFor="vault-verify-id" className="sr-only">
            Enter Certificate ID to verify
          </label>
          <input
            id="vault-verify-id"
            type="text"
            value={verifyInput}
            onChange={(e) => setVerifyInput(e.target.value)}
            placeholder="Enter Certificate ID (e.g. ANANTRA-OS-20261111-K8P4M2)"
            className="min-h-11 flex-1 rounded-xl border border-space-border bg-space-void px-3.5 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={<Search className="h-4 w-4" />}
          >
            Verify Certificate ID
          </Button>
        </form>

        {earnedRecords.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400">Check earned record:</span>
            {earnedRecords.map((rec) => (
              <button
                key={rec.certificateId}
                type="button"
                onClick={() => {
                  setVerifyInput(rec.certificateId);
                  setVerificationResult(verifyCertificate(rec.certificateId));
                }}
                className="cursor-pointer rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 font-mono text-[11px] text-amber-200 hover:bg-amber-400/20"
              >
                {rec.title}: {rec.certificateId}
              </button>
            ))}
          </div>
        )}

        {verificationResult && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-4 rounded-xl border p-4 text-xs sm:text-sm ${
              verificationResult.status === 'verified'
                ? 'border-emerald-400/45 bg-emerald-500/10 text-emerald-100'
                : verificationResult.status === 'superseded'
                  ? 'border-amber-400/45 bg-amber-500/10 text-amber-100'
                  : 'border-rose-400/40 bg-rose-500/10 text-rose-100'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display text-base font-bold">
                {verificationResult.status === 'verified'
                  ? 'Verification Status: Verified in Local Browser Records'
                  : verificationResult.status === 'superseded'
                    ? 'Verification Status: Superseded by Updated Reissue'
                    : verificationResult.status === 'not-found'
                      ? 'Verification Status: Not Found in Local Records'
                      : 'Enter a Certificate ID'}
              </p>
              {verificationResult.record && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setPreviewKey(verificationResult.record!.certificateKey)
                  }
                >
                  Open Certificate Preview
                </Button>
              )}
            </div>

            <p className="mt-1.5 leading-relaxed">{verificationResult.message}</p>

            {verificationResult.record && (
              <div className="mt-3 grid gap-2.5 rounded-xl border border-space-border bg-space-void/80 p-3 text-xs text-slate-200 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-slate-400">Cadet Name</p>
                  <p className="font-semibold text-slate-50">
                    {verificationResult.record.recipientName}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Callsign &amp; Cadet ID</p>
                  <p className="font-mono text-sky-300">
                    {verificationResult.record.recipientCallsign} •{' '}
                    {verificationResult.record.cadetId}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Certification</p>
                  <p className="font-semibold text-amber-200">
                    {verificationResult.record.title}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Issue Date</p>
                  <p>{formatCertificateDate(verificationResult.record.issuedAt)}</p>
                </div>
              </div>
            )}

            <p className="mt-3 border-t border-white/10 pt-2.5 text-[11px] leading-relaxed text-slate-300">
              {verificationResult.honestScopeNote}
            </p>
          </div>
        )}
      </Card>

      {/* All 6 ANANTRA Certifications Grid */}
      <section aria-label="All training certifications" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-50">
              Training Certifications ({earnedCertificatesCount}/
              {certificateStatuses.length} Earned)
            </h2>
            <p className="text-xs text-slate-400 sm:text-sm">
              Certificates require completing both curriculum steps and real
              simulation/quiz proof — never awarded automatically without mastery.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {certificateStatuses.map((item) => {
            const { definition, eligibility, issuedRecord, profileMismatch } = item;
            const isEarned = issuedRecord !== null;

            return (
              <Card
                key={definition.key}
                topAccentClassName={
                  isEarned
                    ? 'from-amber-400/90 via-emerald-400/60 to-transparent'
                    : 'from-slate-500/40 via-slate-600/20 to-transparent'
                }
                className="flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-sky-300">
                        {definition.category}
                      </p>
                      <h3 className="mt-0.5 font-display text-lg font-bold text-slate-50">
                        {definition.title}
                      </h3>
                    </div>

                    {isEarned ? (
                      <BadgePill
                        tone="amber"
                        dot
                        icon={<FileBadge2 className="h-3.5 w-3.5" />}
                      >
                        Earned • Downloadable
                      </BadgePill>
                    ) : (
                      <BadgePill
                        tone="neutral"
                        icon={<Lock className="h-3.5 w-3.5" />}
                      >
                        Locked
                      </BadgePill>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                    {definition.description}
                  </p>

                  {isEarned && issuedRecord ? (
                    <div className="space-y-2 rounded-xl border border-amber-400/35 bg-amber-400/8 p-3 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono font-semibold text-amber-200">
                          {issuedRecord.certificateId}
                        </span>
                        <span className="text-slate-300">
                          Issued {formatCertificateDate(issuedRecord.issuedAt)}
                        </span>
                      </div>
                      <p className="text-slate-200">
                        Awarded to{' '}
                        <strong>
                          {issuedRecord.recipientName} ({issuedRecord.recipientCallsign})
                        </strong>
                      </p>
                      <p className="text-[11px] text-emerald-200">
                        {issuedRecord.evidenceSummary}
                      </p>

                      {profileMismatch && (
                        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-400/45 bg-amber-500/15 px-2.5 py-2 text-[11px] text-amber-100">
                          <span>
                            Profile changed to {currentIdentity.recipientName} (
                            {currentIdentity.recipientCallsign})
                          </span>
                          <button
                            type="button"
                            onClick={() => reissueCertificate(definition.key)}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-amber-300/50 bg-amber-400/20 px-2 py-0.5 font-semibold text-amber-100 hover:bg-amber-400/30"
                          >
                            <RefreshCw className="h-3 w-3" aria-hidden="true" />
                            Reissue
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2.5 rounded-xl border border-space-border bg-space-void/70 p-3 text-xs">
                      <ProgressBar
                        label="Qualification Progress"
                        value={eligibility.progressPercent}
                        size="sm"
                        helperText={`${eligibility.metCount}/${eligibility.totalCount} criteria verified`}
                      />
                      <ul className="space-y-1.5">
                        {eligibility.requirements.map((req) => (
                          <li
                            key={req.id}
                            className={`flex items-start gap-2 ${
                              req.met ? 'text-emerald-200' : 'text-slate-300'
                            }`}
                          >
                            {req.met ? (
                              <CheckCircle2
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300"
                                aria-hidden="true"
                              />
                            ) : (
                              <Lock
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300"
                                aria-hidden="true"
                              />
                            )}
                            <span>
                              {req.label} —{' '}
                              <span className="font-mono text-[11px] text-slate-400">
                                {req.progressText}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="flex flex-wrap items-center gap-2 border-t border-space-border/75 pt-3">
                  {isEarned && issuedRecord ? (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<FileBadge2 className="h-4 w-4" />}
                        onClick={() => setPreviewKey(definition.key)}
                      >
                        Preview Certificate
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Download className="h-4 w-4" />}
                        disabled={downloadingKey === definition.key}
                        onClick={() => handleDownloadSingle(item)}
                      >
                        {downloadingKey === definition.key
                          ? 'Building…'
                          : 'Download PDF'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Printer className="h-3.5 w-3.5" />}
                        onClick={() => setPreviewKey(definition.key)}
                      >
                        Print
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={
                          copiedId === issuedRecord.certificateId ? (
                            <Check className="h-3.5 w-3.5 text-emerald-300" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )
                        }
                        onClick={() => handleCopyId(issuedRecord.certificateId)}
                      >
                        Copy ID
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled
                        leftIcon={<Download className="h-4 w-4" />}
                      >
                        Download PDF (Locked)
                      </Button>
                      <ButtonLink to={definition.route} variant="primary" size="sm">
                        Continue Training
                      </ButtonLink>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Info className="h-3.5 w-3.5" />}
                        onClick={() => setLockedModalKey(definition.key)}
                      >
                        Requirements
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>

    <CertificatePreviewModal
      statusItem={activePreviewItem}
      currentCadetName={currentIdentity.recipientName}
      currentCadetCallsign={currentIdentity.recipientCallsign}
      onClose={() => setPreviewKey(null)}
      onReissue={reissueCertificate}
      onOpenVerify={(certId) => {
        setPreviewKey(null);
        setVerifyInput(certId);
        setVerificationResult(verifyCertificate(certId));
      }}
    />

    <LockedCertificateModal
      statusItem={activeLockedItem}
      onClose={() => setLockedModalKey(null)}
    />
  </>
  );
}
