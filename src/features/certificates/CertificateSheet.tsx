import { Award, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { IssuedCertificateRecord } from '../../types/certificate';
import { CERTIFICATE_BY_KEY } from './certificateCatalog';
import { formatCertificateDate } from './certificateService';

interface CertificateSheetProps {
  record: IssuedCertificateRecord;
  compact?: boolean;
}

export function CertificateSheet({ record, compact = false }: CertificateSheetProps) {
  const def = CERTIFICATE_BY_KEY[record.certificateKey];
  const code = def?.code ?? 'ANT';
  const sealDivisionWord =
    record.moduleId === 'academy'
      ? 'ACADEMY'
      : record.authorizedDesignation.split(' ')[1]?.toUpperCase() ?? 'SEAL';

  const longNameClass =
    record.recipientName.length > 30
      ? 'text-xl sm:text-2xl md:text-3xl'
      : record.recipientName.length > 20
        ? 'text-2xl sm:text-3xl md:text-4xl'
        : 'text-2xl sm:text-4xl md:text-[2.6rem]';

  return (
    <article
      aria-label={`ANANTRA Certificate for ${record.title} awarded to ${record.recipientName}`}
      className={`anantra-print-certificate relative mx-auto w-full overflow-hidden rounded-xl border-2 border-[#d8b24c] bg-[#060e22] text-slate-100 shadow-[0_24px_60px_rgba(2,6,23,0.75)] select-none ${
        compact ? 'p-3 sm:p-4' : 'p-3.5 sm:p-6 md:p-8'
      }`}
    >
      {/* Subtle celestial starfield & orbital geometry layers */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.12),transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(216,178,76,0.09),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-2.5 rounded-lg border border-[#ad862b]/75 bg-[#0a1531]/85 sm:inset-3.5"
      />

      {/* Corner aerospace L-brackets */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-4.5 left-4.5 h-5 w-5 border-t-2 border-l-2 border-[#f3d579] sm:top-5.5 sm:left-5.5"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-4.5 right-4.5 h-5 w-5 border-t-2 border-r-2 border-[#f3d579] sm:top-5.5 sm:right-5.5"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4.5 left-4.5 h-5 w-5 border-b-2 border-l-2 border-[#f3d579] sm:bottom-5.5 sm:left-5.5"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-4.5 bottom-4.5 h-5 w-5 border-r-2 border-b-2 border-[#f3d579] sm:right-5.5 sm:bottom-5.5"
      />

      {/* Decorative background orbital ellipse SVG */}
      <svg
        aria-hidden="true"
        viewBox="0 0 800 540"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
        preserveAspectRatio="none"
      >
        <ellipse
          cx="400"
          cy="270"
          rx="330"
          ry="210"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1"
          strokeDasharray="6 8"
        />
        <ellipse
          cx="400"
          cy="270"
          rx="300"
          ry="184"
          fill="none"
          stroke="#d8b24c"
          strokeWidth="0.75"
        />
      </svg>

      {/* Main Certificate Frame Content */}
      <div className="relative z-10 flex flex-col justify-between gap-4 px-3 py-3 sm:px-6 sm:py-5">
        {/* Top Header Row */}
        <header className="flex flex-col gap-3 border-b border-sky-400/20 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <svg
              aria-hidden="true"
              viewBox="0 0 64 64"
              className="h-11 w-11 shrink-0"
            >
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="#0f1f44"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
              <ellipse
                cx="32"
                cy="32"
                rx="30"
                ry="11"
                fill="none"
                stroke="#f3d579"
                strokeWidth="1.6"
                transform="rotate(-14 32 32)"
              />
              <polygon points="32,14 23,41 32,34" fill="#f3d579" />
              <polygon points="32,14 41,41 32,34" fill="#7dd3fc" />
            </svg>
            <div className="min-w-0">
              <p className="font-display text-base font-bold tracking-[0.18em] text-slate-50 sm:text-lg">
                ANANTRA
              </p>
              <p className="font-mono text-[10px] tracking-[0.14em] text-sky-300 uppercase">
                Junior Astronaut Mission Trainer
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">
              Certificate ID
            </p>
            <p className="font-mono text-xs font-bold text-[#f3d579] sm:text-sm">
              {record.certificateId}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-300">
              Date Earned:{' '}
              <span className="font-medium text-slate-100">
                {formatCertificateDate(record.issuedAt)}
              </span>
              {record.reissuedAt && (
                <span className="ml-1.5 text-amber-300">
                  • Reissued {formatCertificateDate(record.reissuedAt)}
                </span>
              )}
            </p>
          </div>
        </header>

        {/* Center Citation Body */}
        <div className="mx-auto my-1 max-w-3xl space-y-2.5 text-center sm:space-y-3">
          <p className="font-mono text-[10px] font-semibold tracking-[0.22em] text-cyan-300 uppercase sm:text-xs">
            ANANTRA Academy • {record.category}
          </p>

          <h2 className="font-display text-lg font-bold tracking-[0.06em] text-slate-50 uppercase sm:text-2xl md:text-[1.75rem]">
            Certificate of Training Achievement
          </h2>

          {/* Gold Ornamental Divider */}
          <div
            aria-hidden="true"
            className="mx-auto flex max-w-xs items-center justify-center gap-2.5 py-0.5"
          >
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#d8b24c]" />
            <span className="h-2 w-2 rotate-45 bg-[#f3d579]" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#d8b24c]" />
          </div>

          <p className="text-[11px] tracking-[0.22em] text-slate-300 uppercase sm:text-xs">
            This Certifies That
          </p>

          <p
            className={`break-words px-2 font-serif font-bold tracking-tight text-white ${longNameClass}`}
          >
            {record.recipientName}
          </p>

          <div className="mx-auto h-px max-w-md bg-gradient-to-r from-transparent via-[#d8b24c]/80 to-transparent" />

          <p className="break-words font-mono text-[11px] font-semibold tracking-wider text-sky-300 sm:text-xs">
            CALLSIGN: {record.recipientCallsign} • CADET ID: {record.cadetId} •{' '}
            {record.recipientSpecializationTitle}
          </p>

          <p className="pt-1 font-serif text-xs italic text-slate-300 sm:text-sm">
            has successfully completed all hands-on curriculum and verified training
            criteria to earn the credential
          </p>

          <p className="font-display text-2xl font-bold tracking-wide text-[#f3d579] sm:text-3xl">
            {record.title}
          </p>

          <p className="mx-auto max-w-2xl text-xs leading-relaxed text-slate-200 sm:text-sm">
            {record.description}
          </p>

          <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-sky-400/40 bg-[#102147] px-3.5 py-1.5 text-[11px] font-medium text-cyan-200 sm:text-xs">
            <CheckCircle2
              className="h-3.5 w-3.5 shrink-0 text-emerald-300"
              aria-hidden="true"
            />
            <span className="break-words">{record.evidenceSummary}</span>
          </div>
        </div>

        {/* Bottom 3-Column Footer: Authorized Designation | Gold Embossed Seal | Non-Accreditation Disclaimer */}
        <footer className="mt-2 grid grid-cols-1 items-end gap-4 border-t border-sky-400/20 pt-4 sm:grid-cols-3">
          {/* Left: Authorized Designation (No fabricated individual person signature) */}
          <div className="text-center">
            <svg
              aria-hidden="true"
              viewBox="0 0 180 34"
              className="mx-auto h-7 w-40 text-[#f3d579]/90"
            >
              <path
                d="M18 24 C34 8, 44 27, 60 15 C74 5, 84 25, 102 14 C118 6, 134 23, 162 17"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <div className="mx-auto max-w-[210px] border-t border-slate-500/70 pt-1.5">
              <p className="text-xs font-semibold text-slate-100">
                {record.authorizedDesignation}
              </p>
              <p className="text-[10px] text-slate-400">
                Authorized Digital Designation • Local Telemetry Issue
              </p>
            </div>
          </div>

          {/* Center: Gold Embossed-Style Achievement Seal SVG */}
          <div className="flex flex-col items-center justify-center">
            <svg
              role="img"
              aria-label={`Gold ANANTRA achievement seal for ${record.title} (${code})`}
              viewBox="0 0 120 120"
              className="h-24 w-24 shrink-0 drop-shadow-[0_6px_14px_rgba(216,178,76,0.3)]"
            >
              <defs>
                <radialGradient id={`seal-${code}`} cx="38%" cy="32%" r="72%">
                  <stop offset="0%" stopColor="#fde68a" />
                  <stop offset="45%" stopColor="#d8b24c" />
                  <stop offset="100%" stopColor="#926b1c" />
                </radialGradient>
              </defs>
              {/* Scalloped outer rosette */}
              <polygon
                fill={`url(#seal-${code})`}
                stroke="#fef3c7"
                strokeWidth="1.2"
                points={Array.from({ length: 24 }, (_, idx) => {
                  const r = idx % 2 === 0 ? 56 : 47;
                  const angle = (idx * Math.PI) / 12;
                  return `${(60 + r * Math.cos(angle)).toFixed(1)},${(60 + r * Math.sin(angle)).toFixed(1)}`;
                }).join(' ')}
              />
              <circle cx="60" cy="60" r="42" fill="#08132b" stroke="#fde68a" strokeWidth="2" />
              <circle
                cx="60"
                cy="60"
                r="36"
                fill="none"
                stroke="#d8b24c"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x="60"
                y="40"
                textAnchor="middle"
                fill="#fde68a"
                fontSize="8.5"
                fontWeight="700"
                letterSpacing="1.6"
              >
                ANANTRA
              </text>
              <text
                x="60"
                y="56"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="12"
                fontWeight="700"
                letterSpacing="1"
              >
                HONOR
              </text>
              <text
                x="60"
                y="70"
                textAnchor="middle"
                fill="#7dd3fc"
                fontSize="9"
                fontWeight="700"
                fontFamily="monospace"
              >
                {sealDivisionWord}
              </text>
              <text
                x="60"
                y="84"
                textAnchor="middle"
                fill="#fde68a"
                fontSize="7"
                fontWeight="600"
                letterSpacing="1.2"
              >
                VERIFIED
              </text>
            </svg>
          </div>

          {/* Right: Authenticity & Honest Non-Accreditation Statement */}
          <div className="text-center">
            <div className="mb-1 inline-flex items-center gap-1 rounded-md border border-amber-400/35 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-200">
              <Award className="h-3 w-3" aria-hidden="true" />
              <span>{record.certificateId}</span>
            </div>
            <div className="mx-auto max-w-[230px] border-t border-slate-500/70 pt-1.5">
              <p className="inline-flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-200">
                <ShieldAlert className="h-3 w-3 text-amber-300" aria-hidden="true" />
                ANANTRA Training Certificate
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-slate-400">
                Educational achievement record issued by ANANTRA —{' '}
                <strong className="text-slate-300">
                  not an official NASA certification
                </strong>{' '}
                or flight qualification. Locally verifiable only.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
}
