export interface EvaToolOption {
  id: string;
  name: string;
  category: string;
  description: string;
  spaceCertified: boolean;
  prepFeedback: string;
}

export type SpacewalkScenarioId = 'solar-repair' | 'eva-emergency';

export interface RepairStage {
  id: string;
  stepNumber: number;
  stationName: string;
  prompt: string;
  correctOptionId: string;
  options: {
    id: string;
    label: string;
    oxygenCost: number;
    integrityDelta?: number;
    feedback: string;
  }[];
}

export const EVA_EMERGENCY_STAGES: RepairStage[] = [
  {
    id: 'eva-emg-1',
    stepNumber: 1,
    stationName: 'Truss Worksite • Suit Alert',
    prompt:
      'Micro-sensor alarm: Suit Liquid Cooling Water Garment (LCVG) temperature climbs +4°C while working on the radiator truss. What is your safest immediate action?',
    correctOptionId: 'step-cooling',
    options: [
      {
        id: 'step-cooling',
        label: 'Pause heavy bolt work, clip Dual Tether tight, and open backup cooling loop',
        oxygenCost: 14,
        integrityDelta: 0,
        feedback:
          'Smart cooling control! Resting briefly drops body heat while redundant cooling water circulation stabilizes helmet visor clarity.',
      },
      {
        id: 'sprint-work',
        label: 'Rush faster with high power torque to finish early while sweating hard',
        oxygenCost: 24,
        integrityDelta: -15,
        feedback:
          'Overheating traps heat in vacuum suits and spikes CO₂ fog inside your visor! Slow down and switch cooling reserve.',
      },
      {
        id: 'vent-gloves',
        label: 'Partially loosen wrist ring seals to let cool vacuum vent heat out',
        oxygenCost: 30,
        integrityDelta: -45,
        feedback:
          'CRITICAL DANGER! Opening a pressurized wrist seal in vacuum decompresses the suit immediately!',
      },
    ],
  },
  {
    id: 'eva-emg-2',
    stepNumber: 2,
    stationName: 'Outer Hull • Micrometeoroid Pit',
    prompt:
      'A tiny millimeter paint fleck scratches near an outer radiator valve, ringing a suit outer-layer graze check. How do you respond?',
    correctOptionId: 'inspect-integrity',
    options: [
      {
        id: 'inspect-integrity',
        label: 'Hold Dual Tether, check helmet gauge stability with buddy, and mark safe',
        oxygenCost: 15,
        integrityDelta: 0,
        feedback:
          'Calm suit verification! 14-layer Ortho-Fabric and vectran liners blocked the fleck cleanly; pressure held steady.',
      },
      {
        id: 'patch-tape',
        label: 'Slap Household Duct Tape directly onto exposed cold glove bearings',
        oxygenCost: 22,
        integrityDelta: -25,
        feedback:
          'Earth duct tape fails in -157°C shadow! Never attach non-rated adhesives onto pressurized suit bladders.',
      },
      {
        id: 'unclip-inspect',
        label: 'Unclip safety tether to float 3 meters away for a panoramic suit selfie',
        oxygenCost: 24,
        integrityDelta: -30,
        feedback:
          'Never unhook your tether outside the airlock! One stray nudge starts an unrecoverable orbital drift.',
      },
    ],
  },
  {
    id: 'eva-emg-3',
    stepNumber: 3,
    stationName: 'Solar Shade Pass • SAFER Ready Check',
    prompt:
      'Orbital night hits suddenly—darkness falls and one handrail clip jams mid-translation. What keeps you safely anchored?',
    correctOptionId: 'secondary-tether',
    options: [
      {
        id: 'secondary-tether',
        label: 'Engage second waist tether hook + turn on helmet spotlights before freeing clip',
        oxygenCost: 14,
        integrityDelta: 0,
        feedback:
          'Redundancy saves lives! That is why EVA suits always require two independent hooks plus helmet lights in shadow.',
      },
      {
        id: 'push-free',
        label: 'Kick hard off the solar truss hoping to catch the airlock ring mid-float',
        oxygenCost: 25,
        integrityDelta: -35,
        feedback:
          'Free-flying off the truss violates EVA rules—unless firing emergency SAFER jets from unintentional separation.',
      },
      {
        id: 'pry-hammer',
        label: 'Bang jammed steel bracket sharply with a Heavy Steel Hammer',
        oxygenCost: 22,
        integrityDelta: -30,
        feedback:
          'Impact forces in microgravity push you backward and create razor-sharp orbital debris shards!',
      },
    ],
  },
  {
    id: 'eva-emg-4',
    stepNumber: 4,
    stationName: 'Quest Airlock • Rapid Return',
    prompt:
      'Ground Control issues early EVA recall before crew solar eclipse power check. Complete the airlock return sequence:',
    correctOptionId: 'stowed-repress',
    options: [
      {
        id: 'stowed-repress',
        label: 'Inspect tool lanyard inventory, step inside hatch, close seal & repressurize',
        oxygenCost: 12,
        integrityDelta: 0,
        feedback:
          'Anomaly EVA Completed! Tool inventory confirmed zero lost debris and airlock repressurized smoothly.',
      },
      {
        id: 'drop-driver',
        label: 'Toss EVA Pistol-Grip Driver gently backward to lighten suit mass before entry',
        oxygenCost: 20,
        integrityDelta: -25,
        feedback:
          'Loose tools stay in dangerous orbit at ~28,000 km/h! Account for 100% of tools on tethers before sealing airlock.',
      },
      {
        id: 'unclip-outer-handle',
        label: 'Unclip waist tether at outer hatch door before entering airlock recess',
        oxygenCost: 20,
        integrityDelta: -30,
        feedback:
          'Keep tethered to the airlock structure until securely anchored inside!',
      },
    ],
  },
];

export const EVA_TOOL_LOCKER: EvaToolOption[] = [
  {
    id: 'dual-tether',
    name: 'Dual Safety Tether',
    category: 'Safety Gear',
    description: 'Two-hook locking tether line that clips your suit to station handrails.',
    spaceCertified: true,
    prepFeedback: 'Essential! NASA spacewalkers always keep at least two tether points connected.',
  },
  {
    id: 'pistol-driver',
    name: 'EVA Pistol-Grip Driver',
    category: 'Power Tool',
    description: 'Space-rated motorized screwdriver built with an oversized trigger for pressurized gloves.',
    spaceCertified: true,
    prepFeedback: 'Certified! The wide pistol grip is engineered specifically for bulky EVA suit gloves.',
  },
  {
    id: 'torque-wrench',
    name: 'Insulated Torque Wrench',
    category: 'Precision Tool',
    description: 'Non-conductive wrench that tightens high-voltage solar bolts safely without sparks.',
    spaceCertified: true,
    prepFeedback: 'Certified! Insulation protects your suit and prevents electrical arcs on solar connectors.',
  },
  {
    id: 'duct-tape',
    name: 'Household Duct Tape',
    category: 'Hardware',
    description: 'Ordinary adhesive tape from Earth.',
    spaceCertified: false,
    prepFeedback: 'Not space-rated: ordinary adhesive freezes brittle near -157°C (-250°F) in shadow and degrades near +121°C (+250°F) in direct sunlight.',
  },
  {
    id: 'metal-hammer',
    name: 'Heavy Steel Hammer',
    category: 'Impact Tool',
    description: 'Standard heavy workshop hammer.',
    spaceCertified: false,
    prepFeedback: 'Unsafe for EVA: striking hardware in zero-G pushes you backward and can shatter solar glass into orbital debris.',
  },
  {
    id: 'loose-rope',
    name: 'Unclipped Nylon Rope',
    category: 'Cordage',
    description: 'Plain rope without locking carabiners.',
    spaceCertified: false,
    prepFeedback: 'Unsafe for EVA: pressurized gloves cannot tie tight knots reliably—locking tether hooks are required.',
  },
];

export const REPAIR_STAGES: RepairStage[] = [
  {
    id: 'stage-anchor',
    stepNumber: 1,
    stationName: 'Airlock Exit & Truss Handrail',
    prompt: 'Step outside the airlock carefully. First, how do you anchor yourself to the station truss?',
    correctOptionId: 'dual-tether',
    options: [
      {
        id: 'dual-tether',
        label: 'Clip Dual Safety Tether Hooks',
        oxygenCost: 12,
        feedback: 'Locked in! Dual hooks ensure you stay safely attached even while shifting handholds.',
      },
      {
        id: 'pistol-driver',
        label: 'Hold onto Truss with Pistol-Grip Driver',
        oxygenCost: 18,
        feedback: 'Careful—a driver cannot anchor your suit! You spent extra oxygen stabilizing yourself. Clip the Dual Safety Tether first.',
      },
      {
        id: 'torque-wrench',
        label: 'Hook Wrench Around Handrail',
        oxygenCost: 18,
        feedback: 'Unsafe grip! Wrenches can slip off rails in microgravity. Use the Dual Safety Tether.',
      },
    ],
  },
  {
    id: 'stage-cover',
    stepNumber: 2,
    stationName: 'Solar Wing Protective Shield',
    prompt: 'You reached the damaged solar junction box. Which tool unlatches the protective thermal cover cleanly?',
    correctOptionId: 'pistol-driver',
    options: [
      {
        id: 'pistol-driver',
        label: 'Use EVA Pistol-Grip Driver',
        oxygenCost: 15,
        feedback: 'Smooth! The EVA driver turns all four shield latches quickly without straining your gloved hands.',
      },
      {
        id: 'dual-tether',
        label: 'Pull Cover Open with Safety Tether',
        oxygenCost: 18,
        feedback: 'Wrong tool—never pull latches with your life-saving tether! Use the EVA Pistol-Grip Driver.',
      },
      {
        id: 'torque-wrench',
        label: 'Pry Cover Latches with Torque Wrench',
        oxygenCost: 20,
        feedback: 'Prying wastes oxygen and risks bending the shield frame. Use the EVA Pistol-Grip Driver.',
      },
    ],
  },
  {
    id: 'stage-connector',
    stepNumber: 3,
    stationName: 'High-Voltage Solar Connector',
    prompt: 'The main solar power bolt came loose. Which tool secures the electrical connector safely?',
    correctOptionId: 'torque-wrench',
    options: [
      {
        id: 'torque-wrench',
        label: 'Tighten with Insulated Torque Wrench',
        oxygenCost: 18,
        feedback: 'Locked at exact torque! Insulation kept you safe and restored power across the solar wing.',
      },
      {
        id: 'pistol-driver',
        label: 'Spin High-Voltage Bolt with Driver',
        oxygenCost: 22,
        feedback: 'Too much speed on a live solar terminal! Use the Insulated Torque Wrench for safe electrical torque.',
      },
      {
        id: 'dual-tether',
        label: 'Wrap Tether Around Connector',
        oxygenCost: 20,
        feedback: 'That will not restore electrical contact and wastes precious oxygen. Use the Insulated Torque Wrench.',
      },
    ],
  },
  {
    id: 'stage-return',
    stepNumber: 4,
    stationName: 'Telemetry Check & Airlock Return',
    prompt: 'Solar power is glowing nominal! What is your final step to finish the spacewalk safely?',
    correctOptionId: 'verify-and-return',
    options: [
      {
        id: 'verify-and-return',
        label: 'Confirm Telemetry, Enter Airlock, Then Unclip',
        oxygenCost: 12,
        feedback: 'Textbook EVA return! Mission Control confirms full solar power and safe hatch seal.',
      },
      {
        id: 'unclip-outside',
        label: 'Unclip Tether Outside and Float Back',
        oxygenCost: 22,
        feedback: 'Dangerous! Never unclip outside the airlock—a tiny bump could push you away from the station. Stay tethered until inside!',
      },
      {
        id: 'skip-telemetry',
        label: 'Leave Cover Unlatched & Rush Inside',
        oxygenCost: 20,
        feedback: 'Leaving loose hardware outside creates space debris! Always verify telemetry and close up safely.',
      },
    ],
  },
];

export interface SpacewalkScore {
  total: number;
  stars: 1 | 2 | 3;
  completionBonus: number;
  oxygenBonus: number;
  accuracyBonus: number;
}

export function calculateSpacewalkScore(
  remainingOxygen: number,
  mistakesCount: number,
): SpacewalkScore {
  const completionBonus = 400;
  const oxygenBonus = Math.round(Math.max(0, remainingOxygen) * 8);
  const accuracyBonus = Math.max(0, 240 - mistakesCount * 60);
  const total = completionBonus + oxygenBonus + accuracyBonus;
  const stars: 1 | 2 | 3 = total >= 820 ? 3 : total >= 640 ? 2 : 1;

  return {
    total,
    stars,
    completionBonus,
    oxygenBonus,
    accuracyBonus,
  };
}
