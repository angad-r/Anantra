import { MotionConfig } from 'framer-motion';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../../App';
import { TrainingProvider } from '../../context/TrainingContext';
import { TRAINING_MODULES } from '../../data/modules';
import { createBlankTrainingState } from '../../data/traineeSeed';
import type { CadetProfile } from '../../types/cadetProfile';
import type { TrainingState } from '../../types/training';
import {
  clearCadetProfile,
  saveCadetProfile,
} from '../../utils/cadetProfileStorage';
import {
  clearTrainingState,
  loadTrainingState,
  saveTrainingState,
} from '../../utils/storage';
import {
  CERTIFICATE_BY_KEY,
  CERTIFICATE_DEFINITIONS,
  evaluateCertificateEligibility,
} from './certificateCatalog';
import {
  generatePortfolioCertificatesPdf,
  generateSingleCertificatePdf,
} from './certificatePdf';
import {
  formatAllCertificatesPdfFilename,
  formatCertificatePdfFilename,
  reconcileIssuedCertificates,
  reissueCertificateRecord,
  resolveCadetCertificateIdentity,
  verifyCertificateById,
} from './certificateService';

function createCadet(overrides?: Partial<CadetProfile>): CadetProfile {
  const now = new Date().toISOString();
  return {
    version: 1,
    cadetId: 'ANT-ANG-701',
    firstName: 'Angad',
    fullName: 'Angad Ranjan',
    callsign: 'ASTRAL-7',
    specialization: 'lunar-explorer',
    avatarId: 'orbit-helmet',
    ageGroup: '14–16',
    favoriteDestination: 'Moon',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function createChecklistOnlyFullState(): TrainingState {
  const state = createBlankTrainingState();
  for (const mod of TRAINING_MODULES) {
    state.progressByModule[mod.id].completedTaskIds = mod.tasks.map((t) => t.id);
  }
  return state;
}

function createAllSixVerifiedState(): TrainingState {
  const state = createChecklistOnlyFullState();
  state.academyStudiedLessonIds = Array.from({ length: 10 }, (_, i) => `lesson-${i + 1}`);
  state.academyBestQuizScore = 9;
  state.mentorBestQuizScore = 5;
  state.moduleRecords = {
    academy: {
      attempts: 1,
      passedCount: 1,
      bestScore: 9,
      maxScore: 10,
      lastScore: 9,
      lastOutcome: 'success',
    },
    'mission-control': {
      attempts: 2,
      passedCount: 1,
      bestScore: 92,
      maxScore: 100,
      lastScore: 92,
      lastOutcome: 'success',
    },
    'zero-gravity-lab': {
      attempts: 1,
      passedCount: 1,
      bestScore: 96,
      maxScore: 100,
      lastScore: 96,
      lastOutcome: 'success',
    },
    'spacewalk-training': {
      attempts: 1,
      passedCount: 1,
      bestScore: 95,
      maxScore: 100,
      lastScore: 95,
      lastOutcome: 'success',
    },
    'emergency-training': {
      attempts: 1,
      passedCount: 1,
      bestScore: 100,
      maxScore: 100,
      lastScore: 100,
      lastOutcome: 'success',
    },
    'ai-mentor': {
      attempts: 1,
      passedCount: 1,
      bestScore: 5,
      maxScore: 5,
      lastScore: 5,
      lastOutcome: 'success',
    },
  };
  return state;
}

function renderAppAt(route: string) {
  return render(
    <MotionConfig reducedMotion="always">
      <TrainingProvider>
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes />
        </MemoryRouter>
      </TrainingProvider>
    </MotionConfig>,
  );
}

describe('ANANTRA Certificate Generation & Verification System', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearCadetProfile();
    clearTrainingState();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('never awards any certificate when 6/6 checklists are manually ticked without verified simulator or quiz mastery', () => {
    const cadet = createCadet();
    const fakeFullState = createChecklistOnlyFullState();

    for (const def of CERTIFICATE_DEFINITIONS) {
      const eligibility = evaluateCertificateEligibility(def, fakeFullState);
      expect(eligibility.eligible).toBe(false);
      expect(eligibility.metCount).toBe(1);
      expect(eligibility.totalCount).toBe(2);
      expect(eligibility.remainingRequirements).toHaveLength(1);
    }

    const reconciled = reconcileIssuedCertificates(fakeFullState, cadet);
    expect(reconciled.changed).toBe(false);
    expect(reconciled.certificates).toHaveLength(0);
  });

  it('requires BOTH deck steps AND real module mastery/passes to unlock each of the 6 certificates without duplicates', () => {
    const cadet = createCadet();
    const earnedAllState = createAllSixVerifiedState();

    const firstPass = reconcileIssuedCertificates(
      earnedAllState,
      cadet,
      '2026-11-11T10:00:00.000Z',
    );
    expect(firstPass.changed).toBe(true);
    expect(firstPass.certificates).toHaveLength(6);

    const uniqueIds = new Set(firstPass.certificates.map((c) => c.certificateId));
    expect(uniqueIds.size).toBe(6);

    for (const cert of firstPass.certificates) {
      expect(cert.recipientName).toBe('Angad Ranjan');
      expect(cert.recipientCallsign).toBe('ASTRAL-7');
      expect(cert.issuedAt).toBe('2026-11-11T10:00:00.000Z');
      expect(cert.certificateId).toMatch(/^ANANTRA-[A-Z]{2}-20261111-[A-Z0-9]{6}$/);
    }

    // Reconciling a second time later must be idempotent & never overwrite IDs or dates
    const withCerts: TrainingState = {
      ...earnedAllState,
      issuedCertificates: firstPass.certificates,
    };
    const secondPass = reconcileIssuedCertificates(
      withCerts,
      createCadet({ fullName: 'Changed Name', firstName: 'Changed' }),
      '2026-12-01T12:00:00.000Z',
    );
    expect(secondPass.changed).toBe(false);
    expect(secondPass.certificates).toEqual(firstPass.certificates);
  });

  it('handles missing profile information gracefully using safe default Cadet identity', () => {
    const fallback = resolveCadetCertificateIdentity(null, {
      id: '',
      name: '',
      callsign: '',
      cohort: '',
      missionDay: 1,
    });
    expect(fallback.recipientName).toBe('Junior Astronaut Cadet');
    expect(fallback.recipientCallsign).toBe('CADET-01');
    expect(fallback.usedFallbackName).toBe(true);

    const noProfileWithFirstName = resolveCadetCertificateIdentity(
      createCadet({ fullName: undefined, firstName: 'Riya' }),
    );
    expect(noProfileWithFirstName.recipientName).toBe('Riya');
    expect(noProfileWithFirstName.usedFallbackName).toBe(false);
  });

  it('builds valid multi-page and single A4 landscape PDF binaries with safe meaningful filenames', async () => {
    const cadet = createCadet({ firstName: 'Angad', fullName: 'Angad Ranjan' });
    const state = createAllSixVerifiedState();
    const { certificates } = reconcileIssuedCertificates(
      state,
      cadet,
      '2026-11-11T09:00:00.000Z',
    );

    const orbitalCert = certificates.find(
      (c) => c.certificateKey === 'orbital-scholar',
    )!;
    const flightCert = certificates.find(
      (c) => c.certificateKey === 'flight-director',
    )!;

    expect(
      formatCertificatePdfFilename(orbitalCert.title, orbitalCert.recipientName),
    ).toBe('ANANTRA_Orbital_Scholar_Angad_Ranjan.pdf');
    expect(formatAllCertificatesPdfFilename('Angad Ranjan')).toBe(
      'ANANTRA_All_Earned_Certificates_Angad_Ranjan.pdf',
    );

    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    const mockCreateUrl = vi.fn(() => 'blob:anantra-test-pdf');
    const mockRevokeUrl = vi.fn();
    URL.createObjectURL = mockCreateUrl;
    URL.revokeObjectURL = mockRevokeUrl;
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    try {
      const singleRes = await generateSingleCertificatePdf(orbitalCert, {
        download: true,
      });
      expect(singleRes.filename).toBe('ANANTRA_Orbital_Scholar_Angad_Ranjan.pdf');
      expect(singleRes.pageCount).toBe(1);
      expect(singleRes.byteLength).toBeGreaterThan(2000);
      expect(singleRes.triggerDownload).toBe(true);
      expect(mockCreateUrl).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);

      // Inspect raw PDF bytes for valid header & A4 landscape dimensions (841.89 x 595.28 pt = 297 x 210 mm)
      const singlePdfAscii = new TextDecoder('latin1').decode(singleRes.bytes);
      expect(singlePdfAscii.startsWith('%PDF-')).toBe(true);
      expect(singlePdfAscii).toMatch(
        /\/MediaBox\s+\[0\s+0\s+841\.8[89]\d*\s+595\.2[78]\d*\]/,
      );

      const portfolioRes = await generatePortfolioCertificatesPdf(
        [orbitalCert, flightCert],
        'Angad Ranjan',
        { download: true },
      );
      expect(portfolioRes.filename).toBe(
        'ANANTRA_All_Earned_Certificates_Angad_Ranjan.pdf',
      );
      expect(portfolioRes.pageCount).toBe(2);
      expect(portfolioRes.byteLength).toBeGreaterThan(singleRes.byteLength);
      expect(mockCreateUrl).toHaveBeenCalledTimes(2);
    } finally {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    }
  });

  it('displays 0/6 Earned on Dashboard when 6/6 checklist boxes exist without mastery, and shows locked requirements modal cleanly', async () => {
    saveCadetProfile(createCadet());
    saveTrainingState(createChecklistOnlyFullState());

    renderAppAt('/dashboard');

    expect(
      await screen.findByText('Earned Certifications', undefined, {
        timeout: 5000,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('0/6 Earned')).toBeInTheDocument();

    const downloadAllBtn = screen.getByRole('button', {
      name: /Download All Earned \(PDF\)/i,
    });
    expect(downloadAllBtn).toBeDisabled();

    const lockedFlightDirector = screen.getByRole('button', {
      name: /Flight Director certification locked/i,
    });
    fireEvent.click(lockedFlightDirector);

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByText(/Certification Locked/i),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/Achieve at least 1 Safe Moon Pad Touchdown/i),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: /Download PDF \(Locked\)/i }),
    ).toBeDisabled();
  });

  it('opens an interactive A4 landscape certificate preview modal from Dashboard for earned credentials and supports Print & Copy ID', async () => {
    saveCadetProfile(createCadet());
    const state = createBlankTrainingState();
    state.progressByModule.academy.completedTaskIds = [
      'academy-1',
      'academy-2',
      'academy-3',
    ];
    state.academyStudiedLessonIds = Array.from(
      { length: 10 },
      (_, i) => `lesson-${i + 1}`,
    );
    state.academyBestQuizScore = 10;
    saveTrainingState(state);

    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeTextMock },
    });
    const printMock = vi.fn();
    Object.defineProperty(window, 'print', {
      configurable: true,
      value: printMock,
    });

    renderAppAt('/dashboard');

    const earnedBadge = await screen.findByText('1/6 Earned', undefined, {
      timeout: 5000,
    });
    expect(earnedBadge).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Preview Orbital Scholar certificate/i }),
    );

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByText(/Orbital Scholar — Certificate Preview/i),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('Angad Ranjan')).toBeInTheDocument();
    expect(within(dialog).getByText(/ASTRAL-7/)).toBeInTheDocument();
    expect(
      within(dialog).getByText(/ANANTRA Curriculum Directorate/i),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/not an official NASA certification/i),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('img', {
        name: /Gold ANANTRA achievement seal for Orbital Scholar/i,
      }),
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: /Print Certificate/i }));
    expect(printMock).toHaveBeenCalledTimes(1);

    fireEvent.click(
      within(dialog).getByRole('button', { name: /Copy Certificate ID/i }),
    );
    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledTimes(1);
    });
    expect(writeTextMock.mock.calls[0][0]).toMatch(/^ANANTRA-OS-\d{8}-[A-Z0-9]{6}$/);
  });

  it('preserves existing certificate recipient names across Profile updates and supports deliberate Reissue + Verification status checks', async () => {
    saveCadetProfile(createCadet({ firstName: 'Angad', fullName: 'Angad Ranjan' }));
    const earnedState = createBlankTrainingState();
    earnedState.progressByModule['mission-control'].completedTaskIds = [
      'mc-1',
      'mc-2',
      'mc-3',
    ];
    earnedState.moduleRecords = {
      'mission-control': {
        attempts: 1,
        passedCount: 1,
        bestScore: 95,
        maxScore: 100,
        lastScore: 95,
        lastOutcome: 'success',
      },
    };
    const reconciled = reconcileIssuedCertificates(
      earnedState,
      createCadet({ firstName: 'Angad', fullName: 'Angad Ranjan' }),
      '2026-11-11T08:00:00.000Z',
    );
    earnedState.issuedCertificates = reconciled.certificates;
    saveTrainingState(earnedState);

    const originalCert = reconciled.certificates[0];
    expect(originalCert.recipientName).toBe('Angad Ranjan');

    // Navigate to Profile & change Cadet Full Name + Callsign
    const { unmount } = renderAppAt('/profile');
    const firstNameInput = await screen.findByLabelText(/First Name/i, undefined, {
      timeout: 5000,
    });
    const fullNameInput = screen.getByLabelText(/Full Name for Certificates/i);
    const callsignInput = screen.getByLabelText(/Astronaut Callsign/i);

    fireEvent.change(firstNameInput, { target: { value: 'Aarav' } });
    fireEvent.change(fullNameInput, { target: { value: 'Aarav Sharma' } });
    fireEvent.change(callsignInput, { target: { value: 'ORION-99' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Profile Changes/i }));

    // Existing issued certificate MUST still hold the original snapshot & ID
    const storedAfterEdit = loadTrainingState();
    expect(storedAfterEdit.ok).toBe(true);
    if (storedAfterEdit.ok && storedAfterEdit.state) {
      const persistedCert = storedAfterEdit.state.issuedCertificates?.[0];
      expect(persistedCert?.recipientName).toBe('Angad Ranjan');
      expect(persistedCert?.recipientCallsign).toBe('ASTRAL-7');
      expect(persistedCert?.certificateId).toBe(originalCert.certificateId);
    }
    unmount();

    // Open Certificates Vault -> deliberate Reissue -> then check Verification console!
    renderAppAt('/certificates');

    expect(
      await screen.findByRole(
        'heading',
        { name: 'ANANTRA Certificates Vault' },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Profile changed to Aarav Sharma \(ORION-99\)/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Reissue$/i }));

    const afterReissue = loadTrainingState();
    let newId = '';
    if (afterReissue.ok && afterReissue.state) {
      const updatedCert = afterReissue.state.issuedCertificates?.[0];
      expect(updatedCert?.recipientName).toBe('Aarav Sharma');
      expect(updatedCert?.recipientCallsign).toBe('ORION-99');
      expect(updatedCert?.certificateId).not.toBe(originalCert.certificateId);
      expect(updatedCert?.supersededIds).toContain(originalCert.certificateId);
      newId = updatedCert?.certificateId ?? '';
    }

    // Verify new ID -> 'verified'; old ID -> 'superseded'; garbage ID -> 'not-found'
    const verifyInput = screen.getByLabelText(/Enter Certificate ID to verify/i);
    const verifySubmit = screen.getByRole('button', {
      name: /Verify Certificate ID/i,
    });

    fireEvent.change(verifyInput, { target: { value: newId } });
    fireEvent.click(verifySubmit);
    expect(
      screen.getByText(/Verification Status: Verified in Local Browser Records/i),
    ).toBeInTheDocument();

    fireEvent.change(verifyInput, { target: { value: originalCert.certificateId } });
    fireEvent.click(verifySubmit);
    expect(
      screen.getByText(/Verification Status: Superseded by Updated Reissue/i),
    ).toBeInTheDocument();

    fireEvent.change(verifyInput, { target: { value: 'ANANTRA-XX-20260101-NOPE00' } });
    fireEvent.click(verifySubmit);
    expect(
      screen.getByText(/Verification Status: Not Found in Local Records/i),
    ).toBeInTheDocument();
  }, 15000);

  it('verifies direct unit behavior of reissueCertificateRecord and verifyCertificateById', () => {
    const state = createAllSixVerifiedState();
    const initialCadet = createCadet();
    const { certificates } = reconcileIssuedCertificates(
      state,
      initialCadet,
      '2026-11-11T08:00:00.000Z',
    );
    const seededState: TrainingState = {
      ...state,
      issuedCertificates: certificates,
    };

    const evaCert = certificates.find((c) => c.certificateKey === 'eva-pioneer')!;
    const renamedCadet = createCadet({
      firstName: 'Meera',
      fullName: 'Meera Nair',
      callsign: 'VEGA-12',
    });

    const nextCerts = reissueCertificateRecord(
      seededState,
      'eva-pioneer',
      renamedCadet,
      '2026-11-12T10:00:00.000Z',
    );
    const reissuedState: TrainingState = {
      ...seededState,
      issuedCertificates: nextCerts,
    };

    const activeCheck = verifyCertificateById(
      nextCerts.find((c) => c.certificateKey === 'eva-pioneer')!.certificateId,
      reissuedState,
    );
    expect(activeCheck.status).toBe('verified');
    expect(activeCheck.record?.recipientName).toBe('Meera Nair');

    const supersededCheck = verifyCertificateById(
      evaCert.certificateId,
      reissuedState,
    );
    expect(supersededCheck.status).toBe('superseded');
    expect(supersededCheck.honestScopeNote).toMatch(/localStorage/i);

    const missingCheck = verifyCertificateById('DOES-NOT-EXIST', reissuedState);
    expect(missingCheck.status).toBe('not-found');
    expect(CERTIFICATE_BY_KEY['eva-pioneer'].authorizedDesignation).toBe(
      'ANANTRA EVA Training Systems',
    );
  });
});
