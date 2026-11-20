---
name: tm-division-report
description: Build a Toastmasters-branded Division Director report (slide deck by default, web page on request) with an area-by-area scorecard from Toastmasters dashboard data (My Toastmasters Dashboards MCP server). Use for a division report, division council update, or division slides.
---

# Toastmasters Division Director report

Produce a branded report on one division for its Division Director and Area Directors: a
slide deck for the division council meeting, plus a shareable web page when the user asks for one. All data comes
from the Toastmasters dashboard MCP server: the "My Toastmasters Dashboards"
connector on claude.ai, or the `toastmasters` server this plugin installs in Claude Code.

## Inputs

- **District** and **division letter** (both required; ask for whichever is missing).
- **Fiscal year** (optional, `YYYY-YYYY`). Default is the current one.
- **Format** (optional). Default: the slide deck only. Make the web page as well only if the user
  asks for one.

## 1. Gather the data

Find the dashboard tools first (load them with ToolSearch if they are deferred). Their names
may carry a server prefix, such as `mcp__toastmasters__get_area`. If no such tools exist, stop and
tell the user to connect the server (see the tm-skills README) rather than guessing data. Then call:

1. `get_data_freshness(district)`: the snapshot date, shown as "Data as of" everywhere.
2. Read the resource `toastmasters://rules/dcp` so the wording of rules is right.
3. `get_division(district, division, fiscal_year)`.
4. `get_area(district, division, area)` for every area in the division (run them in parallel).

Use the connector's `insights` as given (Distinguished status, visit state, next actions,
club outlook); they are evaluated as of `insights.as_of`, not today. Compute only simple
totals, percentages and rankings.

### Data hygiene (flag, never hide or "fix")

- `club_base` is the 1 July base; current club counts can differ when clubs charter or move.
  Show both where it matters.
- `get_division` names visit rounds `julyOct` / `janMay`; `get_area` names them `nov` / `may`.
  They are the same two rounds: first round due 30 Nov, second due 31 May.
- `month_change` is null in July. Skip "since last month" and say why.
- The division's top-level `paid_clubs` can differ from `month_change.current.paid_clubs`. Use
  the top-level figure against the goals and list the difference in Data notes.
- Members are removed for non-payment only in October and April. An area or club whose members
  fall in any other month is a report glitch or a club that moved: flag it as "check".
- Missing figures or failed calls go in a "Data notes" footnote. Never guess a value.

## 2. Work out the story

- **Distinguished Division progress**: paid clubs vs `goals.*.paid_clubs` and Distinguished
  clubs vs `goals.*.distinguished_clubs` for Distinguished, Select and President's. Show the gap
  to the next level. Before April, say "on track for" rather than "is" Distinguished.
- **Since last month**: `month_change.change` for the division and each area.
- **Area scorecard**, one row per area:
  paid clubs / clubs, members vs base (%), current visit round (visited / required, due label),
  officer training round in progress (%), clubs on track for the month target, and
  Distinguished status. Mark each cell met / at risk / behind with a label, not colour alone.
- **Clubs needing help**: every club whose outlook is `definite_worry` or `declining`, or whose
  status is Low, Ineligible or Suspended. Give the club, area, paid members and the connector's
  `reasons`. Note `needs.club_coach` and `needs.club_success_plan` where true.
- **Bright spots**: clubs `doing_well` or `improving`, and the closest to Distinguished
  (`progress.next` with the smallest goals and members needed).
- **Each Area Director's top action**: the first item of that area's `insights.next_actions`
  (title, hint and when), in the connector's wording.

## 3. Build the outputs

### Web page (only when asked)

Start from the Artifact **Data** type (quickstart with intent "other", or publish with its
type_url) titled "Division <X> report", and follow that type's own instructions. Make it live:
each dataset a connector call (`get_division`, or `get_division` with a loader that calls
`get_area` for each area), loaders that only reshape the JSON into rows, and every sum,
percentage, scorecard cell and list as a calc. Load the fonts with `@import` inside `<style>`
(`<link>` tags are dropped there) and mix the brand colours with the foreground colour for text
so it reads in dark mode. If that type isn't available, write a single HTML page with the
figures as of the report date and publish it with the Artifact tool. Order: Distinguished progress, since
last month, area scorecard, clubs needing help, bright spots, Area Director actions, data notes.
Load the `dataviz` skill before drawing charts. Good charts: progress bars to each Distinguished
level; visits per area against the 75% line.

### Slide deck

Start from the Artifact **Slides** type, 16:9, titled "Division <X> update – <Month YYYY>".
At most 8 slides:

1. Title: district, division, month, "Data as of <date>".
2. Distinguished Division progress.
3. Since last month.
4. Area scorecard.
5. Clubs needing help.
6. Bright spots: recognise people and clubs by name.
7. Area Director actions with dates.
8. Asks of the division council.

Speaker notes carry the detail; slides carry one idea each.

### Without the Artifact tool

In clients with no Artifact tool (for example Claude Code in a terminal), write the page as one
self-contained HTML file, and make the deck with a pptx skill if one is installed, otherwise as
a self-contained HTML slide file. Apply the same branding and footer.

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
  YYYY–YYYY · data as of <date>", and the tagline "Where Leaders Are Made". Place the logo on the
  right only if the user supplied one.
- **No closing "Questions?" slide**: end on the asks slide.
- **Speaker notes** carry the detail and the footer text (source, date, not-official
  disclaimer), so slides stay clean.
- The **web page** uses the same pieces: header with the eyebrow, title and tagline, the stat
  grid, the signal line, tables with blue rules instead of cards where a table reads better.

## Tone

Encouraging and specific: recognise wins first, then name what needs attention with a next step
and a date. These reports are seen by volunteers; describe clubs' situations factually and
never shame a club or officer. Use the terms in `toastmasters://glossary`.

## Finish

Give the deck link (and the page link, if one was asked for), two or three sentences on the main story, and data notes.
Offer to run `tm-grill-area-plan` with the Area Director of the area most at risk.
