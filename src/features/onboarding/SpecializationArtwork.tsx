import type { SpecializationId } from '../../types/cadetProfile';

export function SpecializationArtwork({
  specialization,
  className = 'h-12 w-12',
}: {
  specialization: SpecializationId;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
    >
      {specialization === 'lunar-explorer' && (
        <>
          <circle cx="32" cy="34" r="19" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="25" cy="28" r="4" fill="#0f172a" stroke="#64748b" strokeWidth="1.2" />
          <circle cx="39" cy="40" r="5" fill="#0f172a" stroke="#64748b" strokeWidth="1.2" />
          <circle cx="37" cy="25" r="2.5" fill="#0f172a" />
          <path d="M27 17 L32 10 L37 17 Z" fill="#e2e8f0" />
          <path d="M28 17 L25 21 M36 17 L39 21" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          <ellipse
            cx="32"
            cy="34"
            rx="27"
            ry="10"
            transform="rotate(-18 32 34)"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        </>
      )}

      {specialization === 'mars-pioneer' && (
        <>
          <circle cx="32" cy="30" r="18" fill="#c2410c" stroke="#fbbf24" strokeWidth="2" />
          <path d="M20 26 Q30 22 44 28" stroke="#9a3412" strokeWidth="3" fill="none" />
          <circle cx="26" cy="36" r="3.5" fill="#9a3412" />
          <rect x="23" y="42" width="18" height="7" rx="2" fill="#e2e8f0" />
          <rect x="28" y="37" width="4" height="5" fill="#38bdf8" />
          <circle cx="26" cy="51" r="3" fill="#94a3b8" />
          <circle cx="38" cy="51" r="3" fill="#94a3b8" />
        </>
      )}

      {specialization === 'space-station-specialist' && (
        <>
          <rect x="10" y="16" width="12" height="32" rx="2" fill="#0284c7" stroke="#67e8f9" strokeWidth="1.5" />
          <rect x="42" y="16" width="12" height="32" rx="2" fill="#0284c7" stroke="#67e8f9" strokeWidth="1.5" />
          <line x1="12" y1="32" x2="52" y2="32" stroke="#94a3b8" strokeWidth="3" />
          <rect x="25" y="23" width="14" height="18" rx="4" fill="#e2e8f0" />
          <circle cx="32" cy="32" r="3.5" fill="#34d399" />
          <line x1="16" y1="24" x2="16" y2="40" stroke="#e0f2fe" strokeWidth="1" opacity="0.5" />
          <line x1="48" y1="24" x2="48" y2="40" stroke="#e0f2fe" strokeWidth="1" opacity="0.5" />
        </>
      )}

      {specialization === 'cosmic-scientist' && (
        <>
          <circle cx="32" cy="32" r="18" fill="#4c1d95" opacity="0.45" />
          <ellipse
            cx="32"
            cy="32"
            rx="24"
            ry="8"
            transform="rotate(28 32 32)"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2.2"
          />
          <circle cx="32" cy="32" r="8" fill="#67e8f9" />
          <polygon points="48,14 49.5,18 53.5,19.5 49.5,21 48,25 46.5,21 42.5,19.5 46.5,18" fill="#fbbf24" />
          <polygon points="16,44 17.2,47 20.2,48.2 17.2,49.4 16,52.4 14.8,49.4 11.8,48.2 14.8,47" fill="#e0f2fe" />
        </>
      )}
    </svg>
  );
}

export function WelcomeOrbitalHeroArtwork() {
  return (
    <svg
      viewBox="0 0 360 320"
      className="h-auto w-full max-w-[340px] drop-shadow-[0_0_40px_rgba(56,189,248,0.2)]"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="earthGrad" cx="38%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="55%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
        <radialGradient id="haloGrad" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Deep ambient orbital glow */}
      <circle cx="185" cy="188" r="120" fill="url(#haloGrad)" />

      {/* Outer Trajectory Rings */}
      <ellipse
        cx="182"
        cy="178"
        rx="145"
        ry="52"
        transform="rotate(-16 182 178)"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="1.5"
        strokeDasharray="6 6"
        opacity="0.6"
      />
      <ellipse
        cx="182"
        cy="178"
        rx="116"
        ry="40"
        transform="rotate(14 182 178)"
        fill="none"
        stroke="#67e8f9"
        strokeWidth="1.2"
        opacity="0.35"
      />

      {/* Earth Sphere */}
      <circle cx="190" cy="202" r="78" fill="url(#earthGrad)" stroke="#7dd3fc" strokeWidth="1.5" strokeOpacity="0.4" />
      {/* Stylized Continents */}
      <path
        d="M150 170 C165 162, 190 166, 196 184 C202 200, 182 214, 168 206 C154 198, 142 180, 150 170 Z"
        fill="#34d399"
        opacity="0.7"
      />
      <path
        d="M214 176 C228 182, 238 198, 232 218 C222 224, 212 216, 208 202 C205 190, 206 180, 214 176 Z"
        fill="#34d399"
        opacity="0.65"
      />
      {/* Cloud wisps */}
      <rect x="134" y="190" width="42" height="7" rx="3.5" fill="#f8fafc" opacity="0.45" />
      <rect x="194" y="218" width="52" height="6" rx="3" fill="#f8fafc" opacity="0.4" />

      {/* Distant Moon & Stars */}
      <circle cx="294" cy="74" r="18" fill="#cbd5e1" stroke="#e2e8f0" strokeWidth="1.5" />
      <circle cx="288" cy="69" r="4" fill="#94a3b8" />
      <circle cx="301" cy="80" r="3" fill="#94a3b8" />
      <circle cx="66" cy="70" r="2.2" fill="#fbbf24" />
      <circle cx="110" cy="48" r="1.8" fill="#e2e8f0" />
      <circle cx="322" cy="146" r="2" fill="#67e8f9" />

      {/* Friendly Junior Astronaut in Orbit */}
      <g transform="translate(128, 62)">
        {/* Jetpack */}
        <rect x="6" y="34" width="14" height="32" rx="6" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
        {/* Suit Torso */}
        <rect x="16" y="30" width="38" height="42" rx="14" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="26" y="42" width="18" height="12" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx="32" cy="48" r="2.5" fill="#34d399" />
        <circle cx="39" cy="48" r="2.5" fill="#fbbf24" />

        {/* Waving Arms */}
        <path
          d="M52 38 C64 28, 70 22, 74 16"
          stroke="#f8fafc"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="75" cy="15" r="5" fill="#38bdf8" />
        <path
          d="M18 40 C8 48, 4 54, 8 60"
          stroke="#f8fafc"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />

        {/* Legs */}
        <line x1="26" y1="70" x2="22" y2="86" stroke="#f8fafc" strokeWidth="10" strokeLinecap="round" />
        <line x1="44" y1="70" x2="48" y2="86" stroke="#f8fafc" strokeWidth="10" strokeLinecap="round" />
        <rect x="14" y="83" width="14" height="7" rx="3" fill="#38bdf8" />
        <rect x="42" y="83" width="14" height="7" rx="3" fill="#38bdf8" />

        {/* Helmet */}
        <circle cx="35" cy="20" r="20" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
        <ellipse cx="36" cy="20" rx="14" ry="11" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.8" />
        {/* Friendly visor reflection */}
        <path
          d="M27 16 C31 12, 39 12, 43 15"
          stroke="#67e8f9"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="31" cy="21" r="2" fill="#38bdf8" />
        <circle cx="41" cy="21" r="2" fill="#38bdf8" />
      </g>
    </svg>
  );
}
