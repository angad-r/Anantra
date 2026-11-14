import type { RegisteredModule } from '../../data/modules';
import type { ModuleId, TrainingState } from '../../types/training';
import type { OverallTrainingStats } from '../../utils/progress';

export type MentorCategory =
  | 'science'
  | 'hint'
  | 'debrief'
  | 'encouragement'
  | 'quiz-review'
  | 'live-ai'
  | 'fallback';

export type HintLevel = 1 | 2 | 3;

export interface MentorKnowledgeEntry {
  id: string;
  topicLabel: string;
  category: Exclude<MentorCategory, 'quiz-review' | 'fallback' | 'debrief' | 'live-ai'>;
  phrases: string[];
  keywords: string[];
  sampleQuestion: string;
  answer: string;
  followUpDetail: string;
  scienceHighlight: string;
  encouragedNote: string;
  recommendedAcademyTopic?: string;
  actionRoute?: string;
  actionLabel?: string;
  hintTopicId?: Exclude<ModuleId, 'ai-mentor'>;
}

export interface ProgressiveHintTrack {
  topicId: Exclude<ModuleId, 'ai-mentor'>;
  title: string;
  route: string;
  academyTopic: string;
  scienceFormula: string;
  steps: [string, string, string];
}

export interface MentorProgressSnapshot {
  traineeName: string;
  cadetTitle: string;
  completedModules: number;
  totalModules: number;
  percentage: number;
  totalEarnedXp: number;
  nextIncompleteModule: {
    id: string;
    title: string;
    route: string;
    nextTaskTitle?: string;
  } | null;
}

export interface MentorConversationContext {
  lastEntryId?: string;
  lastHintTopicId?: Exclude<ModuleId, 'ai-mentor'>;
  lastHintStep?: HintLevel;
  state?: TrainingState;
  stats?: OverallTrainingStats;
}

export interface MentorReply {
  entryId?: string;
  hintTopicId?: Exclude<ModuleId, 'ai-mentor'>;
  hintStep?: HintLevel;
  topicLabel: string;
  category: MentorCategory;
  text: string;
  scienceHighlight?: string;
  encouragedNote?: string;
  recommendedAcademyTopic?: string;
  matchedKeywords?: string[];
  actionRoute?: string;
  actionLabel?: string;
}

export interface MentorQuizOption {
  id: string;
  label: string;
  wrongExplanation?: string;
}

export interface MentorQuizQuestion {
  id: string;
  topicLabel: string;
  question: string;
  relatedQuery: string;
  options: MentorQuizOption[];
  correctOptionId: string;
  correctFeedback: string;
}

export const PROGRESSIVE_HINT_TRACKS: ProgressiveHintTrack[] = [
  {
    topicId: 'mission-control',
    title: 'Moon Landing Simulator',
    route: '/mission-control',
    academyTopic: 'Moon Exploration (Module 04)',
    scienceFormula: 'Net Acceleration = Thrust − Lunar Gravity (1.62 m/s²)',
    steps: [
      'Hint Step 1 (Intuition Nudge): Because the Moon has virtually no air, wings and parachutes do nothing—think about saving your rocket propellant while high up instead of hovering early.',
      'Hint Step 2 (Physics Clue): Lunar gravity pulls downward at 1.62 m/s² continuously. Align your horizontal drift over the landing pad using RCS thrusters before the final 100 m descent window.',
      'Hint Step 3 (Action Checklist): Let free fall bring speed smoothly down toward the final ~120 m, then pulse 75% Brake or 100% Max thrust in short bursts so vertical speed stays ≤ 3.5 m/s and |horizontal| ≤ 1.8 m/s inside the pad.',
    ],
  },
  {
    topicId: 'zero-gravity-lab',
    title: 'Zero Gravity Inertia Lab',
    route: '/zero-gravity-lab',
    academyTopic: 'Orbital Mechanics & Spaceflight Fundamentals (Modules 01 & 03)',
    scienceFormula: 'a = F / m  and  p = m × v',
    steps: [
      'Hint Step 1 (Intuition Nudge): Notice how Earth’s floor friction brings a sliding object to rest on its own, whereas in Orbit Mode there is no table friction to stop anything you push.',
      'Hint Step 2 (Physics Clue): With a fixed push force F, a heavier 6 kg Supply Crate gains 1/6th the acceleration of a 1 kg Water Pouch—and bouncing off a bulkhead reverses velocity rather than gently docking!',
      'Hint Step 3 (Action Checklist): In Orbit Mode, push objects toward the Velcro Dock, watch the live p = m·v momentum readout, wait until the target enters the glowing capture zone, then press Catch / Brake before wall impact.',
    ],
  },
  {
    topicId: 'spacewalk-training',
    title: 'Spacewalk EVA Training',
    route: '/spacewalk-training',
    academyTopic: 'EVA Spacesuits (Module 06)',
    scienceFormula: 'Two-Point Handrail Attachment + Thermal Vacuum Protection',
    steps: [
      'Hint Step 1 (Intuition Nudge): Look closely at each item in the airlock locker—everyday household tools fail violently in vacuum, temperature swings (−157 °C to +121 °C), or stiff pressurized gloves.',
      'Hint Step 2 (Physics Clue): Swinging an untethered impact hammer triggers Newton’s Third Law recoil on your suit, while keeping only one clip risks drifting away if a clasp snags.',
      'Hint Step 3 (Action Checklist): Equip only Dual Safety Tethers, the EVA Pistol-Grip Driver, and Insulated Torque Wrench, stay anchored with 2 tethers locked, and complete Mission 2’s coolant bypass and seal check before O₂ drops low.',
    ],
  },
  {
    topicId: 'emergency-training',
    title: 'Orbital Emergency Triage',
    route: '/emergency-training',
    academyTopic: 'Space Station Ops & Radiation Hazards (Modules 07 & 09)',
    scienceFormula: 'Crew Safety Order: Breathe (Air) → Isolate Leak → Shield → Shed Non-Essential Load',
    steps: [
      'Hint Step 1 (Intuition Nudge): When multiple alarms sound at once, think like NASA Flight Director Gene Kranz: protect breathable cabin atmosphere and human crew before worrying about experiments or window views.',
      'Hint Step 2 (Physics Clue): Hydrogen-rich water bags absorb high-energy solar protons far better than cupola glass, and cutting CO₂ scrubbers or oxygen generators causes fatal CO₂ buildup faster than battery savings help.',
      'Hint Step 3 (Action Checklist): Seal leaking hatches immediately, drop non-essential galley/lab lighting rather than life-support scrubbers, move crew behind water-wall shielding during flares, and switch to emergency backup relays when comms drop.',
    ],
  },
  {
    topicId: 'academy',
    title: 'Astronaut Academy (10 Topics)',
    route: '/academy',
    academyTopic: 'All 10 Core Modules + 10-Question Mastery Quiz',
    scienceFormula: 'Pass Threshold = ≥ 7 / 10 on Mastery Quiz',
    steps: [
      'Hint Step 1 (Intuition Nudge): Do not guess blindly on quizzes—examine each module’s labeled SVG diagram first to visualize why spacecraft behave that way.',
      'Hint Step 2 (Physics Clue): Pay special attention to common space myths: ISS gravity is ~90% of ground gravity (weightlessness comes from free fall), and water walls beat aluminum or glass for particle radiation shielding.',
      'Hint Step 3 (Action Checklist): Complete Quick Checks inside lessons 1–10 so they turn Emerald Studied, read the NASA Mission Example box on each tab, then take the Mastery Quiz to score 7/10 or higher.',
    ],
  },
];

export const MENTOR_KNOWLEDGE_BASE: MentorKnowledgeEntry[] = [
  {
    id: 'kb-orbit-float',
    topicLabel: 'Orbits & Free-Fall Floating',
    category: 'science',
    phrases: [
      'why float',
      'why do astronauts float',
      'how does orbit work',
      'free fall',
      'zero gravity',
    ],
    keywords: ['float', 'floating', 'orbit', 'iss', 'weightless', 'weightlessness', 'falling'],
    sampleQuestion: 'Why do astronauts float on the space station?',
    answer:
      'Astronauts float because both they and the space station are in continuous free fall around Earth! Moving sideways at about 28,000 km/h makes the station curve smoothly around Earth instead of hitting the ground.',
    followUpDetail:
      'Because gravity curves the station’s path at the exact rate Earth’s surface drops away beneath it, an orbital period at ~408 km altitude takes roughly 92 minutes—giving crews 16 sunrises every 24 hours.',
    scienceHighlight:
      'Fun physics check: Earth’s gravity at orbital height is still about 90% as strong as on the ground—you feel weightless only because everything around you falls together at the exact same speed.',
    encouragedNote: 'Asking "why" like a physicist is how every great orbital mission begins!',
    recommendedAcademyTopic: 'Orbital Mechanics (Module 03)',
    actionRoute: '/academy',
    actionLabel: 'Open Astronaut Academy',
    hintTopicId: 'academy',
  },
  {
    id: 'kb-living-orbit',
    topicLabel: 'Daily Life in Orbit',
    category: 'science',
    phrases: [
      'life in orbit',
      'how do astronauts sleep',
      'how do astronauts eat',
      'brush teeth',
      'living in space',
      'water sphere',
    ],
    keywords: [
      'sleep',
      'eat',
      'food',
      'drink',
      'water',
      'teeth',
      'tooth',
      'brush',
      'living',
      'live',
      'droplet',
      'crumb',
    ],
    sampleQuestion: 'How do astronauts sleep, eat, and brush their teeth in space?',
    answer:
      'In microgravity, astronauts zip into wall-tethered sleeping bags so they do not drift into air vents. They eat sealed pouch foods and tortillas (no crumbly bread!) and swallow or wipe foam toothpaste with a damp towel using tiny water bubbles.',
    followUpDetail:
      'Ventilation fans aboard the ISS are crucial even while sleeping: without steady airflow in microgravity, warm exhaled carbon dioxide would pool around an astronaut’s face instead of rising naturally!',
    scienceHighlight:
      'Without gravity pulling liquids downward, surface tension shapes floating water drops into shimmering spheres.',
    encouragedNote: 'Imagine brushing your teeth with a floating sphere of water—great curiosity, Cadet!',
    recommendedAcademyTopic: 'Space Station Operations (Module 07)',
    actionRoute: '/academy',
    actionLabel: 'Review Station Operations',
  },
  {
    id: 'kb-zero-g-inertia',
    topicLabel: 'Microgravity Inertia & Newton’s Laws',
    category: 'science',
    phrases: [
      'zero g',
      'zero gravity lab',
      'inertia lab',
      'newton law',
      'velcro dock',
      'earth friction',
      'heavy crate',
      'momentum',
    ],
    keywords: [
      'inertia',
      'newton',
      'friction',
      'crate',
      'pouch',
      'toolbox',
      'mass',
      'force',
      'acceleration',
      'recoil',
      'dock',
      'velcro',
      'brake',
      'push',
      'momentum',
    ],
    sampleQuestion: 'Why do pushed tools keep gliding in Zero Gravity Lab?',
    answer:
      'Newton’s First Law says a moving object keeps gliding at steady speed unless another force stops it. On Earth floor friction slows sliding boxes down, but in microgravity there is no floor friction—so you must tap Catch / Brake inside the Velcro Dock!',
    followUpDetail:
      'Even weightless equipment keeps full momentum (p = m × v)! Stopping a heavy 6 kg supply crate gliding slowly requires the same impulse as stopping a 1 kg water pouch flying six times faster—if you let it hit a station rack, it bounces rather than docking.',
    scienceHighlight:
      'Because a = F / m, a 6 kg crate accelerates 6 times slower than a 1 kg pouch under the same push, and pushing anything away also pushes you backward (Newton’s 3rd Law).',
    encouragedNote: 'Mission Hint: Use Gentle (3 N) on the light Water Pouch, and watch p = m·v before catching inside the Velcro Dock!',
    recommendedAcademyTopic: 'Spaceflight Fundamentals (Module 01)',
    actionRoute: '/zero-gravity-lab',
    actionLabel: 'Practice in Zero Gravity Lab',
    hintTopicId: 'zero-gravity-lab',
  },
  {
    id: 'kb-moon-landing',
    topicLabel: 'Moon Landing Physics & Thrust',
    category: 'science',
    phrases: [
      'moon landing',
      'lunar lander',
      'land on the moon',
      'moon hint',
      'safe landing',
      'lunar gravity',
    ],
    keywords: [
      'moon',
      'lunar',
      'lander',
      'landing',
      'thrust',
      'thruster',
      'fuel',
      'parachute',
      'touchdown',
      'velocity',
      'altitude',
      'pad',
      'rcs',
    ],
    sampleQuestion: 'How do I land safely in the Moon Landing simulator?',
    answer:
      'Since the Moon has almost no air, parachutes do not work—you must fire upward engine thrust to counter 1.62 m/s² lunar gravity! Save fuel high up, then pulse 75% Brake or 100% Max thrust in the final 100 meters so touchdown speed stays at or below 3.5 m/s (real Apollo landers aimed even gentler, around 0.5–3 m/s).',
    followUpDetail:
      'Watch both your vertical sink rate AND lateral drift over the pad: firing left/right RCS jets early near 300 m altitude saves far more fuel than frantic sideways corrections just 15 meters above the regolith!',
    scienceHighlight:
      'Your net acceleration equals (thrust acceleration - moon gravity). Even hovering wastes fuel, so short controlled braking burns near the ground save the most propellant!',
    encouragedNote: 'Mission Hint: Keep vertical speed ≤ 3.5 m/s and horizontal drift ≤ 1.8 m/s inside the green landing pad!',
    recommendedAcademyTopic: 'Moon Exploration (Module 04)',
    actionRoute: '/mission-control',
    actionLabel: 'Launch Moon Landing Simulator',
    hintTopicId: 'mission-control',
  },
  {
    id: 'kb-mars-exploration',
    topicLabel: 'Mars Missions & Thin-Air Landing',
    category: 'science',
    phrases: [
      'mars landing',
      'landing on mars',
      'land on mars',
      'red planet',
      'perseverance',
      'ingenuity',
      'mars atmosphere',
      'sky crane',
    ],
    keywords: [
      'mars',
      'martian',
      'perseverance',
      'ingenuity',
      'rover',
      'crane',
      'methane',
      'moxie',
      'dust',
    ],
    sampleQuestion: 'Why is landing on Mars harder than landing on Earth or the Moon?',
    answer:
      'Mars has just enough carbon dioxide air (~1% of Earth’s pressure) to create extreme entry heat—yet far too thin an atmosphere for parachutes alone to finish the landing! Rovers use heat shields, supersonic chutes, retro-rockets, and even Sky Crane cables.',
    followUpDetail:
      'Because Mars orbits much farther away, radio signals take 4 to 24 minutes one way! That means Earth Mission Control cannot steer in real time—the spacecraft must run automated hazard-avoidance landing software completely on its own.',
    scienceHighlight:
      'NASA’s Ingenuity helicopter proved powered flight on Mars using ultra-fast 2,400 RPM carbon blades built for thin air.',
    encouragedNote: 'Mastering Earth-to-Mars autonomy starts with understanding entry-descent-landing physics right here!',
    recommendedAcademyTopic: 'Mars Exploration (Module 05)',
    actionRoute: '/academy',
    actionLabel: 'Study Mars Module',
  },
  {
    id: 'kb-spacewalk-eva',
    topicLabel: 'Spacewalk Suits & EVA Tool Safety',
    category: 'science',
    phrases: [
      'spacewalk hint',
      'eva suit',
      'solar repair',
      'oxygen tank',
      'safety tether',
      'space tool',
    ],
    keywords: [
      'spacewalk',
      'eva',
      'spacesuit',
      'suit',
      'tether',
      'oxygen',
      'o2',
      'visor',
      'gold',
      'wrench',
      'driver',
      'hammer',
      'tape',
      'airlock',
      'coolant',
    ],
    sampleQuestion: 'Which tools belong on a spacewalk and why save oxygen?',
    answer:
      'Every spacewalker must pack only space-certified gear: Dual Safety Tethers (two hooks attached to handrails), an oversized EVA Pistol-Grip Driver built for bulky gloves, and an Insulated Torque Wrench to safely tighten live solar bolts.',
    followUpDetail:
      'Real NASA EMU suits act like human-shaped miniature spacecraft pressurized to ~4.3 psi pure oxygen with liquid cooling tubes woven into underwear to remove body heat—and in Mission 2 you will also trace a coolant bypass before returning through the airlock!',
    scienceHighlight:
      'Ordinary duct tape fails across space temperature extremes (-157°C in shadow to +121°C in sunlight), and hammers bounce you backward while creating dangerous debris. Accurate steps keep precious O₂ in reserve!',
    encouragedNote: 'Mission Hint: Avoid hammers, tape, or unclipped rope in the locker—certified tools keep Suit Integrity and O₂ high!',
    recommendedAcademyTopic: 'Spacesuits & Life Support (Module 06)',
    actionRoute: '/spacewalk-training',
    actionLabel: 'Enter Spacewalk Training',
    hintTopicId: 'spacewalk-training',
  },
  {
    id: 'kb-physiology-health',
    topicLabel: 'Astronaut Health, Bones & Fluid Shift',
    category: 'science',
    phrases: [
      'bones muscles',
      'human body in space',
      'astronaut exercise',
      'puffy face',
      'fluid shift',
    ],
    keywords: [
      'bone',
      'bones',
      'muscle',
      'muscles',
      'exercise',
      'health',
      'physiology',
      'heart',
      'ared',
      'spine',
      'blood',
      'fluid',
    ],
    sampleQuestion: 'Why do astronauts exercise two hours every day on station?',
    answer:
      'Without gravity loading their legs and spine, astronauts lose about 1–1.5% bone mineral density per month and shrink muscle mass quickly! Daily resistive weightlifting on the ARED machine and harnessed treadmill runs keep skeletons strong for Earth’s return.',
    followUpDetail:
      'Fluids also shift upward toward the chest and head ("puffy face, bird legs"), temporarily shrinking leg volume and even slightly flattening eyeballs—NASA’s Human Research Program tracks every crewmember closely.',
    scienceHighlight:
      'Gravity constantly trains Earth-bound hearts and skeletons; simulating that resistance is mandatory for long Mars voyages.',
    encouragedNote: 'Science discipline includes taking care of the human crew inside the spacecraft!',
    recommendedAcademyTopic: 'Human Physiology (Module 08)',
    actionRoute: '/academy',
    actionLabel: 'Explore Human Physiology',
  },
  {
    id: 'kb-radiation-hazards',
    topicLabel: 'Space Radiation & Storm Shielding',
    category: 'science',
    phrases: [
      'space radiation',
      'solar flare',
      'solar storm',
      'galactic cosmic ray',
      'radiation shelter',
      'van allen',
    ],
    keywords: [
      'radiation',
      'flare',
      'storm',
      'cosmic',
      'gcr',
      'spe',
      'shield',
      'shielding',
      'proton',
      'hydrogen',
      'magnetosphere',
    ],
    sampleQuestion: 'How do astronauts protect themselves from space radiation and solar flares?',
    answer:
      'During sudden Solar Particle Events (SPEs), crew shelter behind dense hydrogen-rich water bags and polyethylene cargo inside the station core! Hydrogen atoms deflect fast protons cleanly without creating heavy secondary radiation sprays.',
    followUpDetail:
      'While Earth’s magnetosphere and Van Allen belts block most low-Earth-orbit storms, crews flying toward the Moon or Mars need dedicated storm shelters and real-time space-weather forecasting from NOAA and NASA.',
    scienceHighlight:
      'Water (H₂O) packs two lightweight hydrogen nuclei per molecule—making crew drinking water double as top-grade radiation shielding.',
    encouragedNote: 'Smart multi-purpose engineering turns everyday consumables into lifesaving armor!',
    recommendedAcademyTopic: 'Space Radiation Hazards (Module 09)',
    actionRoute: '/academy',
    actionLabel: 'Study Radiation Module',
    hintTopicId: 'emergency-training',
  },
  {
    id: 'kb-emergency-triage',
    topicLabel: 'Orbital Emergency Checklist Priority',
    category: 'science',
    phrases: [
      'emergency hint',
      'air leak',
      'pressure drop',
      'power dip',
      'scrubber failure',
      'comms blackout',
    ],
    keywords: [
      'emergency',
      'pressure',
      'leak',
      'hatch',
      'power',
      'battery',
      'scrubber',
      'scrubbers',
      'blackout',
      'comms',
      'triage',
      'alert',
    ],
    sampleQuestion: 'What is the astronaut rule for orbital emergencies?',
    answer:
      'Follow NASA’s calm checklist order: (1) isolate leaking hatches to protect cabin air, (2) turn off extra lights/heaters before oxygen & CO₂ scrubbers during a power dip, (3) shelter crew behind water-filled walls during solar storms, and (4) isolate/swap CO₂ scrubbers and backup S-band/TDRS comms calmly.',
    followUpDetail:
      'In Emergency Training’s 5-Alert Crisis Commander Deck, each wrong reaction spikes CO₂ buildup or loses station bus voltage—reading the live Station Telemetry Matrix first reveals whether air pressure, scrubbers, power, or comms needs immediate stabilization!',
    scienceHighlight:
      'In closed cabins, rising exhaled CO₂ creates confusion and hypoxia long before total oxygen runs out—scrubbers always stay top priority.',
    encouragedNote: 'Calm focus beats rushing every single time—you have got solid commander instincts!',
    recommendedAcademyTopic: 'Mission Control Operations (Module 10)',
    actionRoute: '/emergency-training',
    actionLabel: 'Practice Emergency Drill',
    hintTopicId: 'emergency-training',
  },
  {
    id: 'kb-rockets',
    topicLabel: 'Rockets, Propulsion & Mission Control',
    category: 'science',
    phrases: [
      'how rockets fly',
      'rocket engine',
      'mission control',
      'flight director',
      'cimon astrobee',
      'robot companion',
    ],
    keywords: [
      'rocket',
      'rockets',
      'launch',
      'exhaust',
      'booster',
      'staging',
      'capcom',
      'fido',
      'eeccom',
      'telemetry',
      'cimon',
      'astrobee',
      'mentor',
      'aria',
    ],
    sampleQuestion: 'How do rockets fly in vacuum and how does Mission Control help?',
    answer:
      'Rockets push super-fast hot exhaust gas downward, and Newton’s Third Law pushes the rocket upward—which works even better in vacuum! Meanwhile, Houston Flight Control seats specialists like FIDO (trajectory), EECOM (life support/power), and CAPCOM (crew voice link) watching live telemetry.',
    followUpDetail:
      'Multi-stage rockets drop empty lower fuel tanks mid-climb so upper engines never waste propellant lifting dead metal toward orbit—following Tsiolkovsky’s rocket equation!',
    scienceHighlight:
      'Dropping spent stages dramatically increases final orbital payload mass compared to carrying one giant empty tank all the way.',
    encouragedNote: 'Every giant launch starts by mastering simple action-and-reaction science!',
    recommendedAcademyTopic: 'Rocket Science & Propulsion (Module 02)',
    actionRoute: '/academy',
    actionLabel: 'Explore Rocket Science',
  },
  {
    id: 'kb-encouragement',
    topicLabel: 'Cadet Mindset & Simulator Confidence',
    category: 'encouragement',
    phrases: [
      'i keep crashing',
      'too hard',
      'made a mistake',
      'feel nervous',
      'try again',
    ],
    keywords: [
      'hard',
      'difficult',
      'nervous',
      'scared',
      'mistake',
      'mistakes',
      'crash',
      'crashed',
      'wrong',
      'failed',
      'fail',
      'encourage',
      'confidence',
      'stuck',
    ],
    sampleQuestion: 'I crashed or got a question wrong—is that okay?',
    answer:
      'Yes! Real NASA astronauts crash in simulators dozens of times on purpose so they learn how spacecraft respond safely before real flight. Every wrong quiz answer or hard bounce teaches your brain exact physics!',
    followUpDetail:
      'Whenever a simulator run fails, tap "Debrief With ARIA" right inside the simulator or Mission Sandbox—I will inspect your last recorded failure reason and turn it into an easy step-by-step fix!',
    scienceHighlight:
      'Astronaut Chris Hadfield trained on checklists until unexpected alarms felt calm and familiar rather than scary.',
    encouragedNote: 'Take a deep breath, check one control at a time, and try the next run—you are learning fast!',
  },
];

export const MENTOR_QUIZ_QUESTIONS: MentorQuizQuestion[] = [
  {
    id: 'quiz-orbit',
    topicLabel: 'Orbital Free-Fall',
    question: 'Why do astronauts float inside the International Space Station?',
    relatedQuery: 'Why do astronauts float on the space station?',
    correctOptionId: 'free-fall',
    correctFeedback:
      'Correct! At ~28,000 km/h sideways, the station and astronauts constantly fall around Earth together in free fall.',
    options: [
      {
        id: 'no-gravity',
        label: 'Earth’s gravity vanishes completely right above the clouds.',
        wrongExplanation:
          'Common myth! Earth’s gravity at ISS altitude is still ~90% as strong as on your living room floor—if the station stopped moving sideways, gravity would pull it straight down.',
      },
      {
        id: 'free-fall',
        label: 'They and the station are continuously falling around Earth together.',
      },
      {
        id: 'suit-magnets',
        label: 'Anti-gravity fans inside their spacesuit boots push them up.',
        wrongExplanation:
          'Not quite! Spacewalkers only wear boots indoors with fabric socks and footholds; floating comes naturally from continuous orbital free fall.',
      },
    ],
  },
  {
    id: 'quiz-moon-chute',
    topicLabel: 'Moon Landing Physics',
    question: 'Why cannot a Moon lander use a parachute to slow down like capsules on Earth?',
    relatedQuery: 'How do I land safely in the Moon Landing simulator?',
    correctOptionId: 'no-air',
    correctFeedback:
      'Spot on! Without a thick atmosphere of air molecules, a parachute hangs limp—so landers rely entirely on upward rocket thrust.',
    options: [
      {
        id: 'no-air',
        label: 'The Moon has almost no air, so there is no air resistance to fill a parachute.',
      },
      {
        id: 'cold-moon',
        label: 'Moon shadows are too cold for nylon parachute fabric to unfold.',
        wrongExplanation:
          'Close thinking about temperature, but the real physics reason is vacuum: parachutes need thick atmosphere pushing upward inside the canopy to create drag.',
      },
      {
        id: 'high-gravity',
        label: 'Moon gravity is twice as strong as Earth gravity.',
        wrongExplanation:
          'Actually the Moon’s gravity is only about one-sixth (1.62 m/s²) of Earth’s! Even with gentle gravity, no air means zero parachute drag.',
      },
    ],
  },
  {
    id: 'quiz-inertia',
    topicLabel: 'Microgravity Motion',
    question: 'If you gently push a 1 kg pouch and a 6 kg crate with the exact same 6 N force in space, what happens?',
    relatedQuery: 'Why do pushed tools keep gliding in Zero Gravity Lab?',
    correctOptionId: 'light-faster',
    correctFeedback:
      'Nice physics! Because a = F / m, the 1 kg pouch accelerates 6 times faster—and both keep gliding until caught!',
    options: [
      {
        id: 'same-speed',
        label: 'Both travel at the exact same speed because objects are weightless in space.',
        wrongExplanation:
          'Careful! Objects in orbit are weightless, NOT massless! The 6 kg Supply Crate still has 6 times more inertia (mass) resisting your push.',
      },
      {
        id: 'light-faster',
        label: 'The 1 kg pouch accelerates much faster, and both glide until a force stops them.',
      },
      {
        id: 'stops-quick',
        label: 'Both slow down after 1 meter because space has heavy air friction.',
        wrongExplanation:
          'Only Earth’s lab tabletop has surface/air friction! In microgravity, pushed objects keep moving steadily until caught or hitting a wall.',
      },
    ],
  },
  {
    id: 'quiz-eva',
    topicLabel: 'Spacewalk Safety',
    question: 'What is the golden safety rule every astronaut follows outside the airlock during a spacewalk?',
    relatedQuery: 'Which tools belong on a spacewalk and why save oxygen?',
    correctOptionId: 'dual-tether',
    correctFeedback:
      'Exactly right! Dual safety tethers ensure one locking hook always stays clipped to a station handrail.',
    options: [
      {
        id: 'heavy-hammer',
        label: 'Carry a heavy steel hammer to tap solar latches shut quickly.',
        wrongExplanation:
          'Watch out for Newton’s 3rd Law! Swinging a steel hammer in zero-G pushes your suit backward and risks shattering solar glass into debris.',
      },
      {
        id: 'dual-tether',
        label: 'Keep two safety tether points clipped with space-certified tools at all times.',
      },
      {
        id: 'duct-tape',
        label: 'Use regular household tape so gloves do not need a trigger tool.',
        wrongExplanation:
          'Household adhesive fails in space’s -150°C to +120°C swings and cannot handle stiff pressurized EVA gloves like an oversized Pistol-Grip Driver can.',
      },
    ],
  },
  {
    id: 'quiz-emergency',
    topicLabel: 'Emergency Triage',
    question: 'A sudden solar particle storm approaches the space station. Where should the crew shelter?',
    relatedQuery: 'What is the astronaut rule for orbital emergencies?',
    correctOptionId: 'water-shelter',
    correctFeedback:
      'Commander-level answer! Water-filled bags and dense inner station racks shield astronauts from solar radiation.',
    options: [
      {
        id: 'cupola-view',
        label: 'Float beside the glass observation window to photograph the flare closely.',
        wrongExplanation:
          'Glass cupola windows offer thin shielding! Astronomers rely on cameras outside while human crews move behind dense inner station walls.',
      },
      {
        id: 'cut-scrubbers',
        label: 'Turn off carbon dioxide scrubbers so batteries last longer.',
        wrongExplanation:
          'Never turn off oxygen or CO₂ scrubbers! Life support stays powered while non-essential lab lights are switched off.',
      },
      {
        id: 'water-shelter',
        label: 'Move inside the water-wall shielded shelter zone and confirm crew headcount.',
      },
    ],
  },
];

function normalizeText(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildProgressSnapshot(
  traineeName: string,
  stats: OverallTrainingStats,
  modules: RegisteredModule[],
  progressByModule: TrainingState['progressByModule'],
): MentorProgressSnapshot {
  let nextIncompleteModule: MentorProgressSnapshot['nextIncompleteModule'] = null;

  for (const mod of modules) {
    if (mod.id === 'ai-mentor') continue;
    const doneIds = progressByModule[mod.id]?.completedTaskIds ?? [];
    const remaining = mod.tasks.find((t) => !doneIds.includes(t.id));
    if (remaining) {
      nextIncompleteModule = {
        id: mod.id,
        title: mod.title,
        route: mod.route,
        nextTaskTitle: remaining.title,
      };
      break;
    }
  }

  return {
    traineeName,
    cadetTitle: stats.currentRank.title,
    completedModules: stats.completedModulesCount,
    totalModules: stats.totalModulesCount,
    percentage: stats.overallPercentage,
    totalEarnedXp: stats.totalXp,
    nextIncompleteModule,
  };
}

export function buildMissionHintReply(
  snapshot: MentorProgressSnapshot,
): MentorReply {
  if (snapshot.completedModules >= snapshot.totalModules) {
    return {
      topicLabel: 'Live Mission Readiness Summary',
      category: 'hint',
      text: `Incredible flight record, ${snapshot.traineeName}! You have completed all ${snapshot.totalModules} training decks with ${snapshot.totalEarnedXp} XP (${snapshot.cadetTitle}). Try mastering every simulator challenge score or acing the 5-question Mentor Quiz below!`,
      encouragedNote: 'You are cleared for Commander honors!',
      actionRoute: '/dashboard',
      actionLabel: 'View Astronaut Dashboard',
    };
  }

  if (snapshot.nextIncompleteModule) {
    const { id, title, route, nextTaskTitle } = snapshot.nextIncompleteModule;
    const validHintTopic = id !== 'ai-mentor' ? (id as Exclude<ModuleId, 'ai-mentor'>) : undefined;
    return {
      hintTopicId: validHintTopic,
      hintStep: 1,
      topicLabel: `Next Mission Hint: ${title}`,
      category: 'hint',
      text: `Hi ${snapshot.traineeName} (${snapshot.percentage}% readiness, ${snapshot.totalEarnedXp} XP)! Your best next stop is ${title}${
        nextTaskTitle ? ` — focus on checklist step "${nextTaskTitle}".` : '.'
      }`,
      scienceHighlight:
        'Steady progress beats rushing: read the Mission Brief first, run the interactive sim, or tap Progressive Hint Step 1–3 below without spoiling solutions.',
      encouragedNote: `Keep going, ${snapshot.cadetTitle}—every deck builds real spacecraft intuition!`,
      actionRoute: route,
      actionLabel: `Open ${title}`,
    };
  }

  return {
    topicLabel: 'AI Mentor Readiness Hint',
    category: 'hint',
    text: `You are at ${snapshot.percentage}% overall readiness with ${snapshot.totalEarnedXp} XP, ${snapshot.traineeName}! Try asking a question in the Mentor console, completing the 5-question quiz, and checking off your final AI Mentor tasks.`,
    encouragedNote: 'Curiosity is an astronaut’s strongest navigation tool!',
  };
}

export function buildProgressiveHintReply(
  topicId: Exclude<ModuleId, 'ai-mentor'>,
  stepLevel: HintLevel,
  snapshot: MentorProgressSnapshot,
): MentorReply {
  const track =
    PROGRESSIVE_HINT_TRACKS.find((item) => item.topicId === topicId) ??
    PROGRESSIVE_HINT_TRACKS[0];

  const stepText = track.steps[stepLevel - 1];
  return {
    hintTopicId: track.topicId,
    hintStep: stepLevel,
    topicLabel: `${track.title} — Progressive Hint (${stepLevel}/3)`,
    category: 'hint',
    text: `${snapshot.traineeName}, here is Level ${stepLevel} guidance for ${track.title}: ${stepText}`,
    scienceHighlight: `Key Rule: ${track.scienceFormula}`,
    recommendedAcademyTopic: track.academyTopic,
    encouragedNote:
      stepLevel < 3
        ? `Need a more concrete clue? Ask for "another hint" or tap Next Hint Clue (${stepLevel + 1}/3).`
        : 'You now have the full checklist—launch the simulator and test it in action!',
    actionRoute: track.route,
    actionLabel: `Launch ${track.title}`,
  };
}

const DEBRIEF_SCIENCE_GUIDE: Record<
  Exclude<ModuleId, 'ai-mentor'>,
  { title: string; route: string; academyTopic: string; coaching: string }
> = {
  'mission-control': {
    title: 'Mission Control — Moon Landing Simulator',
    route: '/mission-control',
    academyTopic: 'Moon Exploration (Module 04)',
    coaching:
      'Because lunar gravity pulls at 1.62 m/s² without atmospheric drag, let gravity bring you down into the final ~120 m, keep horizontal drift aligned inside the pad with RCS jets, and pulse 75% Brake / 100% Max thrust so vertical touchdown stays ≤ 3.5 m/s.',
  },
  'zero-gravity-lab': {
    title: 'Zero Gravity Lab',
    route: '/zero-gravity-lab',
    academyTopic: 'Orbital Mechanics & Fundamentals (Modules 01 & 03)',
    coaching:
      'In Orbit Mode, there is no tabletop friction—pushed tools glide forever and bounce if they reach the bulkhead. Wait until the payload enters the glowing Velcro Dock zone before hitting Catch / Brake.',
  },
  'spacewalk-training': {
    title: 'Spacewalk EVA Training',
    route: '/spacewalk-training',
    academyTopic: 'EVA Spacesuits & Life Support (Module 06)',
    coaching:
      'Keep two tether points locked to station handrails, pick only space-certified tools (Pistol-Grip Driver, Dual Safety Tethers, Insulated Torque Wrench), and save O₂ by checking fault telemetry carefully in Mission 2.',
  },
  'emergency-training': {
    title: 'Orbital Emergency Triage',
    route: '/emergency-training',
    academyTopic: 'Space Station Ops & Radiation Hazards (Modules 07 & 09)',
    coaching:
      'Always prioritize breathable cabin air, CO₂ scrubbers, and crew water-wall shielding before optional lighting or camera views. Read the live telemetry matrix row by row before locking a response.',
  },
  academy: {
    title: 'Astronaut Academy',
    route: '/academy',
    academyTopic: 'Academy 10-Topic Curriculum',
    coaching:
      'Review each topic’s labeled diagram and NASA mission example, then finish the Quick Check before starting the 10-question Mastery Quiz (7/10 passes).',
  },
};

export function buildMissionDebriefReply(
  moduleId: ModuleId,
  state: TrainingState,
  snapshot: MentorProgressSnapshot,
): MentorReply {
  if (moduleId === 'ai-mentor') {
    return buildScoreExplanationReply(
      undefined,
      state,
      snapshot,
    );
  }

  const record = state.moduleRecords?.[moduleId];
  const guide = DEBRIEF_SCIENCE_GUIDE[moduleId];

  if (!record || record.attempts === 0) {
    return {
      hintTopicId: moduleId,
      hintStep: 1,
      topicLabel: `Pre-Flight Debrief: ${guide.title}`,
      category: 'debrief',
      text: `${snapshot.traineeName}, no completed or failed simulator runs are logged for ${guide.title} yet! Here is your flight prep checklist: ${guide.coaching}`,
      recommendedAcademyTopic: guide.academyTopic,
      encouragedNote: 'Run one attempt—even a rocky first test gives us real telemetry to tune together!',
      actionRoute: guide.route,
      actionLabel: `Open ${guide.title}`,
    };
  }

  const scoreLine =
    typeof record.bestScore === 'number' && typeof record.maxScore === 'number'
      ? `Best recorded score: ${record.bestScore}/${record.maxScore} across ${record.attempts} run(s) (${record.passedCount} passed).`
      : `Logged ${record.attempts} run(s) with ${record.passedCount} pass(es).`;

  const failureNote =
    record.lastOutcome === 'retry' && record.lastFailureReason
      ? `Last Telemetry Anomaly: ${record.lastFailureReason}.`
      : record.lastTelemetrySummary
        ? `Last Run Telemetry: ${record.lastTelemetrySummary}.`
        : 'Latest telemetry run logged.';

  return {
    hintTopicId: moduleId,
    hintStep: 2,
    topicLabel: `Flight Telemetry Debrief: ${guide.title}`,
    category: 'debrief',
    text: `${snapshot.traineeName}, inspecting your logged telemetry for ${guide.title}: ${failureNote} ${scoreLine}`,
    scienceHighlight: `Engineering Fix: ${guide.coaching}`,
    recommendedAcademyTopic: guide.academyTopic,
    encouragedNote:
      record.lastOutcome === 'retry'
        ? 'Every NASA crew reviews black-box telemetry after a scrub or hard touchdown—head back in and beat that metric!'
        : 'Strong run! Try Commander Mode or another deck to boost your next skill track.',
    actionRoute: guide.route,
    actionLabel: `Retry ${guide.title}`,
  };
}

export function buildScoreExplanationReply(
  stats: OverallTrainingStats | undefined,
  state: TrainingState | undefined,
  snapshot: MentorProgressSnapshot,
): MentorReply {
  if (!stats) {
    return {
      topicLabel: 'Cadet Readiness & Score Summary',
      category: 'hint',
      text: `You are currently at ${snapshot.percentage}% overall readiness with ${snapshot.totalEarnedXp} XP (${snapshot.cadetTitle}, ${snapshot.completedModules}/${snapshot.totalModules} decks certified). Complete checklists and scored simulators to raise your XP and unlock advanced ranks!`,
      actionRoute: '/dashboard',
      actionLabel: 'Inspect Mission Control Dashboard',
    };
  }

  const sortedSkills = [...stats.skillScores].sort((a, b) => a.percentage - b.percentage);
  const weakest = sortedSkills[0];
  const strongest = sortedSkills[sortedSkills.length - 1];
  const avgBest =
    stats.analytics.averageBestScorePercent !== null
      ? `${stats.analytics.averageBestScorePercent}%`
      : 'no scored simulator runs yet';
  const studiedCount = state?.academyStudiedLessonIds?.length ?? 0;

  return {
    topicLabel: 'Cadet Telemetry, Skills & Score Breakdown',
    category: 'hint',
    text: `${snapshot.traineeName}, your real telemetry shows ${snapshot.totalEarnedXp} XP (${stats.currentRank.title}), ${stats.analytics.totalSimAttempts} simulator run(s), an average best simulator score of ${avgBest}, and ${studiedCount}/10 Academy topics studied.`,
    scienceHighlight: `Strongest track: ${strongest.label} (${strongest.percentage}%). Highest-leverage growth area: ${weakest.label} (${weakest.percentage}%) — ${weakest.description}.`,
    encouragedNote:
      stats.nextRank
        ? `Only ${stats.xpToNextRank} XP needed to earn "${stats.nextRank.title}"!`
        : 'You have reached the pinnacle Junior Mission Commander rank—keep sharpening your simulator precision!',
    actionRoute: snapshot.nextIncompleteModule?.route ?? '/dashboard',
    actionLabel: snapshot.nextIncompleteModule
      ? `Boost ${weakest.label} Now`
      : 'View Full Analytics on Dashboard',
  };
}

const HINT_INTENT_KEYWORDS = [
  'hint',
  'next',
  'progress',
  'readiness',
  'recommend',
  'xp',
  'badge',
  'dashboard',
  'mission',
];

const HINT_INTENT_PHRASES = [
  'what should i do next',
  'mission hint',
  'readiness hint',
  'my progress',
  'next module',
];

const FOLLOW_UP_PHRASES = [
  'tell me more',
  'more details',
  'explain deeper',
  'why does that happen',
  'give an example',
  'keep going',
];

const NEXT_HINT_PHRASES = [
  'another hint',
  'next hint',
  'more hint',
  'step 2',
  'step 3',
  'still stuck',
];

const SCORE_PHRASES = [
  'explain my score',
  'my score',
  'my scores',
  'weakest skill',
  'how am i doing',
  'my analytics',
];

const DEBRIEF_PHRASES = [
  'why did i fail',
  'debrief',
  'last crash',
  'what went wrong',
  'my last run',
  'my telemetry',
];

function detectMentionedModuleId(normalized: string): ModuleId | null {
  if (normalized.includes('moon') || normalized.includes('lunar') || normalized.includes('lander')) {
    return 'mission-control';
  }
  if (normalized.includes('zero g') || normalized.includes('inertia') || normalized.includes('crate')) {
    return 'zero-gravity-lab';
  }
  if (normalized.includes('spacewalk') || normalized.includes('eva') || normalized.includes('suit')) {
    return 'spacewalk-training';
  }
  if (normalized.includes('emergency') || normalized.includes('crisis') || normalized.includes('scrubber')) {
    return 'emergency-training';
  }
  if (normalized.includes('academy') || normalized.includes('quiz')) {
    return 'academy';
  }
  return null;
}

export function matchMentorQuery(
  rawQuery: string,
  snapshot: MentorProgressSnapshot,
  context?: MentorConversationContext,
): MentorReply {
  const normalized = normalizeText(rawQuery);
  if (!normalized) {
    return {
      topicLabel: 'Ask a Space Question',
      category: 'fallback',
      text: 'Type a space science question above or tap any topic button below—for example, ask about floating in orbit, Moon landing thrust, Mars thin-air entry, zero-G inertia, spacewalk tools, or your next mission hint!',
    };
  }

  // 1. Multi-turn follow-up on previous science answer
  if (
    context?.lastEntryId &&
    FOLLOW_UP_PHRASES.some((phrase) => normalized.includes(phrase))
  ) {
    const prevEntry = MENTOR_KNOWLEDGE_BASE.find((e) => e.id === context.lastEntryId);
    if (prevEntry) {
      return {
        entryId: prevEntry.id,
        hintTopicId: prevEntry.hintTopicId,
        topicLabel: `${prevEntry.topicLabel} — Deeper Dive`,
        category: prevEntry.category,
        text: prevEntry.followUpDetail,
        scienceHighlight: prevEntry.scienceHighlight,
        recommendedAcademyTopic: prevEntry.recommendedAcademyTopic,
        encouragedNote: prevEntry.encouragedNote,
        actionRoute: prevEntry.actionRoute,
        actionLabel: prevEntry.actionLabel,
      };
    }
  }

  // 2. Multi-turn escalation to next non-spoiler hint step
  if (NEXT_HINT_PHRASES.some((phrase) => normalized.includes(phrase))) {
    const targetTopic: Exclude<ModuleId, 'ai-mentor'> =
      (detectMentionedModuleId(normalized) as Exclude<ModuleId, 'ai-mentor'> | null) ??
      context?.lastHintTopicId ??
      ((snapshot.nextIncompleteModule?.id && snapshot.nextIncompleteModule.id !== 'ai-mentor'
        ? snapshot.nextIncompleteModule.id
        : 'mission-control') as Exclude<ModuleId, 'ai-mentor'>);
    const nextStep: HintLevel = context?.lastHintStep
      ? (Math.min(3, context.lastHintStep + 1) as HintLevel)
      : 1;
    return buildProgressiveHintReply(targetTopic, nextStep, snapshot);
  }

  // 3. Score / skill breakdown intent
  if (SCORE_PHRASES.some((phrase) => normalized.includes(phrase))) {
    return buildScoreExplanationReply(context?.stats, context?.state, snapshot);
  }

  // 4. Failed-mission / run telemetry debrief intent
  if (context?.state && DEBRIEF_PHRASES.some((phrase) => normalized.includes(phrase))) {
    const explicitMod = detectMentionedModuleId(normalized);
    const retryMod = (['mission-control', 'zero-gravity-lab', 'spacewalk-training', 'emergency-training'] as ModuleId[]).find(
      (id) => context.state?.moduleRecords?.[id]?.lastOutcome === 'retry',
    );
    const anyMod = (['mission-control', 'zero-gravity-lab', 'spacewalk-training', 'emergency-training'] as ModuleId[]).find(
      (id) => (context.state?.moduleRecords?.[id]?.attempts ?? 0) > 0,
    );
    const target = explicitMod ?? retryMod ?? anyMod ?? 'mission-control';
    return buildMissionDebriefReply(target, context.state, snapshot);
  }

  const tokens = normalized.split(' ').filter(Boolean);

  // Check general mission readiness / next-step hint intent first when not asking about a specific science simulator
  let hintScore = 0;
  for (const phrase of HINT_INTENT_PHRASES) {
    if (normalized.includes(phrase)) hintScore += 6;
  }
  for (const kw of HINT_INTENT_KEYWORDS) {
    if (tokens.includes(kw)) hintScore += 3;
  }

  let bestEntry: MentorKnowledgeEntry | null = null;
  let bestScore = 0;
  let bestMatchedKeywords: string[] = [];

  for (const entry of MENTOR_KNOWLEDGE_BASE) {
    let score = 0;
    const hits: string[] = [];

    for (const phrase of entry.phrases) {
      if (normalized.includes(phrase)) {
        score += 5;
        hits.push(phrase);
      }
    }

    for (const kw of entry.keywords) {
      if (tokens.includes(kw)) {
        score += 3;
        hits.push(kw);
      } else if (
        kw.length >= 4 &&
        tokens.some((tok) => tok.length >= 4 && (tok.startsWith(kw) || kw.startsWith(tok)))
      ) {
        score += 1.5;
        hits.push(kw);
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
      bestMatchedKeywords = Array.from(new Set(hits)).slice(0, 4);
    }
  }

  // If user specifically asks for "next / readiness / progress" and no specific science topic scored higher
  if (hintScore >= 3 && hintScore > bestScore) {
    return buildMissionHintReply(snapshot);
  }

  if (bestEntry && bestScore > 0) {
    return {
      entryId: bestEntry.id,
      hintTopicId: bestEntry.hintTopicId,
      topicLabel: bestEntry.topicLabel,
      category: bestEntry.category,
      text: bestEntry.answer,
      scienceHighlight: bestEntry.scienceHighlight,
      encouragedNote: bestEntry.encouragedNote,
      recommendedAcademyTopic: bestEntry.recommendedAcademyTopic,
      matchedKeywords: bestMatchedKeywords,
      actionRoute: bestEntry.actionRoute,
      actionLabel: bestEntry.actionLabel,
    };
  }

  return {
    topicLabel: 'Offline Knowledge Base Match Not Found',
    category: 'fallback',
    text: `My offline educational handbook does not have an entry matching "${rawQuery.trim()}" yet—remember I am a deterministic local Q&A prototype, not a live AI model! Try asking about floating in orbit, Moon landing thrust, Mars entry, zero-G inertia, spacewalk suits, solar radiation, or tap "Get My Readiness Hint".`,
    encouragedNote: 'Keep asking curious questions—that is how mission scientists think!',
  };
}
