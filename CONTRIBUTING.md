# Contributing to ANANTRA — Junior Astronaut Mission Trainer

Thank you for helping improve **ANANTRA**! Whether you are refining space science explanations, tuning physics simulations, expanding the Certificate system, fixing responsive UI layouts, or adding unit tests, this guide keeps contributions safe, accessible, scientifically honest, and aligned with our modular architecture.

---

## 1. Local Setup

1. Fork or clone the repository and inspect the project layout:
   ```bash
   git clone https://github.com/angad-r/Anantra.git
   cd Anantra
   npm install
   ```
   > **Windows PowerShell note:** If `npm` script execution is restricted on your machine, use `npm.cmd` (for example, `npm.cmd install`, `npm.cmd run dev`, `npm.cmd test`).
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Familiarize yourself with the key reference docs before coding:
   - [Project Overview](docs/PROJECT_OVERVIEW.md)
   - [Architecture Guide](docs/ARCHITECTURE.md)
   - [Scientific References](docs/SCIENTIFIC_REFERENCES.md)
   - [QA Report](docs/QA_REPORT.md)

---

## 2. Working Inside ANANTRA's Modular Architecture

ANANTRA uses a vertical **feature-folder architecture** inside `src/features/` so contributors can extend modules cleanly without unintended side effects:

| Task | Recommended Location |
| :--- | :--- |
| Update lesson topics, diagrams, brief copy, or task XP metadata | `src/features/<module-name>/*Data.ts` |
| Enhance or test interactive simulations or quizzes | `src/features/<module-name>/` (`*.tsx`, pure `.ts` helpers, `*.test.tsx`) |
| Customize certificate criteria, A4 PDF vector drawing, or local verification | `src/features/certificates/` (`certificateCatalog.ts`, `certificateService.ts`, `certificatePdf.ts`) |
| Update curated NASA citations or educational model disclosures | `src/features/references/ReferencesPage.tsx` & [docs/SCIENTIFIC_REFERENCES.md](docs/SCIENTIFIC_REFERENCES.md) |
| Reuse shared telemetry cards, pills, buttons, rings, or bars | `src/components/ui/` (`Card`, `Button`, `BadgePill`, `ProgressBar`, `OrbitalRing`) |
| Inspect onboarding validation or cadet specialization metadata | `src/features/onboarding/cadetProfileData.ts` |

### Strict Architectural & Safety Rules

1. **Zero PII & Zero Client Secrets:** Never add login forms, email/phone/address collection, analytics trackers, or client-side API keys (`VITE_*`). Keep core curriculum, simulations, certificates, and ARIA offline Q&A **100% browser-local** using schema-validated `localStorage`. Any optional cloud mentor key must stay strictly server-side inside [`api/mentor.ts`](api/mentor.ts).
2. **Respect Scientific Honesty & Brand Disclaimers:** Verify spaceflight claims against [NASA educational resources](docs/SCIENTIFIC_REFERENCES.md), label simplified simulation parameters openly, and preserve ANANTRA's disclaimer that neither simulations nor issued certificates represent official NASA products or accreditation.
3. **Preserve Reduced Motion, Print Isolation & Accessibility:** Wrap motion inside `<MotionConfig reducedMotion="user">`, keep print-only selectors aligned (`print:hidden` vs `.anantra-print-certificate`), maintain semantic landmarks and keyboard navigation (`Tab`, `Escape`), and keep high contrast against `#050914` (`space-void`) surfaces.
4. **Prevent Responsive Overflow:** Avoid rigid `shrink-0` or single-line `truncate` on multi-word badges inside narrow sidebars or mobile grids; pair `min-w-0` with clean flex/grid wrapping across `360px` mobile through `1920px` desktop.
5. **Keep Pure Logic Testable:** Place physics and credential logic in pure `.ts` helpers (`lunarPhysics.ts`, `zeroGravityPhysics.ts`, `certificateService.ts`, `progress.ts`) so Vitest tests run deterministically.

---

## 3. Code Quality Standards

- **Strict TypeScript (`tsconfig.app.json` + `api/mentor.ts`):** Zero `any`, zero unused locals/parameters, zero `@ts-ignore` suppressions.
- **No Debug Clutter:** Remove leftover `console.log` statements and temporary scratch artifacts before committing.
- **Existing Tests Stay Green:** Add or update unit/component tests alongside bug fixes or new module logic (`*.test.ts` / `*.test.tsx`).

---

## 4. Branch & Commit Style

Use descriptive branch names scoped cleanly to your task:

- `feat/certificate-batch-export`
- `fix/zero-gravity-wall-dock-guard`
- `docs/update-nasa-references`
- `test/moon-lander-edge-cases`

Write concise imperative commit messages summarizing **what** changed and **why**.

---

## 5. Pull Request Checklist

Before opening a pull request, run **all verification commands** and confirm they pass cleanly:

```bash
npm run typecheck
npm run typecheck:api
npm test
npm run build
```

*(On Windows PowerShell: use `npm.cmd` if needed.)*

Also verify:
- [ ] Desktop (`1440x900` / `1366x768`), tablet (`768x1024`), and mobile (`360x800` / `375x812`) views have `0px` horizontal overflow.
- [ ] Browser console and network logs have `0` runtime errors or React warnings.
- [ ] Any new documentation links or image paths resolve accurately inside the repository.
- [ ] Your PR fills out [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md).
