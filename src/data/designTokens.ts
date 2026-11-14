import type { AstronautRank, ModuleAccent } from '../types/training';

export const DESIGN_TOKENS = {
  colors: {
    void: '#050914',
    navy: '#0a1124',
    slate: '#101a36',
    hover: '#17254a',
    border: '#1e2d54',
    cyan: '#38bdf8',
    cyanBright: '#67e8f9',
    emerald: '#34d399',
    amber: '#fbbf24',
    rose: '#fb7185',
    violet: '#a78bfa',
  },
} as const;

export const ACCENT_STYLES: Record<
  ModuleAccent,
  {
    iconBox: string;
    borderHover: string;
    progressFill: string;
    topBar: string;
    glow: string;
  }
> = {
  cyan: {
    iconBox: 'bg-sky-400/15 text-sky-300 border-sky-400/30',
    borderHover: 'hover:border-sky-400/50',
    progressFill: 'bg-sky-400',
    topBar: 'from-sky-400/80 via-cyan-300/60 to-transparent',
    glow: 'hover:shadow-[0_14px_36px_rgba(56,189,248,0.12)]',
  },
  emerald: {
    iconBox: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
    borderHover: 'hover:border-emerald-400/50',
    progressFill: 'bg-emerald-400',
    topBar: 'from-emerald-400/80 via-teal-300/60 to-transparent',
    glow: 'hover:shadow-[0_14px_36px_rgba(52,211,153,0.12)]',
  },
  violet: {
    iconBox: 'bg-violet-400/15 text-violet-300 border-violet-400/30',
    borderHover: 'hover:border-violet-400/50',
    progressFill: 'bg-violet-400',
    topBar: 'from-violet-400/80 via-indigo-300/60 to-transparent',
    glow: 'hover:shadow-[0_14px_36px_rgba(167,139,250,0.12)]',
  },
  amber: {
    iconBox: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
    borderHover: 'hover:border-amber-400/50',
    progressFill: 'bg-amber-400',
    topBar: 'from-amber-400/80 via-yellow-300/60 to-transparent',
    glow: 'hover:shadow-[0_14px_36px_rgba(251,191,36,0.12)]',
  },
  rose: {
    iconBox: 'bg-rose-400/15 text-rose-300 border-rose-400/30',
    borderHover: 'hover:border-rose-400/50',
    progressFill: 'bg-rose-400',
    topBar: 'from-rose-400/80 via-pink-300/60 to-transparent',
    glow: 'hover:shadow-[0_14px_36px_rgba(251,113,133,0.12)]',
  },
};

export const ASTRONAUT_RANKS: AstronautRank[] = [
  { level: 1, title: 'Starlight Cadet', minXp: 0 },
  { level: 2, title: 'Orbital Apprentice', minXp: 120 },
  { level: 3, title: 'Flight Specialist', minXp: 300 },
  { level: 4, title: 'EVA Explorer', minXp: 520 },
  { level: 5, title: 'Junior Mission Commander', minXp: 750 },
];
