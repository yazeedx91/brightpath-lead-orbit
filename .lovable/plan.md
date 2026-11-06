# Presentation polish and 5-step guided demo

No new features. Every existing button, table action, editor and run flow stays as is; only layout, styling and the guide change.

## Review findings (from screenshots of the current app)
- Overview: only two actions are visible at the top. The six figure cards have uneven heights, labels wrap onto two lines, and icons sit in different places.
- Leads table: at laptop width the Review and Actions columns are cut off. Names, titles and locations wrap onto three lines, and the "SYNTHETIC" tag repeats on every row.
- Sidebar: the "11" beside Leads has no label, so it reads like an error count.
- Lead profile: the score card and next-action card have mismatched heights, and the long fictional email wraps mid-word.
- Analytics: the qualification ring renders with a gap and still animates; the figure cards share the Overview card problems.
- Status pills (Qualified, Pending, Complete, Demo) use slightly different shapes and sizes across pages.

## 1. Overview: demo launch strip
- Under the welcome heading, show one row of four equal action cards: **Start Guided Demo**, **Create Campaign**, **Run AI Agent** (runs the sample campaign and opens its activity) and **View Qualified Leads** (opens Leads filtered to Qualified).
- Figure cards get a single height, one-line labels, the icon top-right, and the value and caption aligned the same way. Same treatment on Analytics.

## 2. Consistent visual language
- One shared status pill style (same height, radius, weight) for qualification, review and campaign status. One score badge style reused in the table, the run results and the profile.
- Buttons: primary for the main action per area, outline for secondary, ghost for tertiary; consistent icon size and spacing.
- Typography: one heading scale for page titles, panel titles and labels; tabular numbers for every figure.
- Sidebar: group items under "Workspace", label the Leads count as pending reviews (a tooltip plus a muted pill), and keep the active state clear.

## 3. Leads table
- Fit at 1280px without horizontal scrolling: merge Company + ID into one cell and Contact + title into another, show the city only, put size on one line, and remove the per-row Synthetic tag (one "Synthetic Demo Dataset" note above the table instead).
- Right-align numbers, use consistent row height, and keep row actions always visible.

## 4. Lead profile, outreach, modals, charts
- Profile: equal-height score and next-action cards, and the score ring shows its qualification band. Emails break cleanly at "@".
- Outreach editor (Outreach page and profile panel): labelled Subject/Body fields, a footer toolbar with Saved state on the left and actions on the right, and the "Not sent" note shown as a muted badge.
- Reset confirmation and other dialogs: consistent title/description/button order, with the destructive style on Reset.
- Charts: fix the ring gap, turn off chart entry animations, and use the same chart colours and legend format across Analytics.

## 5. Guided demo: 5 steps
Replace the current 6-step guide with exactly:
1. Create a campaign: opens the sample campaign brief.
2. Launch the agent: starts the run and opens Agent Activity.
3. Discover prospects: opens Leads for the sample campaign.
4. Qualify leads: opens the top prospect's profile and score breakdown.
5. Generate outreach: opens Outreach for that prospect.

The guide is a small card in the corner with Back, Next/Finish, Exit (X) and 5 progress dots. It is optional, starts only from "Start Guided Demo", and moving Back never re-runs the agent.

## Technical notes
- Changes stay in `ui.tsx` (shared pill/score/stat components), `AppShell.tsx`, `GuidedDemo.tsx`, the route files, and `src/styles.css` tokens. No changes to `engine.ts` or the dataset.
- Recharts: `isAnimationActive={false}`, with the ring gap fixed through `paddingAngle`/stroke.
- Verify afterwards with screenshots at 1280 and 1062 widths, a full guide walkthrough (forward, back, exit), the approve/save/generate flow, and the existing tests.
