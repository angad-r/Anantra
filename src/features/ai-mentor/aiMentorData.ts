import type { FeatureModuleData } from '../../types/training';

export const aiMentorData: FeatureModuleData = {
  id: 'ai-mentor',
  title: 'AI Astronaut Mentor',
  shortTitle: 'AI Mentor',
  route: '/ai-mentor',
  tagline: 'Ask questions about space, get friendly hints, and review your mission readiness.',
  description:
    'Meet ARIA, your offline-ready Mission Mentor! Explore guided Q&A topics, mission tips, and personalized encouragement with zero API keys required.',
  estimatedMinutes: 10,
  difficulty: 'Cadet',
  patchTitle: 'Curious Explorer',
  accent: 'amber',
  missionBrief:
    'Curiosity is an astronaut’s superpower! Here you can ask common space questions, review what you learned across modules, and prepare for your Junior Mission Commander badge.',
  learningGoals: [
    'Ask clear scientific questions about living and working in space.',
    'Connect concepts across Academy, Zero Gravity Lab, and Spacewalk Training.',
    'Reflect on teamwork and problem-solving habits used by real NASA crews.',
  ],
  funFacts: [
    {
      title: 'Zero-Key Design',
      detail: 'Our hackathon mentor starter runs completely in your browser with local Q&A prompts—no paid APIs or secrets needed!',
    },
    {
      title: 'Real Crew Companions',
      detail: 'Astronauts have tested real floating AI assistants like CIMON and Astrobee aboard the space station.',
    },
  ],
  tasks: [
    {
      id: 'ai-1',
      title: 'Ask About Life in Orbit',
      description: 'Explore how astronauts sleep, eat, and brush their teeth in microgravity.',
      xpReward: 50,
    },
    {
      id: 'ai-2',
      title: 'Request a Mission Readiness Hint',
      description: 'Review your remaining training modules and choose your next challenge.',
      xpReward: 50,
    },
    {
      id: 'ai-3',
      title: 'Complete Commander Reflection',
      description: 'Summarize one safety rule you would teach a new junior astronaut.',
      xpReward: 60,
    },
  ],
  teamNotes:
    'ARIA combines a deterministic offline orbital handbook, progressive 3-step simulator coaching, logged run telemetry debriefs, and an optional server-side /api/mentor relay with graceful offline fallback.',
  nextRecommendedModuleId: 'academy',
};
