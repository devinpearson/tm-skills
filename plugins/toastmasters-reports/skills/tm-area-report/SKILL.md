---
name: tm-area-report
description: Build a Toastmasters-branded Area Director working report (slide deck, optionally a web page) with club-by-club triage, a visit planner and a dated action list from Toastmasters dashboard data (My Toastmasters Dashboards MCP server). Use for an area report, area council update, Area Director slides, or a report on one area such as "D74 F3".
---

# Toastmasters Area Director report

Produce a branded report on one area for its Area Director, to present at an area council or
division council meeting. Default output is a slide deck; add a web page when the user asks for
one. All data comes from the Toastmasters dashboard MCP server: the "My Toastmasters Dashboards"
connector on claude.ai, or the `toastmasters` server this plugin installs in Claude Code.

## Inputs

- **District**, **division letter** and **area number** (all required). "D74 F3" means
  district 74, division F, area 03. Ask for whatever is missing.
- **Fiscal year** (optional, `YYYY-YYYY`). Default is the current one.
- **Area Director name** (optional). Without it, put "[Area Director name]" on the cover and say
  so when you hand the deck over.
- **Format** (optional). Default: deck only. Add the page if asked.

## 1. Gather the data

Find the dashboard tools first (load them with ToolSearch if they are deferred). Their names
may carry a server prefix, such as `mcp__toastmasters__get_area`. If no such tools exist, stop and
tell the user to connect the server (see the tm-skills README) rather than guessing data. Then call:

1. `get_data_freshness(district)`: the snapshot date, shown as "data as of" everywhere.
2. Read the resource `toastmasters://rules/dcp` so the wording of rules is right.
3. `get_area(district, division, area, fiscal_year)`. Areas are two digits ("03").
4. Optional: `get_club(club)` for a club whose `reasons` need more detail, and
   `get_division` if the user wants the area compared with the rest of its division.

Use the connector's `insights` as given (Distinguished status, visit state, next actions, club
outlook, `needs`); they are evaluated as of `insights.as_of`, not today. Compute only simple
totals, percentages and differences.

### Data hygiene (flag, never hide or "fix")

- `club_base` is the 1 July base; the current club count can differ. Show both where it matters.
- Visit rounds are named `nov` / `may` here: round 1 is due 30 Nov, round 2 by 31 May. The
  number required is 75% of the club base, rounded up, so one club can go unvisited and the round
  is still met. Name any club not yet visited.
- `month_change` is null in July. Skip "since last month" and say why.
- Members are removed for non-payment only in October and April. A club whose members fall in
  any other month is a report glitch or a transfer: flag it as "check".
- With four or five clubs, one club moves every area percentage. Say so under charts, and never
  show confidence intervals for an area.
- Missing figures or failed calls go in the speaker notes as data notes. Never guess a value.

## 2. Work out the story

Write it for the Area Director: someone who looks after four to six clubs, visits each one twice
a year, and has a few hours a month. Every line should say which club, what to do, and by when.

- **Snapshot**: paid clubs / clubs, members vs base (net and %), DCP goals (per club),
  educational awards, visits in the open round (done / needed), officer training for both rounds,
  and the change since last month for each.
- **Summary**, four labelled lines in this order:
  - *On course*: clubs whose `progress.achieved` is set, and how many more the area needs.
  - *Closest next*: the clubs with the smallest `progress.next` gap.
  - *Still at risk*: Red or Amber clubs (triage below), and what a lost club would do to the area.
  - *Due next*: the nearest deadline (visit round, training round) with done / needed.
- **Distinguished Area scorecard**, a table: rows Paid clubs (with base), Distinguished clubs
  ("0 (1 on course)"), Members (with base and net), Total DCP goals; columns Now, Distinguished,
  Select, President's from `goals.*`. Say what each level still needs. When President's needs
  more paid clubs than the area has, say that only a new club gets there.
- **Club by club**, one row per club: members (base), change since last month, DCP goals, the
  visit in the open round (done / not yet), round 2 officers trained (n / 4), next milestone
  (`progress.next`), health, and a short "why". Triage rule, applied exactly:
  - Red: status Ineligible, Low or Suspended, or under 8 members.
  - Amber: under 13 members, or 40% or more below base.
  - Green: everything else; a club with no scored year shows the outlook "New club".
- **Visit planner**, one card per club, for the next visit or call:
  - when: not yet visited this round first; otherwise the next round's opening.
  - what to ask about, from the data: the goal or members it needs next, renewals if it is below
    base, educational awards if it has none, a Club Success Plan if `needs.club_success_plan`,
    a Club Coach if `needs.club_coach`, the month target if `below_month_target`.
  Keep each to two or three prompts. They are conversation starters, not verdicts.
- **Action list**, ordered by deadline then impact, each naming clubs and a date:
  1. Visits still needed in the open round.
  2. Red clubs and anything that threatens paid status.
  3. Officer training still needed in the open round.
  4. Clubs closest to Distinguished.
  5. Club Success Plans and Club Coaches.
  6. Clubs below this month's goal target not already listed.
- **Asks**: three numbers with deadlines from the top of the action list.
- **Notes on data and method** in the speaker notes: snapshot date, what members and base mean,
  the club Distinguished rule (5 goals plus 20 members or net growth of 3; recognised from
  April), the triage rule, and any data hygiene flags.

## 3. Build the deck

Start from the Artifact **Slides** type, 16:9 at 1920×1080, titled
"Area <X><NN> update – <Month YYYY>", and follow that type's instructions. Eight slides, no
closing "Questions?" slide:

1. **Cover**: eyebrow "DISTRICT <n> · DIVISION <X>", title "Area <X><NN> Report", subtitle
   "Area Director working report", the Area Director's name (or "[Area Director name]"),
   programme year and "data as of", tagline.
2. **Area <X><NN> | performance snapshot**: 3×2 stat grid and an "Area signal:" line.
3. **Summary**: the four labelled lines as cards.
4. **Distinguished Area scorecard**: the table, with what each level still needs in the signal.
5. **Club by club**: the table, health as a coloured word, with the triage rule in a gray note.
6. **Visit planner**: one card per club (2×2 for four clubs, 3 columns for five or six).
7. **Action list**: the ordered list as checkbox lines with clubs and dates.
8. **Three asks**: three big numbers with deadlines and an "Area signal:".

Put the context, sources, notes on data and method and the not-official disclaimer in the
speaker notes.

### Web page (when asked)

Use the Artifact **Data** type titled "Area <X><NN> report", live from `get_area`, with loaders
that only reshape JSON and calcs for every sum and percentage. Load Montserrat with `@import`
inside `<style>`. Same order as the deck. If that type isn't available, write one HTML page.

### Without the Artifact tool

In clients with no Artifact tool (for example Claude Code in a terminal), make the deck with a
pptx skill if one is installed, otherwise as one self-contained HTML slide file. Apply the same
branding and style.

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

Encouraging and specific: recognise wins first, then name what needs attention with a next step
and a date. Area Directors present this to the clubs' own officers, so describe each club's
situation factually and never shame a club or officer. Use the terms in `toastmasters://glossary`.

## Finish

Give the deck link, two or three sentences on the main story, any placeholders to fill in
(Area Director name), and data notes. Offer to run `tm-grill-area-plan` to test the Area
Director's plan against these figures.
