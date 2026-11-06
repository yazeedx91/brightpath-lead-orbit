# Final untested scenarios — targeted reliability test

Test only the items not covered in the last pass. Fix only confirmed defects, retest them, and leave the app in its clean original demo state. No new features, no dataset changes, no publishing.

## Tests (all in a real browser against the preview)
1. **Save and Reject:** on profile and table, check the status shows in the table, sidebar, dashboard and analytics, survives a refresh, and that double clicks do not double-count.
2. **Outreach for 3 prospects** (e.g. PX-001, PX-004, PX-009): generate, check name, company and title, edit with a unique marker, save, refresh, and confirm each draft stays with its own prospect with no cross-over.
3. **Repeated interactions:** 30 status changes, 10 confirmed resets, 10 agent runs with resets in between, repeated campaign navigation, repeated searches and filters. After each block, check campaign count, 12 unique prospects, 8/3/1 counts, and no stuck "running" state.
4. **Refresh during agent run:** refresh at stages 1, 2, 4, 5 and 7. The page must end either finished or able to run again, never stuck, never duplicated.
5. **Real Leads page with 100 / 500 / 1,000 prospects:** temporary saved data loaded into the browser only (copies pointing at the existing fictional companies). Time page render, search, sort and filter. Then reset back to the 12. Nothing is added to the code.
6. **Clipboard denied and fonts blocked:** Copy must show a clear message and the text must stay selectable. With Google Fonts blocked, pages must stay readable using fallback fonts (screenshot check).
7. **Final clean demo:** reset, then sample campaign, 12 prospects with original scores, 8/3/1, consistent dashboard, run agent, full journey, one draft, analytics and navigation.

## Likely fixes, only if a test confirms the problem
- Copy failure feedback (error toast plus "select the text manually" hint) if it is missing.
- Recovery for a campaign left in a "running" state after refresh, if one is found.
- Fallback font stack, if missing, using only system fonts.

## Report
Executed / passed / failed per test, issues, fixes, retest results, measured timings, limitations, and readiness. No claim of 100% reliability.

## Technical notes
- Scripts live in /tmp/browser/final-qa. Test 5 writes an expanded state to the `projectx-demo-v4` localStorage key, which Reset clears.
- Run the full Vitest suite after any fix. Add a unit test for any logic fix.
