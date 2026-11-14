import { MODULE_BY_ID } from '../../data/modules';
import type {
  CertificateDefinition,
  CertificateEligibility,
  CertificateKey,
  CertificateRequirementItem,
} from '../../types/certificate';
import type { ModuleId, TrainingState } from '../../types/training';

export const CERTIFICATE_DEFINITIONS: CertificateDefinition[] = [
  {
    key: 'orbital-scholar',
    moduleId: 'academy',
    code: 'OS',
    title: 'Orbital Scholar',
    category: 'Core Spaceflight Curriculum',
    description:
      'For demonstrating verified proficiency across multi-stage rocketry, orbital free-fall mechanics, spacesuit engineering, and Earth-to-Mars spaceflight fundamentals.',
    unlockSummary:
      'Complete all 3 Academy deck steps AND either study all 10 Academy topics or pass the 10-question Mastery Quiz (≥ 7/10).',
    authorizedDesignation: 'ANANTRA Curriculum Directorate',
    accent: 'cyan',
    route: '/academy',
  },
  {
    key: 'flight-director',
    moduleId: 'mission-control',
    code: 'FD',
    title: 'Flight Director',
    category: 'Powered Lunar Descent & Telemetry',
    description:
      'For commanding a controlled lunar powered descent against 1.62 m/s² gravity, balancing propellant reserves, vertical velocity, and sideways RCS drift onto the landing pad.',
    unlockSummary:
      'Complete all 3 Mission Control steps AND achieve at least 1 verified Safe Touchdown in the Moon Landing Simulator.',
    authorizedDesignation: 'ANANTRA Flight Simulation Division',
    accent: 'emerald',
    route: '/mission-control',
  },
  {
    key: 'microgravity-scientist',
    moduleId: 'zero-gravity-lab',
    code: 'MS',
    title: 'Microgravity Scientist',
    category: 'Newtonian Inertia & Fluid Physics',
    description:
      'For applying Newton’s laws of inertia (F = m · a), third-law recoil, linear momentum conservation (p = m · v), and zero-G fluid surface tension in experimental trials.',
    unlockSummary:
      'Complete all 3 Zero Gravity Lab steps AND pass at least 1 verified capture or friction comparison experiment inside the Motion Chamber.',
    authorizedDesignation: 'ANANTRA Orbital Physics Lab',
    accent: 'violet',
    route: '/zero-gravity-lab',
  },
  {
    key: 'eva-pioneer',
    moduleId: 'spacewalk-training',
    code: 'EP',
    title: 'EVA Pioneer',
    category: 'Extravehicular Activity & Suit Safety',
    description:
      'For selecting space-certified EVA tooling, enforcing dual safety tether lock protocols, managing portable life-support oxygen, and completing exterior truss operations.',
    unlockSummary:
      'Complete all 3 Spacewalk Training steps AND pass at least 1 verified EVA mission returning safely to the airlock.',
    authorizedDesignation: 'ANANTRA EVA Training Systems',
    accent: 'cyan',
    route: '/spacewalk-training',
  },
  {
    key: 'crisis-responder',
    moduleId: 'emergency-training',
    code: 'CR',
    title: 'Crisis Responder',
    category: 'Orbital Emergency Triage & Station Ops',
    description:
      'For executing calm, crew-first ISS emergency triage protocols across cabin pressure leaks, CO₂ scrubber preservation, electrical bus shedding, comms loss, and solar radiation shielding.',
    unlockSummary:
      'Complete all 3 Emergency Training steps AND pass at least 1 verified Emergency Triage Drill.',
    authorizedDesignation: 'ANANTRA Station Safety & Triage Directorate',
    accent: 'rose',
    route: '/emergency-training',
  },
  {
    key: 'curious-explorer',
    moduleId: 'ai-mentor',
    code: 'CE',
    title: 'Curious Explorer',
    category: 'Spaceflight Inquiry & ARIA Mastery',
    description:
      'For connecting first-principles physics questions, mission telemetry debriefs, and progressive problem-solving with verified spaceflight knowledge mastery.',
    unlockSummary:
      'Complete all 3 AI Mentor steps AND score at least 3/5 on the ARIA Cadet Knowledge Quiz.',
    authorizedDesignation: 'ANANTRA Educational Outreach Directorate',
    accent: 'amber',
    route: '/ai-mentor',
  },
];

export const CERTIFICATE_BY_KEY: Record<
  CertificateKey,
  CertificateDefinition
> = Object.fromEntries(
  CERTIFICATE_DEFINITIONS.map((def) => [def.key, def]),
) as Record<CertificateKey, CertificateDefinition>;

export const CERTIFICATE_BY_MODULE_ID: Record<ModuleId, CertificateDefinition> =
  Object.fromEntries(
    CERTIFICATE_DEFINITIONS.map((def) => [def.moduleId, def]),
  ) as Record<ModuleId, CertificateDefinition>;

function countValidCompletedTasks(
  moduleId: ModuleId,
  state: TrainingState,
): { done: number; total: number } {
  const mod = MODULE_BY_ID[moduleId];
  const validIds = new Set(mod.tasks.map((t) => t.id));
  const doneSet = new Set(
    (state.progressByModule[moduleId]?.completedTaskIds ?? []).filter((id) =>
      validIds.has(id),
    ),
  );
  return { done: doneSet.size, total: mod.tasks.length };
}

export function evaluateCertificateEligibility(
  definition: CertificateDefinition,
  state: TrainingState,
): CertificateEligibility {
  const { done: tasksDone, total: tasksTotal } = countValidCompletedTasks(
    definition.moduleId,
    state,
  );
  const deckDone = tasksTotal > 0 && tasksDone >= tasksTotal;
  const record = state.moduleRecords?.[definition.moduleId];
  const passedCount = record?.passedCount ?? 0;

  const requirements: CertificateRequirementItem[] = [
    {
      id: `${definition.key}-tasks`,
      label: `${MODULE_BY_ID[definition.moduleId].title} briefing & checklist steps`,
      met: deckDone,
      progressText: `${tasksDone}/${tasksTotal} steps completed`,
    },
  ];

  let evidenceSummary = '';

  switch (definition.key) {
    case 'orbital-scholar': {
      const studiedCount = state.academyStudiedLessonIds?.length ?? 0;
      const bestQuiz = state.academyBestQuizScore ?? null;
      const masteryMet =
        (bestQuiz !== null && bestQuiz >= 7) ||
        studiedCount >= 10 ||
        passedCount >= 1;
      requirements.push({
        id: 'orbital-scholar-mastery',
        label: 'Study all 10 Academy topics OR score ≥ 7/10 on Academy Mastery Quiz',
        met: masteryMet,
        progressText:
          bestQuiz !== null
            ? `${studiedCount}/10 topics • Best Quiz: ${bestQuiz}/10`
            : `${studiedCount}/10 topics studied • Quiz not passed yet`,
      });
      if (masteryMet) {
        evidenceSummary =
          bestQuiz !== null && bestQuiz >= 7
            ? `Academy Mastery Quiz ${bestQuiz}/10 • ${studiedCount}/10 Topics Studied`
            : `${studiedCount}/10 Academy Curriculum Topics Verified`;
      }
      break;
    }
    case 'flight-director': {
      const simPassed = passedCount >= 1;
      requirements.push({
        id: 'flight-director-sim',
        label: 'Achieve at least 1 Safe Moon Pad Touchdown in Moon Landing Simulator',
        met: simPassed,
        progressText: simPassed
          ? `${passedCount} safe landing${passedCount === 1 ? '' : 's'} logged (Best: ${record?.bestScore ?? '—'} pts)`
          : `${record?.attempts ?? 0} attempt${(record?.attempts ?? 0) === 1 ? '' : 's'} • 0 safe pad touchdowns`,
      });
      if (simPassed) {
        evidenceSummary = record?.bestScore
          ? `Moon Landing Simulator Passed • Best Score ${record.bestScore} pts`
          : `Verified Safe Lunar Pad Touchdown (${passedCount}×)`;
      }
      break;
    }
    case 'microgravity-scientist': {
      const labPassed = passedCount >= 1;
      requirements.push({
        id: 'microgravity-scientist-lab',
        label: 'Pass a verified physics dock/friction experiment in Zero Gravity Lab',
        met: labPassed,
        progressText: labPassed
          ? `${passedCount} verified lab pass${passedCount === 1 ? '' : 'es'} (Best: ${record?.bestScore ?? '—'} pts)`
          : `${record?.attempts ?? 0} run${(record?.attempts ?? 0) === 1 ? '' : 's'} • No passing Velcro Dock or Earth friction test logged`,
      });
      if (labPassed) {
        evidenceSummary = record?.bestScore
          ? `Zero Gravity Motion Chamber Verified • Best ${record.bestScore} pts`
          : `Zero Gravity Inertia & Friction Lab Passed`;
      }
      break;
    }
    case 'eva-pioneer': {
      const evaPassed = passedCount >= 1;
      requirements.push({
        id: 'eva-pioneer-mission',
        label: 'Complete a Spacewalk EVA repair or anomaly mission safely to the airlock',
        met: evaPassed,
        progressText: evaPassed
          ? `${passedCount} safe EVA return${passedCount === 1 ? '' : 's'} logged (Best: ${record?.bestScore ?? '—'} pts)`
          : `${record?.attempts ?? 0} attempt${(record?.attempts ?? 0) === 1 ? '' : 's'} • 0 safe EVA completions`,
      });
      if (evaPassed) {
        evidenceSummary = record?.bestScore
          ? `EVA Spacewalk Repair Verified • Best Score ${record.bestScore} pts`
          : `Certified Safe Airlock Return & Dual-Tether Protocol`;
      }
      break;
    }
    case 'crisis-responder': {
      const drillPassed = passedCount >= 1;
      requirements.push({
        id: 'crisis-responder-drill',
        label: 'Stabilize all alerts and pass an Emergency Training orbital drill',
        met: drillPassed,
        progressText: drillPassed
          ? `${passedCount} crisis drill${passedCount === 1 ? '' : 's'} passed (Best: ${record?.bestScore ?? '—'} pts)`
          : `${record?.attempts ?? 0} attempt${(record?.attempts ?? 0) === 1 ? '' : 's'} • 0 passing drills logged`,
      });
      if (drillPassed) {
        evidenceSummary = record?.bestScore
          ? `Orbital Emergency Triage Passed • Best Score ${record.bestScore} pts`
          : `Verified Crew-First Emergency Response Pass`;
      }
      break;
    }
    case 'curious-explorer': {
      const mentorBest = state.mentorBestQuizScore ?? null;
      const quizPassed = (mentorBest !== null && mentorBest >= 3) || passedCount >= 1;
      requirements.push({
        id: 'curious-explorer-quiz',
        label: 'Score ≥ 3/5 on the ARIA Cadet Knowledge Quiz',
        met: quizPassed,
        progressText:
          mentorBest !== null
            ? `Best ARIA Quiz: ${mentorBest}/5`
            : 'ARIA Quiz not completed yet (need ≥ 3/5)',
      });
      if (quizPassed) {
        evidenceSummary =
          mentorBest !== null
            ? `ARIA Knowledge Quiz ${mentorBest}/5 • Guided Q&A Completed`
            : `ARIA Spaceflight Inquiry & Quiz Verified`;
      }
      break;
    }
  }

  const metCount = requirements.filter((r) => r.met).length;
  const totalCount = requirements.length;
  const eligible = metCount === totalCount;

  // Granular percentage blending checklist steps + verification challenge
  const taskRatio = tasksTotal > 0 ? Math.min(1, tasksDone / tasksTotal) : 1;
  const verifyMet = requirements[1]?.met ? 1 : 0;
  const progressPercent = Math.round((taskRatio * 0.5 + verifyMet * 0.5) * 100);

  const remainingRequirements = requirements
    .filter((r) => !r.met)
    .map((r) => `${r.label} (${r.progressText})`);

  return {
    eligible,
    requirements,
    metCount,
    totalCount,
    progressPercent,
    remainingRequirements,
    evidenceSummary:
      evidenceSummary ||
      `${tasksDone}/${tasksTotal} steps completed — training verification pending`,
  };
}
