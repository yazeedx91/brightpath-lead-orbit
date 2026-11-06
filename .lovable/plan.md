# QA pass: full demo journey, CSV export, fixes, report

## Known gap before testing
- There is no CSV export yet, but the scenario requires one. Add an "Export CSV" button on the Leads page that downloads the prospects currently shown (respecting search, filters and sort) as `projectx-synthetic-prospects.csv`. Columns: Prospect ID, Company, Contact, Title, Industry, City, Country, Employees, Score, Qualification, Review status, Email (fictional), Website (fictional), Source. The file is built in the browser; nothing is sent anywhere. Add a test for the CSV builder (header row, 12 rows for the sample, quoting of commas/quotes).

## Scripted browser run (real preview, 1440 x 900)
Run each step with Playwright, take a screenshot per step, and record console errors, page errors, failed requests and any request to a non-localhost host.
1. Open Overview; record the figures.
2. Click Create Campaign; confirm the form loads, validation blocks an empty submit, and a filled form saves.
3. Open the Saudi Logistics Prospecting campaign brief.
4. Run AI Agent; watch all 7 stages advance and reach completion without skipping (a second run uses Skip to Results).
5. Open discovered prospects; confirm 12 rows with IDs PX-001 to PX-012.
6. Filter to Qualified (8 rows), sort by score (descending, then ascending).
7. Open the top prospect (PX-001, score 96); confirm the score breakdown sums correctly and the explanation is visible.
8. Approve; confirm the status, the sidebar count and the Overview/Analytics approval figures change.
9. Open Outreach; generate, edit, save and copy a draft (clipboard read back); confirm it persists after a refresh.
10. Review Analytics; cross-check its figures against Overview and Leads.
11. Export CSV; confirm the download, row count and fields.
12. Reset (Cancel first, then Confirm); confirm the original campaign, 12 prospects, 0 approvals and 0 saved drafts.
13. Repeat the whole journey a second time to prove it is repeatable.

## Technical sweep
- Visit every sidebar and in-page link and every route (including unknown URLs and missing prospect/campaign IDs); confirm no blank screens and that the 404 page works.
- Confirm there are no full page reloads during in-app navigation (a window marker survives).
- Confirm no external requests apart from Google Fonts, and no email sending (no mail or network calls on Save/Copy).
- Confirm all data uses `.example` domains and fictional names.
- Check localStorage contents before and after reset.
- Mobile at 390 x 844: menu opens, Leads, Profile and Outreach are usable, and the guide card fits.

## Fixes
Fix any problem the run confirms, re-run the affected steps, and add tests for rule-level issues.

## Report
A concise list of features tested (with pass/fail as observed), problems found and fixed, remaining limitations, and an overall pass/fail verdict. Nothing is reported as passed unless it was executed.
