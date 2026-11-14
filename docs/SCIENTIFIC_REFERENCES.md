# Scientific References & Educational Simplifications — ANANTRA

Every spaceflight lesson fact, simulation constant, and mentor explanation in **ANANTRA — Junior Astronaut Mission Trainer** is grounded in publicly available **NASA educational resources**, tuned intentionally into approachable interactive models for young learners. All 18 NASA resources listed below are also browsable inside the application at [`/references`](../src/features/references/ReferencesPage.tsx).

> **Educational Disclaimer:** ANANTRA is an independent educational project created for the NASA Space Apps Challenge. It is **not** endorsed by, affiliated with, or certified as a training tool or credential issuer by NASA or any government space agency.

---

## 1. Verified NASA Educational References (18 Sources)

| Topic in ANANTRA | Relevant Module(s) | Verified NASA Resource |
| :--- | :--- | :--- |
| **Solar System & Planets** | Astronaut Academy (`Topic 01`) | [NASA Science — Our Solar System](https://science.nasa.gov/solar-system/) |
| **Rocky vs. Gas/Ice Giants** | Astronaut Academy (`Topic 01`) | [NASA Science — Planets](https://science.nasa.gov/solar-system/planets/) |
| **Mars Surface, Volcanism & Exploration** | Onboarding (`Mars Pioneer`), Academy (`Topic 05`) | [NASA Science — Mars Exploration](https://science.nasa.gov/mars/) |
| **Earth's Moon & Gravity (`1.62 m/s²`)** | Mission Control, Academy (`Topic 04`) | [NASA Science — Earth's Moon](https://science.nasa.gov/moon/) |
| **Apollo 11 & Lunar Descent Heritage** | Mission Control, Academy (`Topic 04`) | [NASA — Apollo 11 Mission](https://www.nasa.gov/mission/apollo-11/) |
| **Artemis Lunar Exploration Program** | Academy (`Topic 04`), Onboarding (`Lunar Explorer`) | [NASA — Artemis](https://www.nasa.gov/humans-in-space/artemis/) |
| **What Is Microgravity? (Continuous Free-Fall)** | Zero Gravity Lab, Academy (`Topic 03`), AI Mentor | [NASA — What Is Microgravity?](https://www.nasa.gov/learning-resources/what-is-microgravity/) |
| **Microgravity Classroom Educator Guide (Grades 5–8)** | Zero Gravity Lab | [NASA — What Is Microgravity? (Grades 5–8)](https://www.nasa.gov/learning-resources/for-educators/what-is-microgravity-grades-5-8/) |
| **Newton's Laws of Motion (`a = F / m`, Action-Reaction)** | Zero Gravity Lab, Mission Control | [NASA Glenn Research Center — Newton's Laws of Motion](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/newtons-laws-of-motion/) |
| **Basics of Space Flight (Orbital Mechanics)** | Academy (`Topics 02–03`), AI Mentor | [NASA Science — Basics of Space Flight](https://science.nasa.gov/learn/basics-of-space-flight/) |
| **Gravity & Weight vs. Mass** | Academy (`Topics 01 & 08`), Zero Gravity Lab | [NASA Space Place — What Is Gravity?](https://spaceplace.nasa.gov/what-is-gravity/) |
| **Launching Into Space & Staging** | Academy (`Topics 01–02`), AI Mentor | [NASA Space Place — Launching Into Space](https://spaceplace.nasa.gov/launching-into-space/en/) |
| **EVA Spacesuits, Cooling & Gold Visors** | Academy (`Topic 06`), Spacewalk Training | [NASA — Spacesuits](https://www.nasa.gov/humans-in-space/spacesuits/) |
| **Living & Working in Orbit & Human Physiology** | Academy (`Topics 07–08`), AI Mentor | [NASA — Astronauts](https://www.nasa.gov/humans-in-space/astronauts/) |
| **International Space Station (`~28,000 km/h`, `~90 min` Orbit)** | Academy (`Topic 07`), Spacewalk, Emergency | [NASA — International Space Station](https://www.nasa.gov/international-space-station/) |
| **Orbital Crew Assistants (`Astrobee`)** | AI Astronaut Mentor | [NASA — Astrobee Free-Flying Robot](https://www.nasa.gov/astrobee/) |
| **Solar Flares & Space Radiation Hazards** | Emergency Training (`Alert 03`), Academy (`Topic 09`) | [NASA Space Place — Solar Activity](https://spaceplace.nasa.gov/solar-activity/en/) |
| **General Kid-Friendly Space Exploration** | All Cadet Cohorts (`Under 10` – `17+`) | [NASA Space Place](https://spaceplace.nasa.gov/) |

---

## 2. Core Physics Facts Used Directly in ANANTRA

- **Lunar Surface Gravity:** `1.62 m/s²` (~`1/6` of Earth's `9.81 m/s²`) inside an ultra-thin exosphere vacuum—meaning aerodynamic parachutes cannot slow down a lunar lander and rocket thrust is essential.
- **International Space Station Orbit:** Travels at roughly `28,000 km/h` (`~7.66 km/s`) at `~408 km` altitude, completing one orbit every `~90 minutes` (`~16 sunrises and sunsets` per Earth day).
- **Orbital Free-Fall ("Microgravity"):** Earth's gravity at ISS altitude is still roughly `~90%` as strong as on the surface; astronauts float because both crew and spacecraft fall continuously around Earth at orbital velocity.
- **Surface Tension in Microgravity:** Without buoyancy/gravity pulling liquids flat to a container floor, cohesive molecular forces dominate—pulling droplets into floating spheres and causing water to creep upward along curved surfaces.
- **EVA Thermal & Life Support Realities:** Unfiltered orbital sunlight vs. Earth's shadow exposes suit exteriors to roughly `-157°C` to `+121°C`, regulated internally by chilled water tubes in the Liquid Cooling and Ventilation Garment (LCVG) and glare-reflecting gold-coated visors.
- **Orbital Solar Particle Sheltering:** Hydrogen-rich potable water walls and dense equipment racks provide stronger radiation attenuation than thin observation windows such as the Cupola.

---

## 3. Intentional Educational Simplifications (Model Boundaries)

ANANTRA documents the explicit gap between operational spacecraft physics and approachable browser training models both here and inside `/references`:

| Module | Real Spaceflight Complexity | Simplified Model Used in ANANTRA | Why This Helps Young Learners |
| :--- | :--- | :--- | :--- |
| **Mission Control (`lunarPhysics.ts`)** | Time-varying wet mass as propellant burns (Tsiolkovsky rocket equation), gimbaled engine torque, slosh, 3D terrain slope | Constant `1.62 m/s²` lunar gravity, `3.80 m/s²` max upward thrust (`~43%` hover balance), `±2.20 m/s²` lateral RCS, `0.05 s`-clamped stepping, `Cadet` (`100%` fuel) & `Commander` (`72%` fuel) presets | Keeps vertical vs. horizontal velocity limits (`|vy| <= 3.5 m/s`, `|vx| <= 2.5 m/s`) intuitive without overwhelming young pilots with 6-DOF attitude math. |
| **Zero Gravity Lab (`zeroGravityPhysics.ts`)** | 3D coupled rigid-body rotation and torque around an object's center of mass | 1D linear motion along a `20 m` track (`a = F / m`, `0.8 s` push impulse, `45 kg` astronaut recoil) comparing zero drag vs. `1.2 m/s²` Earth friction, plus water droplet surface-tension visualization | Makes momentum (`p = m · v`), inertia, and mass-vs.-weight trade-offs immediately legible in `m/s`. |
| **Spacewalk Training (`spacewalkChallengeData.ts`)** | Full 6–8 hr EVA Suit Telemetry tracking `pO₂`, `pCO₂` scrubbing, battery watt-hours, and dual tether translation | Percentage `100% O₂` suit reserve with discrete per-stage tool/step oxygen costs (`12%–22% O₂`) | Teaches pre-flight hardware safety checklists and life-support reserve budgeting inside a classroom-friendly run. |
| **Emergency Training (`emergencyChallengeData.ts`)** | Flight-director fault trees, depressurization rate curves, bus load-shedding matrices | Sequential 3-alert priority triage scored against a `0–100%` Station Safety meter (`< 25%` retry) | Builds calm life-support-first decision habits without stressful irreversible failure timers. |
| **AI Mentor (`mentorKnowledgeBase.ts` & `api/mentor.ts`)** | General-purpose external AI agent | Offline-first deterministic 10-topic knowledge matcher + 3-step progressive hints + telemetry debriefs, plus strictly opt-in serverless Cloud AI (`/api/mentor`) | Guarantees reliable classroom behavior with zero client secrets, zero PII exposure, and honest capability boundaries. |
