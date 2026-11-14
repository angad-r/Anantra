import type { FeatureModuleData } from '../../types/training';

export const academyData: FeatureModuleData = {
  id: 'academy',
  title: 'Astronaut Academy',
  shortTitle: 'Academy',
  route: '/academy',
  tagline:
    'Master 10 core astronaut science modules—from rocket propulsion and orbits to spacesuits and radiation safety.',
  description:
    'Complete 10 structured spaceflight lessons with NASA examples, conceptual diagrams, and a 10-question mastery quiz.',
  estimatedMinutes: 15,
  difficulty: 'Cadet',
  patchTitle: 'Orbital Scholar',
  accent: 'cyan',
  missionBrief:
    'Welcome to the ANANTRA Academy! Before stepping into a spacecraft simulator, every astronaut learns how rockets escape Earth, why astronauts float in orbit, and how teamwork keeps a crew safe.',
  learningGoals: [
    'Understand how thrust overcomes Earth’s gravity during launch.',
    'Learn why objects in orbit are in continuous free-fall around Earth.',
    'Identify key parts of a crewed spacecraft and life-support cabin.',
  ],
  funFacts: [
    {
      title: 'Orbit Speed',
      detail: 'The International Space Station travels at about 28,000 km/h—fast enough to circle Earth 16 times every day!',
    },
    {
      title: '16 Sunrises a Day',
      detail: 'With one orbit taking about 90 minutes, astronauts see a sunrise or sunset roughly every 45 minutes—16 sunrises and 16 sunsets each Earth day!',
    },
  ],
  tasks: [
    {
      id: 'academy-1',
      title: 'Complete Rocket Stages Briefing',
      description: 'Review how multi-stage rockets shed empty tanks to reach space efficiently.',
      xpReward: 50,
    },
    {
      id: 'academy-2',
      title: 'Pass Orbital Motion Check',
      description: 'Explore why sideways speed keeps a spacecraft safely in orbit.',
      xpReward: 60,
    },
    {
      id: 'academy-3',
      title: 'Inspect Crew Cabin Essentials',
      description: 'Identify oxygen, water recycling, and thermal protection systems.',
      xpReward: 60,
    },
  ],
  teamNotes:
    'Teammate Guide: Edit lessons or tasks in src/features/academy/academyData.ts, and add flashcards or quiz components inside src/features/academy/AcademyPage.tsx.',
  nextRecommendedModuleId: 'mission-control',
};
