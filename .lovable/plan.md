# End-to-end demonstration: close the remaining gaps

Most of the requested behaviour already works (timed run with Skip, search/filter/sort, approve/reject/save, outreach edit/save/copy, campaign create/edit, localStorage, confirmed Reset). This plan aligns the remaining pieces with the brief.

## 1. Run AI Agent sequence
- Replace the 8 stages with exactly the 7 requested labels:
  Validating campaign profile → Discovering 12 synthetic companies → Identifying 12 fictional decision-makers → Completing simulated enrichment → Evaluating qualification criteria → Calculating lead scores → Compiling the final prospect list.
  (Counts come from the campaign's actual prospect count, so custom campaigns stay accurate.)
- Fold the "drafts prepared" log lines into the final stage.
- Shorten transitions (about 0.5s per log line, about 10s total); keep progress bar, logs, Pause and Skip to Results.
- On completion, show the qualified prospect list inline on the run page (name, company, title, score, status, link to profile), plus "Review all leads".

## 2. Prospect profile: Generate Outreach in place
- On a Qualified (or Review) prospect's profile, add a "Generate Outreach" button that builds the draft right there using name, company, title, industry, synthetic company context and the fictional offering.
- Editable subject/body with Save draft and Copy draft; a clear "Not sent: demo only" note. Shares the same saved drafts as the Outreach page.

## 3. Campaign results reopening
- On the Campaigns list, each completed campaign gets a "View results" action that opens its run page in the finished state (no re-animation), with "Run again" available.

## 4. Live figures
- Confirm Overview and Analytics recount approved/rejected/saved/drafts from current state after every action; fix any figure that is computed from the seed instead.

## Technical notes
- Stage changes in `campaigns.$id.run.tsx`; finished-state view reused for "View results".
- Draft generation reuses `generateDraft` from `engine.ts` and `buildDraft`/`saveDraft` from the store; no new data.
- Add an engine test asserting the sample run still yields 12 / 8 Qualified / 3 Review / 1 Low Fit and 8 drafts, and that two runs produce identical results.
- Browser check: run sample campaign, skip, approve a lead, generate and save outreach from profile, refresh, confirm persistence, then Reset.
