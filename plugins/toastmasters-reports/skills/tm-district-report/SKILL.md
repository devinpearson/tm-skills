---
name: tm-district-report
description: Build a Toastmasters-branded District Director report (slide deck by default, web page on request) on the Distinguished District Program and the district's overall health - net club growth, membership payments, Distinguished clubs, each division's progress, the leadership team's KPIs and the risks - from Toastmasters dashboard data (My Toastmasters Dashboards MCP server). Use for a district report, District Director update, district executive committee or district council slides.
---

# Toastmasters District Director report

Produce a branded report on one district for its District Director (DD), to use with the district
executive committee, the district council and the Region Advisor. Default output is a slide deck;
add a web page when the user asks for one. All data comes from the Toastmasters dashboard MCP
server: the "My Toastmasters Dashboards" connector on claude.ai, or the `toastmasters` server
this plugin installs in Claude Code.

## What the role is accountable for

Toastmasters International makes the DD responsible for the district's day-to-day operations,
finances and people: leading the district executive committee in developing and monitoring the
District Success Plan, guiding the district toward Distinguished status, regular performance
check-ins with the Region Advisor, regular leadership team meetings to review progress, and
compliance with Toastmasters policies. The Club Growth Director (CGD) and Program Quality
Director (PQD) each own part of the result; the DD owns the whole. Build the report around:

| KPI | Measure | Owner on the team |
| --- | --- | --- |
| Distinguished District | Net club growth, membership payments growth and Distinguished clubs, all three together | DD, with CGD and PQD |
| Division progress | Each division against its Distinguished Division goals | Division Directors |
| Club growth | Paid clubs, members, new clubs, clubs to rescue | CGD (`tm-cgd-report`) |
| Program quality | DCP goals, educational awards, officer training, club visits | PQD (`tm-pqd-report`) |
| Momentum | Change since last month on every measure | DD |
| Risks | Clubs to rescue, divisions furthest behind, data issues | DD |
| Plan, budget, check-ins | District Success Plan, budget, Region Advisor | Manual input: not in the dashboard |

### Distinguished District requirements

From the District Recognition Program (Item 1490, Rev. 07/2026, for 2026–2027). Check the current
Item 1490 if the program year isn't 2026–2027 and say which version you used.

| Level | Net club growth | Membership payments growth | Distinguished clubs |
| --- | --- | --- | --- |
| Distinguished | 1% | 1% | 45% of club base |
| Select Distinguished | 3% | 3% | 50% |
| President's Distinguished | 5% | 5% | 55% |
| Smedley Distinguished | 8% | 8% | 60% |

A district needs all three measures at a level to earn it. Growth is against the club base and
last year's payments; targets round up.

## Inputs

- **District** (required). If the user didn't name one, ask. "U" is undistricted, "F" the Founders District.
- **Fiscal year** (optional, `YYYY-YYYY`). Default is the latest one.
- **Presenter** (optional). Without it, put "[District Director name]" on the cover.
- **Membership payments** (optional): year-to-date payments and the payments base from the
  Toastmasters District Performance report. Without them, use members against the member base
  and label it "proxy".
- **District Success Plan and budget** (optional documents). See below.
- **Format** (optional). Default: the slide deck only. Make the web page as well only if the user
  asks for one.

## Ask the presenter

Before building, ask the person making the report these questions, all in one message (in Claude
Code, one AskUserQuestion call with free-text answers). Say that each is optional and that
anything left blank shows as a "[bracketed]" placeholder they can fill in later. Use the answers
on the "District Success Plan and operations" slide and in the year strip.

1. Your name and role for the cover.
2. District Success Plan: which goals are on track, and which need help?
3. Budget: where spending stands against the approved budget (with the Finance Manager).
4. Region Advisor: date of the last or next check-in, and what it agreed.
5. Team: any district roles vacant, or leaders who need support?
6. Membership payments: year-to-date payments and the payments base from the District
   Performance report (otherwise the report uses paid members as a proxy).
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
  the plan and, beside it, where the dashboard puts it today. For the District Director, that is all three goals and the qualifying requirements.
- Flag anything in the plan that doesn't add up as "check": a name spelled two ways, blank
  monthly milestones, a qualifying form with zero leaders. Don't correct the plan.

From the **budget**:

- Check its fiscal year. If it isn't the report's year, label every figure with its year and ask
  the user for the current approved budget.
- Show the lines this role spends: every spend line, grouped by the team member who owns it, with the plan's net surplus or deficit and how much of revenue the membership dues make up. Give each line's amount, its share of the
  membership dues allocation and the policy limit the budget states. Compute only those shares.
- Spend to date isn't in the budget or the dashboard: show "[From the Finance Manager]".
- Note any phasing the budget gives (months a line is spent in) where it affects what to do now.

With these documents, add two slides before the presenter's-answers slide: "District Success Plan | goals and owners" (one row per goal: target from the first level to the top level, now, lead actions with owners and dates; plus the qualifying requirements) and
"Budget | where the money goes" (spend lines by owner, share of dues, policy limit, and a "District signal:" on the surplus and on how far revenue depends on membership payments). Pre-fill the presenter's answers with what the documents already say (owners,
budgeted amounts) and keep "[bracketed]" for what they don't.

## 1. Gather the data

Find the dashboard tools first (load them with ToolSearch if they are deferred). Their names
may carry a server prefix, such as `mcp__toastmasters__get_area`. If no such tools exist, stop and
tell the user to connect the server (see the tm-skills README) rather than guessing data. Then call:

1. `get_data_freshness(district)`: the snapshot date. Every output shows it as "Data as of".
2. Read the resource `toastmasters://rules/dcp` so the wording of rules is right.
3. `get_district(district, fiscal_year)`.
4. `get_division(district, division)` for every real division in the district list (run them in parallel).
5. `get_area` for every area, in parallel, for club-level detail: each club's `progress.achieved`
   (the level it is potentially Distinguished at, before April) and the clubs to rescue. In a client that can delegate, hand this to a helper that writes one row
   per club to a file.

Do not recompute rules the connector already evaluates (Distinguished status, visit state,
month target, next actions). Use its `insights` as given; they are evaluated as of `insights.as_of`,
not today's date. Compute only simple totals, percentages and rankings, and say so.

### Data hygiene (flag, never hide or "fix")

- A division whose name isn't a letter (for example `0D`), or with 0 members, is a placeholder.
  Leave it out of rankings and list it in a "Data notes" footnote.
- `club_base` is the 1 July base; `month_change.current.clubs` is today's count. They differ when
  clubs charter or move. Show both where it matters; don't call it an error.
- `month_change` is null in July. Then skip the "last month" section and say why.
- A division's top-level `paid_clubs` can differ from its `month_change.current.paid_clubs`
  (seen in District 74, Division C: 16 against 15). Use the top-level figure against the
  Distinguished Division goal, the district `month_change` total for the headline, and list the
  difference in Data notes.
- `get_district` names an area's visit rounds `nov` / `may`; `get_division` names the division's
  `julyOct` / `janMay`. They are the same two rounds (first due 30 Nov, second due 31 May).
- Members are removed for non-payment only in October and April. An area whose members fall in
  any other month is a report glitch or a club that moved: flag it as "check", don't report it as a loss.
- If any call fails or a figure is missing, say which in Data notes. Never guess a value.

## 2. Work out the story

Lead with what the District Director must act on, and who on the team owns it.

- **Snapshot**: paid clubs against the club base, members against the member base (and change),
  potentially Distinguished clubs (the API's status before April) against the Distinguished
  District count, DCP goals (and
  change), club visits in the open round, and officer training in the open round.
- **Where we are in the year**: fiscal month m of 12 (`fiscal_month`; July is 1). Done / Now /
  Next across the whole district: charter windows, officer training rounds, club visit rounds,
  renewals (1 October, 1 April), Distinguished recognition from April, year end (30 June), and
  the Region Advisor check-in the presenter gave. Move items between columns as the month changes.
- **Distinguished District scorecard**, a table: rows Net club growth, Membership payments (or
  proxy), Distinguished clubs, Club retention (90% of the paid base); columns Now, Distinguished,
  Select, President's, Smedley (all four levels, always), and Owner (CGD, PQD). Say which measure is furthest from the first level.
- **Divisions at a glance**, one row per lettered division: paid clubs against its Distinguished
  Division goal, potentially Distinguished clubs against its Distinguished clubs goal, members as % of base,
  areas that met the open visit round, round 1 training %, and the biggest gap in words.
- **Leadership team KPIs**, three columns: Club growth (CGD), Program quality (PQD), Divisions
  and areas. Three or four figures each, with the deadline that matters most.
- **Since last month**: the district's `month_change.change` and each division's, including clubs
  added and removed. Skip in July and say why.
- **Watch list**, by stated rules so it can be checked: clubs to rescue (Ineligible, Low or
  Suspended) by division; divisions with members under 80% of base, 4 or more paid clubs short
  of their goal, round 1 training under 65%, or areas with no visits in the open round; and data
  issues (marked "check").
- **District Success Plan and operations**: the presenter's answers to the questions above.
- **Action list by owner**: DD, CGD, PQD and Division Directors, each line naming clubs, areas or
  divisions and a date, ordered by deadline.
- **Three asks**: three numbers with deadlines, each with its owner.

## 3. Build the outputs

### Slide deck

Start from the Artifact **Slides** type, 16:9, titled "District <N> update – <Month YYYY>", in the
report style below. Eleven slides (thirteen with the Success Plan and budget slides), no
closing "Questions?" slide:

1. **Cover**: eyebrow "DISTRICT <n> · DISTRICT DIRECTOR", title "District <n> Report", subtitle
   "Prepared for the District Director", presenter, "Programme year · fiscal month m of 12
   (<Month>) · data as of <date>", tagline.
2. **District <n> | performance snapshot**: 3×2 stat grid and a "District signal:" line.
3. **District <n> | where we are in the year**: the year strip and Done / Now / Next.
4. **Distinguished District | scorecard**: the table with owners.
5. **Divisions at a glance**: the table.
6. **Leadership team | KPIs**: three columns.
7. **Since last month**: district change in the caption, a table by division.
8. **Watch list**: three columns (clubs, divisions, data).
9. **District Success Plan and operations**: the presenter's answers, 2×2.
10. **Action list by owner**: checkbox lines.
11. **Three asks**: three big numbers with owners and deadlines, and a "District signal:".

Put sources (roles guide, Item 1490 version), data notes and the
not-official disclaimer in the speaker notes. The deck is a snapshot: write the figures as of
the report date into the slides.

### Web page (only when asked)

Start from the Artifact **Data** type (quickstart with intent "other", or publish with its
type_url) titled "District <N> report", and follow that type's own instructions. Make the
page **live** rather than typing numbers in, so it stays current:

- Each dataset is a call to the dashboard connector (connector name as the user added it, for
  example "My Toastmasters Dashboards"), such as `get_district {"district": "<N>"}`.
- The connector answers with one JSON object, not rows, so give each dataset a loader that
  only reshapes it. A loader can call `get_division` for each lettered division with its
  `call(tool, args)`, which avoids one dataset per division.
- Put every sum, percentage and ranking in a calc, and write the asks, watch list and data notes
  as calcs too, so their numbers follow the data.
- The page's `<link>` tags are dropped there: load Montserrat with `@import`
  inside its `<style>`, with fallbacks. Its colour tokens follow the reader's theme; mix Loyal
  Blue and True Maroon with the foreground colour (`color-mix`) for text, so it reads in dark mode.

If that type isn't available, write a single HTML page with the figures as of the report date,
in the same order as the deck.

### Without the Artifact tool

In clients with no Artifact tool (for example Claude Code in a terminal), make the deck with a
pptx skill if one is installed, otherwise as a self-contained HTML slide file, and write the
page (if asked) as one self-contained HTML file. Apply the same branding and footer.

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
  Good/bad states must not rely on colour alone; add a label or icon.
- **Logo**: don't draw, recreate, recolour or stretch the Toastmasters logo or any trademark.
  Use a logo only if the user supplies their district's approved logo file, unaltered, with
  clear space around it. Otherwise the title text alone is the brand.
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

Plain, encouraging and specific, in the Toastmasters spirit: recognise wins first, then name
what needs attention with a concrete next step. Use Toastmasters terms (club base, paid clubs,
DCP goals, Distinguished, officer training, area visits) as in `toastmasters://glossary`.

## Finish

Give the user the deck link (and the page link, if one was asked for), two or three sentences on
the main story, any placeholders to fill in, which figures are proxies, and data notes. Offer the
role reports for the team (`tm-cgd-report`, `tm-pqd-report`) and a division report
(`tm-division-report`) for the division furthest behind.
