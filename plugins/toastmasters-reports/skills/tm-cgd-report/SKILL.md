---
name: tm-cgd-report
description: Build a Toastmasters-branded Club Growth Director report (slide deck by default, web page on request) on a district's growth KPIs - net club growth, membership payments, new clubs, club retention, clubs to rescue, Club Coaches and 20-plus clubs - from Toastmasters dashboard data (My Toastmasters Dashboards MCP server). Use for a CGD report, club growth update, or district growth slides.
---

# Toastmasters Club Growth Director report

Produce a branded report for a district's Club Growth Director (CGD) to use with the District
Director, the district executive committee and the CGD's own teams. Default output is a slide
deck; add a web page when the user asks for one. All data comes from the Toastmasters dashboard
MCP server: the "My Toastmasters Dashboards" connector on claude.ai, or the `toastmasters` server
this plugin installs in Claude Code.

## What the role is accountable for

Toastmasters International describes the CGD as responsible for all aspects of marketing,
club building, and member and club retention in the district: the district marketing plan, new
club development, club rescue for struggling clubs, recruiting and supporting Club Coaches and
club sponsors, analysing markets for growth, and reporting growth progress with numbers. Build
the report around the KPIs that follow from that:

| KPI | Measure | Where it comes from |
| --- | --- | --- |
| Net club growth | Paid clubs against the paid club base | Distinguished District requirement |
| Membership payments growth | Payments against last year's payments | Distinguished District requirement |
| New clubs chartered | Charters in each award window | District Club Growth Achievement, President's Extension Award |
| Club retention | Paid clubs as a share of the paid club base | District Club Retention Award (90%+ all year) |
| Clubs to rescue | Ineligible, Low or Suspended clubs, and clubs under 8 members | Club rescue, good standing |
| Club Coach pipeline | Clubs with 12 or fewer members (coach eligible) | Club Coach program |
| 20-plus clubs | Share of clubs with 20 or more paid members | President's 20-Plus Award |
| New members | New members this year and last month | Membership building |

### Distinguished District growth targets

From the District Recognition Program (Item 1490, Rev. 07/2026, for 2026–2027). Toastmasters can
change these each year: if the program year isn't 2026–2027, check the current Item 1490 and say
which version you used.

| Level | Net club growth | Membership payments growth |
| --- | --- | --- |
| Distinguished | 1% | 1% |
| Select Distinguished | 3% | 3% |
| President's Distinguished | 5% | 5% |
| Smedley Distinguished | 8% | 8% |

Growth is measured against the club base (paid clubs at 1 July) and last year's payments; goals
round up to the next whole number, and losses must be recovered first. Distinguished District
also needs a share of Distinguished clubs, but that measure belongs to the Program Quality
Director (`tm-pqd-report`): leave Distinguished clubs out of this report, slides and notes alike.

District Club Growth Achievement windows: 3 or 5 new clubs chartered 1 Jul – 30 Sep; 3, 5 or 10
new clubs chartered 1 Oct – 31 Mar. Count gross charters by charter date.

## Inputs

- **District** (required). Ask if missing.
- **Fiscal year** (optional, `YYYY-YYYY`). Default is the current one.
- **Presenter** (optional). Without it, put "[Club Growth Director name]" on the cover.
- **Membership payments** (optional). The dashboard has paid members, not the payments count
  Toastmasters uses for the payments goal. If the user gives the year-to-date payments and the
  payments base (from the Toastmasters District Performance report), use them; otherwise use
  members against the member base as a proxy and label it "proxy" everywhere it appears.
- **Charters this year** (optional). If the user has the official District Club Growth report,
  use its charter count for each window.
- **District Success Plan and budget** (optional documents). See below.
- **Format** (optional). Default: deck only.

## Ask the presenter

Before building, ask the person making the report these questions, all in one message (in Claude
Code, one AskUserQuestion call with free-text answers). Say that each is optional and that
anything left blank shows as a "[bracketed]" placeholder they can fill in later. Use the answers
on the "Growth plan" slide, and the payments figures on the targets slide.

1. Your name and role for the cover.
2. Clubs in development: prospects, sponsors and demo meeting dates.
3. Club Coaches: which coach-eligible clubs already have one?
4. Marketing: open houses, campaigns or partners planned before the April renewals.
5. Membership payments: year-to-date payments and the payments base from the District
   Performance report (otherwise the report uses paid members as a proxy).
6. Charters: the official District Club Growth report's count for each window, if you have it.
7. District Success Plan and approved budget: attach them if you have them (optional).

If nobody can answer (a scheduled run), build with placeholders and say so.

## District Success Plan and budget (optional documents)

The user may attach the district's **District Success Plan** and its **approved budget** (usually
PDFs). Both are optional: without them, build the report from the dashboard as usual and leave
their slides out. They may be confidential, so use their figures only in the report you build:
never write them, or the documents, into a repository, a skill or shared memory.

From the **District Success Plan**:

- Use its official starting numbers (club base, membership payments base) and its targets for
  each level instead of computing them from the dashboard. If they differ (for example, the
  dashboard's club base counts a placeholder division), use the plan's and say why in the notes.
- Use last year's closing figures from the plan as context (paid clubs, payments, Distinguished
  clubs by level).
- Take the presenter's name and role from its team list when the user hasn't given one.
- For each action the plan gives this role (or a goal it owns), show the owner and end date from
  the plan and, beside it, where the dashboard puts it today. For the Club Growth Director, that is the membership payments and club growth goals: retention and coaching, recruitment and renewals, new and corporate clubs.
- Flag anything in the plan that doesn't add up as "check": a name spelled two ways, blank
  monthly milestones, a qualifying form with zero leaders. Don't correct the plan.

From the **budget**:

- Check its fiscal year. If it isn't the report's year, label every figure with its year and ask
  the user for the current approved budget.
- Show the lines this role spends: club growth, marketing outside Toastmasters and public relations where the CGD shares it. Give each line's amount, its share of the
  membership dues allocation and the policy limit the budget states. Compute only those shares.
- Spend to date isn't in the budget or the dashboard: show "[From the Finance Manager]".
- Note any phasing the budget gives (months a line is spent in) where it affects what to do now.

With these documents, add two slides before the presenter's-answers slide: "Success Plan | club growth actions" (action, owner, by, dashboard now) and
"Budget | club growth and marketing" (line, amount, share of dues, policy, spent to date). Pre-fill the presenter's answers with what the documents already say (owners,
budgeted amounts) and keep "[bracketed]" for what they don't.

## 1. Gather the data

Find the dashboard tools first (load them with ToolSearch if they are deferred). If none exist,
stop and tell the user to connect the server (see the tm-skills README). Then call:

1. `get_data_freshness(district)`: the snapshot date, shown as "data as of" everywhere.
2. Read `toastmasters://rules/dcp` for good standing, renewals and the club Distinguished rules.
3. `get_district(district)`: divisions, club base, paid clubs, members, `month_change`
   (including `clubs_added` and `clubs_removed`).
4. `get_area` for every area of every lettered division, in parallel, for club-level status,
   members, outlook and `needs` (`club_coach`, `club_success_plan`). In a client that can delegate,
   hand this to a helper that writes one row per club to a file.
5. `get_club` for each club in `clubs_added`, for its charter date and Club Success Plan deadline.

### Data hygiene (flag, never hide or "fix")

- The club base is the sum of division `club_base`; a placeholder division (such as `0D`) holds
  clubs not yet placed. Include its clubs in district totals and name them in data notes.
- `active_members` is paid members, not payments. Say "proxy" for any payments figure built
  from it.
- A new club can show one division in `get_club` and another in `month_change`: report what
  each says.
- Members are removed for non-payment only in October and April. A drop in another month is a
  report glitch or a transfer: flag it as "check".
- Charters found from `clubs_added` cover only the months the dashboard compares. Say that the
  official District Club Growth report is the count of record.

## 2. Work out the story

- **Snapshot**: paid clubs against the club base (net and %), members against the member base,
  new members this year (and last month), new clubs chartered this year, unpaid clubs, and the
  share of clubs with 20+ members.
- **Where we are in the year**: fiscal month m of 12 (`fiscal_month`; July is 1) and what it
  means for growth. Done: the Jul–Sep charter window, October renewals. Now: the Oct–Mar charter
  window, Club Success Plans due, clubs to rescue. Next: the end of the Oct–Mar window (31 March),
  April renewals (1 April, when unpaid members are removed), year end (30 June). Move items between
  columns as the month changes.
- **Growth targets**, a table: rows Net club growth, Paid clubs still needed, Membership payments
  growth (or proxy), Payments still needed, Club retention; columns Now, Distinguished, Select,
  President's, Smedley, each target as a count (round up) and %. No Distinguished clubs row.
- **New clubs**: charters in each District Club Growth Achievement window against 3 / 5 / 10,
  each new club's name, charter date and Club Success Plan deadline, and how many charters the
  open window still needs.
- **Clubs to rescue**: every Ineligible, Low or Suspended club and every club under 8 members,
  with division and area, paid members, members needed for good standing (8, 3 renewing) and the
  outlook's first reason. Order by members needed. The deadline is April renewals (1 April).
- **Club Coach pipeline**: clubs with 12 or fewer members or `needs.club_coach`, with members and
  outlook. Ask whether a coach is assigned; the dashboard doesn't know.
- **Retention by division**: paid clubs / club base and members / member base per division, and
  the district's paid share against the 90% Club Retention Award line.
- **20-plus clubs**: share of paid clubs with 20+ members, by division, and the clubs at 17–19
  members that one recruiting push would lift over the line.
- **Action list**, ordered by deadline, each naming clubs or divisions:
  1. Club Success Plans due for new clubs (90 days from charter).
  2. Charters needed before 31 March for the next Club Growth Achievement level.
  3. Clubs to rescue before April renewals (1 April).
  4. Club Coaches for the coach-eligible clubs.
  5. Divisions furthest below their member base.
- **Growth plan**: the presenter's answers to the questions above.
- **Asks**: three numbers with deadlines from the top of the action list.

## 3. Build the deck

Start from the Artifact **Slides** type, 16:9, titled "District <n> club growth – <Month YYYY>",
in the report style below. Eleven slides (thirteen with the Success Plan and budget slides), no
closing "Questions?" slide:

1. **Cover**: eyebrow "DISTRICT <n> · CLUB GROWTH", title "Club Growth Report", subtitle
   "Prepared for the Club Growth Director", presenter, "Programme year · fiscal month m of 12
   (<Month>) · data as of <date>", tagline.
2. **District <n> | club growth snapshot**: 3×2 stat grid and a "Growth signal:" line.
3. **Club growth | where we are in the year**: the year strip and Done / Now / Next.
4. **Club growth targets | Distinguished District**: the table.
5. **New clubs and the Club Growth Achievement**: the two windows as big numbers against their
   levels, then each new club with charter date and Club Success Plan deadline.
6. **Clubs to rescue before April renewals**: the table.
7. **Club Coach pipeline**: the table of coach-eligible clubs.
8. **Retention by division**: a dot chart of members as % of base by division with the district
   as the dashed line, and paid clubs / base beside it.
9. **Growth plan | from the Club Growth Director**: the presenter's answers, 2×2.
10. **Action list**: checkbox lines with clubs, divisions and dates.
11. **Three asks**: three big numbers with deadlines and a "Growth signal:".

Put sources, the Item 1490 version, data notes and the not-official disclaimer in the speaker
notes.

### Web page (when asked)

Use the Artifact **Data** type titled "District <n> club growth", live from `get_district` with
loaders that call `get_area` for club rows, and calcs for every count and percentage. Load
Montserrat with `@import`. Same order as the deck. If that type isn't available, write one HTML
page.

### Without the Artifact tool

Make the deck with a pptx skill if one is installed, otherwise as one self-contained HTML slide
file. Apply the same branding and style.

## Toastmasters branding

Use a Toastmasters design system if the user has one (list the Design System type); otherwise
apply these tokens yourself.

| Token | Hex | Use |
| --- | --- | --- |
| Loyal Blue | #004165 | Primary: headers, title bars, main chart series |
| True Maroon | #772432 | Accent: section rules, emphasis, "needs attention" |
| Cool Gray | #A9B2B1 | Secondary: borders, base/target marks, muted text on dark |
| Happy Yellow | #F2DF74 | Highlight only, sparingly: a callout or the one number that matters |
| White | #FFFFFF | Backgrounds |

- Font: **Montserrat** for everything (Google Fonts; the web stand-in for the brand's print
  fonts).
- Contrast: never put white text on Happy Yellow or Cool Gray; use Loyal Blue or black on them.
  Good/bad states must not rely on colour alone.
- **Logo**: don't draw, recreate, recolour or stretch the Toastmasters logo or any trademark.
  Use a logo only if the user supplies their district's approved logo file, unaltered, with
  clear space around it.
- Footer on every page, and in the speaker notes of every slide in a deck: "Data as of <date> · Source: Toastmasters daily reports via
  My Toastmasters Dashboards · Not an official Toastmasters International publication."

## Report style

Every report follows one look, taken from a District 74 division report. Keep
it plain and data-first: white background, blue type, maroon numbers, no decoration.

- **Type**: Montserrat only (weights 300–700), Loyal Blue text, muted gray (#6B7378) for captions.
- **Slide titles** read "<Subject> | <subtitle>", for example "Division C | performance snapshot",
  left-aligned, bold, about 72px on a 1920×1080 slide.
- **Caption** under every title, in muted gray: the snapshot date and what is compared, for
  example "Dashboard snapshot as of 20 November 2026 (fiscal month 5). Changes compare with October."
- **Stat grid**: 3 columns × 2 rows. Each stat is a big True Maroon number (about 104px), a bold
  blue label under it, and one gray line of context (rate, base, change since last month).
- **Signal line**: one bold-prefixed sentence under the stats, "District signal:", "Division
  signal:" or "Area signal:", saying what the numbers mean and what to do.
- **Status cards**: light panel (#F2F3F3) with a gray border, a square traffic-light marker
  (green #2A7A57, amber #C28A06, red #B5474B) beside the name, and a gray line that states the
  rule behind the colour. The text always says the state too.
- **Dot charts** for comparisons: one row per division, area or club, label right-aligned on the
  left, value on the right, light gridlines, a dashed gray reference line for the overall figure,
  and the focal row (the whole district, division or area) in True Maroon. Show Wilson 95%
  intervals as whiskers on rates such as paid clubs; show none on simple totals and say so.
  A "Reading this chart" sentence under each chart says what the measure is and is not.
- **Three-column slides** for detail (visits, training, watch list) with maroon column headings.
- **Notes line** in gray at the bottom for definitions and rules ("Net is current less base").
- **Cover**: eyebrow "DISTRICT <n> · DIVISION <X>" in maroon, a big title ("Area F3 Report"),
  a light subtitle, a presenter placeholder ("[Presenter name]") the user replaces, "Programme year
  YYYY–YYYY · fiscal month <m> of 12 (<Month>) · data as of <date>", and the tagline "Where
  Leaders Are Made". Place the logo on the right only if the user supplied one, and keep every
  line of cover text within the left 1060px (about 55% of the slide) so none of it runs under
  the logo: let a long subtitle wrap rather than widen it.
- **Year strip** (role reports): twelve boxes, July to June, past months in the light panel,
  the current month in True Maroon with white text, each labelled "done", "now" or "ahead" so
  the state isn't colour alone; under it three maroon-headed columns Done / Now / Next.
- **Presenter's answers** (role reports): a 2×2 grid of light panels, each with a maroon heading,
  the answer in maroon, and the question in gray; "[bracketed]" where no answer was given.
- **No closing "Questions?" slide**: end on the asks slide.
- **Speaker notes** carry the detail and the footer text (source, date, not-official
  disclaimer), so slides stay clean.
- The **web page** uses the same pieces: header with the eyebrow, title and tagline, the stat
  grid, the signal line, tables with blue rules instead of cards where a table reads better.

## Tone

Growth work is done by volunteers in clubs that are often struggling. Name clubs factually,
never shame a club or officer, and frame every at-risk club as a rescue opportunity with a next
step and a date. Use the terms in `toastmasters://glossary`.

## Finish

Give the deck link, two or three sentences on the main story, any placeholders to fill in, which
figures are proxies (payments), and data notes. Offer to make division reports
(`tm-division-report`) for the divisions with the most clubs to rescue.
