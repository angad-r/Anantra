import type { FeatureModuleData } from '../../types/training';

export const emergencyData: FeatureModuleData = {
  id: 'emergency-training',
  title: 'Emergency Training',
  shortTitle: 'Emergency Training',
  route: '/emergency-training',
  tagline: 'Stay calm under pressure and solve orbital alerts using real astronaut checklists.',
  description:
    'Practice quick-thinking response drills for power dips, cabin pressure alarms, and solar flare shelter protocols.',
  estimatedMinutes: 14,
  difficulty: 'Commander',
  patchTitle: 'Crisis Responder',
  accent: 'rose',
  missionBrief:
    'Astronauts train for emergencies so they never panic when alarms sound. Every alert has a clear priority order: protect the crew first, stabilize life support, and communicate with Mission Control.',
  learningGoals: [
    'Prioritize astronaut safety steps during a simulated cabin pressure or power warning.',
    'Know when to move to a shielded radiation shelter zone during solar storms.',
    'Use clear, calm checklist steps instead of guessing under time pressure.',
  ],
  funFacts: [
    {
      title: 'Backup Everything',
      detail: 'Spacecraft use redundant backup computers and oxygen reserves so a single glitch never stops the mission.',
    },
    {
      title: 'Solar Storm Shelters',
      detail: 'Crew quarters surrounded by water bags help shield astronauts from space radiation during strong solar flares.',
    },
  ],
  tasks: [
    {
      id: 'emg-1',
      title: 'Diagnose Solar Array Power Dip',
      description: 'Switch non-essential lights off and route backup battery power to life support.',
      xpReward: 70,
    },
    {
      id: 'emg-2',
      title: 'Execute Cabin Seal Drill',
      description: 'Locate the simulated pressure drop sector and close the isolation hatch.',
      xpReward: 70,
    },
    {
      id: 'emg-3',
      title: 'Complete Solar Flare Shelter Protocol',
      description: 'Verify crew headcount inside the shielded module until the all-clear signal.',
      xpReward: 80,
    },
  ],
  teamNotes:
    'Emergency Training pairs live telemetry readouts across Cabin Pressure, O2/CO2 Scrubbers, Power Bus, and Comms Link with both 3-alert Standard and 5-alert Crisis Commander drills.',
  nextRecommendedModuleId: 'ai-mentor',
};
