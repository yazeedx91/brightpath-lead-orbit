# Final stakeholder-readiness check (Nov 7 presentation)

No rebuild, no new features, no publishing. Only fixes to issues actually found.

## 1. Stakeholder walkthrough
Open every page fresh at your screen size (1062x676) and at 1440x900, take screenshots, and judge: clear purpose, credible look, campaign form, agent run, score explanation, leads, outreach, business value. Note confusing elements.

## 2. Three rehearsals (scripted in a real browser)
Run the 14-step journey three times in a row: open, Reset, Start Guided Demo, open sample campaign, run agent to completion, review qualified prospects, open PX-001, check score "30 + 20 + 18 + 28 = 96", approve, generate outreach, edit + save, analytics, back to dashboard. Each run checks: 12 prospects, 8 Qualified / 3 Review / 1 Low Fit, counts match between dashboard, leads and analytics, campaign status consistent, saved draft survives refresh, reset restores clean state, zero console errors.

## 3. Risk sweep
Every button and link, unknown URLs, load timing, animations, empty screens, mobile (390px) and your laptop size.

## 4. Clean opening state
Confirm the dashboard shows: ProjectX branding, a visible DEMO MODE label, a short product description, exactly one ready sample campaign, Start Guided Demo and Create Campaign buttons. Add the DEMO MODE label or description text only if missing.

## 5. Final report
Readiness verdict, results of the three runs, issues found, fixes made, remaining limitations, a timed 7-minute presentation script, and a clear ready / not-ready statement. Only tests actually run will be reported as passed.

## Technical notes
- Playwright scripts under /tmp/browser; run existing vitest suite after any fix.
- Fixes limited to presentation/copy and bugs; data and scoring engine untouched.
