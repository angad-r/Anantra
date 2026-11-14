# Security & Privacy Policy — ANANTRA

## 1. Security-by-Design & Child Safety Architecture

**ANANTRA — Junior Astronaut Mission Trainer** is engineered as a **privacy-first educational web application** designed for young learners, classrooms, and NASA Space Apps Challenge reviewers:

- **Zero Mandatory Backend & Zero Database:** Core lessons, physics simulations (`lunarPhysics.ts`, `zeroGravityPhysics.ts`), certificate generation (`certificateService.ts`, `certificatePdf.ts`), and the offline mentor **ARIA** (`mentorKnowledgeBase.ts`) execute **100% locally in your browser** with no remote account system, session cookies, or database.
- **Zero PII Collection:** Cadet onboarding intentionally limits inputs to a non-identifying first name (`2–24` letters, spaces, hyphens, or apostrophes), a public-style Astronaut Callsign (`2–16` uppercase characters), specialization choice, and optional age bracket, SVG avatar preset, and target space destination (`src/features/onboarding/cadetProfileData.ts`).
  - `validateCadetIdentity()` explicitly detects and blocks `@` characters so learners do **not** enter email addresses into identity fields.
  - Learners on `/profile` may optionally specify a certificate display name (`fullName`, `<= 60` characters) purely for exported A4 PDF certificates—stored strictly in local browser storage and never transmitted.
  - No email, phone number, home address, birth date, password, or geolocation permission is ever requested.
- **Zero Client-Side Secrets:** Browser bundles (`dist/`) contain zero API keys or secret tokens. When deployed on Vercel, the optional serverless endpoint [`api/mentor.ts`](api/mentor.ts) reads `GEMINI_API_KEY` or `OPENAI_API_KEY` strictly server-side (`process.env`) with sanitized, bounded prompts (`<= 600` chars) and automatically falls back to ARIA's deterministic offline mode (`HTTP 503` -> client fallback) when unconfigured.

---

## 2. Browser Storage, Certificates & Fault Resilience

ANANTRA persists state locally using two schema-validated `localStorage` stores:

| Key | Source File | Purpose & Validation |
| :--- | :--- | :--- |
| `anantra.cadet.profile.v1` | `src/utils/cadetProfileStorage.ts` | Schema-checked via `isValidCadetProfile()` against finite allow-lists for `specialization`, `avatarId`, `ageGroup`, and `favoriteDestination`, plus optional bounded `fullName`. |
| `anantra.training.state.v1` | `src/utils/storage.ts` | Schema-checked via `isValidTrainingState()` + `normalizeTrainingState()` across all 6 `ModuleId` keys, task completion IDs, simulator `moduleRecords`, `activityHistory`, and `issuedCertificates`. |

### Storage & Certificate Integrity Notes

- **Fault Recovery:** Both storage adapters wrap `JSON.parse()` and `window.localStorage.setItem()` in `try/catch` blocks so damaged JSON, private-browsing locks, or `QuotaExceededError` conditions surface safe, user-recoverable UI banners (`ErrorState`) without crashing the React tree (`AppErrorBoundary`).
- **Mastery-Gated Certificates:** Earned certificates require both completed module checklist steps and verified simulation/quiz mastery (`evaluateCertificateEligibility()`). Editing a profile name never silently alters previously issued certificate snapshots unless the user explicitly clicks **Reissue** (which preserves old IDs in `supersededIds`).
- **Transparent Local Verification:** Certificate lookup (`/certificates/verify`) checks `localStorage` records on the current browser and clearly states that certificates are local educational achievement records—not cryptographically signed or backed by a remote NASA accreditation server.

---

## 3. Third-Party Requests & Supply Chain Hygiene

- **Typography:** `index.html` loads `Inter`, `Space Grotesk`, and `JetBrains Mono` from `https://fonts.googleapis.com` with `<meta name="referrer" content="no-referrer" />`. Offline or behind strict school firewalls, the app falls back seamlessly to local sans/monospace fonts.
- **Vector PDF Export:** Certificate PDF generation dynamically lazy-loads `jspdf` strictly client-side when a cadet requests a PDF download; no document contents leave the user's device.
- **No Unsanitized HTML Injection:** No `dangerouslySetInnerHTML`, `eval()`, `new Function()`, or dynamic script injection is used anywhere in `src/` or `api/`.
- **Supply Chain Hygiene:** `npm audit --omit=dev` is verified at **0 known vulnerabilities** across production runtime dependencies (`package-lock.json`).

---

## 4. Hosting Recommendations (Deployment)

When hosting ANANTRA on Vercel, Netlify, or an institutional web server:

- Configure standard HTTP security headers (`X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `X-Frame-Options: SAMEORIGIN`).
- Never prefix private keys with `VITE_` in `.env` or deployment settings; keep `GEMINI_API_KEY` / `OPENAI_API_KEY` strictly as server-only runtime variables if enabling optional `/api/mentor` cloud Q&A.

---

## 5. Reporting a Vulnerability

If you discover a security concern, XSS vector, privacy bug, or unsafe dependency in ANANTRA:

1. **Do not publish exploit details** in a public GitHub Issue before maintainers can investigate.
2. Reach out privately to the repository maintainer via GitHub security reporting (Security tab / private vulnerability advisory once enabled) or direct maintainer contact associated with the repository commit history.
3. Include clear reproduction steps, affected file path(s), and any suggested remediation patch.
4. For non-sensitive bug reports unrelated to security or child privacy, use the standard [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md).
