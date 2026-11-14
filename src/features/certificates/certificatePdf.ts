import type { jsPDF as JsPdfType } from 'jspdf';
import type { IssuedCertificateRecord } from '../../types/certificate';
import {
  formatAllCertificatesPdfFilename,
  formatCertificateDate,
  formatCertificatePdfFilename,
} from './certificateService';

function toPdfSafeText(raw: string): string {
  return raw
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2265/g, '>=')
    .replace(/\u2264/g, '<=')
    .replace(/\u00D7/g, 'x')
    .replace(/\u2082/g, '2')
    .replace(/\u2022/g, '*')
    .replace(/[^\x20-\xFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function drawCertificatePage(
  doc: JsPdfType,
  record: IssuedCertificateRecord,
  pageIndexLabel?: string,
): void {
  const W = 297;
  const H = 210;
  const CX = W / 2;

  // 1. Deep midnight navy celestial backdrop
  doc.setFillColor(6, 14, 34);
  doc.rect(0, 0, W, H, 'F');

  // Subtle inner midnight navy panel
  doc.setFillColor(10, 21, 49);
  doc.rect(8, 8, W - 16, H - 16, 'F');

  // Subtle perimeter starlight dots (kept away from core reading zone)
  const starCoords: Array<[number, number, number, boolean]> = [
    [20, 22, 0.55, false],
    [42, 16, 0.4, true],
    [255, 18, 0.5, false],
    [277, 26, 0.45, true],
    [18, 95, 0.45, true],
    [279, 102, 0.45, false],
    [22, 188, 0.5, false],
    [274, 190, 0.55, true],
    [92, 15, 0.35, true],
    [205, 195, 0.4, false],
  ];
  for (const [sx, sy, sr, cyanTone] of starCoords) {
    if (cyanTone) {
      doc.setFillColor(125, 211, 252);
    } else {
      doc.setFillColor(243, 213, 121);
    }
    doc.circle(sx, sy, sr, 'F');
  }

  // Subtle decorative orbital arcs inside header/footer margin
  doc.setDrawColor(23, 44, 88);
  doc.setLineWidth(0.35);
  doc.ellipse(CX, 105, 122, 76, 'S');
  doc.setDrawColor(19, 36, 74);
  doc.ellipse(CX, 105, 114, 68, 'S');

  // 2. Double gold frame & corner telemetry brackets
  doc.setDrawColor(216, 178, 76); // champagne gold
  doc.setLineWidth(1.0);
  doc.rect(8, 8, W - 16, H - 16, 'S');

  doc.setDrawColor(173, 134, 43);
  doc.setLineWidth(0.35);
  doc.rect(11.5, 11.5, W - 23, H - 23, 'S');

  // Corner L accents
  doc.setDrawColor(243, 213, 121);
  doc.setLineWidth(0.9);
  const bLen = 10;
  // Top-left
  doc.line(13.5, 13.5, 13.5 + bLen, 13.5);
  doc.line(13.5, 13.5, 13.5, 13.5 + bLen);
  // Top-right
  doc.line(W - 13.5, 13.5, W - 13.5 - bLen, 13.5);
  doc.line(W - 13.5, 13.5, W - 13.5, 13.5 + bLen);
  // Bottom-left
  doc.line(13.5, H - 13.5, 13.5 + bLen, H - 13.5);
  doc.line(13.5, H - 13.5, 13.5, H - 13.5 - bLen);
  // Bottom-right
  doc.line(W - 13.5, H - 13.5, W - 13.5 - bLen, H - 13.5);
  doc.line(W - 13.5, H - 13.5, W - 13.5, H - 13.5 - bLen);

  // 3. Top Branding Header (Left: ANANTRA crest, Right: Record ledger)
  // Vector Crest at (26, 26)
  doc.setFillColor(15, 31, 68);
  doc.setDrawColor(56, 189, 248);
  doc.setLineWidth(0.6);
  doc.circle(26, 26, 7.2, 'FD');

  doc.setDrawColor(243, 213, 121);
  doc.setLineWidth(0.35);
  doc.ellipse(26, 26, 9.6, 3.3, 'S');

  // Delta arrow inside emblem
  doc.setFillColor(243, 213, 121);
  doc.triangle(26, 20.5, 22.8, 30.2, 26, 27.6, 'F');
  doc.setFillColor(125, 211, 252);
  doc.triangle(26, 20.5, 29.2, 30.2, 26, 27.6, 'F');

  doc.setTextColor(248, 250, 252);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ANANTRA', 39, 25.2);

  doc.setTextColor(125, 211, 252);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.text('JUNIOR ASTRONAUT MISSION TRAINER', 39, 29.8);

  // Right Header Ledger
  doc.setTextColor(148, 163, 184);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.2);
  doc.text('CERTIFICATE ID', W - 20, 21.5, { align: 'right' });
  doc.setTextColor(243, 213, 121);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.text(toPdfSafeText(record.certificateId), W - 20, 25.6, { align: 'right' });

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const issueLabel = toPdfSafeText(
    `Issued ${formatCertificateDate(record.issuedAt)}${pageIndexLabel ? ` * ${pageIndexLabel}` : ''}`,
  );
  doc.text(issueLabel, W - 20, 30.2, { align: 'right' });

  // Horizontal separator
  doc.setDrawColor(38, 63, 114);
  doc.setLineWidth(0.35);
  doc.line(20, 36.5, W - 20, 36.5);

  // 4. Main Certificate Typography
  doc.setTextColor(103, 232, 249);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(
    toPdfSafeText(`ANANTRA ACADEMY  *  ${record.category.toUpperCase()}`),
    CX,
    45.5,
    { align: 'center' },
  );

  doc.setTextColor(248, 250, 252);
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.text('CERTIFICATE OF TRAINING ACHIEVEMENT', CX, 55.5, {
    align: 'center',
  });

  // Gold center rule with diamond
  doc.setDrawColor(216, 178, 76);
  doc.setLineWidth(0.5);
  doc.line(CX - 54, 60.5, CX - 5, 60.5);
  doc.line(CX + 5, 60.5, CX + 54, 60.5);
  doc.setFillColor(243, 213, 121);
  doc.triangle(CX, 58.6, CX + 2, 60.5, CX, 62.4, 'F');
  doc.triangle(CX, 58.6, CX - 2, 60.5, CX, 62.4, 'F');

  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('THIS CERTIFIES THAT', CX, 69.5, { align: 'center' });

  // Cadet Full Name (auto-sized so very long names never clip)
  const safeName = toPdfSafeText(record.recipientName) || 'Junior Astronaut Cadet';
  const nameFontSize =
    safeName.length > 34 ? 19 : safeName.length > 24 ? 23 : 28;
  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(nameFontSize);
  doc.text(safeName, CX, 82, { align: 'center', maxWidth: 230 });

  // Delicate underline beneath name
  doc.setDrawColor(216, 178, 76);
  doc.setLineWidth(0.4);
  doc.line(CX - 68, 86.2, CX + 68, 86.2);

  // Callsign / Cadet ID / Specialization strip
  const metaStrip = toPdfSafeText(
    `CALLSIGN: ${record.recipientCallsign}   *   CADET ID: ${record.cadetId}   *   ${record.recipientSpecializationTitle}`,
  );
  doc.setTextColor(125, 211, 252);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.8);
  doc.text(metaStrip, CX, 92.8, { align: 'center', maxWidth: 240 });

  doc.setTextColor(203, 213, 225);
  doc.setFont('times', 'italic');
  doc.setFontSize(10.8);
  doc.text(
    'has completed all practical curriculum and simulation verification criteria to earn the credential',
    CX,
    102.5,
    { align: 'center' },
  );

  // Certification Title in Gold
  doc.setTextColor(243, 213, 121);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  doc.text(toPdfSafeText(record.title), CX, 114, { align: 'center' });

  // Certification Description (wrapped cleanly)
  doc.setTextColor(226, 232, 240);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.6);
  const descLines = doc.splitTextToSize(toPdfSafeText(record.description), 206);
  doc.text(descLines.slice(0, 3), CX, 122.2, {
    align: 'center',
    lineHeightFactor: 1.38,
  });

  // Verified Evidence Pill
  const safeEvidence = toPdfSafeText(`Verified Record: ${record.evidenceSummary}`);
  const pillW = Math.min(210, Math.max(118, safeEvidence.length * 1.9 + 18));
  doc.setFillColor(16, 33, 71);
  doc.setDrawColor(56, 189, 248);
  doc.setLineWidth(0.35);
  doc.roundedRect(CX - pillW / 2, 137.5, pillW, 9.2, 4.2, 4.2, 'FD');

  doc.setTextColor(165, 243, 252);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(safeEvidence, CX, 143.4, { align: 'center', maxWidth: pillW - 8 });

  // 5. Footer Section: Signature Designation (Left) | Gold Embossed Seal (Center) | Authenticity Notice (Right)
  // Left: Authorized Designation (No fabricated individual person signature)
  doc.setDrawColor(216, 178, 76);
  doc.setLineWidth(0.4);
  // Stylized orbital program insignia stroke above rule
  doc.line(34, 169, 44, 164);
  doc.line(44, 164, 52, 169.5);
  doc.line(52, 169.5, 68, 164.5);
  doc.line(68, 164.5, 86, 168);

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.35);
  doc.line(24, 174, 106, 174);

  doc.setTextColor(248, 250, 252);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(toPdfSafeText(record.authorizedDesignation), 65, 179.5, {
    align: 'center',
    maxWidth: 82,
  });

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.text(
    'Authorized Program Designation * Client Telemetry Issue',
    65,
    184.2,
    { align: 'center' },
  );
  if (record.reissuedAt) {
    doc.setTextColor(251, 191, 36);
    doc.text(
      toPdfSafeText(`Reissued: ${formatCertificateDate(record.reissuedAt)}`),
      65,
      188.6,
      { align: 'center' },
    );
  }

  // Center: Gold Embossed-Style Achievement Seal
  const sealY = 172;
  const spikes = 24;
  const outerR = 17.2;
  const innerR = 14.6;
  doc.setFillColor(212, 166, 54);
  doc.setDrawColor(246, 224, 146);
  doc.setLineWidth(0.3);
  for (let i = 0; i < spikes; i += 1) {
    const a1 = ((i * 360) / spikes) * (Math.PI / 180);
    const a2 = (((i + 0.5) * 360) / spikes) * (Math.PI / 180);
    const a3 = (((i + 1) * 360) / spikes) * (Math.PI / 180);
    doc.triangle(
      CX + outerR * Math.cos(a1),
      sealY + outerR * Math.sin(a1),
      CX + innerR * Math.cos(a2),
      sealY + innerR * Math.sin(a2),
      CX + outerR * Math.cos(a3),
      sealY + outerR * Math.sin(a3),
      'F',
    );
  }
  doc.setFillColor(186, 140, 38);
  doc.circle(CX, sealY, 14.2, 'F');
  doc.setFillColor(10, 21, 49);
  doc.setDrawColor(246, 224, 146);
  doc.setLineWidth(0.55);
  doc.circle(CX, sealY, 11.4, 'FD');
  doc.setDrawColor(216, 178, 76);
  doc.setLineWidth(0.25);
  doc.circle(CX, sealY, 9.8, 'S');

  doc.setTextColor(246, 224, 146);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.text('ANANTRA', CX, sealY - 5.2, { align: 'center' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('HONOR', CX, sealY - 1.2, { align: 'center' });
  doc.setTextColor(125, 211, 252);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.2);
  doc.text(toPdfSafeText(record.moduleId === 'academy' ? 'ACADEMY' : record.authorizedDesignation.split(' ')[1]?.toUpperCase() ?? 'SEAL'), CX, sealY + 3.4, {
    align: 'center',
    maxWidth: 18,
  });
  doc.setTextColor(246, 224, 146);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.8);
  doc.text('VERIFIED', CX, sealY + 7.2, { align: 'center' });

  // Right: Non-Accreditation Disclaimer & Verification Record
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.35);
  doc.line(191, 174, 273, 174);

  doc.setTextColor(243, 213, 121);
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.2);
  doc.text(toPdfSafeText(`Verify: ${record.certificateId}`), 232, 169.5, {
    align: 'center',
    maxWidth: 82,
  });

  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('ANANTRA Educational Training Certificate', 232, 179.2, {
    align: 'center',
  });

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.4);
  const legalLines = doc.splitTextToSize(
    'Not an official NASA certification, license, or government accreditation. Verified solely against local ANANTRA browser training records.',
    80,
  );
  doc.text(legalLines.slice(0, 3), 232, 183.4, {
    align: 'center',
    lineHeightFactor: 1.28,
  });
}

export interface GeneratedPdfResult {
  filename: string;
  byteLength: number;
  pageCount: number;
  bytes: Uint8Array;
  triggerDownload: boolean;
}

function triggerBrowserPdfDownload(bytes: Uint8Array, filename: string): boolean {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    return false;
  }

  const copiedBuffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copiedBuffer).set(bytes);
  const blob = new Blob([copiedBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
  return true;
}

export async function generateSingleCertificatePdf(
  record: IssuedCertificateRecord,
  options: { download?: boolean } = { download: true },
): Promise<GeneratedPdfResult> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  drawCertificatePage(doc, record);
  const filename = formatCertificatePdfFilename(record.title, record.recipientName);
  const arrayBuf = doc.output('arraybuffer');
  const bytes = new Uint8Array(arrayBuf);
  const triggerDownload =
    options.download !== false
      ? triggerBrowserPdfDownload(bytes, filename)
      : false;

  return {
    filename,
    byteLength: bytes.byteLength,
    pageCount: 1,
    bytes,
    triggerDownload,
  };
}

export async function generatePortfolioCertificatesPdf(
  records: IssuedCertificateRecord[],
  recipientName: string,
  options: { download?: boolean } = { download: true },
): Promise<GeneratedPdfResult> {
  if (records.length === 0) {
    throw new Error('At least one earned certificate is required to export a PDF portfolio.');
  }

  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  records.forEach((record, index) => {
    if (index > 0) {
      doc.addPage('a4', 'landscape');
    }
    drawCertificatePage(
      doc,
      record,
      records.length > 1 ? `${index + 1} of ${records.length}` : undefined,
    );
  });

  const filename = formatAllCertificatesPdfFilename(recipientName);
  const arrayBuf = doc.output('arraybuffer');
  const bytes = new Uint8Array(arrayBuf);
  const triggerDownload =
    options.download !== false
      ? triggerBrowserPdfDownload(bytes, filename)
      : false;

  return {
    filename,
    byteLength: bytes.byteLength,
    pageCount: records.length,
    bytes,
    triggerDownload,
  };
}
