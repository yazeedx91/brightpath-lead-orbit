# ProjectX – Full Application Interface (v2)

Upgrade the current demo to match the new specification. It stays 100% local: synthetic data, deterministic logic, no backend, no login, nothing sent.

## Key assumptions
- The existing look stays as it is (navy sidebar, white surfaces, indigo accent, current fonts).
- Leads get two separate labels:
  - **Qualification** (set by the agent's score): Qualified (score 70 or more), Needs review (50–69), Not qualified (below 50).
  - **Review** (set by the user): Pending, Approved, Rejected, Saved.
- The Saudi Logistics campaign is the preloaded sample. It is marked "DEMO – editable sample scenario", not a real customer. The data gets a dedicated set of fictional Saudi logistics companies in Riyadh, Jeddah and Dammam, so the sample produces convincing results.
- The other fictional companies stay (more countries, cities and industries), so other campaigns also work.
- "Run Guided Demo" loads the Saudi sample, fills in the form, starts the agent, and shows a small step guide (Create, Run, Review leads, Outreach, Analytics) with Next buttons.
- "Current campaign status" in the top bar shows the active campaign and its state: Draft, Running, or Complete.

## Layout
- **Sidebar:** Overview, Campaigns, Create Campaign, Leads, Outreach, Analytics. The Agent Activity page opens from campaigns and from the guided demo; it is not a sidebar item. The sidebar collapses to icons, and becomes a slide-out menu on small screens.
- **Top bar:** ProjectX logo and name, a "Demo Mode" badge, the current campaign's status, and a Reset Demo button.

## Pages
1. **Overview (dashboard)**
   - Welcome heading and a short product description.
   - Start New Campaign and Run Guided Demo buttons.
   - Four numbers: discovered prospects, qualified, requiring review, drafts generated.
   - Recent campaign activity (from the agent's activity log).
   - Performance summary: a small funnel and reply/approval rates.
   - Sample campaign card with a DEMO label.
2. **Campaigns:** a list of campaigns with their status, plus buttons to open, edit, run, or view activity.
3. **Create Campaign**
   - Form fields: name, target industry, country, cities/regions (multi-select), company size, employee range, annual revenue range, target positions (chips, with custom entries), ideal customer profile, product or service being promoted, and objective.
   - Prefilled with the Saudi Logistics sample, plus a "Load sample" and a "Clear" button.
   - **Save Campaign** saves it as a draft. **Run AI Agent** saves it and opens Agent Activity. Missing required fields show an error.
4. **Agent Activity**
   - 8 stages: Understanding requirements, Discovering companies, Identifying decision-makers, Enriching information, Evaluating relevance, Calculating scores, Preparing qualified leads, Generating outreach drafts.
   - Shows an overall progress bar, a "current activity" card with live detail, the list of completed stages, a timestamped activity timeline, and live counters for discovered and qualified prospects.
   - Pause, 1x/4x speed, and skip buttons.
   - A "Simulated demonstration" label stays visible.
5. **Leads**
   - Table columns: Company, Contact, Job title, Industry, Location, Company size, Lead score, Qualification, Review status.
   - Search, filters (qualification, review status, campaign), and sorting by score or other columns.
   - Row actions: Approve, Reject, Save, Open. The same actions are available in bulk, with confirmation messages.
6. **Lead Profile**
   - Company overview, decision-maker card, size, industry, location, fictional website and email.
   - Lead score with a factor breakdown and the qualification explanation.
   - Reasons for selection (bullets built from the actual matches).
   - Recommended next action, driven by the rules: e.g. "Approve and send a personalised intro" for a Qualified lead, or "Hold for 30 days" when its signals are weak.
   - Approve/Reject/Save buttons and an "Open in Outreach" link.
7. **Outreach**
   - Prospect picker (searchable; approved and saved leads appear first).
   - "Generate draft" with a tone choice and variations.
   - Editable subject and message, Save Draft (shows a saved time), and Copy to clipboard.
   - A list of saved drafts. A banner states that messages are never sent.
8. **Analytics**
   - Total discovered, qualified %, qualification breakdown (donut chart), campaign funnel, lead score distribution, drafts created, and approval statistics (approved/rejected/saved/pending).
   - Filter by campaign. All numbers come from the same live app state.

## Technical details
- **Data:** each company gets a country and city, and the industry list adds "Logistics and Supply Chain". Each company also gets a revenue band, a fictional `.example` website, and a fictional email for each contact. About 40 seeded Saudi logistics companies are added. Contacts get positions such as Fleet Manager and Supply Chain Director.
- **Campaign type:** name, industry, country, cities, sizeLabel, employeeMin/Max, revenueMin/Max, positions, icp, offering, objective, status (draft/running/complete), and stats.
- **Lead type:** score, factors, qualification (worked out from the score), review status, savedDraft. A pure `nextAction(lead)` helper picks the recommended next action.
- **Scoring weights:** industry, location (country plus city), size and revenue fit, position match, signals, and timing. Each factor comes with its reason text.
- **Drafts:** `generateDraft` mentions the offering, objective, city and position. Drafts are stored per lead in the app's saved state. Copy uses the browser clipboard.
- **Guided demo:** a small state in the app store (current step) and a floating step card shown across pages.
- **Saved data:** the saved-data key changes to v3 so earlier saved data doesn't clash. Reset restores the seed (the Saudi sample, run and complete, plus one draft campaign).
- **Pages:** `/` overview, `/campaigns`, `/campaigns/new`, `/campaigns/$id/edit`, `/campaigns/$id/run`, `/leads`, `/leads/$id`, `/outreach` (accepts an optional lead in the link), `/analytics`. The old `/activity` page is removed. Each page gets its own title and description.
- **Tests:** update `engine.test.ts`:
  - qualification thresholds (70/50);
  - the Saudi sample yields only Logistics companies in Riyadh/Jeddah/Dammam with 50–500 employees ranked above the rest;
  - deterministic scores;
  - the draft includes the contact's name, company, city and offering;
  - the next action for each qualification.
- **Check:** a browser run of the guided demo from start to finish: create, run, approve a lead, save and copy a draft, then confirm the numbers in Analytics.
