import type { AcademyLessonId } from './academyLessonsData';

interface AcademyDiagramProps {
  lessonId: AcademyLessonId;
}

export function AcademyDiagram({ lessonId }: AcademyDiagramProps) {
  return (
    <div className="rounded-xl border border-sky-400/25 bg-space-void/85 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-sky-300">
          Conceptual Diagram
        </span>
        <span className="font-mono text-[10px] text-slate-400">
          ANANTRA Visual Brief
        </span>
      </div>

      {lessonId === 'spaceflight-fundamentals' && (
        <svg viewBox="0 0 360 130" className="h-32 w-full" role="img" aria-label="Diagram showing inner rocky planets and outer giant planets orbiting the Sun">
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#f59e0b" />
            </radialGradient>
          </defs>
          <rect width="360" height="130" rx="10" fill="#060d1f" />
          <circle cx="38" cy="65" r="24" fill="url(#sunGlow)" />
          <text x="38" y="102" textAnchor="middle" fill="#fcd34d" fontSize="9" fontFamily="monospace">SUN (99.8%)</text>
          {[85, 118, 152, 190, 245, 295, 330].map((cx) => (
            <ellipse key={cx} cx="38" cy="65" rx={cx - 38} ry={(cx - 38) * 0.28} fill="none" stroke="#1e293b" strokeDasharray="3 3" />
          ))}
          <circle cx="85" cy="65" r="4" fill="#94a3b8" />
          <circle cx="118" cy="65" r="5" fill="#fbbf24" />
          <circle cx="152" cy="65" r="6" fill="#38bdf8" />
          <text x="152" y="84" textAnchor="middle" fill="#bae6fd" fontSize="8">Earth</text>
          <circle cx="190" cy="65" r="5" fill="#f87171" />
          <text x="190" y="84" textAnchor="middle" fill="#fecaca" fontSize="8">Mars</text>
          <circle cx="245" cy="65" r="13" fill="#fdba74" />
          <text x="245" y="90" textAnchor="middle" fill="#fed7aa" fontSize="8">Jupiter</text>
          <ellipse cx="295" cy="65" rx="18" ry="6" fill="none" stroke="#fde68a" strokeWidth="2" />
          <circle cx="295" cy="65" r="10" fill="#eab308" />
          <circle cx="335" cy="65" r="8" fill="#60a5fa" />
          <text x="200" y="18" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">GRAVITY CURVES FORWARD MOTION INTO ORBIT</text>
        </svg>
      )}

      {lessonId === 'rocket-science' && (
        <svg viewBox="0 0 360 130" className="h-32 w-full" role="img" aria-label="Diagram of a multi-stage rocket showing thrust upward and exhaust action downward">
          <rect width="360" height="130" rx="10" fill="#060d1f" />
          <polygon points="80,22 65,48 95,48" fill="#e2e8f0" />
          <rect x="65" y="48" width="30" height="24" fill="#38bdf8" rx="2" />
          <text x="115" y="48" fill="#bae6fd" fontSize="9">Upper Stage (Lights in Vacuum)</text>
          <rect x="62" y="76" width="36" height="34" fill="#94a3b8" rx="2" />
          <line x1="65" y1="74" x2="95" y2="74" stroke="#f59e0b" strokeDasharray="3 2" strokeWidth="2" />
          <text x="115" y="92" fill="#cbd5e1" fontSize="9">Booster Stage Drops When Empty</text>
          <polygon points="68,110 92,110 80,126" fill="#fb923c" />
          <line x1="42" y1="95" x2="42" y2="32" stroke="#34d399" strokeWidth="2.5" />
          <polygon points="42,26 37,35 47,35" fill="#34d399" />
          <text x="15" y="65" fill="#6ee7b7" fontSize="8" fontFamily="monospace">THRUST</text>
          <text x="215" y="25" fill="#fcd34d" fontSize="9" fontFamily="monospace">Newton III: Exhaust Down → Craft Up</text>
          <text x="215" y="114" fill="#7dd3fc" fontSize="9" fontFamily="monospace">Newton II: Lower Mass → Higher a = F/m</text>
        </svg>
      )}

      {lessonId === 'orbital-mechanics' && (
        <svg viewBox="0 0 360 130" className="h-32 w-full" role="img" aria-label="Diagram showing Earth curve and orbital free-fall trajectory at 28,000 km/h">
          <rect width="360" height="130" rx="10" fill="#060d1f" />
          <circle cx="145" cy="115" r="78" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="145" cy="115" r="98" fill="none" stroke="#34d399" strokeDasharray="4 4" strokeWidth="1.8" />
          <rect x="140" y="12" width="12" height="8" rx="2" fill="#f8fafc" />
          <line x1="154" y1="16" x2="215" y2="16" stroke="#38bdf8" strokeWidth="2" />
          <polygon points="222,16 213,12 213,20" fill="#38bdf8" />
          <text x="228" y="20" fill="#7dd3fc" fontSize="9" fontFamily="monospace">v ≈ 28,000 km/h Sideways</text>
          <line x1="146" y1="22" x2="146" y2="48" stroke="#f59e0b" strokeWidth="2" />
          <polygon points="146,54 142,45 150,45" fill="#f59e0b" />
          <text x="165" y="45" fill="#fcd34d" fontSize="9">Earth Gravity Still ~89%!</text>
          <text x="220" y="88" fill="#a7f3d0" fontSize="9">Station falls at the exact rate</text>
          <text x="220" y="101" fill="#a7f3d0" fontSize="9">Earth curves away beneath it</text>
        </svg>
      )}

      {lessonId === 'moon-exploration' && (
        <svg viewBox="0 0 360 130" className="h-32 w-full" role="img" aria-label="Diagram of a lunar lander descending in airless Moon vacuum using thrusters">
          <rect width="360" height="130" rx="10" fill="#060d1f" />
          <path d="M0,104 Q90,94 180,104 T360,104 L360,130 L0,130 Z" fill="#334155" />
          <ellipse cx="145" cy="106" rx="34" ry="5" fill="#38bdf8" opacity="0.35" />
          <rect x="133" y="46" width="24" height="18" rx="3" fill="#e2e8f0" />
          <line x1="133" y1="64" x2="124" y2="76" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="157" y1="64" x2="166" y2="76" stroke="#cbd5e1" strokeWidth="2" />
          <polygon points="139,65 151,65 145,86" fill="#fbbf24" />
          <text x="200" y="34" fill="#e2e8f0" fontSize="9" fontFamily="monospace">LUNAR GRAVITY: 1.62 m/s² (1/6 Earth)</text>
          <text x="200" y="54" fill="#fcd34d" fontSize="9">No Air = Parachutes Cannot Work</text>
          <text x="200" y="74" fill="#6ee7b7" fontSize="9">Artemis Target: South Pole Water Ice</text>
        </svg>
      )}

      {lessonId === 'mars-exploration' && (
        <svg viewBox="0 0 360 130" className="h-32 w-full" role="img" aria-label="Diagram of Mars rover entry with supersonic chute and sky-crane landing">
          <rect width="360" height="130" rx="10" fill="#170b0b" />
          <path d="M0,102 Q140,86 360,106 L360,130 L0,130 Z" fill="#7c2d12" />
          <path d="M55,22 Q85,4 115,22 Z" fill="#f97316" opacity="0.7" />
          <line x1="58" y1="22" x2="85" y2="54" stroke="#fed7aa" strokeWidth="1.5" />
          <line x1="112" y1="22" x2="85" y2="54" stroke="#fed7aa" strokeWidth="1.5" />
          <circle cx="85" cy="58" r="7" fill="#e2e8f0" />
          <rect x="205" y="78" width="26" height="14" rx="2" fill="#e2e8f0" />
          <circle cx="209" cy="96" r="5" fill="#94a3b8" />
          <circle cx="227" cy="96" r="5" fill="#94a3b8" />
          <text x="155" y="30" fill="#fdba74" fontSize="9" fontFamily="monospace">THIN CO₂ AIR (1% EARTH)</text>
          <text x="155" y="48" fill="#fed7aa" fontSize="9">Gravity: 3.72 m/s² • 1 Sol = 24h 39m</text>
          <text x="155" y="64" fill="#fca5a5" fontSize="9">Radio Lag: 4–24 min One Way</text>
        </svg>
      )}

      {lessonId === 'spacesuits' && (
        <svg viewBox="0 0 360 130" className="h-32 w-full" role="img" aria-label="Diagram of an EVA spacesuit showing gold visor, PLSS backpack, and cooling garment">
          <rect width="360" height="130" rx="10" fill="#060d1f" />
          <circle cx="95" cy="36" r="18" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
          <ellipse cx="98" cy="36" rx="12" ry="10" fill="#f59e0b" opacity="0.85" />
          <rect x="78" y="56" width="34" height="44" rx="6" fill="#f1f5f9" />
          <rect x="64" y="54" width="14" height="36" rx="3" fill="#94a3b8" />
          <text x="135" y="32" fill="#fcd34d" fontSize="9">Gold Visor Reflects Harsh Sunlight</text>
          <text x="135" y="52" fill="#7dd3fc" fontSize="9">Chilled Water Loops (91 m LCVG Tubing)</text>
          <text x="135" y="72" fill="#6ee7b7" fontSize="9">PLSS Backpack: Pure O₂ &amp; CO₂ Scrubbers</text>
          <text x="135" y="92" fill="#cbd5e1" fontSize="9">14+ Outer Layers Block -157°C to +121°C</text>
        </svg>
      )}

      {lessonId === 'space-station-ops' && (
        <svg viewBox="0 0 360 130" className="h-32 w-full" role="img" aria-label="Diagram of International Space Station with golden solar arrays and pressurized science modules">
          <rect width="360" height="130" rx="10" fill="#060d1f" />
          <line x1="70" y1="65" x2="290" y2="65" stroke="#94a3b8" strokeWidth="4" />
          <rect x="76" y="20" width="22" height="90" fill="#d97706" rx="2" opacity="0.85" />
          <rect x="108" y="20" width="22" height="90" fill="#d97706" rx="2" opacity="0.85" />
          <rect x="230" y="20" width="22" height="90" fill="#d97706" rx="2" opacity="0.85" />
          <rect x="262" y="20" width="22" height="90" fill="#d97706" rx="2" opacity="0.85" />
          <rect x="148" y="53" width="64" height="24" rx="5" fill="#e2e8f0" />
          <text x="180" y="68" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold">PRESSURIZED LAB</text>
          <text x="180" y="16" textAnchor="middle" fill="#fde68a" fontSize="9" fontFamily="monospace">SOLAR ARRAYS + RADIATORS + ~408 KM ORBIT</text>
        </svg>
      )}

      {lessonId === 'human-physiology' && (
        <svg viewBox="0 0 360 130" className="h-32 w-full" role="img" aria-label="Diagram illustrating body fluid shift and daily resistive exercise in microgravity">
          <rect width="360" height="130" rx="10" fill="#060d1f" />
          <circle cx="85" cy="40" r="14" fill="#38bdf8" opacity="0.28" stroke="#38bdf8" />
          <rect x="75" y="56" width="20" height="36" rx="6" fill="#94a3b8" />
          <line x1="85" y1="88" x2="85" y2="52" stroke="#34d399" strokeWidth="2.5" />
          <polygon points="85,46 80,55 90,55" fill="#34d399" />
          <text x="120" y="42" fill="#7dd3fc" fontSize="9">Upward Fluid Shift (No Weight Pull)</text>
          <text x="120" y="64" fill="#6ee7b7" fontSize="9">2 hr/day Exercise Saves Bone &amp; Muscle</text>
          <text x="120" y="86" fill="#fcd34d" fontSize="9">Fans Move Exhaled CO₂ Away During Sleep</text>
          <text x="120" y="108" fill="#e2e8f0" fontSize="9">Surface Tension Forms Floating Water Spheres</text>
        </svg>
      )}

      {lessonId === 'radiation-hazards' && (
        <svg viewBox="0 0 360 130" className="h-32 w-full" role="img" aria-label="Diagram showing solar particle storm blocked by hydrogen-rich water wall shielding">
          <rect width="360" height="130" rx="10" fill="#060d1f" />
          <circle cx="28" cy="65" r="16" fill="#fbbf24" />
          <line x1="48" y1="45" x2="140" y2="45" stroke="#f87171" strokeDasharray="5 3" strokeWidth="2" />
          <line x1="48" y1="65" x2="140" y2="65" stroke="#f87171" strokeDasharray="5 3" strokeWidth="2" />
          <line x1="48" y1="85" x2="140" y2="85" stroke="#f87171" strokeDasharray="5 3" strokeWidth="2" />
          <rect x="145" y="25" width="18" height="80" rx="3" fill="#0284c7" stroke="#7dd3fc" />
          <text x="154" y="118" textAnchor="middle" fill="#7dd3fc" fontSize="8">H₂O WALL</text>
          <rect x="168" y="34" width="46" height="62" rx="4" fill="#0f2942" stroke="#34d399" />
          <text x="191" y="68" textAnchor="middle" fill="#6ee7b7" fontSize="8" fontWeight="bold">CREW SAFE</text>
          <text x="230" y="45" fill="#fca5a5" fontSize="9">Solar Particle Events &amp; GCRs</text>
          <text x="230" y="68" fill="#7dd3fc" fontSize="9">Hydrogen Blocks High-Energy Rays</text>
          <text x="230" y="91" fill="#fde68a" fontSize="9">Avoid Thin Cupola Glass in Storms</text>
        </svg>
      )}

      {lessonId === 'mission-control-ops' && (
        <svg viewBox="0 0 360 130" className="h-32 w-full" role="img" aria-label="Diagram showing Mission Control console loop linking Flight Director, CAPCOM, and Station">
          <rect width="360" height="130" rx="10" fill="#060d1f" />
          <rect x="26" y="46" width="84" height="36" rx="5" fill="#1e293b" stroke="#38bdf8" />
          <text x="68" y="67" textAnchor="middle" fill="#bae6fd" fontSize="9" fontWeight="bold">FLIGHT + EECOM</text>
          <rect x="140" y="46" width="80" height="36" rx="5" fill="#1e293b" stroke="#34d399" />
          <text x="180" y="67" textAnchor="middle" fill="#a7f3d0" fontSize="9" fontWeight="bold">CAPCOM</text>
          <rect x="250" y="46" width="84" height="36" rx="5" fill="#1e293b" stroke="#fbbf24" />
          <text x="292" y="67" textAnchor="middle" fill="#fde68a" fontSize="9" fontWeight="bold">ORBIT CREW</text>
          <line x1="112" y1="64" x2="138" y2="64" stroke="#38bdf8" strokeWidth="2" />
          <line x1="222" y1="64" x2="248" y2="64" stroke="#34d399" strokeWidth="2" />
          <text x="180" y="24" textAnchor="middle" fill="#7dd3fc" fontSize="9" fontFamily="monospace">TDRS SATELLITE TELEMETRY LOOP</text>
          <text x="180" y="108" textAnchor="middle" fill="#94a3b8" fontSize="9">Calm Priority Triage: Life Support → Attitude → Comms</text>
        </svg>
      )}
    </div>
  );
}
