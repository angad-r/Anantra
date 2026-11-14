# Architecture Guide — ANANTRA

## 1. High-Level Runtime Architecture

ANANTRA is a **React 19 + TypeScript single-page application** compiled by **Vite 8** with **Tailwind CSS v4**. All curriculum lessons, physics engines, mastery evaluation, and client-side A4 PDF certificate rendering execute natively in the browser with zero mandatory backend dependencies. When deployed to Vercel, an optional serverless endpoint (`api/mentor.ts`) augments the mentor console when server-side AI keys are configured.

```text
src/main.tsx
 └─ App (src/App.tsx)
     ├─ AppErrorBoundary          # React runtime crash boundary & safe reload UI
     ├─ MotionConfig              # Respects prefers-reduced-motion="user"
     ├─ TrainingProvider          # Cadet identity, module telemetry, certificates & XP
     └─ BrowserRouter
         └─ AppRoutes             # Gate: !cadetProfile || awaitingMissionControlEntry
             ├─ OnboardingExperience (first-visit registration across module routes)
             ├─ LandingPage (/)
             ├─ CommandDeckLayout (<AppShell showSidebar />)
             │   ├─ DashboardPage (/dashboard)
             │   ├─ ProfilePage (/profile)
             │   ├─ CertificatesPage (/certificates, /certificates/verify)
             │   ├─ ReferencesPage (/references)
             │   └─ 6 Lazy Feature Modules wrapped in <ModuleSandbox />
             │       (/academy, /mission-control, /zero-gravity-lab,
             │        /spacewalk-training, /emergency-training, /ai-mentor)
             └─ NotFoundPage (*)
```

---

## 2. State Management, Telemetry & `localStorage` Design

[`TrainingContext`](../src/context/TrainingContext.tsx) cleanly separates Cadet Identity from Training & Certificate state:

| Domain | Storage Key | Validation & Normalization | Responsibility |
| :--- | :--- | :--- | :--- |
| **Cadet Identity** | `anantra.cadet.profile.v1` | `isValidCadetProfile()` in `src/utils/cadetProfileStorage.ts` | Stores `cadetId` (`ANT-XXX-XXX`), `firstName`, optional certificate `fullName`, `callsign`, `specialization`, and optional age/avatar/destination preferences. |
| **Training Telemetry & Certificates** | `anantra.training.state.v1` | `isValidTrainingState()` + `normalizeTrainingState()` in `src/utils/storage.ts` | Stores 6-module checklist progress, `moduleRecords` (attempts, pass counts, best/last scores), `academyStudiedLessonIds`, quiz best scores, `activityHistory`, `guidedProgression`, and `issuedCertificates`. |

### Fault Recovery & Snapshot Integrity

- **Corrupt Storage Resilience:** Malformed JSON or schema mismatches never throw into the UI. Invalid `TrainingState` activates an interactive recovery banner (`ErrorState`) preserving the underlying screen; invalid `CadetProfile` recovers gracefully back to Onboarding without dropping existing module telemetry.
- **Certificate Reconciliation & Immutability:** `reconcileIssuedCertificates()` evaluates strict eligibility (`evaluateCertificateEligibility()` in [`certificateCatalog.ts`](../src/features/certificates/certificateCatalog.ts)) on verified state transitions (`recordModuleAttempt`, `saveAcademyProgress`, `saveMentorQuizBest`, `toggleTask`, `completeModule`, bootstrap) and issues `ANANTRA-<CODE>-<YYYYMMDD>-<RANDOM6>` IDs once earned. Editing a cadet's profile (`updateCadetProfile`) intentionally does **not** overwrite existing earned certificate snapshots; cadets instead see a non-destructive `Reissue` option in the Preview Modal or Vault that records previous IDs under `supersededIds`.

---

## 3. Feature Modules & Pure Domain Engines

Every simulation and domain engine separates pure deterministic logic from React UI views:

| Feature / Subsystem | Core Pure Logic Modules | Architectural Highlights |
| :--- | :--- | :--- |
| **Astronaut Academy** | `src/features/academy/academyLessonsData.ts`, `AcademyDiagrams.tsx` | 10 spaceflight curriculum topics, bespoke interactive vector diagrams (stages, free-fall orbits, spacesuit layers, radiation), NASA mission case studies, misconception prompts, and a 10-question mastery exam (`>= 7/10` persists mastery). |
| **Mission Control** | `src/features/mission-control/lunarPhysics.ts` | Fixed-clamped `dt` (`0.001–0.05 s`) `requestAnimationFrame` physics engine (`LUNAR_GRAVITY = 1.62 m/s²`, `MAX_THRUST_ACCEL = 3.8 m/s²`, `LATERAL_ACCEL = 2.2 m/s²`), `Cadet` (`100%` fuel) and unlockable `Commander` (`72%` precision) modes, 4-metric landing score (`calculateLandingScore`), and automatic telemetry persistence. |
| **Zero Gravity Lab** | `src/features/zero-gravity-lab/zeroGravityPhysics.ts` | 1D kinematics engine comparing frictionless orbital motion against Earth friction (`EARTH_FRICTION_DECEL = 1.2 m/s²`), Newton's 2nd/3rd law recoil over `45 kg`, surface-tension droplet comparator, and 3 physics challenges. |
| **Spacewalk & Emergency** | `spacewalkChallengeData.ts`, `emergencyChallengeData.ts` | Deterministic multi-phase EVA safety locker + `100% O₂` truss repair state machine and 3-alert orbital emergency triage with live safety scoring. |
| **AI Mentor (`ARIA`)** | `mentorKnowledgeBase.ts` + optional [`api/mentor.ts`](../api/mentor.ts) | Offline 10-topic keyword/phrase matcher + 3-step progressive hint engine + telemetry debriefs + 5-question quiz; optional opt-in Cloud AI button POSTs bounded prompts to `/api/mentor` and degrades seamlessly back to offline mode when unconfigured (`HTTP 503`). |
| **Certificates & Vector PDF** | `certificateCatalog.ts`, `certificateService.ts`, `certificatePdf.ts`, `CertificateSheet.tsx` | Dual live React A4 sheet + WinAnsi-safe native `jsPDF` vector renderer (`297 × 210 mm`), dynamic `import('jspdf')` code-splitting, `@media print` isolation via `print:hidden` sibling wrappers, and local ID lookup (`/certificates/verify`). |

---

## 4. Responsive Shell, Navigation & Route Code-Splitting

- **Route-Level Lazy Loading (`src/App.tsx`):** All non-onboarding feature pages (`LandingPage`, `DashboardPage`, `ProfilePage`, `CertificatesPage`, `ReferencesPage`, and all 6 training modules) load via `React.lazy` inside `<Suspense />`.
- **Responsive Breakpoints (`src/components/layout/AppShell.tsx`):**
  - Desktop nav + `lg:w-72` sidebar appear cleanly at `>= 1024px`, preventing `768px` tablet header overlap.
  - Long specialization/rank strings (`SPACE STATION SPECIALIST`) wrap naturally with `min-w-0` + `whitespace-normal` across `360px`–`1920px`.
  - Mobile drawer state syncs strictly on `pathname` changes (`prevPathnameRef`) so initial render never closes drawer toggles under concurrent load.
- **Vendor Chunk Strategy (`vite.config.ts`):** Splits `react-vendor`, `motion-vendor`, and `icons-vendor`, while dynamic `import('jspdf')` keeps the ~`399 kB` PDF engine completely out of the initial page payload (`~115 kB` app entry).
- **Vercel SPA Routing (`vercel.json`):** Rewrites non-`/api/*` routes cleanly to `/index.html` while keeping `/api/mentor` reachable as a serverless function.
