import type { FeatureModuleData } from '../../types/training';

export const missionControlData: FeatureModuleData = {
  id: 'mission-control',
  title: 'Mission Control',
  shortTitle: 'Mission Control',
  route: '/mission-control',
  tagline: 'Monitor lunar descent telemetry, manage propellant, and land safely on the Moon.',
  description:
    'Command the Moon Landing Simulator! Track altitude, vertical speed, sideways drift, and fuel reserve while guiding a soft touchdown on the glowing pad.',
  estimatedMinutes: 12,
  difficulty: 'Explorer',
  patchTitle: 'Flight Director',
  accent: 'emerald',
  missionBrief:
    'Welcome to Lunar Mission Control! Because the Moon has almost no air, parachutes cannot slow your lander down. Watch altitude, vertical speed (≤ 3.5 m/s), sideways drift (≤ 2.5 m/s), and remaining fuel as you pulse engine thrust to land cleanly on the glowing pad.',
  learningGoals: [
    'Understand why airless worlds like the Moon require upward rocket thrust instead of parachutes.',
    'Balance lunar gravity (1.62 m/s²) with steady throttle settings and controlled thruster bursts.',
    'Control both vertical descent (≤ 3.5 m/s) and sideways drift (≤ 2.5 m/s) while conserving fuel.',
  ],
  funFacts: [
    {
      title: 'No Air for Parachutes',
      detail: 'Unlike Earth capsules, a Moon lander drops through vacuum—only upward rocket engine thrust can brake its fall.',
    },
    {
      title: 'One-Sixth Gravity & Hover Balance',
      detail: 'Moon gravity pulls at 1.62 m/s² (about 6× gentler than Earth), giving Flight Directors slower falls to practice precise braking burns.',
    },
  ],
  tasks: [
    {
      id: 'mc-1',
      title: 'Inspect Lunar Descent Telemetry',
      description: 'Review Altitude, Vertical Speed, H-Speed drift, Fuel, and Pad Target readouts before firing engines.',
      xpReward: 50,
    },
    {
      id: 'mc-2',
      title: 'Practice Throttle & RCS Steering',
      description: 'Test steady throttle presets, thruster hold boosts, and Steer Left / Right jets over the pad.',
      xpReward: 60,
    },
    {
      id: 'mc-3',
      title: 'Complete a Safe Moon Pad Touchdown',
      description: 'Land inside the glowing pad with vertical speed ≤ 3.5 m/s and H-speed ≤ 2.5 m/s before fuel runs out.',
      xpReward: 70,
    },
  ],
  teamNotes:
    'Lunar descent physics runs deterministically in src/features/mission-control/lunarPhysics.ts with Standard & Commander modes rendered via MoonLandingSimulator.tsx.',
  nextRecommendedModuleId: 'zero-gravity-lab',
};
