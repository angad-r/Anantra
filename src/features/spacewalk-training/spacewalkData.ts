import type { FeatureModuleData } from '../../types/training';

export const spacewalkData: FeatureModuleData = {
  id: 'spacewalk-training',
  title: 'Spacewalk Training',
  shortTitle: 'Spacewalk Training',
  route: '/spacewalk-training',
  tagline: 'Prepare your EVA spacesuit, tether safely, and repair solar arrays outside the station.',
  description:
    'Train like an Extravehicular Activity (EVA) specialist: check suit seals, plan handhold routes, and complete an exterior repair.',
  estimatedMinutes: 15,
  difficulty: 'Explorer',
  patchTitle: 'EVA Pioneer',
  accent: 'cyan',
  missionBrief:
    'Stepping outside the airlock means your spacesuit becomes your personal spacecraft. You will verify helmet seals, practice safety tethering, and guide a solar panel repair along the station truss.',
  learningGoals: [
    'Understand the layers of an EVA spacesuit that protect against extreme heat and cold.',
    'Follow the golden rule of spacewalks: always stay tethered with two points of contact.',
    'Navigate handhold-by-handhold to service exterior station hardware.',
  ],
  funFacts: [
    {
      title: 'Personal Spacecraft',
      detail: 'A modern EVA spacesuit weighs over 120 kg on Earth and carries oxygen, cooling water, and radios.',
    },
    {
      title: 'Gold Visors',
      detail: 'Astronaut helmet visors have an ultra-thin layer of real gold to reflect bright, unfiltered sunlight.',
    },
  ],
  tasks: [
    {
      id: 'eva-1',
      title: 'Complete Spacesuit Seal Check',
      description: 'Verify suit pressure, cooling loop flow, and visor sunshade before airlock exit.',
      xpReward: 60,
    },
    {
      id: 'eva-2',
      title: 'Lock Dual Safety Tethers',
      description: 'Practice hooking and verifying safety clips along exterior handrails.',
      xpReward: 60,
    },
    {
      id: 'eva-3',
      title: 'Align Solar Array Connector',
      description: 'Complete the step-by-step exterior repair and return safely to the airlock.',
      xpReward: 70,
    },
  ],
  teamNotes:
    'Spacewalk EVA Training enforces two-point tether lock checks, suit layer/integrity monitoring, Mission 1 solar array repair, and Mission 2 cooling & seal anomaly triage.',
  nextRecommendedModuleId: 'emergency-training',
};
