---
name: tm-pqd-report
description: Build a Toastmasters-branded Program Quality Director report (slide deck by default, web page on request) on a district's education and club-quality KPIs - Distinguished clubs, DCP goals, educational awards, club officer training and Area Director club visits - from Toastmasters dashboard data (My Toastmasters Dashboards MCP server). Use for a PQD report, program quality update, education and training slides, or Distinguished Club Program progress for a district.
---

# Toastmasters Program Quality Director report

Produce a branded report for a district's Program Quality Director (PQD) to use with the District
Director, the district executive committee, Division Directors and the training team. Default
output is a slide deck; add a web page when the user asks for one. All data comes from the
Toastmasters dashboard MCP server: the "My Toastmasters Dashboards" connector on claude.ai, or the
`toastmasters` server this plugin installs in Claude Code.

## What the role is accountable for

Toastmasters International makes the PQD responsible for all aspects of education and training
in the district: supporting quality club programming, promoting the Distinguished Club Program
(DCP), club officer training, guiding Division and Area Directors and club officers on
educational opportunities, recognising members' achievements, running speech contests by the
rulebook, and planning the district conference. The district leader roles guide gives one number:
prepare strategies to reach **at least 40% Distinguished clubs**. Build the report around the KPIs
that follow:

| KPI | Measure | Where it comes from |
| --- | --- | --- |
| Potentially Distinguished clubs | Clubs that meet a Distinguished level now, by level, against % of the club base | API: each club's `progress.achieved` / `milestone.achieved`; Distinguished District requirement; roles guide (40%) |
| Distinguished pipeline | Potentially Distinguished, one or two goals away, goals met but members short | DCP progress (`progress.next`) |
| DCP goals | Goals met, per club, and clubs below this month's target | DCP; `insights.month_target` |
| Educational awards | Awards this year and last month, per club | DCP goals 1–6 |
| Club officer training | Officers trained in each round, by division | DCP goal 9 (4 officers in each round) |
| Club visits | Area Director visits in the open round | Club quality; Distinguished Area and Division |
| Contests, TLI, conference | Dates and status | Manual input: not in the dashboard |

### Distinguished District: the Distinguished clubs column

From the District Recognition Program (Item 1490, Rev. 07/2026, for 2026–2027): Distinguished
District needs 45% of the club base to be Distinguished clubs, Select 50%, President's 55%,
Smedley 60%, each rounded up, alongside the net club and payments growth that the Club Growth
Director owns. Show the roles guide's 40% as the PQD's floor and Item 1490's 45% as the
district's target. Check the current Item 1490 if the program year isn't 2026–2027 and say which
version you used.

Club Distinguished rule (from `toastmasters://rules/dcp`): 5 of 10 DCP goals and 20 paid members
or net growth of 3; Select 7 goals and 20 members or net growth of 5; President's 9 goals and 20
members; Smedley 10 goals and 25 members. Clubs are recognised from April. Before then the dashboard calls a club
that meets a level **potentially Distinguished** (or potentially Select, President's, Smedley):
use that term, as the API returns it, and never call those clubs Distinguished. The official
Distinguished count stays 0 until April.

## Inputs

- **District** (required). Ask if missing.
- **Fiscal year** (optional, `YYYY-YYYY`). Default is the current one.
- **Presenter** (optional). Without it, put "[Program Quality Director name]" on the cover.
- **District Success Plan and budget** (optional documents). See below.
- **Format** (optional). Default: deck only.

## Ask the presenter

Before building, ask the person making the report these questions, all in one message (in Claude
Code, one AskUserQuestion call with free-text answers). Say that each is optional and that
anything left blank shows as a "[bracketed]" placeholder they can fill in later. Use the answers
on the "Training, contests and conference" slide and in the year strip's Next column.

1. Your name and role for the cover.
2. Round 2 training (TLI): session dates and venues by division.
3. Speech contests: which contests run this year, and the area, division and district dates.
4. District conference: date, venue and where planning stands.
5. Education focus: recognition plans and how clubs are being helped to earn awards.
6. District Success Plan and approved budget: attach them if you have them (optional).

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
  the plan and, beside it, where the dashboard puts it today. For the Program Quality Director, that is the Distinguished clubs goal: the plan's club pipeline (if it classifies clubs, map the potentially Distinguished clubs and the clubs one or two steps away onto its classes), officer training, club visits and education.
- Flag anything in the plan that doesn't add up as "check": a name spelled two ways, blank
  monthly milestones, a qualifying form with zero leaders. Don't correct the plan.

From the **budget**:

- Check its fiscal year. If it isn't the report's year, label every figure with its year and ask
  the user for the current approved budget.
- Show the lines this role spends: education and training, recognition, speech contests and the district conference. Give each line's amount, its share of the
  membership dues allocation and the policy limit the budget states. Compute only those shares.
- Spend to date isn't in the budget or the dashboard: show "[From the Finance Manager]".
- Note any phasing the budget gives (months a line is spent in) where it affects what to do now.

With these documents, add two slides before the presenter's-answers slide: "Success Plan | Distinguished clubs actions" (action, owner, by, dashboard now) and
"Budget | education, recognition and contests" (line, amount, share of dues, policy, spent to date). Pre-fill the presenter's answers with what the documents already say (owners,
budgeted amounts) and keep "[bracketed]" for what they don't.

## 1. Gather the data

Find the dashboard tools first (load them with ToolSearch if they are deferred). If none exist,
stop and tell the user to connect the server (see the tm-skills README). Then call:

1. `get_data_freshness(district)`: the snapshot date, shown as "data as of" everywhere.
2. Read `toastmasters://rules/dcp` for the DCP goals, the Distinguished rules and training rounds.
3. `get_district(district)`: totals, `month_change` (goals, educational awards), the month target
   and every area's visit rounds.
4. `get_division` for every lettered division, in parallel: `officer_training` rounds,
   `on_track_clubs`, visits and the Distinguished Division goals.
5. `get_area` for every area, in parallel, for each club's goals, members, `progress.achieved`
   (the level a club potentially holds now), `milestone.achieved` (the API's wording, such as
   "Potentially Distinguished: meets the requirements, and can become Distinguished from April"),
   `progress.next` and `below_month_target`. In a client that can delegate, hand this to a
   helper that writes one row per club to a file.

### Data hygiene (flag, never hide or "fix")

- Officer training percentages use the dashboard's officers possible (7 per club). Sum officers
  trained and possible across divisions for the district; don't average percentages.
- Training round 1 runs June–August, round 2 November–February (due 28 February). DCP goal 9
  needs 4 officers trained in each round.
- Visit rounds are `nov` / `may` in `get_district` and `julyOct` / `janMay` in `get_division`.
  A division can show more visits than required because some areas over-visit; count visits
  still needed area by area.
- Per-club averages use today's club count (`month_change.current.clubs`), not the base.
- A placeholder division (such as `0D`) holds unplaced clubs: include it in totals, leave it out
  of division comparisons, and name it in data notes.

## 2. Work out the story

- **Snapshot**: potentially Distinguished clubs against the Distinguished District count, DCP goals (per
  club, change since last month), educational awards (per club, change), officer training round
  1 and round 2, and Area Director visits in the open round (visits done / needed, areas met).
- **Where we are in the year**: fiscal month m of 12 (`fiscal_month`; July is 1) and what it
  means for program quality. Done: round 1 officer training (1 Jun – 31 Aug). Now: round 1 club
  visits (due 30 Nov), round 2 training (1 Nov – 28 Feb), this month's DCP target and next month's.
  Next: contest season (the presenter's dates), Distinguished recognition from April, round 2
  visits (31 May), year end (30 June). Move items between columns as the month changes.
- **Distinguished clubs pipeline**, a table: stages "Potentially Distinguished now", "1 goal or 2 members away",
  "2 goals away", "Goals met, members short", "Further away", each with clubs and a running
  total, against the 40% floor and the Distinguished / Select / President's / Smedley counts.
  Say plainly how far the pipeline falls short; don't promise the target.
- **Potentially Distinguished clubs**: every club whose `progress.achieved` is set, with area,
  goals, members, the level it potentially holds and what the next level needs
  (`progress.next`). Count them by level. Remind that they keep the level only if still in good
  standing after the April renewals.
- **Closest to Distinguished**: the named clubs from the next two stages with area, goals,
  members and what each still needs.
- **DCP goals and educational awards by division**: a dot chart of goals per club with the
  district as the dashed line and the month target noted, and awards per club beside it. Name
  the clubs with no goals yet.
- **Club officer training**: round 1 % by division (dot chart), round 2 trained so far and the
  officers still to train by 28 February.
- **Club visits**: every area short in the open round with visited / required and days left.
- **Training, contests and conference**: the presenter's answers to the questions above.
- **Action list**, ordered by deadline, each naming clubs, areas or divisions:
  1. Club visits still needed in the open round.
  2. Round 2 officer training (TLI) by 28 February.
  3. Clubs one goal or two members from Distinguished.
  4. Clubs with goals met but members short (hand to the Club Growth Director).
  5. Clubs below this month's goal target, starting with those at 0 goals.
- **Asks**: three numbers with deadlines from the top of the action list.

## 3. Build the deck

Start from the Artifact **Slides** type, 16:9, titled "District <n> program quality – <Month
YYYY>", in the report style below. Twelve slides (fourteen with the Success Plan and budget
slides), no closing "Questions?":

1. **Cover**: eyebrow "DISTRICT <n> · PROGRAM QUALITY", title "Program Quality Report", subtitle
   "Prepared for the Program Quality Director", presenter, "Programme year · fiscal month m of 12
   (<Month>) · data as of <date>", tagline.
2. **District <n> | program quality snapshot**: 3×2 stat grid and a "Quality signal:" line.
3. **Program quality | where we are in the year**: the year strip and Done / Now / Next.
4. **Distinguished clubs | pipeline**: the table.
5. **Potentially Distinguished clubs**: the table, counted by level in the caption.
6. **Closest to Distinguished**: the clubs table.
7. **DCP goals by division**: the dot chart with educational awards beside it.
8. **Club officer training**: the dot chart with round 2 beside it.
9. **Club visits**: the areas still short.
10. **Training, contests and conference**: the presenter's answers, 2×2.
11. **Action list**: checkbox lines with clubs, areas and dates.
12. **Three asks**: three big numbers with deadlines and a "Quality signal:".

Put sources (roles guide, Item 1490 version), data notes and the not-official disclaimer in the
speaker notes.

### Web page (when asked)

Use the Artifact **Data** type titled "District <n> program quality", live from `get_district`
with loaders that call `get_division` and `get_area`, and calcs for every count and percentage.
Load Montserrat with `@import`. Same order as the deck. If that type isn't available, write one
HTML page.

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

Program quality is about members' experience, so lead with what clubs have achieved: goals,
awards and officers trained. Then name what needs attention with a next step and a date. Never
shame a club or officer. Use the terms in `toastmasters://glossary`.

## Finish

Give the deck link, two or three sentences on the main story, any placeholders to fill in
(presenter, contest and TLI dates), and data notes. Offer to make division reports
(`tm-division-report`) for the divisions furthest behind on visits or training.
