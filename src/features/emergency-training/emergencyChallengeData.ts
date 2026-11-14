export type EmergencyDeckId = 'core-triad' | 'full-crisis';

export interface EmergencyScenario {
  id: string;
  alertCode: string;
  title: string;
  situation: string;
  telemetryDomain: 'pressure' | 'oxygen' | 'power' | 'comms' | 'radiation';
  correctActionId: string;
  options: {
    id: string;
    label: string;
    safetyDelta: number;
    feedback: string;
  }[];
}

export const EMERGENCY_SCENARIOS: EmergencyScenario[] = [
  {
    id: 'emg-pressure',
    alertCode: 'ALERT 01 • PRESSURE DROP',
    title: 'Cabin Air Pressure Falling in Module B',
    situation:
      'Sensors show air slowly leaking from Cargo Module B. What is your calm first priority?',
    telemetryDomain: 'pressure',
    correctActionId: 'isolate-hatch',
    options: [
      {
        id: 'isolate-hatch',
        label: 'Move crew out, close the isolation hatch, and monitor air gauges',
        safetyDelta: 0,
        feedback:
          'Smart priority! Isolating the leaking module keeps breathable air inside the rest of the station.',
      },
      {
        id: 'open-airlock',
        label: 'Open the exterior airlock hatch to equalize pressure',
        safetyDelta: -40,
        feedback:
          'Unsafe! Space outside is a vacuum—opening an outer hatch would let all cabin air rush out.',
      },
      {
        id: 'dim-lights',
        label: 'Turn off cabin lights and wait to see if pressure returns',
        safetyDelta: -30,
        feedback:
          'Turning off lights does not stop an air leak. Always protect breathable air and seal hatches first!',
      },
    ],
  },
  {
    id: 'emg-power',
    alertCode: 'ALERT 02 • POWER DIP',
    title: 'Solar Array Shadowing — Low Battery Bus',
    situation:
      'One solar wing rotated offline during orbital night, cutting available electricity in half. How do you stabilize the crew cabin?',
    telemetryDomain: 'power',
    correctActionId: 'shed-nonessential',
    options: [
      {
        id: 'shed-nonessential',
        label: 'Turn off extra lab heaters/lights and keep oxygen scrubbers powered',
        safetyDelta: 0,
        feedback:
          'Great load-shedding! Real astronauts turn off non-essential experiments so life support never loses power.',
      },
      {
        id: 'cut-scrubbers',
        label: 'Switch off carbon dioxide scrubbers to save maximum battery',
        safetyDelta: -40,
        feedback:
          'Careful! Oxygen supply and CO₂ scrubbers are always top-priority loads and must stay powered.',
      },
      {
        id: 'reboot-all',
        label: 'Unplug the main station computer without telling Mission Control',
        safetyDelta: -30,
        feedback:
          'Cutting flight computers blinds telemetry. Shed non-essential loads calmly and inform Mission Control.',
      },
    ],
  },
  {
    id: 'emg-radiation',
    alertCode: 'ALERT 03 • SOLAR FLARE',
    title: 'Solar Particle Storm Approaching Orbit',
    situation:
      'Space weather satellites warn of a strong solar flare reaching your orbit in 10 minutes. Where should the crew shelter?',
    telemetryDomain: 'radiation',
    correctActionId: 'water-shelter',
    options: [
      {
        id: 'water-shelter',
        label: 'Gather inside the water-wall shielded shelter zone and verify headcount',
        safetyDelta: 0,
        feedback:
          'Spot on! Water and thick station racks absorb high-energy solar particles effectively.',
      },
      {
        id: 'cupola-window',
        label: 'Float beside the glass observation cupola to watch the flare',
        safetyDelta: -40,
        feedback:
          'Too exposed! Thin observation windows offer much less radiation shielding than inner shelter racks.',
      },
      {
        id: 'eva-outside',
        label: 'Suit up and step outside for a spacewalk during the storm',
        safetyDelta: -45,
        feedback:
          'Unsafe! Never perform a spacewalk during a solar radiation storm—stay inside shielded quarters.',
      },
    ],
  },
];

export const EXTENDED_CRISIS_SCENARIOS: EmergencyScenario[] = [
  EMERGENCY_SCENARIOS[0],
  {
    id: 'emg-oxygen',
    alertCode: 'ALERT 04 • O₂ / CO₂ SYSTEM FAULT',
    title: 'Primary CO₂ Scrubber & Oxygen Generator Trip',
    situation:
      'Amine CO₂ buildup climbs past 4.0 mmHg after a primary valve sticks inside ECLSS Rack 2. How do you protect breathable air?',
    telemetryDomain: 'oxygen',
    correctActionId: 'switch-backup-o2',
    options: [
      {
        id: 'switch-backup-o2',
        label: 'Activate redundant CO₂ scrubber channel, open reserve O₂ valve & verify mask readiness',
        safetyDelta: 0,
        feedback:
          'Textbook ECLSS backup! Switching to redundant CO₂ beds stabilizes cabin air purity without wasting oxygen.',
      },
      {
        id: 'hold-breath',
        label: 'Turn off cabin ventilation fans completely so air stays still',
        safetyDelta: -40,
        feedback:
          'Danger! Stopping cabin circulation creates pockets of stagnant exhaled CO₂ right around crew faces.',
      },
      {
        id: 'vent-cabin-air',
        label: 'Flush cabin air out into space until sensors cool off',
        safetyDelta: -45,
        feedback:
          'Dumping cabin air drains scarce station nitrogen and oxygen reserves immediately!',
      },
    ],
  },
  EMERGENCY_SCENARIOS[1],
  {
    id: 'emg-comms',
    alertCode: 'ALERT 05 • COMMS BLACKOUT',
    title: 'Primary High-Gain Dish Telemetry Loss',
    situation:
      'High-gain dish gimbal stalls, dropping live HD video and telemetry with Mission Control while orbital alerts remain active.',
    telemetryDomain: 'comms',
    correctActionId: 'switch-sband-relay',
    options: [
      {
        id: 'switch-sband-relay',
        label: 'Fail over to omnidirectional S-Band antenna via TDRS relay & log checklist state',
        safetyDelta: 0,
        feedback:
          'Smart CAPCOM recovery! Low-bandwidth omnidirectional S-Band reconnects voice and safety telemetry reliably across TDRS satellites.',
      },
      {
        id: 'ignore-comms',
        label: 'Wait silently for two full orbits until passing directly over Houston antennas',
        safetyDelta: -35,
        feedback:
          'Operating blind without TDRS telemetry delays ground engineering checks during anomalies!',
      },
      {
        id: 'power-down-radio',
        label: 'Unplug every VHF and S-band radio breaker to boost lab Wi-Fi',
        safetyDelta: -40,
        feedback:
          'Cutting all radio receivers severs Mission Control contact completely.',
      },
    ],
  },
  EMERGENCY_SCENARIOS[2],
];
