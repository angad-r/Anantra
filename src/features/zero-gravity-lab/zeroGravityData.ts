import type { FeatureModuleData } from '../../types/training';

export const zeroGravityLabData: FeatureModuleData = {
  id: 'zero-gravity-lab',
  title: 'Zero Gravity Lab',
  shortTitle: 'Zero Gravity Lab',
  route: '/zero-gravity-lab',
  tagline: 'Experiment with microgravity physics, floating droplets, and Newton’s laws.',
  description:
    'Discover how everyday objects behave in microgravity and run hands-on orbital science experiments aboard the lab module.',
  estimatedMinutes: 15,
  difficulty: 'Explorer',
  patchTitle: 'Microgravity Scientist',
  accent: 'violet',
  missionBrief:
    'In microgravity, water forms glowing spheres, flames burn round instead of teardrop-shaped, and a gentle push sends you drifting across the cabin. Test predictions and observe what changes!',
  learningGoals: [
    'Explore Newton’s Third Law: pushing one way moves you the opposite way.',
    'Observe how surface tension shapes liquids when gravity does not pull them down.',
    'Learn how astronauts anchor themselves while working with tools.',
  ],
  funFacts: [
    {
      title: 'Floating Water',
      detail: 'Without gravity pulling water down into a cup, surface tension pulls floating water into a wobbling sphere.',
    },
    {
      title: 'Growing Taller',
      detail: 'Astronauts can grow up to 5 centimeters taller in space because their spines gently stretch out in microgravity!',
    },
  ],
  tasks: [
    {
      id: 'zg-1',
      title: 'Test Thruster Action & Reaction',
      description: 'Predict how pushing a floating cargo pack moves an astronaut in zero-G.',
      xpReward: 60,
    },
    {
      id: 'zg-2',
      title: 'Observe Water Sphere Physics',
      description: 'Examine why water sticks to surfaces and forms spheres aboard the station.',
      xpReward: 60,
    },
    {
      id: 'zg-3',
      title: 'Secure Floating Lab Equipment',
      description: 'Use Velcro strips and handrails to keep tools from drifting into air vents.',
      xpReward: 60,
    },
  ],
  teamNotes:
    'Zero Gravity Lab combines F = m * a microgravity vs Earth tabletop physics (zeroGravityPhysics.ts) with a surface-tension Fluid Sphere containment demo in ZeroGravityLabActivity.tsx.',
  nextRecommendedModuleId: 'spacewalk-training',
};
