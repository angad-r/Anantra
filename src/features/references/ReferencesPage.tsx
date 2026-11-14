import {
  BookOpen,
  ExternalLink,
  FlaskConical,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { BadgePill } from '../../components/ui/BadgePill';
import { ButtonLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface NasaReferenceEntry {
  id: string;
  topic: string;
  category:
    | 'Curriculum & Solar System'
    | 'Orbital Physics & Microgravity'
    | 'Moon, Mars & Spacecraft'
    | 'Human Health, Suits & Hazards';
  modules: string;
  title: string;
  url: string;
}

const NASA_REFERENCES: NasaReferenceEntry[] = [
  {
    id: 'ref-solar-system',
    topic: 'Our Solar System Overview',
    category: 'Curriculum & Solar System',
    modules: 'Astronaut Academy (Topic 01–05)',
    title: 'NASA Science — Our Solar System',
    url: 'https://science.nasa.gov/solar-system/',
  },
  {
    id: 'ref-planets',
    topic: 'Rocky vs. Gas & Ice Giants',
    category: 'Curriculum & Solar System',
    modules: 'Astronaut Academy',
    title: 'NASA Science — Planets',
    url: 'https://science.nasa.gov/solar-system/planets/',
  },
  {
    id: 'ref-mars',
    topic: 'Mars Surface, Volcanism & Exploration',
    category: 'Moon, Mars & Spacecraft',
    modules: 'Astronaut Academy (Topic 05), Onboarding',
    title: 'NASA Science — Mars Exploration',
    url: 'https://science.nasa.gov/mars/',
  },
  {
    id: 'ref-moon',
    topic: "Earth's Moon & Surface Gravity (1.62 m/s²)",
    category: 'Moon, Mars & Spacecraft',
    modules: 'Mission Control, Astronaut Academy (Topic 04)',
    title: "NASA Science — Earth's Moon",
    url: 'https://science.nasa.gov/moon/',
  },
  {
    id: 'ref-apollo11',
    topic: 'Apollo 11 Powered Lunar Descent Heritage',
    category: 'Moon, Mars & Spacecraft',
    modules: 'Mission Control',
    title: 'NASA — Apollo 11 Mission',
    url: 'https://www.nasa.gov/mission/apollo-11/',
  },
  {
    id: 'ref-artemis',
    topic: 'Artemis Lunar Exploration Architecture',
    category: 'Moon, Mars & Spacecraft',
    modules: 'Astronaut Academy (Topic 04), AI Mentor',
    title: 'NASA — Artemis',
    url: 'https://www.nasa.gov/humans-in-space/artemis/',
  },
  {
    id: 'ref-microgravity',
    topic: 'What Is Microgravity? (Orbital Free-Fall)',
    category: 'Orbital Physics & Microgravity',
    modules: 'Zero Gravity Lab, Astronaut Academy (Topic 03 & 07), AI Mentor',
    title: 'NASA — What Is Microgravity?',
    url: 'https://www.nasa.gov/learning-resources/what-is-microgravity/',
  },
  {
    id: 'ref-microgravity-guide',
    topic: 'Microgravity Educator Experiments (Grades 5–8)',
    category: 'Orbital Physics & Microgravity',
    modules: 'Zero Gravity Lab',
    title: 'NASA — What Is Microgravity? (Grades 5–8 Guide)',
    url: 'https://www.nasa.gov/learning-resources/for-educators/what-is-microgravity-grades-5-8/',
  },
  {
    id: 'ref-newton',
    topic: "Newton's Laws of Motion (F = m · a & Action-Reaction)",
    category: 'Orbital Physics & Microgravity',
    modules: 'Zero Gravity Lab, Mission Control, Academy (Topic 02)',
    title: "NASA Glenn Research Center — Newton's Laws of Motion",
    url: 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/newtons-laws-of-motion/',
  },
  {
    id: 'ref-basics-spaceflight',
    topic: 'Orbital Mechanics & Basics of Space Flight',
    category: 'Orbital Physics & Microgravity',
    modules: 'Astronaut Academy (Topic 03), AI Mentor',
    title: 'NASA Science — Basics of Space Flight',
    url: 'https://science.nasa.gov/learn/basics-of-space-flight/',
  },
  {
    id: 'ref-gravity',
    topic: 'Gravity, Weight vs. Mass (Kid-Friendly Guide)',
    category: 'Orbital Physics & Microgravity',
    modules: 'Astronaut Academy, Zero Gravity Lab',
    title: 'NASA Space Place — What Is Gravity?',
    url: 'https://spaceplace.nasa.gov/what-is-gravity/',
  },
  {
    id: 'ref-launch',
    topic: 'Rocket Stages & Launching Into Space',
    category: 'Moon, Mars & Spacecraft',
    modules: 'Astronaut Academy (Topic 01 & 02)',
    title: 'NASA Space Place — Launching Into Space',
    url: 'https://spaceplace.nasa.gov/launching-into-space/en/',
  },
  {
    id: 'ref-spacesuits',
    topic: 'EVA Spacesuits, Liquid Cooling & Gold Visors',
    category: 'Human Health, Suits & Hazards',
    modules: 'Spacewalk Training, Astronaut Academy (Topic 06)',
    title: 'NASA — Spacesuits',
    url: 'https://www.nasa.gov/humans-in-space/spacesuits/',
  },
  {
    id: 'ref-astronauts',
    topic: 'Living, Exercising & Working in Orbit',
    category: 'Human Health, Suits & Hazards',
    modules: 'Astronaut Academy (Topic 08), AI Mentor',
    title: 'NASA — Astronauts',
    url: 'https://www.nasa.gov/humans-in-space/astronauts/',
  },
  {
    id: 'ref-iss',
    topic: 'International Space Station (~28,000 km/h, ~408 km)',
    category: 'Moon, Mars & Spacecraft',
    modules: 'Astronaut Academy (Topic 07 & 10), Spacewalk, Emergency',
    title: 'NASA — International Space Station',
    url: 'https://www.nasa.gov/international-space-station/',
  },
  {
    id: 'ref-astrobee',
    topic: 'Orbital Crew Robotic Assistants (Astrobee)',
    category: 'Moon, Mars & Spacecraft',
    modules: 'AI Astronaut Mentor (ARIA)',
    title: 'NASA — Astrobee Free-Flying Robot',
    url: 'https://www.nasa.gov/astrobee/',
  },
  {
    id: 'ref-solar-activity',
    topic: 'Solar Flares, Radiation & Space Weather Sheltering',
    category: 'Human Health, Suits & Hazards',
    modules: 'Emergency Training, Astronaut Academy (Topic 09)',
    title: 'NASA Space Place — Solar Activity',
    url: 'https://spaceplace.nasa.gov/solar-activity/en/',
  },
  {
    id: 'ref-space-place',
    topic: 'Junior Explorer Earth & Space Science Hub',
    category: 'Curriculum & Solar System',
    modules: 'All Cadet Age Tiers',
    title: 'NASA Space Place',
    url: 'https://spaceplace.nasa.gov/',
  },
];

const MODEL_TRANSPARENCY_ROWS = [
  {
    system: 'Mission Control — Lunar Descent',
    realFact:
      'Lunar surface gravity is 1.62 m/s² (~1/6 Earth) inside an airless vacuum; parachutes cannot slow descent so variable rocket thrust is required.',
    classroomModel:
      'Fixed-mass 2D vertical + horizontal thruster model (max 3.80 m/s² upward, ±2.20 m/s² RCS) with deterministic 0.05 s Euler step integration.',
    limits:
      'Does not simulate changing lander mass from burned propellant (Tsiolkovsky rocket equation), pitch/gimbal torque, or 3D crater slopes.',
  },
  {
    system: 'Zero Gravity Lab — Newton & Microgravity',
    realFact:
      'Astronauts float in Low Earth Orbit (~408 km) because Earth gravity (~89%) curves them and their station around Earth in continuous free-fall; Newton’s F = m·a and p = m·v still apply.',
    classroomModel:
      '1D 20 m ISS chamber comparing frictionless glide with Earth tabletop kinetic friction (1.2 m/s²), plus 45 kg cadet recoil and surface-tension water sphere exploration.',
    limits:
      'Does not include 3D rigid-body rotational tumbling or center-of-mass torque offsets.',
  },
  {
    system: 'Spacewalk Training — EVA Systems',
    realFact:
      'NASA EMU suits maintain breathable O₂ pressure (~29.6 kPa pure O₂), circulate chilled water for extreme solar thermal swings (-157 °C to +121 °C), and enforce dual-tether safety.',
    classroomModel:
      'Staged EVA repair & thermal/micrometeoroid anomaly drills with discrete O₂ percentage budgets, Suit Integrity %, and interactive Dual-Hook Tether lock state.',
    limits:
      'Replaces multi-hour partial-pressure pO₂ / CO₂ scrubber chemical curves with clear classroom percentage reserves.',
  },
  {
    system: 'Emergency Training — Station Triage',
    realFact:
      'Real ISS Flight Rules prioritize cabin pressure containment, breathing air / O₂ scrubber continuity, electrical bus load-shedding, S-band comms recovery, and water-wall radiation shielding.',
    classroomModel:
      'Scenario triage decks updating live Cabin Pressure, O₂ Purity, Power Bus, Comms Link, and Station Safety meters with calm crew-first explanations.',
    limits:
      'Omits live fault-tree branching and simultaneous multi-console Flight Director voice loops.',
  },
];

export function ReferencesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = [
    'All',
    'Curriculum & Solar System',
    'Orbital Physics & Microgravity',
    'Moon, Mars & Spacecraft',
    'Human Health, Suits & Hazards',
  ];

  const visibleRefs =
    selectedCategory === 'All'
      ? NASA_REFERENCES
      : NASA_REFERENCES.filter((entry) => entry.category === selectedCategory);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SCIENTIFIC RIGOR & SOURCE TRANSPARENCY"
        title="Science, Models & NASA References"
        subtitle="Every spaceflight fact, physics constant, and simulator rule in ANANTRA is grounded in public NASA educational resources — with honest boundaries between real orbital mechanics and classroom simplifications."
        backTo={{ label: 'Back to Astronaut Dashboard', to: '/dashboard' }}
        badges={
          <>
            <BadgePill tone="cyan" icon={<BookOpen className="h-3.5 w-3.5" />}>
              18 Verified NASA Sources
            </BadgePill>
            <BadgePill tone="emerald" icon={<FlaskConical className="h-3.5 w-3.5" />}>
              Transparent Classroom Models
            </BadgePill>
          </>
        }
      />

      {/* Official Non-Affiliation Notice */}
      <Card
        variant="accent"
        topAccentClassName="bg-gradient-to-r from-amber-400/80 via-sky-400/75 to-cyan-400/80"
      >
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/35 bg-amber-400/12 text-amber-300">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-display text-base font-semibold text-slate-50">
              Independent Educational Project Notice
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              <strong className="text-slate-100">ANANTRA</strong> is an independent
              educational web application built for the{' '}
              <strong className="text-slate-100">NASA Space Apps Challenge</strong>. It
              is <strong className="text-amber-200">not</strong> affiliated with,
              endorsed by, or certified as an operational crew trainer by NASA or any
              government space agency. All simulations are intentionally tuned
              classroom learning tools designed for young explorers and learners.
            </p>
          </div>
        </div>
      </Card>

      {/* Established Facts vs Simplified Models vs Assumptions */}
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-50">
              Established Facts vs. Simplified Models vs. Assumptions
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Compare real spaceflight engineering parameters with the approachable
              browser models running inside ANANTRA.
            </p>
          </div>
          <BadgePill tone="amber" icon={<Info className="h-3.5 w-3.5" />}>
            Pedagogical Transparency
          </BadgePill>
        </div>

        <div className="space-y-4">
          {MODEL_TRANSPARENCY_ROWS.map((row) => (
            <div
              key={row.system}
              className="rounded-2xl border border-space-border bg-space-void/70 p-4"
            >
              <h3 className="font-display text-base font-semibold text-sky-200">
                {row.system}
              </h3>
              <div className="mt-3 grid gap-3 lg:grid-cols-3">
                <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/8 p-3">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                    Established Science
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-200 sm:text-sm">
                    {row.realFact}
                  </p>
                </div>
                <div className="rounded-xl border border-sky-400/25 bg-sky-500/8 p-3">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-sky-300">
                    ANANTRA Classroom Model
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-200 sm:text-sm">
                    {row.classroomModel}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-400/25 bg-amber-500/8 p-3">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                    Explicit Model Limits
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-200 sm:text-sm">
                    {row.limits}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Verified NASA Bibliography */}
      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-50">
              Verified NASA Educational Bibliography
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Official public NASA learning portals referenced by ANANTRA&apos;s
              lessons, simulations, and ARIA mentor library.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter sources by topic">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'border-sky-400/60 bg-sky-400/18 text-sky-100'
                    : 'border-space-border bg-space-void/70 text-slate-300 hover:border-sky-400/40 hover:text-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {visibleRefs.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between gap-2 rounded-xl border border-space-border bg-space-void/70 p-4 transition-all hover:border-sky-400/50 hover:bg-space-slate/75"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-sky-300">
                    {item.category}
                  </span>
                  <ExternalLink
                    className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-sky-300"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-1 font-display text-sm font-semibold text-slate-50 group-hover:text-sky-200">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  {item.topic}
                </p>
              </div>
              <p className="border-t border-space-border/60 pt-2 font-mono text-[11px] text-slate-400">
                Used in: {item.modules}
              </p>
            </a>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ButtonLink to="/academy" variant="primary">
          Open 10-Topic Astronaut Academy
        </ButtonLink>
        <ButtonLink to="/dashboard" variant="secondary">
          Return to Dashboard
        </ButtonLink>
      </div>
    </div>
  );
}
