# ProjectX – AI Lead Generation Agent (Demo Prototype)

A standalone, fully local demonstration for the Nov 7, 2026 stakeholder meeting. All data is synthetic, all "AI" is deterministic simulation, no login, no external services.

## Key assumptions
- Single fictional user: "Maya Chen, Head of Growth at Northwind Analytics" (fictional seller of a B2B data platform).
- No backend: state lives in memory (React context) with optional localStorage persistence so a demo survives a refresh; a "Reset demo" button restores the seed data.
- The "agent run" is a scripted, timed simulation (~20–30s) that can be sped up or skipped during the presentation.
- Outreach "Send" only marks a draft approved/queued — nothing leaves the app.
- English only, desktop-first (1280px+), usable down to tablet/mobile.

## 1. Application architecture
```text
App shell (sidebar + top bar)
 ├─ Demo data layer   seed JSON: ICPs, companies, contacts, campaigns, events
 ├─ Agent engine      deterministic pipeline: discover → identify → enrich → score → draft
 ├─ Scoring module    pure functions, explainable factor breakdown
 ├─ Draft generator   template + lead attributes → personalized email
 └─ State store       campaigns, leads, approvals, activity log (context + localStorage)
```
Seeded randomness (fixed seed) guarantees the same results on every run.

## 2. Pages and navigation
Left sidebar:
1. **Dashboard** `/` – KPIs (leads found, qualified, approved, reply rate), pipeline funnel, active campaigns, recent agent activity, "Leads awaiting approval".
2. **Campaigns** `/campaigns` – list; **New campaign** `/campaigns/new` – ICP wizard.
3. **Agent Activity** `/campaigns/$id/run` – live agent console.
4. **Leads** `/leads` – discovery & qualification table with filters.
5. **Lead profile** `/leads/$id` – company + person detail, score explanation, outreach.
6. **Outreach** `/outreach` – approval queue of drafts.
7. **Analytics** `/analytics` – campaign performance charts.
Top bar: campaign switcher, global search (local), "Reset demo".

## 3. Main user journey (demo script)
1. Dashboard overview of an existing campaign with results.
2. Create campaign: describe ICP in plain language (prefilled example) → agent "interprets" it into structured criteria (industry, size, region, titles, signals) the user can edit.
3. Launch → Agent Activity: step-by-step timeline with streaming log lines, counters (companies scanned → matched → contacts → qualified), and the agent's reasoning snippets.
4. Leads: ranked table, score badges, tiers (Hot / Warm / Cold), filters.
5. Lead profile: why this score (factor bars: fit, intent signals, seniority, timing), enriched data, buying signals.
6. Outreach: personalized draft referencing signals; edit, regenerate tone variant, approve or reject.
7. Analytics: funnel, score distribution, simulated replies/meetings over time, by-industry breakdown.

## 4. Synthetic data structure
- **ICP**: industries[], employeeRange, regions[], titles[], seniority[], signals[], exclusions[].
- **Company** (~120): id, name, domain (.example), industry, employees, revenueBand, hq, techStack[], fundingStage, signals[] (hiring, funding, expansion, new exec), description.
- **Contact** (~250): id, companyId, name, title, seniority, department, tenureMonths, email (fictional), linkedinStyleSummary.
- **Lead**: contactId, campaignId, score 0–100, tier, factors[{label, weight, value, reason}], status (new / qualified / approved / rejected / contacted / replied / meeting).
- **OutreachDraft**: leadId, subject, body, tone, personalizationPoints[], status.
- **Campaign**: id, name, icp, createdAt, status, metrics, dailySeries[].
- **AgentEvent**: campaignId, step, timestamp, message, payload.

## 5. Core interaction design
- Agent console: progress stepper, pause/resume, speed (1x/4x/skip), live counters, expandable reasoning cards.
- Leads table: sort, filter by tier/industry/status, bulk approve, row click to profile side panel or full page.
- Explainable score: stacked factor bars with plain-language reasons; "what would raise this score".
- Drafts: inline edit, tone switch (formal / concise / friendly), regenerate (deterministic variants), approve/reject with toasts.
- Empty, loading-skeleton, and confirmation states throughout.

## 6. Visual direction
White and light-gray surfaces, deep navy text, restrained indigo accent, one display + one text font (e.g. Instrument Sans / IBM Plex Sans style, not Inter), thin borders, generous spacing, Recharts-based charts in the accent palette, minimal motion (only for agent progress).

## 7. Implementation phases
1. Design tokens, app shell, sidebar, routes with titles/meta, seed data + scoring + draft generator.
2. Dashboard and Leads table + Lead profile.
3. Campaign wizard + Agent Activity simulation.
4. Outreach approval queue + Analytics charts.
5. Polish: responsiveness, reset demo, empty states, tests, demo walkthrough.

## 8. Testing and acceptance criteria
- Unit tests: scoring is deterministic and within 0–100; tier thresholds (e.g. Hot ≥ 80, Warm 60–79, Cold < 60); ICP exclusions remove matching companies; draft includes the lead's name, company and at least one signal.
- Browser checks: full journey (create campaign → run → approve a draft → see analytics update) works without errors.
- Acceptance: no network calls to external services; no login; every page has unique title; reset restores seed; layout holds at 1280px and 390px; full demo runs in under 5 minutes.

## Technical details
TanStack Start routes per page above, React context store with localStorage, pure TS modules for engine/scoring/drafts under `src/lib/demo/`, shadcn UI components, Recharts, Vitest for logic tests. No Lovable Cloud.
