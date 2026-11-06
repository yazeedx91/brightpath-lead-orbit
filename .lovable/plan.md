# ProjectX presenter briefing pack (no app changes)

A single document you can print or read on a second screen. Nothing in the app is touched: no code, data, reset or publishing.

## Deliverable
`ProjectX_Presenter_Briefing.docx` in your Files, also summarised in chat. Built only from what the app actually does today.

## Contents
1. **7-minute script:** timed sections (0:00–7:00) with the exact words to say, matched to the screens.
2. **Click-by-click sequence:** Reset → Overview → Start Guided Demo → sample campaign brief → Run AI Agent (7 stages, about 10 seconds) → qualified list → Leads with the Qualified filter (8) → PX-001 profile (30 + 20 + 18 + 28 = 96) → Approve → Generate Outreach → edit and save → Analytics → Export CSV (optional) → Overview. Includes a fallback for each step (Skip to results, Reset).
3. **Business value, concept architecture and workflow:** ideal-customer brief → discovery → enrichment → scoring → human approval → outreach. Includes a simple diagram.
4. **What is real vs simulated vs future:** a three-column table.
   - Real today: campaign form and checks, the scoring rules (30/20/20/30), lead review, editable drafts, CSV, analytics, saving in the browser.
   - Simulated: discovery, enrichment and AI wording (fixed fictional dataset and templates).
   - Future: real data sources, AI models, CRM and email integrations.
5. **Ten likely stakeholder questions** with accurate answers (data sources, AI model, accuracy, compliance under the Saudi data protection law (PDPL) and GDPR, cost, timeline, integrations, scale, ownership, differentiation).
6. **Prototype to production requirements:** data licensing, AI layer, backend and database, sign-in and roles, consent and compliance, email deliverability, monitoring, testing.
7. **Roadmap:** phases for MVP, integrations, AI capabilities, data sources, security, infrastructure and commercial readiness, with indicative durations clearly marked as estimates.
8. **Five questions to ask the stakeholder:** scope, success measures, responsibilities, IP and data ownership, commercial model.
9. **Closing statement:** confident, with no overpromising.

## Technical notes
Generate the DOCX with python-docx under /tmp, render it to images to check the layout, then copy it to /mnt/documents. No project files change.
