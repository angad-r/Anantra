# Project Overview — ANANTRA (Junior Astronaut Mission Trainer)

## 1. Vision & Mission Context

**ANANTRA** (*Junior Astronaut Mission Trainer*) is an interactive educational space exploration web application built for the **NASA Space Apps Challenge**. Designed for young learners, families, classrooms, and STEM showcases, ANANTRA combines a privacy-first Cadet Onboarding experience, 10 curriculum lessons with vector science diagrams, 4 physics and engineering simulators, a mastery-gated Certificate Generation & Verification System, and a hybrid offline-capable AI mentor—running directly in the browser with **zero accounts or mandatory API keys**.

Rather than passive articles or slide decks, cadets follow a realistic training flow:

1. **Enroll Safely:** Build a privacy-first local Cadet Badge with First Name, Callsign, optional avatar crest, optional target destination, and Astronaut Specialization.
2. **Understand Core Physics & Systems:** Study 10 structured lessons across orbital mechanics, multi-stage rockets, Moon exploration, Mars engineering, spacesuit life support, ISS operations, human physiology, space radiation, and Mission Control flight rooms.
3. **Command Interactive Simulators:** Control real-time Moon lander thrust (`1.62 m/s²` lunar gravity) across Cadet & Commander tiers, compare frictionless microgravity inertia (`a = F / m`) and water surface tension against Earth gravity, run EVA locker safety checks and `100% O₂` truss repairs, and triage station emergencies.
4. **Earn & Export Mastery Certificates:** Unlock 6 mastery-gated certifications, preview them on landscape A4 certificates with embossed vector seals and unique IDs, export vector PDFs (`jsPDF`), print isolated sheets, or verify IDs inside the **Certificates Vault**.

---

## 2. Target Learner Brackets & Inclusive UX

Onboarding lets cadets optionally select an age cohort (`Under 10`, `10–13`, `14–16`, `17+`):

- **Elementary & Early Explorers (`Under 10`):** Clear vocabulary, high-contrast telemetry rings, interactive vector science diagrams, progressive 3-step ARIA hints, and accessible touch controls.
- **Middle-Grade Cadets (`10–13`):** Quantitative intuition around mass vs. weight, Newton's Laws (`F = m × a`), hover thrust balance (`~43%`), oxygen budgeting, and planetary comparisons.
- **High School & Educators (`14–16` / `17+`):** Multi-variable lunar descent limits (`|vy| <= 3.5 m/s`, `|vx| <= 2.5 m/s`, Commander landing precision), explicit classroom-model boundary disclosures (`/references`), and clean open-source TypeScript extensibility.

---

## 3. Cadet Onboarding, Profile & Specialization Tracks

Before unlocking the Command Deck, first-time visitors complete [`OnboardingExperience`](../src/features/onboarding/OnboardingExperience.tsx):

1. **Cadet Identity (Required):** First Name (`2–24` characters; rejects `@` email inputs) and Astronaut Callsign (`2–16` uppercase characters with sample chips `ORION-7`, `STARLIGHT`, `APOLLO-9`, `COMET-4`).
2. **Preferences (Optional / Skippable):** Age Group (`Under 10`, `10–13`, `14–16`, `17+`), 1 of 6 custom SVG avatar crests, and Favorite Space Destination (`Moon`, `Mars`, `Jupiter`, `Saturn`, `International Space Station`).
3. **Astronaut Specialization (Required):**
   - `SPEC-01` — **LUNAR EXPLORER**: Touchdown & Crater Navigation
   - `SPEC-02` — **MARS PIONEER**: Red Planet Reconnaissance
   - `SPEC-03` — **SPACE STATION SPECIALIST**: EVA Repairs & Systems Ops
   - `SPEC-04` — **COSMIC SCIENTIST**: Microgravity & Deep-Sky Discovery

On [`ProfilePage`](../src/features/profile/ProfilePage.tsx) (`/profile`), cadets can edit identity details live, set an optional **Full Name for Certificates** (`<= 60` chars), export/inspect their credentials, or trigger a guarded badge reset without overwriting training records.

---

## 4. Six Core Training Modules, Mastery Certificates & XP Economy

Across all **6 modules** ([`TRAINING_MODULES`](../src/data/modules.ts)), cadets earn up to **1,100 XP** across **18 deck objectives**, persist simulator telemetry records (`moduleRecords`, `activityHistory`), and unlock **6 mastery-gated certifications**:

| Order | Module & Route | Difficulty | Certificate Title | Checklist & Mastery Criteria | Interactive Experience |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Astronaut Academy** (`/academy`) | Cadet | *Orbital Scholar* | `170 XP` • 3 steps + Academy quiz `>= 7/10` | 10 NASA-grounded science lessons, custom interactive SVG diagrams, NASA mission case studies, misconception checks, and a 10-question mastery exam |
| **2** | **Mission Control** (`/mission-control`) | Explorer | *Flight Director* | `180 XP` • 3 steps + Verified safe landing | Real-time 2D SVG **Moon Landing Simulator** under `1.62 m/s²` lunar gravity, RCS horizontal thrust, hover presets, Cadet & Commander difficulties, and 4-metric star scoring |
| **3** | **Zero Gravity Lab** (`/zero-gravity-lab`) | Explorer | *Microgravity Scientist* | `180 XP` • 3 steps + `3/3` Lab Challenges | 1D `a = F / m` motion chamber comparing zero drag vs. Earth tabletop friction (`1 kg`, `3 kg`, `6 kg`), astronaut recoil display, surface-tension water droplet demo, and 3 lab challenges |
| **4** | **Spacewalk Training** (`/spacewalk-training`) | Explorer | *EVA Pioneer* | `190 XP` • 3 steps + Safe EVA return | 6-tool pre-EVA safety locker selection (rejecting Earth hazards) followed by a 4-stage exterior truss repair under a `100% O₂` suit reserve |
| **5** | **Emergency Training** (`/emergency-training`) | Commander | *Crisis Responder* | `220 XP` • 3 steps + Triage drill pass | Sequential orbital crisis alerts (*Cabin Pressure Drop*, *Solar Array Power Dip*, *Solar Particle Storm*) scored against live Station Safety (`>= 25%`) |
| **6** | **AI Astronaut Mentor** (`/ai-mentor`) | Cadet | *Curious Explorer* | `160 XP` • 3 steps + Quiz `>= 4/5` & ARIA engagement | **ARIA** deterministic offline handbook (`10+` spaceflight topics) + 3-step progressive hints + telemetry debriefs + 5-question quiz + optional server-side Cloud AI toggle (`/api/mentor`) |

> **Anti-Spoofing Certificate Guardrail:** Checking off manual deck tasks alone does **not** issue a certificate—each certification validates both completed checklist steps **and** real interactive quiz or simulator mastery.

### Astronaut Ranks ([`ASTRONAUT_RANKS`](../src/data/designTokens.ts))

| Level | Rank Title | Minimum XP Required |
| :---: | :--- | :--- |
| **1** | Starlight Cadet | `0 XP` |
| **2** | Orbital Apprentice | `120 XP` |
| **3** | Flight Specialist | `300 XP` |
| **4** | EVA Explorer | `520 XP` |
| **5** | Junior Mission Commander | `750 XP` |

---

## 5. Additional Platform Views

- **Mission Overview (`/`):** Interactive landing page with live Cadet Flight Pass telemetry preview and training pathway.
- **Certificates Vault & Verification (`/certificates`, `/certificates/verify`):** Preview all 6 certifications, inspect requirements for locked credentials, export single or portfolio landscape A4 vector PDFs, print isolated sheets, copy or reissue IDs after profile updates, and look up local browser certificate records.
- **Science, Models & NASA References (`/references`):** Searchable directory of 18+ verified NASA educational URLs paired with honest scientific vs. classroom-simulation boundary tables.

---

## 6. Companion Reading

- [Architecture Guide](ARCHITECTURE.md) — Routing, lazy code-splitting, storage schemas, physics engines, PDF pipeline & serverless bridge
- [Scientific References](SCIENTIFIC_REFERENCES.md) — Verified NASA sources & physics model simplifications
- [QA Report](QA_REPORT.md) — TypeScript, Vitest (`73` tests), Vite build, security scan & multi-viewport Chrome CDP audit metrics
