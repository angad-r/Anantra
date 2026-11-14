export type AcademyLessonId =
  | 'spaceflight-fundamentals'
  | 'rocket-science'
  | 'orbital-mechanics'
  | 'moon-exploration'
  | 'mars-exploration'
  | 'spacesuits'
  | 'space-station-ops'
  | 'human-physiology'
  | 'radiation-hazards'
  | 'mission-control-ops';

export interface AcademyExplorerItem {
  id: string;
  name: string;
  tagline: string;
  metricLabel: string;
  metricValue: string;
  scienceNote: string;
  kidTip: string;
}

export interface AcademyQuickCheckOption {
  id: string;
  label: string;
  wrongHint?: string;
}

export interface AcademyLesson {
  id: AcademyLessonId;
  title: string;
  badge: string;
  headline: string;
  learningObjectives: string[];
  nasaExample: {
    missionName: string;
    detail: string;
  };
  summary: string;
  keyFacts: Array<{ title: string; detail: string }>;
  explorerTitle: string;
  explorerItems: AcademyExplorerItem[];
  quickCheck: {
    question: string;
    options: AcademyQuickCheckOption[];
    correctOptionId: string;
    correctExplanation: string;
  };
}

export interface AcademyQuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: Array<{
    id: string;
    label: string;
    wrongExplanation?: string;
  }>;
  correctOptionId: string;
  correctFeedback: string;
}

export const ACADEMY_LESSONS: AcademyLesson[] = [
  {
    id: 'spaceflight-fundamentals',
    title: 'Spaceflight Fundamentals',
    badge: 'Module 01 • Basics & Gravity',
    headline: 'Solar System Worlds, Mass vs. Weight & Escaping Earth',
    learningObjectives: [
      'Distinguish constant mass (kg) from gravity-dependent weight (N).',
      'Compare inner rocky planets with outer gas and ice giants.',
      'Understand why airless vs. atmospheric worlds require different mission plans.',
    ],
    nasaExample: {
      missionName: 'NASA Voyager & Parker Solar Probe',
      detail:
        'Using gravity assists from giant planets and precise orbital mechanics, Voyager spacecraft escaped deeper into outer space while Parker dives near our Sun.',
    },
    summary:
      'Every journey from Earth begins inside a Solar System ruled by the Sun’s gravity, which holds over 99.8% of total Solar System mass. Spaceflight engineering starts by distinguishing your unchanged mass from local gravitational pull and choosing missions suited to rocky, dusty, or gas-giant worlds.',
    keyFacts: [
      {
        title: 'Mass Stays Same, Weight Changes',
        detail:
          'Mass is how much matter makes up an object (identical on Earth, Moon, or ISS); weight scales with gravity (1.62 m/s² on Moon, 9.81 m/s² on Earth).',
      },
      {
        title: 'Inner vs. Outer Planets',
        detail:
          'Mercury, Venus, Earth, and Mars have rocky crusts, while Jupiter and Saturn are gas giants and Uranus and Neptune are icy giants.',
      },
      {
        title: 'Vacuum Starts Above Kármán Line',
        detail:
          'Thin atmospheric traces end near ~100 km, turning sky black and making wings or air-breathing jet engines useless in space.',
      },
    ],
    explorerTitle: 'Solar System Gravity & Mission Explorer',
    explorerItems: [
      {
        id: 'earth',
        name: 'Earth',
        tagline: 'Oxygen ocean home world',
        metricLabel: 'Surface Gravity',
        metricValue: '9.81 m/s² (1.0 g)',
        scienceNote:
          'Thick atmosphere allows winged planes, aerobraking, and parachutes—but also forces launching rockets to push hard upward.',
        kidTip:
          'An astronaut weighing 60 kg-force on Earth still has 60 kg mass in orbit and on Mars!',
      },
      {
        id: 'moon',
        name: 'The Moon',
        tagline: 'Airless cratered neighbor',
        metricLabel: 'Surface Gravity',
        metricValue: '1.62 m/s² (~1/6 Earth)',
        scienceNote:
          'With no air to inflate parachutes or scatter blue sunlight, landers must brake strictly with gimbaled or throttled rocket engines.',
        kidTip:
          'You would feel six times lighter on the Moon while still needing full engine control to slow your inertia.',
      },
      {
        id: 'mars',
        name: 'Mars',
        tagline: 'Rusty world with thin CO₂ air',
        metricLabel: 'Surface Gravity',
        metricValue: '3.72 m/s² (~38% Earth)',
        scienceNote:
          'Mars air is ~1% as thick as Earth’s—strong enough to slow heat shields and supersonic parachutes, then rockets finish the landing.',
        kidTip:
          'A Mars solar day (called a sol) runs 24 hours 39 minutes—almost Earth’s daily rhythm!',
      },
      {
        id: 'jupiter',
        name: 'Jupiter',
        tagline: 'Giant planet with icy moons',
        metricLabel: 'Cloud-Top Gravity',
        metricValue: '~24.8 m/s² (~2.5× Earth)',
        scienceNote:
          'Gas giants lack solid ground, so spacecraft like Juno study cloud storms from orbit while icy moon Europa excites ocean-life researchers.',
        kidTip:
          'Over 1,300 Earths could fit inside Jupiter’s enormous volume!',
      },
    ],
    quickCheck: {
      question:
        'Why does an astronaut weigh one-sixth as much on the Moon even though their mass has not changed?',
      options: [
        {
          id: 'less-mass',
          label: 'Because half of an astronaut’s atoms evaporate during rocket launch.',
          wrongHint:
            'Your body keeps all of its matter! Gravity depends on the mass of the world pulling on you.',
        },
        {
          id: 'weaker-gravity',
          label: 'Because lunar surface gravity (1.62 m/s²) pulls about 1/6 as strongly as Earth gravity.',
        },
        {
          id: 'no-wind',
          label: 'Because having zero wind removes upward lift force.',
          wrongHint:
            'Air does not create weight—the gravitational attraction of the planet or moon beneath you creates weight.',
        },
      ],
      correctOptionId: 'weaker-gravity',
      correctExplanation:
        'Exact science! Your mass stays constant everywhere, while local surface gravity determines downward weight.',
    },
  },
  {
    id: 'rocket-science',
    title: 'Rocket Science',
    badge: 'Module 02 • Thrust & Stages',
    headline: 'Newton’s Third Law, Specific Impulse & Multi-Stage Rockets',
    learningObjectives: [
      'Explain thrust in vacuum via Newton’s Third Law (action-reaction).',
      'Relate engine force and vehicle mass using a = F / m.',
      'Understand why rockets drop empty lower stages on ascent.',
    ],
    nasaExample: {
      missionName: 'NASA Saturn V & Space Launch System (SLS)',
      detail:
        'Both heavy-lift Moon rockets drop solid boosters and empty core stages along the climb so upper stages push lighter mass to translunar speed.',
    },
    summary:
      'Rockets do not push against air—they push high-speed exhaust gas violently downward, and by Newton’s Third Law the hot exhaust pushes the rocket equally upward! Dropping spent fuel tanks reduces mass m so existing engine thrust F creates sharper acceleration (a = F / m).',
    keyFacts: [
      {
        title: 'Vacuum Propulsion Physics',
        detail:
          'Action-reaction works even better in vacuum because outside air pressure is zero and does not squeeze back against the engine nozzle.',
      },
      {
        title: 'Staging Drops Dead Mass',
        detail:
          'Carrying empty metal tanks all the way to orbit wastes propellant. Separating lower stages multiplies final payload capacity.',
      },
      {
        title: 'Propellant + Oxidizer Onboard',
        detail:
          'Because space has no oxygen, rockets carry liquid oxygen (LOX) right beside fuel such as liquid hydrogen or RP-1 kerosene/methane.',
      },
    ],
    explorerTitle: 'Interactive Rocket Propulsion Deck',
    explorerItems: [
      {
        id: 'newton3',
        name: 'Action-Reaction Exhaust',
        tagline: 'Works cleanly in airless space',
        metricLabel: 'Core Physics Law',
        metricValue: 'Newton’s 3rd Law',
        scienceNote:
          'Burning propellant expands out of a bell nozzle at ~3–4.5 km/s; conservation of momentum drives the spacecraft in the opposite direction.',
        kidTip:
          'Imagine standing on frictionless skateboards and throwing a heavy backpack—you glide opposite!',
      },
      {
        id: 'staging',
        name: 'Multi-Stage Separation',
        tagline: 'Shedding empty lower hull mass',
        metricLabel: 'Key Equation',
        metricValue: 'a = F / m',
        scienceNote:
          'As propellant burns and heavy lower tanks fall away, total mass m shrinks sharply so steady engine thrust accelerates upper stages much faster.',
        kidTip:
          'Up to ~85% of a rocket’s liftoff weight is actually propellant, not passengers!',
      },
      {
        id: 'hydrolox',
        name: 'LH₂ / LOX Cryogenics',
        tagline: 'High-efficiency green steam exhaust',
        metricLabel: 'Storage Temp',
        metricValue: '-253°C (LH₂)',
        scienceNote:
          'Liquid hydrogen + liquid oxygen produce water vapor exhaust with top chemical efficiency (high specific impulse), used on SLS RS-25 engines.',
        kidTip:
          'Those puffy white clouds pouring off rockets on launch pads are freezing-cold condensation, not smoke!',
      },
      {
        id: 'gimbals',
        name: 'Gimbal Thrust Vectoring',
        tagline: 'Steering without tail fins in vacuum',
        metricLabel: 'Steer Authority',
        metricValue: '±4°–8° Gimbal',
        scienceNote:
          'Small actuators swivel the entire rocket nozzle slightly left or right so the spacecraft tilts cleanly without air fins.',
        kidTip:
          'Balance a broomstick upright on your palm—swiveling the nozzle underneath works just like moving your hand!',
      },
    ],
    quickCheck: {
      question:
        'If there is no air in space to push against, why can a spacecraft rocket thruster still accelerate?',
      options: [
        {
          id: 'pushes-sunlight',
          label: 'The thruster pushes directly off sunlight beams hitting its nozzle.',
          wrongHint:
            'Solar sails use faint light pressure very slowly—chemical rockets push against their own expelled exhaust gas!',
        },
        {
          id: 'reaction-exhaust',
          label: 'By Newton’s Third Law, accelerating exhaust mass backward pushes the rocket forward.',
        },
        {
          id: 'pulls-magnets',
          label: 'Earth’s magnetic field pulls aluminum engine nozzles downward.',
          wrongHint:
            'Rocket nozzles work deep past Earth’s magnetic field too because exhaust momentum conserves cleanly anywhere.',
        },
      ],
      correctOptionId: 'reaction-exhaust',
      correctExplanation:
        'Nailed it! Rockets throw exhaust particles one way so conservation of momentum accelerates the ship the other way.',
    },
  },
  {
    id: 'orbital-mechanics',
    title: 'Orbital Mechanics',
    badge: 'Module 03 • Free-Fall Physics',
    headline: 'Newton’s Cannonball, Orbital Velocity & Why Astronauts Float',
    learningObjectives: [
      'Explain why Low Earth Orbit is continuous free-fall, not "zero gravity".',
      'Connect sideways speed (~28,000 km/h) with falling around Earth’s curve.',
      'Understand altitude vs. orbital speed and docking phasing.',
    ],
    nasaExample: {
      missionName: 'International Space Station Low Earth Orbit (~408 km)',
      detail:
        'At ~408 km altitude, Earth’s gravity is still nearly ~89% as strong as on your living room floor—crew float solely because the ISS falls sideways at 7.66 km/s.',
    },
    summary:
      'Orbiting does NOT mean escaping Earth’s gravity! At ISS height, gravity pulls strongly toward Earth’s center. Because rockets accelerate spacecraft sideways near ~28,000 km/h (~7.66 km/s), every second the spacecraft falls downward, Earth’s round surface curves away underneath by the exact same distance.',
    keyFacts: [
      {
        title: 'Gravity at ISS Is ~89%',
        detail:
          'Astronauts float in free-fall because astronaut, station walls, and spilled water drops accelerate toward Earth together at identical rates.',
      },
      {
        title: 'Sideways Speed Builds Orbit',
        detail:
          'Going straight up past 400 km without sideways speed just means falling straight back down. Horizontal velocity creates a lasting loop.',
      },
      {
        title: '90-Minute Earth Lap',
        detail:
          'One Low Earth Orbit takes ~90 minutes—giving astronauts 16 orbital sunrises and sunsets every 24-hour Earth day.',
      },
    ],
    explorerTitle: 'Orbital Physics Concept Lab',
    explorerItems: [
      {
        id: 'cannonball',
        name: 'Newton’s Mountain Cannon',
        tagline: 'Throw fast enough to miss the Earth',
        metricLabel: 'Circular LEO Speed',
        metricValue: '~7.66 km/s',
        scienceNote:
          'Isaac Newton pictured firing a cannonball horizontally off a tall peak: faster speeds travel farther before falling; at 7.66 km/s, it never touches ground.',
        kidTip:
          'Orbit is literally falling forever and continuously missing the planet!',
      },
      {
        id: 'freefall',
        name: 'True Meaning of Microgravity',
        tagline: 'Why scales read 0 inside the ISS',
        metricLabel: 'Earth Pull at 408 km',
        metricValue: '~89% Surface g',
        scienceNote:
          'Just like stepping onto a scale inside a snapping elevator, if cabin and body fall at the same rate, zero support force presses your feet.',
        kidTip:
          'In Zero Gravity Lab, objects still resist pushes because mass inertia never disappears!',
      },
      {
        id: 'transfer',
        name: 'Raising & Lowering Orbits',
        tagline: 'Burn prograde to boost opposite side',
        metricLabel: 'Transfer Principle',
        metricValue: 'Hohmann Transfer',
        scienceNote:
          'Firing engines forward increases speed now and lifts the opposite side of the ellipse; firing backward brakes to reenter.',
        kidTip:
          'Weird orbital puzzle: firing straight forward at the ISS actually lifts you into a higher, SLOWER orbit!',
      },
      {
        id: 'drag',
        name: 'Upper Atmosphere Drag',
        tagline: 'Station needs periodic reboost burns',
        metricLabel: 'ISS Altitude',
        metricValue: '~408 km',
        scienceNote:
          'Even at 408 km, faint stray air molecules slowly tug on giant solar arrays, so docked cargo ships periodically fire thrusters to lift ISS back up.',
        kidTip:
          'Without occasional reboost burns, orbital decay would slowly pull the station downward.',
      },
    ],
    quickCheck: {
      question:
        'Why do astronauts float effortlessly inside the International Space Station even though Earth’s gravity there is still ~89% strong?',
      options: [
        {
          id: 'antigrav-metal',
          label: 'Aluminum hulls block Earth’s gravitational waves from entering bedrooms.',
          wrongHint:
            'Nothing can shield gravity! Both the metal hull and the astronauts are pulled equally toward Earth.',
        },
        {
          id: 'free-fall',
          label: 'Both astronaut and station are falling continuously around Earth together at ~28,000 km/h.',
        },
        {
          id: 'cabin-helium',
          label: 'Station air contains thick helium that floats bodies upward like balloons.',
          wrongHint:
            'ISS maintains normal breathable Earth-like nitrogen-oxygen cabin air at ~14.7 psi!',
        },
      ],
      correctOptionId: 'free-fall',
      correctExplanation:
        'Spot on! Continuous sideways orbital free-fall makes you weightless relative to the surrounding cabin.',
    },
  },
  {
    id: 'moon-exploration',
    title: 'Moon Exploration',
    badge: 'Module 04 • Apollo & Artemis',
    headline: 'Vacuum Touchdowns, 1/6th Gravity & Lunar South Pole Ice',
    learningObjectives: [
      'Understand why airless Moon landings depend entirely on engine thrust.',
      'Connect Apollo 11 heritage with modern NASA Artemis South Pole goals.',
      'Explain why crater shadow ice matters for future Moon habitats.',
    ],
    nasaExample: {
      missionName: 'Apollo 11 (1969) & NASA Artemis Program',
      detail:
        'Neil Armstrong & Buzz Aldrin piloted Eagle past boulder fields on hover thrust; Artemis targets ancient water ice inside sunlit ridges near the Lunar South Pole.',
    },
    summary:
      'Our Moon sits ~384,400 km away with 1.62 m/s² surface gravity and virtually zero atmosphere. With no air friction to slow craft down, braking requires firing descent engines cleanly into the velocity vector—which you can fly directly inside ANANTRA’s Mission Control simulator!',
    keyFacts: [
      {
        title: 'Airless Dust & Regolith',
        detail:
          'Sharp glass-like lunar soil forms over billions of micrometeoroid impacts because wind and rain never smooth rock edges.',
      },
      {
        title: '14-Day Lunar Nights',
        detail:
          'The Moon rotates slowly: most sites roast at +120°C for two straight weeks, then plunge below -130°C for two weeks of darkness.',
      },
      {
        title: 'South Pole Water Ice',
        detail:
          'Permanently shadowed craters preserve frozen water that future explorers can filter to drink, split into breathable O₂, or refine into rocket propellant!',
      },
    ],
    explorerTitle: 'Lunar Engineering & Artemis Sites',
    explorerItems: [
      {
        id: 'lunar-gravity',
        name: '1.62 m/s² Descent Physics',
        tagline: 'Slow fall—full horizontal momentum',
        metricLabel: 'Lunar Hover Balance',
        metricValue: '~43% Max Thrust',
        scienceNote:
          'In Mission Control, downward 1.62 m/s² gravity cancels around ~43% throttle; firing 75–100% slows descent speed quickly.',
        kidTip:
          'Watch horizontal drift vx just as closely as downward vy—sideways motion keeps going unless RCS thrusters push back!',
      },
      {
        id: 'vacuum-brake',
        name: 'Why Chutes Fail on Moon',
        tagline: 'Zero atmosphere for canopy drag',
        metricLabel: 'Lunar Air Pressure',
        metricValue: '< 10⁻¹² atm',
        scienceNote:
          'A parachute dropped on the Moon falls right beside a steel anvil at identical acceleration because zero air resists either object.',
        kidTip:
          'Apollo 15’s David Scott proved Galileo right on live TV by dropping a hammer and falcon feather together—they hit lunar soil simultaneously!',
      },
      {
        id: 'shackleton',
        name: 'South Pole Ridges & Craters',
        tagline: 'Sunlight beside icy permanent shade',
        metricLabel: 'Artemis Focus',
        metricValue: 'Peaks of Light',
        scienceNote:
          'Low-angle sunlight brushes crater rims nearly nonstop for solar electricity only steps away from billion-year-old crater ice traps.',
        kidTip:
          'Ice equals drinking water, air oxygen (H₂O → O₂), AND liquid hydrogen + oxygen rocket fuel!',
      },
      {
        id: 'orion-gateway',
        name: 'Orion & Lunar Gateway',
        tagline: 'High-speed deep-space transit',
        metricLabel: 'Trip Travel Time',
        metricValue: '~3–4 Days',
        scienceNote:
          'Unlike 400 km ISS orbits, Orion capsules cross ~384,400 km through solar radiation zones before swooping back at 40,000 km/h reentry.',
        kidTip:
          'Returning from Moon speed hits Earth air nearly 40% hotter and faster than coming down from ISS!',
      },
    ],
    quickCheck: {
      question:
        'Why did Apollo lunar landers carry variable rocket thrusters instead of saving weight with simple parachutes?',
      options: [
        {
          id: 'no-moon-air',
          label: 'The Moon has virtually no atmosphere to inflate or create drag on a parachute.',
        },
        {
          id: 'moondust-melts',
          label: 'Grey lunar dust dissolves nylon parachute cords instantly.',
          wrongHint:
            'Lunar dust is abrasive and clings electrostatically, yet without air pressure a parachute hangs limp like a towel!',
        },
        {
          id: 'gravity-zero',
          label: 'Because Moon gravity is zero and parachutes only slow objects upward.',
          wrongHint:
            'Lunar gravity pulls craft down at 1.62 m/s²—parachutes fail strictly from the lack of atmosphere.',
        },
      ],
      correctOptionId: 'no-moon-air',
      correctExplanation:
        'Correct! No air means zero aerodynamic drag—powered rocket braking is mandatory for lunar touchdowns.',
    },
  },
  {
    id: 'mars-exploration',
    title: 'Mars Exploration',
    badge: 'Module 05 • Red Planet Rovers',
    headline: 'Thin CO₂ Entry, Perseverance, Ingenuity & Radio Delay',
    learningObjectives: [
      'Contrast Mars landing ("7 Minutes of Terror") with Earth and Moon landings.',
      'Identify Mars hazards: perchlorates, fine dust storms, 4–24 min signal lag.',
      'Understand why Mars shows evidence of ancient liquid rivers and lakes.',
    ],
    nasaExample: {
      missionName: 'NASA Perseverance Rover & Ingenuity Helicopter (Jezero Crater)',
      detail:
        'Perseverance landed inside an ancient river delta via sky crane, hunting biosignatures while Ingenuity proved ultra-light rotor flight works in 1%-density Mars air.',
    },
    summary:
      'Mars offers a tantalizing mix: 3.72 m/s² gravity (~38% Earth) and a 24 h 39 m day, yet thin carbon dioxide air requires dramatic multi-step landing sequences (heat shield + supersonic parachute + sky-crane rockets). Radio messages take 4 to 24 minutes each way, making autonomous rover software indispensable.',
    keyFacts: [
      {
        title: 'Automated "7 Minutes of Terror"',
        detail:
          'Light lag makes live Earth joystick piloting impossible during landing—onboard radar and hazard cameras guide final touchdown autonomously.',
      },
      {
        title: 'MOXIE Makes Oxygen on Mars',
        detail:
          'Perseverance’s MOXIE experiment proved solar-powered electrolysis can split Mars CO₂ air into pure breathable oxygen propellant!',
      },
      {
        title: 'Ancient Lakes & Delta Clays',
        detail:
          'Layered rocks, carved channels, and Jezero’s fossil fan show Mars held persistent surface water billions of years ago.',
      },
    ],
    explorerTitle: 'Red Planet Systems & Exploration Deck',
    explorerItems: [
      {
        id: 'mars-air',
        name: '1%-Density CO₂ Atmosphere',
        tagline: 'Too thin for chutes alone, hot at hypersonic speeds',
        metricLabel: 'Composition',
        metricValue: '~95% CO₂ Gas',
        scienceNote:
          'Entering at ~20,000 km/h still heats the heat shield above 1,300°C, yet supersonic chutes only slow the pod to ~300 km/h before retro-rockets fire.',
        kidTip:
          'Mars sky looks butterscotch-pink from tiny rust-iron dust grains suspended high aloft!',
      },
      {
        id: 'ingenuity',
        name: 'Ingenuity Mars Rotorcraft',
        tagline: '1st powered aircraft flight on another world',
        metricLabel: 'Blade Speed',
        metricValue: '~2,400–2,800 RPM',
        scienceNote:
          'Spinning twin carbon-fiber rotors nearly 10× faster than Earth helicopters grabs enough wisps of thin CO₂ air to lift off.',
        kidTip:
          'Built originally for 5 test hops, Ingenuity completed 72 scout flights ahead of Perseverance!',
      },
      {
        id: 'radio-lag',
        name: 'Deep Space Comms Lag',
        tagline: 'Wait 8–48 min for round-trip radio reply',
        metricLabel: 'One-Way Light Delay',
        metricValue: '4 – 24 Minutes',
        scienceNote:
          'Even at light speed (300,000 km/s), signals between Earth and Mars stretch up to 400 million km—pilots command plans each sol rather than steering live.',
        kidTip:
          'Astronaut emergency voice calls to Earth would be a delay rather than a real-time chat!',
      },
      {
        id: 'isru',
        name: 'Subsurface Ice & MOXIE O₂',
        tagline: 'Living off the Martian land (ISRU)',
        metricLabel: 'Day Length (Sol)',
        metricValue: '24 hr 39 min',
        scienceNote:
          'Mining glacier water ice under Martian regolith and generating O₂ directly out of ambient CO₂ reduces rocket launch costs dramatically.',
        kidTip:
          'Home gardens on Mars will use sealed indoor hydroponic trays, not dusty outdoors!',
      },
    ],
    quickCheck: {
      question:
        'Why must a Mars rover execute its final landing sequence completely on autopilot instead of relying on live joysticks from Earth?',
      options: [
        {
          id: 'radio-delay',
          label: 'Radio waves take 4 to 24 minutes each way—far longer than the 7-minute descent itself.',
        },
        {
          id: 'joysticks-banned',
          label: 'Space treaties forbid radio signals near Olympus Mons.',
          wrongHint:
            'NASA’s Deep Space Network sends commands daily—the true barrier is the cosmic speed limit of light!',
        },
        {
          id: 'mars-too-cold',
          label: 'Mars cold snaps freeze radio waves halfway across space.',
          wrongHint:
            'Electromagnetic radio waves travel cleanly at light speed in cold space—distance is what causes the delay.',
        },
      ],
      correctOptionId: 'radio-delay',
      correctExplanation:
        'Exact physics! By the time Mission Control hears "entry started," the rover has already been sitting on Mars for minutes.',
    },
  },
  {
    id: 'spacesuits',
    title: 'Spacesuits & Life Support',
    badge: 'Module 06 • EVA Armor',
    headline: 'Mini Spacecraft: O₂ Pressure, LCVG Water Cooling & Gold Visor',
    learningObjectives: [
      'Identify why suits keep low pure-O₂ pressure (~29.6 kPa) instead of 101 kPa.',
      'Explain how chilled water garments regulate body heat in vacuum.',
      'Understand dual-tether attachment rules and gold optical visors.',
    ],
    nasaExample: {
      missionName: 'NASA Extravehicular Mobility Unit (EMU) & xEMU',
      detail:
        'Tested continuously outside ISS airlocks for 6–8 hour solar-array upgrades, balancing puncture-resistant layers with flexible heated gloved joints.',
    },
    summary:
      'Stepping outside a station airlock places astronauts inside raw space vacuum where body liquids would boil at low pressure and temperatures swing from -157°C in Earth’s shadow to +121°C in direct sunlight. NASA’s EVA suit works as a form-fitting spacecraft wrapping pure breathable O₂, CO₂ scrubbers, chilled water loops, and radiation/glare shields.',
    keyFacts: [
      {
        title: '91 Meters of Cooling Tubing',
        detail:
          'Without air currents to evaporate sweat away in vacuum, chilled water loops inside the Liquid Cooling and Ventilation Garment carry metabolic heat away.',
      },
      {
        title: 'Lower Pressure Aids Flexing',
        detail:
          'Running pure O₂ at ~29.6 kPa (~4.3 psi) keeps astronauts safely oxygenated while avoiding rigid balloon-stiff fingers and knees.',
      },
      {
        title: 'Always Keep Dual Tethers Clipped',
        detail:
          'One misstep without tethers floats crew gently away in orbit—rules require continuous handrail or waist-tether attachment plus SAFER jet backup.',
      },
    ],
    explorerTitle: 'Interactive Suit Anatomy & EVA Readiness',
    explorerItems: [
      {
        id: 'visor',
        name: 'Gold Reflective Bubble Visor',
        tagline: 'Protection from unfiltered UV/IR rays',
        metricLabel: 'Thermal Extremes',
        metricValue: '-157°C to +121°C',
        scienceNote:
          'Unfiltered orbital sun radiation burns unprotected retinas quickly. A micron-thin gold metallic film reflects infrared and ultraviolet energy cleanly.',
        kidTip:
          'Notice ANANTRA’s Spacewalk Simulator uses similar suit thermal and visor checks!',
      },
      {
        id: 'lcvg',
        name: 'Liquid Cooling Garment (LCVG)',
        tagline: 'Closed water circuit against skin',
        metricLabel: 'Tubing Length',
        metricValue: '~91 m Spandex Tubes',
        scienceNote:
          'Hot water returns to the PLSS backpack sublimator where ice vents harmless traces of vapor to chill loop water cold again.',
        kidTip:
          'Spacewalkers get sweaty fast moving bulky pressurized arms—turning cooling up cools you off in seconds!',
      },
      {
        id: 'plss',
        name: 'PLSS Backpack & SAFER Unit',
        tagline: 'Primary O₂, scrubbers & emergency jets',
        metricLabel: 'Earth Weight / EVA Mass',
        metricValue: '~127 kg Loaded Suit',
        scienceNote:
          'Dual oxygen tanks feed helmet breath while chemical cartridges capture exhaled CO₂; bottom-mounted SAFER cold nitrogen jets rescue accidental untethered drifts.',
        kidTip:
          'If a spacesuit water or cooling hose blocks up, EVA teams abort safely to the airlock early!',
      },
      {
        id: 'ortho',
        name: '14-Layer Armor Shell',
        tagline: 'Micrometeoroid & sharp-bolt barrier',
        metricLabel: 'Pre-Breathe Rule',
        metricValue: 'Purge Nitrogen First',
        scienceNote:
          'Vectran and Kevlar blankets resist jagged aluminum bolts and dust pits; crews pre-breathe O₂ beforehand to clear nitrogen bubbles ("the bends").',
        kidTip:
          'Just like deep-sea scuba divers rising too quickly, pressure drops require clearing dissolved nitrogen cleanly!',
      },
    ],
    quickCheck: {
      question:
        'Why do astronauts pre-breathe pure oxygen before dropping suit pressure to 29.6 kPa inside an EVA airlock?',
      options: [
        {
          id: 'nitrogen-bends',
          label: 'To flush dissolved nitrogen out of the blood so painful decompression bubbles do not form.',
        },
        {
          id: 'float-higher',
          label: 'Pure oxygen makes bodies lighter inside heavy helmet boots.',
          wrongHint:
            'Astronauts are already in free fall! Pre-breathing solves gas solubility safety in human blood.',
        },
        {
          id: 'warm-gloves',
          label: 'Because nitrogen freezes battery wires inside suit gloves.',
          wrongHint:
            'Heated glove coils run on electrical lithium-ion suit batteries—nitrogen affects dissolved blood gases, not copper wiring.',
        },
      ],
      correctOptionId: 'nitrogen-bends',
      correctExplanation:
        'Safety Chief answer! Pre-breathing clears dissolved nitrogen safely before stepping into lower suit operating pressure.',
    },
  },
  {
    id: 'space-station-ops',
    title: 'Space Station Operations',
    badge: 'Module 07 • Orbital Habitat',
    headline: 'Solar Arrays, Radiators, Robotics & ~98% Water Recovery (ECLSS)',
    learningObjectives: [
      'Describe how ISS generates electricity and rejects excess heat in vacuum.',
      'Explain Environmental Control & Life Support (ECLSS) water/O₂ recycling.',
      'Understand visiting spacecraft rendezvous, robotic capture, and docking.',
    ],
    nasaExample: {
      missionName: 'International Space Station ECLSS & Canadarm2',
      detail:
        'Station environmental racks now recover roughly 98% of crew sweat, condensation, and urine while electrolyzing water into fresh breathable oxygen.',
    },
    summary:
      'Orbiting ~408 km above Earth at ~28,000 km/h, a space station hosts shirtsleeve science labs 365 days a year. Keeping it alive requires rotating huge solar wings toward daylight, pointing white thermal radiators into cold shadow to vent heat, and running closed-loop air & water recycling continuously.',
    keyFacts: [
      {
        title: 'Radiators Reject Excess Heat',
        detail:
          'Space vacuum acts like a giant Thermos: computers and crew heat cannot blow into air outside, so ammonia-filled radiator wings glow infrared heat into black space.',
      },
      {
        title: '~98% Water Loop Efficiency',
        detail:
          'Launching 1 liter of heavy water takes costly propellant—closed-loop filters purify cabin sweat, breath humidity, and urine cleaner than Earth city tap water.',
      },
      {
        title: 'CO₂ Must Be Scrubbed Constantly',
        detail:
          'Sealed cabins trap exhaled carbon dioxide quickly; Sabatier & amine beds strip CO₂ out and convert leftovers back into usable water and methane.',
      },
    ],
    explorerTitle: 'ISS Subsystems & Orbital Architecture',
    explorerItems: [
      {
        id: 'solar-irosa',
        name: 'Solar Arrays & Batteries',
        tagline: 'Powering sunrise-to-shadow cycles',
        metricLabel: 'Day / Night Orbit',
        metricValue: '45 min Sun / 45 min Night',
        scienceNote:
          'Large solar wings generate ~120 kW in orbit sunlight and charge lithium-ion batteries to power life support through every 45-minute night pass.',
        kidTip:
          'Batteries drain fast during eclipse passes—loss of solar array tracking triggers instant load-shedding triage!',
      },
      {
        id: 'eclss-air',
        name: 'Oxygen Generator & CO₂ Scrub',
        tagline: 'Splitting H₂O (H₂ + O₂) cleanly',
        metricLabel: 'Water Reclaimed',
        metricValue: '~98% Recovery',
        scienceNote:
          'Electrolysis sends electric current through purified station water to yield crisp O₂ for breathing while CDRA/amine beds capture waste CO₂.',
        kidTip:
          'When CO₂ scrubbers trip off, crew fix power/airflow fast before cabin CO₂ ppm rises!',
      },
      {
        id: 'canadarm',
        name: 'Canadarm2 Robotic Crane',
        tagline: 'Catching visiting cargo ships smoothly',
        metricLabel: 'Arm Reach',
        metricValue: '17.6 Meters Long',
        scienceNote:
          'Astronauts inside the 7-window Cupola guide Canadarm2 to snatch free-floating Cygnus or Cargo Dragon ships gently to docking ports.',
        kidTip:
          'Both ship and station travel at 28,000 km/h together—relative motion before capture is practically zero!',
      },
      {
        id: 'cupola',
        name: 'Cupola Earth-Observation Dome',
        tagline: '7 fused-silica panes monitoring storms',
        metricLabel: 'Shielding Rule',
        metricValue: 'Close Shutters in Debris',
        scienceNote:
          'Protective metal window shutters stay shut whenever astronauts aren’t taking photos or operating robotics, shielding glass from paint-fleck pits.',
        kidTip:
          'During Solar Particle radiation storms, crew move OUT of thin Cupola rooms toward water-walled shelters!',
      },
    ],
    quickCheck: {
      question:
        'Why do space stations need huge white radiator wings pointed away from sunlight in addition to electricity-generating solar wings?',
      options: [
        {
          id: 'vent-heat',
          label: 'Space vacuum traps cabin heat—radiators release infrared heat from computers and crews outward.',
        },
        {
          id: 'paint-reflects',
          label: 'White wings double as sails pushing ISS toward Mars every Tuesday.',
          wrongHint:
            'Tiny sunlight pressure is far too faint to shift a 420-ton station to Mars—white paint reflects solar heating while emitting infrared heat!',
        },
        {
          id: 'cool-moon',
          label: 'They collect cool wind blowing downward from the Moon.',
          wrongHint:
            'Between Earth and Moon lies near-empty vacuum with zero cooling wind!',
        },
      ],
      correctOptionId: 'vent-heat',
      correctExplanation:
        'Thermal engineer! Radiation is the only heat escape path in space vacuum, making ammonia radiator loops essential.',
    },
  },
  {
    id: 'human-physiology',
    title: 'Human Physiology in Space',
    badge: 'Module 08 • Astronaut Health',
    headline: 'Fluid Shifts, Bone Loss, 2-Hour Workouts & Free-Fall Daily Life',
    learningObjectives: [
      'Understand fluid shift ("puffy face / chicken legs") and balance adaptation.',
      'Explain why daily treadmill and ARED resistive exercise saves muscle & bone.',
      'Explain surface-tension water spheres and tortilla / fan safety rules.',
    ],
    nasaExample: {
      missionName: 'NASA Twins Study & Expedition 6-Month Medical Protocols',
      detail:
        'Decades of ISS blood, heart, eye, and bone measurements showed strict daily resistive workouts keep crews healthy for 6- to 12-month missions.',
    },
    summary:
      'Our bodies evolved over millions of years under steady 1 g pull. Removing weight triggers immediate fluid shifting toward your upper chest and head, tricks your inner-ear balance system for days, and quickly weakens leg muscles and bone minerals unless countered with daily workouts and smart cabin habits.',
    keyFacts: [
      {
        title: 'Spine Stretches ~3–5 cm',
        detail:
          'Without gravity squishing spinal discs downward, astronauts temporarily grow taller in space—often causing gentle early back stiffness before settling back on Earth.',
      },
      {
        title: 'No Floating Bread Crumbs',
        detail:
          'Crumbs float silently straight into breathing ducts, eyes, or electronic fans. Tortillas, sticky pastes, and sealed drink pouches replace crispy loaves and open cups.',
      },
      {
        title: 'Sleep Fans Move Exhaled CO₂',
        detail:
          'Warm breath rises by convection on Earth; in free fall, stale CO₂ hugs your face unless cabin vents blow gentle air currents past zipped wall sleep bags.',
      },
    ],
    explorerTitle: 'Human Body Adaptation & Crew Care',
    explorerItems: [
      {
        id: 'fluid-shift',
        name: 'Upward Fluid Redistribution',
        tagline: 'Puffy face & stuffed-nose feeling',
        metricLabel: 'Adaptation Window',
        metricValue: 'First 2–5 Days',
        scienceNote:
          'Normally gravity pulls blood toward your calves; in orbit ~2 liters shift upward toward chest and head until kidneys balance extra volume.',
        kidTip:
          'Even spicy salsa tastes awesome in space because slightly stuffy sinuses dull gentler aromas!',
      },
      {
        id: 'ared-gym',
        name: 'ARED & Treadmill Harnesses',
        tagline: 'Faking 100 kg loads without weight',
        metricLabel: 'Daily Crew Mandate',
        metricValue: '~2 Hours / Day',
        scienceNote:
          'Since iron barbells float effortlessly, ISS uses Advanced Resistive Exercise Device vacuum pistons + bungee cords so bones feel firm pull force.',
        kidTip:
          'Squats and deadlifts in microgravity protect calcium density so walking on Earth feels steady upon return!',
      },
      {
        id: 'water-spheres',
        name: 'Water Surface Tension',
        tagline: 'Floating spheres instead of spills',
        metricLabel: 'Cohesive Physics',
        metricValue: 'Surface Tension Wins',
        scienceNote:
          'Without gravity pulling puddles flat onto tables, weak molecular attractions between water molecules become dominant—forming shimmering spheres.',
        kidTip:
          'Touch a dry cloth to a floating sphere and capillary action wicks the entire droplet straight into fabric!',
      },
      {
        id: 'neuro-balance',
        name: 'Inner-Ear Reset',
        tagline: 'Space adaptation sickness & ceiling orientation',
        metricLabel: 'Sensor Conflict',
        metricValue: 'Eyes vs. Vestibular',
        scienceNote:
          'Eyes see teammates floating upside-down while tiny inner-ear fluid crystals stop feeling "down." Most astronauts adapt smoothly within 48–72 hours.',
        kidTip:
          'Every station wall uses subtle floor lighting and color labels so nobody loses direction quickly!',
      },
    ],
    quickCheck: {
      question:
        'Why do weight-lifting astronauts aboard the ISS train with vacuum-piston resistance cables instead of ordinary heavy iron dumbbells?',
      options: [
        {
          id: 'dumbbells-float',
          label: 'Because dumbbells are weightless in free fall and only resist fast pushes—vacuum pistons create steady load.',
        },
        {
          id: 'iron-rusts',
          label: 'Iron turns completely into harmless dust after crossing 100 km altitude.',
          wrongHint:
            'ISS uses plenty of metal alloys safely—iron dumbbells simply have zero downward weight force inside free fall!',
        },
        {
          id: 'pistons-oxygen',
          label: 'Exercise pistons double as air pumps filling EVA spacesuit tanks.',
          wrongHint:
            'High-pressure O₂ compressors run on electrical power—exercise machines strictly safeguard astronaut muscle and bone!',
        },
      ],
      correctOptionId: 'dumbbells-float',
      correctExplanation:
        'Muscle physiology ace! Pistons provide consistent mechanical tension so skeletons rebuild strong bone even in free-fall.',
    },
  },
  {
    id: 'radiation-hazards',
    title: 'Radiation & Space Hazards',
    badge: 'Module 09 • Cosmic Safety',
    headline: 'Solar Storms, Cosmic Rays, Orbital Debris & Water Shielding',
    learningObjectives: [
      'Compare Solar Particle Events (SPEs) with Galactic Cosmic Rays (GCRs).',
      'Explain why hydrogen-rich water walls protect crew better than aluminum windows.',
      'Understand kinetic danger of tiny orbital debris moving at ~28,000 km/h.',
    ],
    nasaExample: {
      missionName: 'NASA Space Radiation Analysis Group (SRAG) & Artemis Orion Shelter',
      detail:
        'During intense solar flares, crew aboard ISS shelter inside denser, water-lined interior modules while Orion crews stack heavy supply bags into an interior radiation bunker.',
    },
    summary:
      'Outside Earth’s magnetic cocoon and protective ocean of air, radiation bursts and microscopic debris present unseen engineering threats. Lead is actually clumsy armor against cosmic ions because heavy nuclei shatter into secondary sparks—instead, light hydrogen-rich plastics and water walls absorb high-energy protons safely.',
    keyFacts: [
      {
        title: 'Why Water Shields Better Than Windows',
        detail:
          'Hydrogen atoms inside water (H₂O) and polyethylene blocks absorb fast solar protons without generating extra harmful secondary X-rays!',
      },
      {
        title: '28,000 km/h Paint Flecks Hit Like Bullets',
        detail:
          'Because kinetic energy scales with v², an aluminum rivet at orbital velocity strikes harder than a speeding bowling ball—Whipple shields vaporize hits outside hulls.',
      },
      {
        title: 'Magnetic Earth Belts Protect LEO',
        detail:
          'ISS stays mostly shielded under Earth’s geomagnetic Van Allen belts except at high polar latitudes and storms; Moon/Mars flights face deeper exposure.',
      },
    ],
    explorerTitle: 'Cosmic Threat Countermeasures & Shielding Lab',
    explorerItems: [
      {
        id: 'spe',
        name: 'Solar Particle Events (SPEs)',
        tagline: 'Sudden proton gusts from bright sun flares',
        metricLabel: 'Warning Lead Time',
        metricValue: 'Minutes to Hours',
        scienceNote:
          'Coronal mass ejections fling energetic protons across space. Weather satellites spot flares by light first, warning station crews to shelter cleanly behind water racks.',
        kidTip:
          'Never watch a solar storm from the wide Cupola glass panes—step back inside thicker central sleep/water zones!',
      },
      {
        id: 'water-wall',
        name: 'Hydrogen-Rich Water Walls',
        tagline: 'Smart shielding doubles as crew drinks',
        metricLabel: 'Best Shield Element',
        metricValue: 'Hydrogen (Water / Poly)',
        scienceNote:
          'Light hydrogen nuclei break up oncoming cosmic particles smoothly with minimum secondary scatter, making food & water supply bags prime dual-use armor!',
        kidTip:
          'Mission designers wrap sleep bunks behind clean drinking water bladders to save rocket payload mass!',
      },
      {
        id: 'whipple',
        name: 'Whipple Debris Bumpers',
        tagline: 'Multi-layer sacrificial outer skin',
        metricLabel: 'Debris Impact Speed',
        metricValue: '~10 km/s Relative',
        scienceNote:
          'A thin outer aluminum plate shatters fast debris flecks into a wider harmless spray of tiny dust before touching the thicker inner pressure wall.',
        kidTip:
          'Ground radar tracks objects larger than ~10 cm—if one gets close, ISS engines execute a tiny Dodge Burn early!',
      },
      {
        id: 'lunar-regolith',
        name: 'Regolith & Lava-Tube Bases',
        tagline: 'Using natural Moon/Mars rock ceilings',
        metricLabel: 'Shield Depth Needed',
        metricValue: '~1–2 Meters Regolith',
        scienceNote:
          'Permanent Artemis or Mars habitats plan to cover inflatable labs beneath compacted dirt bricks or inside ancient underground volcanic tubes.',
        kidTip:
          'Underground caves also stabilize brutal +120°C to -150°C surface swings automatically!',
      },
    ],
    quickCheck: {
      question:
        'During an intense Solar Particle radiation alert aboard a space station, where should astronauts shelter until levels drop?',
      options: [
        {
          id: 'water-shelter',
          label: 'Inside central interior modules surrounded by hydrogen-rich water racks and dense equipment.',
        },
        {
          id: 'cupola-window',
          label: 'Press closely up against the thin glass Cupola windows to track the Sun visually.',
          wrongHint:
            'Cupola glass is far thinner than main hull racks—you would increase radiation exposure significantly!',
        },
        {
          id: 'airlock-eva',
          label: 'Step outside into an EVA spacesuit to wash off cosmic rays.',
          wrongHint:
            'Spacesuits have thin flexible fabric for mobility and protect far less against solar proton bursts than solid station racks!',
        },
      ],
      correctOptionId: 'water-shelter',
      correctExplanation:
        'Radiation Officer qualified! Water and hydrogen-rich structures absorb solar proton radiation safely.',
    },
  },
  {
    id: 'mission-control-ops',
    title: 'Mission Control Operations',
    badge: 'Module 10 • Flight Ops',
    headline: 'Flight Director Consoles, Go/No-Go Polls & Calm Priority Triage',
    learningObjectives: [
      'Understand roles across Mission Control consoles (FLIGHT, CAPCOM, EECOM, FIDO).',
      'Practice priority triage: Breathing O₂ & Cabin Pressure before secondary gear.',
      'Connect TDRS relay satellites with real telemetry anomaly handling.',
    ],
    nasaExample: {
      missionName: 'NASA Johnson Space Center Christopher C. Kraft Mission Control',
      detail:
        'Teams of specialist engineers monitor thousands of real-time telemetry streams around the clock so crews stay calm, double-checked, and never make high-risk guesses alone.',
    },
    summary:
      'An astronaut never flies solo: Mission Control stands beside every second from launch pad to splashdown. Each console owns one domain—EECOM guards cabin air and power, FIDO maps orbits, SURGEON watches crew health, and CAPCOM speaks concisely with orbital crew under the Flight Director’s final go/no-go lead.',
    keyFacts: [
      {
        title: 'Strict Priority Triage Order',
        detail:
          'First stop life-threatening air leaks & O₂/CO₂ failure, next secure electric power & radiation shelter, then restore communications and science experiments.',
      },
      {
        title: 'CAPCOM Voice Discipline',
        detail:
          'Only one single Astronaut-trained voice (CAPCOM) talks directly to orbit so multiple engineers never talk over each other during alarms.',
      },
      {
        title: 'TDRS Satellite Relay Loop',
        detail:
          'High geostationary TDRS satellites relay commands continuously around Earth’s horizon even when ground dishes pass into ocean gaps.',
      },
    ],
    explorerTitle: 'Flight Control Room Consoles & Playbook',
    explorerItems: [
      {
        id: 'flight-director',
        name: 'FLIGHT (Flight Director)',
        tagline: 'Final Go / No-Go Mission Commander',
        metricLabel: 'Core Mantra',
        metricValue: 'Work the Problem Calmly',
        scienceNote:
          'Leads pre-burn polls across all desks and makes final call whenever split-second safety overrides scheduled science activities.',
        kidTip:
          'Gene Kranz’s rule in Apollo 13: never guess—verify gauges cleanly before throwing a single switch!',
      },
      {
        id: 'eecom',
        name: 'EECOM (Life Support & Power)',
        tagline: 'Cabin Pressure, O₂ Scrubbers & Electrical Bus',
        metricLabel: 'Priority One',
        metricValue: 'Air, Pressure & Watts',
        scienceNote:
          'Tracks cabin kPa pressure, CO₂ ppm, and coolant loops. If one solar bus fails, EECOM immediately sheds coffee warmers and non-essential heaters.',
        kidTip:
          'You will put EECOM’s exact triage playbook into practice inside ANANTRA’s Emergency Training module!',
      },
      {
        id: 'capcom',
        name: 'CAPCOM (Capsule Communicator)',
        tagline: 'Fellow Astronaut Speaking to Crew',
        metricLabel: 'Comms Protocol',
        metricValue: 'Single Voice Clarity',
        scienceNote:
          'Translates detailed backroom engineering steps into concise, clear checklists tailored to someone floating under time pressure in orbit.',
        kidTip:
          'Good radio calls stay brief, respectful, and unambiguous—read back critical switch numbers aloud!',
      },
      {
        id: 'fido',
        name: 'FIDO (Flight Dynamics Officer)',
        tagline: 'Orbits, Burns & Conjunction Warnings',
        metricLabel: 'Orbital Timing',
        metricValue: 'Δv Burn Precision',
        scienceNote:
          'Calculates exact second-by-second engine burns for rendezvous, debris avoidance, and safe splashdown corridors.',
        kidTip:
          'Even 1 m/s error far from Mars misses target altitude by hundreds of kilometers—precision wins!',
      },
    ],
    quickCheck: {
      question:
        'When both a minor science experiment lamp AND main cabin oxygen scrubber compete for low battery power during an orbital fault, what does Mission Control keep powered?',
      options: [
        {
          id: 'power-life-support',
          label: 'Keep the oxygen scrubber powered first—crew life support always outranks experiments.',
        },
        {
          id: 'power-cameras',
          label: 'Turn off oxygen scrubbers to preserve colorful HD cameras for public broadcasts.',
          wrongHint:
            'Flight Rules prioritize breathable air and crew health above every non-essential load!',
        },
        {
          id: 'flip-coin',
          label: 'Cycle both randomly on and off every 10 seconds to save switches.',
          wrongHint:
            'Random cycling risks tripping breakers and fails Flight Rule priority discipline!',
        },
      ],
      correctOptionId: 'power-life-support',
      correctExplanation:
        'Flight Director certified! Life support (air, pressure, thermal survival) always wins power triage.',
    },
  },
];

export const ACADEMY_QUIZ_QUESTIONS: AcademyQuizQuestion[] = [
  {
    id: 'acad-q1',
    topic: 'Spaceflight Fundamentals',
    question:
      'If an astronaut stands on the Moon (gravity 1.62 m/s²) instead of Earth (9.81 m/s²), how do their mass and weight compare?',
    correctOptionId: 'same-mass-less-weight',
    correctFeedback:
      'Spot on! Mass measures how much matter makes up your body (unchanged anywhere), while weaker lunar gravity pulls downward with about 1/6th weight.',
    options: [
      {
        id: 'both-zero',
        label: 'Both mass and weight drop completely to zero as soon as you leave Earth.',
        wrongExplanation:
          'Careful! The Moon still has 1.62 m/s² gravity giving objects weight, and an astronaut’s body keeps 100% of its mass everywhere.',
      },
      {
        id: 'same-mass-less-weight',
        label: 'Their mass stays identical, while their weight drops to about one-sixth of Earth weight.',
      },
      {
        id: 'more-weight-less-mass',
        label: 'Their weight triples because Moon dust is magnetically sticky.',
        wrongExplanation:
          'Lunar surface gravity is 6× weaker—not stronger—than Earth’s.',
      },
    ],
  },
  {
    id: 'acad-q2',
    topic: 'Rocket Science',
    question:
      'Why do multi-stage rockets shed heavy empty booster tanks on their way to orbit?',
    correctOptionId: 'shed-mass',
    correctFeedback:
      'Awesome rocket physics! Dropping empty metal tanks drops mass m so engine force F accelerates the spacecraft sharply faster (a = F / m).',
    options: [
      {
        id: 'shed-mass',
        label: 'Dropping dead empty tank mass lets upper engines accelerate the lighter payload faster.',
      },
      {
        id: 'cool-sky',
        label: 'So empty metal drums drop parachutes that tow the upper stage forward.',
        wrongExplanation:
          'Dropped stages fall down rather than towing upward—less mass m is what increases upper acceleration.',
      },
      {
        id: 'add-oxygen',
        label: 'So space wind can rush inside the middle of the rocket hull.',
        wrongExplanation:
          'Space is a vacuum with no air; rockets bring onboard liquid oxygen oxidizer.',
      },
    ],
  },
  {
    id: 'acad-q3',
    topic: 'Orbital Mechanics',
    question:
      'Why do astronauts float inside the International Space Station even at 408 km altitude where Earth’s gravity is still ~89% strong?',
    correctOptionId: 'free-fall',
    correctFeedback:
      'Orbital mechanics ace! Moving ~28,000 km/h sideways means both astronaut and station fall freely together around Earth’s curve.',
    options: [
      {
        id: 'zero-earth-gravity',
        label: 'Earth’s gravity vanishes completely once you cross the edge of the atmosphere.',
        wrongExplanation:
          'Earth gravity reaches far past the Moon! At 408 km it is still nearly ~89% as strong as at sea level.',
      },
      {
        id: 'free-fall',
        label: 'Both astronaut and station are in continuous sideways free-fall around Earth together.',
      },
      {
        id: 'magnetic-boots-off',
        label: 'Magnets mounted beneath the station push human bones gently upward.',
        wrongExplanation:
          'Humankind is non-magnetic—microgravity inside an orbiting lab comes directly from continuous free-fall!',
      },
    ],
  },
  {
    id: 'acad-q4',
    topic: 'Moon Exploration',
    question:
      'Why can a lunar lander NOT use parachutes to slow down before touching the Moon’s surface?',
    correctOptionId: 'airless-moon',
    correctFeedback:
      'Right! Parachutes require air resistance; in the Moon’s vacuum only throttleable rocket thrusters can arrest descent.',
    options: [
      {
        id: 'airless-moon',
        label: 'Because the Moon has virtually no atmosphere to create drag against a parachute.',
      },
      {
        id: 'parachutes-burn',
        label: 'Because grey lunar regolith catches cloth on fire before deployment.',
        wrongExplanation:
          'Parachutes fail cleanly on the Moon simply because vacuum holds no air to catch canopies.',
      },
      {
        id: 'fast-wind',
        label: 'Fierce lunar hurricanes would rip parachutes sideways off the craft.',
        wrongExplanation:
          'Without atmosphere, the Moon has zero wind or storms—bootprints left in 1969 remain crisp today!',
      },
    ],
  },
  {
    id: 'acad-q5',
    topic: 'Mars Exploration',
    question:
      'Why must robotic Mars landers complete their 7-minute touchdown automatically without live Earth joysticks?',
    correctOptionId: 'light-delay',
    correctFeedback:
      'Signal-lag master! Radio takes 4–24 minutes each way between Earth and Mars, far slower than real-time entry.',
    options: [
      {
        id: 'mars-blocks-radio',
        label: 'Martian iron mountains block all NASA radio waves from reaching orbit.',
        wrongExplanation:
          'Orbiters relay radio cleanly—the delay comes from the huge distance traveled at finite light speed.',
      },
      {
        id: 'light-delay',
        label: 'One-way radio signals take 4 to 24 minutes—far slower than the rapid entry sequence.',
      },
      {
        id: 'pilots-sleep',
        label: 'Because all Mars landings happen during Mission Control holidays.',
        wrongExplanation:
          'Earth teams stay wide awake at every landing console—physics light delay dictates autonomy!',
      },
    ],
  },
  {
    id: 'acad-q6',
    topic: 'Spacesuits & Life Support',
    question:
      'How does a spacewalker keep from overheating inside an insulated suit while repairing ISS panels in sunlight?',
    correctOptionId: 'lcvg-tubes',
    correctFeedback:
      'Spacesuit specialist! Chilled water flowing through 91 m of narrow tubes absorbs metabolic body heat cleanly.',
    options: [
      {
        id: 'lcvg-tubes',
        label: 'Chilled water circulates through thin tubes worn directly against the body (LCVG).',
      },
      {
        id: 'crack-visor',
        label: 'Unlatch the neck seal slightly to let orbital breeze blow inside.',
        wrongExplanation:
          'Opening any seal into vacuum instantly vents breathable suit pressure!',
      },
      {
        id: 'external-fans',
        label: 'Spin small glove propellers against cold outer space air.',
        wrongExplanation:
          'Vacuum holds no air for external cooling fans—closed-loop water tubing solves body heat transfer.',
      },
    ],
  },
  {
    id: 'acad-q7',
    topic: 'Space Station Operations',
    question:
      'How many orbital sunrises and sunsets does an International Space Station crew see every 24-hour Earth day?',
    correctOptionId: 'sixteen-orbits',
    correctFeedback:
      'Spot on! Orbiting Earth roughly once every 90 minutes gives 16 sunrises and sunsets each Earth day.',
    options: [
      {
        id: 'one-orbit',
        label: 'Just one sunrise and sunset, identical to Earth surface timing.',
        wrongExplanation:
          'Station speed (~28,000 km/h) loops completely around the planet 16 times inside a single 24-hour Earth day!',
      },
      {
        id: 'sixteen-orbits',
        label: 'About 16 sunrises and 16 sunsets, completing one full orbit roughly every 90 minutes.',
      },
      {
        id: 'zero-sunrises',
        label: 'Zero sunrises, because outer space sits permanently inside dark shadow.',
        wrongExplanation:
          'Space is dark only because nothing scatters sunlight—the Sun shines brightly for half of each orbit!',
      },
    ],
  },
  {
    id: 'acad-q8',
    topic: 'Human Physiology in Space',
    question:
      'Why do astronauts eat soft tortillas rather than crusty loaves and sleep near gently blowing cabin vents?',
    correctOptionId: 'crumbs-and-co2',
    correctFeedback:
      'Crew flight surgeon approved! Avoiding floating crumbs protects eyes & air grilles, and fans clear exhaled CO₂ bubbles while sleeping.',
    options: [
      {
        id: 'crumbs-and-co2',
        label: 'To prevent floating crumbs from clogging filters and stop stale CO₂ hovering around sleeping faces.',
      },
      {
        id: 'bread-explodes',
        label: 'Yeast inside baked bread expands continuously inside free-fall pantries.',
        wrongExplanation:
          'Baked bread stays stable—dry crumbs floating around without settling onto floors are the safety risk!',
      },
      {
        id: 'vents-push-down',
        label: 'Strong sleep fans pin astronauts down using aerodynamic gravity.',
        wrongExplanation:
          'Sleep zippers strap crew comfortably onto the wall; cabin vents provide vital air-gas mixing!',
      },
    ],
  },
  {
    id: 'acad-q9',
    topic: 'Radiation & Space Hazards',
    question:
      'During a Solar Particle radiation warning, why do hydrogen-rich water walls protect crew better than staying inside Cupola windows?',
    correctOptionId: 'hydrogen-shield',
    correctFeedback:
      'Radiation Safety Gold! Hydrogen-rich water slows cosmic protons safely with minimal secondary radiation scatter.',
    options: [
      {
        id: 'water-mirrors',
        label: 'Cupola panes zoom sunlight like magnifying lenses toward the station core.',
        wrongExplanation:
          'Flat thick quartz Cupola windows do not magnify sunlight like curved lenses—thin glass simply lacks shielding mass!',
      },
      {
        id: 'hydrogen-shield',
        label: 'Dense interior water racks contain abundant light hydrogen that absorbs oncoming proton energy safely.',
      },
      {
        id: 'cupola-cold',
        label: 'Glass windows freeze crew helmets solidly onto wall bolts.',
        wrongExplanation:
          'Interior Cupola stays room temperature—ionizing radiation penetration is the exact reason crews shelter inside water-lined racks.',
      },
    ],
  },
  {
    id: 'acad-q10',
    topic: 'Mission Control Operations',
    question:
      'Under Mission Control Flight Rules, if multiple systems alarm at once, what always receives top priority before science gear?',
    correctOptionId: 'life-support-first',
    correctFeedback:
      'Flight Director Certified! Breathable air, cabin pressure containment, and thermal safety always come first.',
    options: [
      {
        id: 'science-camera',
        label: 'Downlinking external video before troubleshooting leaking air valves.',
        wrongExplanation:
          'Payload media and experiments shed power immediately when cabin life support or hull pressure is threatened!',
      },
      {
        id: 'life-support-first',
        label: 'Cabin pressure, breathable oxygen/CO₂ scrubbers, and crew radiation safety.',
      },
      {
        id: 'silence-alarms',
        label: 'Muting alarm speakers cleanly for 30 minutes to see if wires cool off.',
        wrongExplanation:
          'Never silence uninvestigated alerts—work the telemetry calmly step by step!',
      },
    ],
  },
];
