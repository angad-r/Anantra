## Summary
Briefly explain what changed and why.

## Type of Change
- [ ] Bug fix
- [ ] Curriculum / simulation enhancement
- [ ] Responsive / accessibility improvement
- [ ] Tests or documentation update

## Verification Completed
Please run these checks locally before submitting (use `npm.cmd` in Windows PowerShell if needed):
- [ ] `npm run typecheck` and `npm run typecheck:api` passed (`0` errors)
- [ ] `npm test` passed (`vitest run`)
- [ ] `npm run build` passed (`0` errors / clean bundle output)
- [ ] Checked responsive layout on desktop (`1440x900` / `1366x768`), tablet (`768x1024`), and mobile (`360x800` / `375x812`) with zero unintended horizontal overflow

## Safety, Privacy & Scientific Checklist
- [ ] Confirmed **zero** secrets, analytics scripts, or PII inputs were introduced in client code (any optional AI provider keys stay strictly server-side in `api/`)
- [ ] Confirmed browser `localStorage` changes remain schema-validated and backwards-safe
- [ ] Verified new educational facts against reliable NASA educational sources where applicable

## Screenshots / Notes (if UI changed)
Attach before/after screenshots or test logs if visual layout changed.
