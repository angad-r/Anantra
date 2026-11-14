import type {
  AgeGroup,
  AvatarId,
  SpaceDestination,
  SpecializationId,
} from '../../types/cadetProfile';

export interface SpecializationOption {
  id: SpecializationId;
  code: string;
  title: string;
  description: string;
  badgeFocus: string;
  accentBorder: string;
  accentBg: string;
  accentText: string;
  accentGlow: string;
}

export const CADET_SPECIALIZATIONS: SpecializationOption[] = [
  {
    id: 'lunar-explorer',
    code: 'SPEC-01',
    title: 'LUNAR EXPLORER',
    description:
      'Specialize in lunar missions, Moon exploration, and landing challenges.',
    badgeFocus: 'Touchdown & Crater Navigation',
    accentBorder: 'border-sky-400/70',
    accentBg: 'bg-sky-400/14',
    accentText: 'text-sky-300',
    accentGlow: 'shadow-[0_0_28px_rgba(56,189,248,0.2)]',
  },
  {
    id: 'mars-pioneer',
    code: 'SPEC-02',
    title: 'MARS PIONEER',
    description:
      'Specialize in Mars exploration, planetary science, and rover missions.',
    badgeFocus: 'Red Planet Reconnaissance',
    accentBorder: 'border-amber-400/70',
    accentBg: 'bg-amber-400/14',
    accentText: 'text-amber-300',
    accentGlow: 'shadow-[0_0_28px_rgba(251,191,36,0.18)]',
  },
  {
    id: 'space-station-specialist',
    code: 'SPEC-03',
    title: 'SPACE STATION SPECIALIST',
    description:
      'Specialize in spacecraft systems, orbital operations, and spacewalks.',
    badgeFocus: 'EVA Repairs & Systems Ops',
    accentBorder: 'border-emerald-400/70',
    accentBg: 'bg-emerald-400/14',
    accentText: 'text-emerald-300',
    accentGlow: 'shadow-[0_0_28px_rgba(52,211,153,0.18)]',
  },
  {
    id: 'cosmic-scientist',
    code: 'SPEC-04',
    title: 'COSMIC SCIENTIST',
    description:
      'Specialize in astronomy, space science, and scientific experiments.',
    badgeFocus: 'Microgravity & Deep-Sky Discovery',
    accentBorder: 'border-violet-400/70',
    accentBg: 'bg-violet-400/14',
    accentText: 'text-violet-300',
    accentGlow: 'shadow-[0_0_28px_rgba(167,139,250,0.18)]',
  },
];

export const SPECIALIZATION_BY_ID: Record<SpecializationId, SpecializationOption> =
  Object.fromEntries(
    CADET_SPECIALIZATIONS.map((item) => [item.id, item]),
  ) as Record<SpecializationId, SpecializationOption>;

export interface AvatarOption {
  id: AvatarId;
  label: string;
  tagline: string;
}

export const CADET_AVATARS: AvatarOption[] = [
  {
    id: 'orbit-helmet',
    label: 'Orbit Helmet',
    tagline: 'Reflective gold visor flight suit badge',
  },
  {
    id: 'lunar-rover',
    label: 'Lunar Rover',
    tagline: 'Six-wheel Moon terrain scout patch',
  },
  {
    id: 'star-commander',
    label: 'Star Commander',
    tagline: 'Twin-star orbital command crest',
  },
  {
    id: 'nebula-explorer',
    label: 'Nebula Explorer',
    tagline: 'Deep-space starlight navigator',
  },
  {
    id: 'saturn-pilot',
    label: 'Saturn Pilot',
    tagline: 'Ringed-world trajectory insignia',
  },
  {
    id: 'nova-bot',
    label: 'ARIA Telemetry Drone',
    tagline: 'Autonomous orbital companion crest',
  },
];

export const AVATAR_BY_ID: Record<AvatarId, AvatarOption> = Object.fromEntries(
  CADET_AVATARS.map((item) => [item.id, item]),
) as Record<AvatarId, AvatarOption>;

export const AGE_GROUP_OPTIONS: AgeGroup[] = [
  'Under 10',
  '10–13',
  '14–16',
  '17+',
];

export const FAVORITE_DESTINATIONS: {
  id: SpaceDestination;
  subtitle: string;
}[] = [
  { id: 'Moon', subtitle: '384,400 km • Artemis Gateway' },
  { id: 'Mars', subtitle: '225M km avg • Jezero Crater' },
  { id: 'Jupiter', subtitle: '778M km • Giant of Storms' },
  { id: 'Saturn', subtitle: '1.4B km • Icy Ring System' },
  {
    id: 'International Space Station',
    subtitle: '408 km • Low Earth Orbit Lab',
  },
];

export const CALLSIGN_SUGGESTIONS = [
  'ORION-7',
  'STARLIGHT',
  'APOLLO-9',
  'COMET-4',
] as const;

export interface CadetIdentityValidationErrors {
  firstName?: string;
  callsign?: string;
}

const FIRST_NAME_REGEX = /^[\p{L}][\p{L}\s'-]{0,23}$/u;
const CALLSIGN_REGEX = /^[A-Za-z0-9][A-Za-z0-9\-_ ]{0,15}$/;

export function normalizeFirstName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function normalizeCallsign(raw: string): string {
  return raw.trim().replace(/\s+/g, '-').toUpperCase();
}

export function validateCadetIdentity(
  rawFirstName: string,
  rawCallsign: string,
): CadetIdentityValidationErrors {
  const errors: CadetIdentityValidationErrors = {};
  const firstName = normalizeFirstName(rawFirstName);
  const callsign = rawCallsign.trim();

  if (!firstName) {
    errors.firstName = 'Please enter your first name to create your cadet badge.';
  } else if (firstName.includes('@')) {
    errors.firstName =
      'No email needed! Please enter only your first name.';
  } else if (firstName.length < 2) {
    errors.firstName = 'First name must be at least 2 letters long.';
  } else if (firstName.length > 24) {
    errors.firstName = 'First name must be 24 characters or fewer.';
  } else if (!FIRST_NAME_REGEX.test(firstName)) {
    errors.firstName =
      'Use letters, spaces, hyphens, or apostrophes for your first name.';
  }

  if (!callsign) {
    errors.callsign =
      'Please choose an Astronaut Callsign (for example, ORION-7).';
  } else if (callsign.length < 2) {
    errors.callsign = 'Astronaut callsign must be at least 2 characters.';
  } else if (callsign.length > 16) {
    errors.callsign = 'Astronaut callsign must be 16 characters or fewer.';
  } else if (!CALLSIGN_REGEX.test(callsign)) {
    errors.callsign =
      'Use only letters, numbers, spaces, hyphens, or underscores in your callsign.';
  }

  return errors;
}

export function generateCadetId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const length = 6;
  let code = '';

  if (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto &&
    typeof globalThis.crypto.getRandomValues === 'function'
  ) {
    const bytes = new Uint8Array(length);
    globalThis.crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i += 1) {
      code += alphabet[bytes[i] % alphabet.length];
    }
  } else {
    for (let i = 0; i < length; i += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }

  return `ANT-${code.slice(0, 3)}-${code.slice(3)}`;
}
