import {
  AlertTriangle,
  Award,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Info,
  Lock,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BadgePill } from '../../components/ui/BadgePill';
import { Button, ButtonLink } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import type {
  CertificateKey,
  CertificateStatusItem,
  CertificateVerificationResult,
  IssuedCertificateRecord,
} from '../../types/certificate';
import { CertificateSheet } from './CertificateSheet';
import { generateSingleCertificatePdf } from './certificatePdf';
import { formatCertificateDate } from './certificateService';

interface CertificatePreviewModalProps {
  statusItem: CertificateStatusItem | null;
  currentCadetName: string;
  currentCadetCallsign: string;
  onClose: () => void;
  onReissue: (key: CertificateKey) => void;
  onOpenVerify: (certificateId: string) => void;
}

export function CertificatePreviewModal({
  statusItem,
  currentCadetName,
  currentCadetCallsign,
  onClose,
  onReissue,
  onOpenVerify,
}: CertificatePreviewModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadNote, setDownloadNote] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const record = statusItem?.issuedRecord ?? null;

  useEffect(() => {
    setDownloadNote(null);
    setCopiedId(false);
  }, [record?.certificateId, record?.reissuedAt]);

  useEffect(() => {
    if (!statusItem || !record) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [statusItem, record, onClose]);

  if (!statusItem || !record) return null;

  const handleDownloadPdf = async () => {
    setDownloading(true);
    setDownloadNote(null);
    try {
      const result = await generateSingleCertificatePdf(record, {
        download: true,
      });
      setDownloadNote(`Downloaded A4 landscape PDF: ${result.filename}`);
    } catch {
      setDownloadNote('Could not build PDF right now. Please try Print Certificate.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  };

  const handleCopyId = async () => {
    const text = record.certificateId;
    let copied = false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied && typeof document !== 'undefined') {
      const ta = document.createElement('textarea');
      ta.value = text;
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

    setCopiedId(true);
    setDownloadNote(
      copied
        ? `Copied Certificate ID ${text} to clipboard.`
        : `Certificate ID ready: ${text}`,
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-6 print:static print:block print:bg-transparent print:p-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-preview-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="my-auto w-full max-w-5xl rounded-2xl border border-amber-400/40 bg-space-navy p-4 shadow-2xl sm:p-6 print:max-w-none print:border-0 print:bg-transparent print:p-0 print:shadow-none">
        {/* Modal Action & Header Bar (hidden in print) */}
        <div className="mb-4 flex flex-col gap-3 border-b border-space-border/80 pb-4 lg:flex-row lg:items-center lg:justify-between print:hidden">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <BadgePill tone="amber" dot icon={<Award className="h-3.5 w-3.5" />}>
                Earned ANANTRA Certificate
              </BadgePill>
              <span className="font-mono text-xs text-slate-300">
                {record.certificateId}
              </span>
            </div>
            <h2
              id="cert-preview-modal-title"
              className="mt-1 font-display text-lg font-bold text-slate-50 sm:text-xl"
            >
              {record.title} — Certificate Preview
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleDownloadPdf}
              disabled={downloading}
            >
              {downloading ? 'Generating PDF…' : 'Download PDF'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Printer className="h-4 w-4" />}
              onClick={handlePrint}
            >
              Print Certificate
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={
                copiedId ? (
                  <Check className="h-4 w-4 text-emerald-300" />
                ) : (
                  <Copy className="h-4 w-4" />
                )
              }
              onClick={handleCopyId}
            >
              {copiedId ? 'Copied ID' : 'Copy Certificate ID'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ShieldCheck className="h-4 w-4" />}
              onClick={() => onOpenVerify(record.certificateId)}
            >
              Verify ID
            </Button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close certificate preview"
              className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-space-border bg-space-void text-slate-300 hover:border-sky-400/50 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Deliberate Reissue Notice if Cadet Profile Name/Callsign changed since original issuance */}
        {statusItem.profileMismatch && (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-amber-400/45 bg-amber-500/12 p-3.5 text-xs text-amber-100 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <div className="flex items-start gap-2.5">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-300"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold text-amber-200">
                  Profile Identity Updated Since Original Issuance
                </p>
                <p className="mt-0.5 text-amber-100/90">
                  This certificate remains issued to{' '}
                  <strong>
                    {record.recipientName} ({record.recipientCallsign})
                  </strong>{' '}
                  so earned records are never silently rewritten. Your current
                  profile reads{' '}
                  <strong>
                    {currentCadetName} ({currentCadetCallsign})
                  </strong>
                  .
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0 border-amber-400/50 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30"
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              onClick={() => onReissue(record.certificateKey)}
            >
              Reissue Under Current Name
            </Button>
          </div>
        )}

        {downloadNote && (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/12 px-3.5 py-2.5 text-xs font-medium text-emerald-100 print:hidden"
          >
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-emerald-300"
              aria-hidden="true"
            />
            <span>{downloadNote}</span>
          </div>
        )}

        {/* Live Landscape A4 Certificate Document */}
        <CertificateSheet record={record} />

        {/* Honest Educational Footnote */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 print:hidden">
          <p className="inline-flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
            <span>
              A4 Landscape PDF export &amp; browser local verification • Not an
              official NASA credential
            </span>
          </p>
          <Link
            to="/certificates"
            onClick={onClose}
            className="inline-flex items-center gap-1 font-medium text-sky-300 hover:text-sky-200"
          >
            Open Full Certificates Vault <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

interface LockedCertificateModalProps {
  statusItem: CertificateStatusItem | null;
  onClose: () => void;
}

export function LockedCertificateModal({
  statusItem,
  onClose,
}: LockedCertificateModalProps) {
  useEffect(() => {
    if (!statusItem) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [statusItem, onClose]);

  if (!statusItem) return null;
  const { definition, eligibility } = statusItem;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="locked-cert-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="my-auto w-full max-w-xl rounded-2xl border border-space-border bg-space-navy p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <BadgePill tone="neutral" icon={<Lock className="h-3.5 w-3.5" />}>
              Certification Locked • Requirements Pending
            </BadgePill>
            <h2
              id="locked-cert-title"
              className="mt-2 font-display text-xl font-bold text-slate-50"
            >
              {definition.title}
            </h2>
            <p className="mt-0.5 text-xs font-mono text-sky-300">
              {definition.category}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close certificate requirements"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-space-border bg-space-void text-slate-300 hover:border-sky-400/50 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          {definition.unlockSummary}
        </p>

        <div className="mt-4">
          <ProgressBar
            label="Qualification Progress"
            value={eligibility.progressPercent}
            helperText={`${eligibility.metCount}/${eligibility.totalCount} certification requirements satisfied`}
          />
        </div>

        <div className="mt-4 space-y-2.5">
          {eligibility.requirements.map((req) => (
            <div
              key={req.id}
              className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs ${
                req.met
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
                  : 'border-amber-400/35 bg-space-void/75 text-slate-200'
              }`}
            >
              {req.met ? (
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300"
                  aria-hidden="true"
                />
              ) : (
                <Lock
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-300"
                  aria-hidden="true"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{req.label}</p>
                <p className="mt-0.5 font-mono text-[11px] opacity-90">
                  {req.progressText}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5 border-t border-space-border/80 pt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled
            leftIcon={<Download className="h-4 w-4" />}
          >
            Download PDF (Locked)
          </Button>
          <ButtonLink to={definition.route} variant="primary" size="sm" onClick={onClose}>
            Unlock in Training Module
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

interface CertificateVerificationModalProps {
  open: boolean;
  initialQuery?: string;
  issuedCertificates: IssuedCertificateRecord[];
  onVerify: (certificateId: string) => CertificateVerificationResult;
  onSelectPreviewRecord: (record: IssuedCertificateRecord) => void;
  onClose: () => void;
}

export function CertificateVerificationModal({
  open,
  initialQuery = '',
  issuedCertificates,
  onVerify,
  onSelectPreviewRecord,
  onClose,
}: CertificateVerificationModalProps) {
  const [queryId, setQueryId] = useState(initialQuery);
  const [result, setResult] = useState<CertificateVerificationResult | null>(
    null,
  );

  useEffect(() => {
    if (!open) return;
    setQueryId(initialQuery);
    if (initialQuery.trim()) {
      setResult(onVerify(initialQuery));
    } else {
      setResult(null);
    }
  }, [open, initialQuery, onVerify]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setResult(onVerify(queryId));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-cert-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="my-auto w-full max-w-2xl rounded-2xl border border-space-border bg-space-navy p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <BadgePill tone="cyan" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
              Local Browser Record Verification
            </BadgePill>
            <h2
              id="verify-cert-modal-title"
              className="mt-2 font-display text-xl font-bold text-slate-50"
            >
              Verify ANANTRA Certificate ID
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close verification dialog"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-space-border bg-space-void text-slate-300 hover:border-sky-400/50 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="modal-verify-cert-id">
            Certificate ID
          </label>
          <input
            id="modal-verify-cert-id"
            type="text"
            value={queryId}
            onChange={(e) => setQueryId(e.target.value)}
            placeholder="e.g. ANANTRA-OS-20261111-K8P4M2"
            className="min-h-10 flex-1 rounded-xl border border-space-border bg-space-void px-3.5 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            leftIcon={<Search className="h-4 w-4" />}
          >
            Verify ID
          </Button>
        </form>

        {issuedCertificates.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400">Your earned IDs:</span>
            {issuedCertificates.map((c) => (
              <button
                key={c.certificateId}
                type="button"
                onClick={() => {
                  setQueryId(c.certificateId);
                  setResult(onVerify(c.certificateId));
                }}
                className="cursor-pointer rounded-full border border-sky-400/35 bg-sky-400/10 px-2.5 py-0.5 font-mono text-[11px] text-sky-200 hover:bg-sky-400/20"
              >
                {c.certificateId}
              </button>
            ))}
          </div>
        )}

        {result && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-4 rounded-xl border p-4 text-xs ${
              result.status === 'verified'
                ? 'border-emerald-400/45 bg-emerald-500/10 text-emerald-100'
                : result.status === 'superseded'
                  ? 'border-amber-400/45 bg-amber-500/10 text-amber-100'
                  : 'border-rose-400/40 bg-rose-500/10 text-rose-100'
            }`}
          >
            <p className="font-display text-sm font-bold">
              {result.status === 'verified'
                ? 'Status: Verified in Local Browser Records'
                : result.status === 'superseded'
                  ? 'Status: Superseded by Reissued Certificate'
                  : result.status === 'not-found'
                    ? 'Status: Not Found in Local Records'
                    : 'Enter a Certificate ID'}
            </p>
            <p className="mt-1 leading-relaxed">{result.message}</p>

            {result.record && (
              <div className="mt-3 grid gap-2 rounded-xl border border-space-border/80 bg-space-void/80 p-3 text-slate-200 sm:grid-cols-2">
                <div>
                  <span className="text-slate-400">Cadet:</span>{' '}
                  <strong>{result.record.recipientName}</strong> ({result.record.recipientCallsign})
                </div>
                <div>
                  <span className="text-slate-400">Credential:</span>{' '}
                  <strong>{result.record.title}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Issue Date:</span>{' '}
                  {formatCertificateDate(result.record.issuedAt)}
                </div>
                <div>
                  <span className="text-slate-400">Active ID:</span>{' '}
                  <span className="font-mono text-[#f3d579]">
                    {result.record.certificateId}
                  </span>
                </div>
                <div className="sm:col-span-2 flex justify-end pt-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (result.record) {
                        onClose();
                        onSelectPreviewRecord(result.record);
                      }
                    }}
                  >
                    Open Full Certificate
                  </Button>
                </div>
              </div>
            )}

            <p className="mt-3 border-t border-white/10 pt-2.5 text-[11px] leading-relaxed text-slate-300">
              {result.honestScopeNote}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
