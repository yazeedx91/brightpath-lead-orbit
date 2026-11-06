# ProjectX full smoke, regression, stress and reliability test

Test first, fix only confirmed defects, retest. No new features, no redesign, no publishing, no real data or services.

## Phase 1 — Baseline audit
Read routes, store, engine, data, CSV, analytics and tests; check build log, typecheck, current test results, imports and dead controls. Write the baseline findings before changing anything.

## Phase 2 — Browser smoke tests (scenarios A–I)
One Playwright script per scenario, run against the live preview:
- A: dashboard, branding, DEMO MODE, sample campaign, metrics, sidebar.
- B: empty, invalid and valid campaign form; persists after navigating away and refreshing.
- C: 7 stages in order, progress, completion, Skip, repeated Run clicks (no duplicates).
- D: 12 unique records, scores 96/93/90/87/84/82/80/78/72/68/64/52, components add up, `.example` emails and sites, no "verified" claims.
- E: search by company, contact and title; each filter; sort both ways; clear; open profile and go back; approve, reject, save.
- F: outreach for 3 prospects (name, company and title correct), edit, save, revisit, copy.
- G: dashboard, campaign and analytics figures agree.
- H: CSV headers, 12 rows, no duplicates or empty columns, escaping.
- I: reset cancel, then confirm, then refresh.

## Phase 3 — Automated tests (existing Vitest + Testing Library, no new packages)
Add tests for: score thresholds at 100/75/74/60/59/0, component sums, campaign validation and creation, search, filter and sort, approve and reject, outreach draft create, edit and persist, analytics totals, CSV generation (including formula-injection values), reset, localStorage save and load, and malformed stored state. Small pure helpers may be pulled out of pages only where needed to make this testable.

## Phase 4 — Stress tests (temporary data only)
- A test-only generator makes 100, 500 and 1,000 synthetic prospects in memory. They never touch the 12-record dataset or saved data.
- Time the filter, sort, analytics and render work on each set.
- Browser loops: 50 searches, 50 filters, 50 sorts, 30 profile opens, 30 status changes, 20 navigation cycles each, 10 resets, 10 agent runs.
- Campaign isolation checks, plus refresh mid-run.
- Record real timings only.

## Phase 5 — Negative tests
Very long and special-character names, `<script>` text (must render as text), invalid employee counts, missing roles, empty search results, double clicks, malformed localStorage, spreadsheet formula values in CSV.

## Phase 6 — Visual checks
Screenshots of the 7 main pages at 1440x900, 1920x1080, 768x1024 and 390x844. Check sideways overflow, overlap, clipping and charts.

## Phase 7 — Security and data integrity
Search the code for keys and secrets. Log outbound requests (only fonts are expected), check console output, and confirm sending is impossible and wording says "simulated".

## Phase 8 — Three clean rehearsals
The 15-step sequence (including CSV export) run three times from a reset, with screenshots at key points.

## Phase 9 — Fix and report
For each defect: root cause, P0–P3 severity, smallest fix, retest the failing case, then rerun the full test suite and the affected browser scripts. The final report has a pass/fail table per phase, measured timings, defects and fixes, and remaining limitations.

## Technical notes
- Likely fix candidates, pending confirmation: CSV formula-injection guard (prefix `'` to cells starting with `= + - @`), and validating malformed localStorage in `DemoProvider` with a fallback to the canonical dataset.
- Browser scripts live under `/tmp/browser/full-qa`. Test files sit next to the existing `engine.test.ts`.
