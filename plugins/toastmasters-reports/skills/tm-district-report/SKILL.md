---
name: tm-district-report
description: Build a Toastmasters-branded District Director report (web page plus slide deck) from Toastmasters dashboard data (My Toastmasters Dashboards MCP server). Use for a district report, district update, or district council slides.
---

# Toastmasters District Director report

Produce a branded report on one district's performance for the District Director and the
district council: a shareable web page, plus a short slide deck of the same numbers for
presenting. All data comes from the Toastmasters dashboard MCP server: the "My Toastmasters Dashboards"
connector on claude.ai, or the `toastmasters` server this plugin installs in Claude Code.

## Inputs

- **District** (required). If the user didn't name one, ask. "U" is undistricted, "F" the Founders District.
- **Fiscal year** (optional, `YYYY-YYYY`). Default is the latest one.
- **Format** (optional). Default: both the page and the deck. Make only one if the user asks.

## 1. Gather the data

Find the dashboard tools first (load them with ToolSearch if they are deferred). Their names
may carry a server prefix, such as `mcp__toastmasters__get_area`. If no such tools exist, stop and
tell the user to connect the server (see the tm-skills README) rather than guessing data. Then call:

1. `get_data_freshness(district)`: the snapshot date. Every output shows it as "Data as of".
2. Read the resource `toastmasters://rules/dcp` so the wording of rules is right.
3. `get_district(district, fiscal_year)`.
4. `get_division(district, division)` for every real division in the district list (run them in parallel).

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

Lead with what the District Director must act on, not with every number.

- **Headline**: active members vs member base (%), paid clubs vs club base, Distinguished clubs,
  DCP goals met, and the change since last fiscal month (`month_change.change`), including
  clubs added and removed.
- **Month target**: `insights.month_target` goals per club for this month, and the clubs on
  track for it (sum of `insights.on_track_clubs` from each `get_division`). Name the divisions
  furthest behind.
- **Division league table**: per division, members vs base (%), paid clubs vs base, Distinguished
  clubs vs the Distinguished Division goal (`goals.distinguished` from `get_division`),
  officer training round 1 and round 2 %, and last month's member change. Sort by members vs base.
- **Area visits**: from `insights.divisions[].areas[].visits`. List areas still short in the open
  round, with visited / required and the due label. Count days left from `as_of`.
- **Officer training**: round in progress, % trained per division (`officer_training`).
- **Watch list**, by stated rules so it can be checked: members under 80% of base; 4 or more
  paid clubs short of the Distinguished Division goal; round 1 training under 65%; suspended
  clubs; areas with no visits in the open round; area member drops outside October and April
  (from each division's `month_change.areas`, marked "check").
- **Three asks**: three concrete actions for the next month, each naming a division or area
  and a date. Base them on the data above, never on assumptions.

## 3. Build the outputs

### Web page

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

If that type isn't available, write a single HTML page with the figures as of the report date
and publish it with the Artifact tool. Order: headline tiles, "since last month", three asks,
division table, area visits, training, watch list, data notes. Load the `dataviz` skill before
drawing charts. Good charts: members vs base bars per division; visits per area as chips
(met / short / none).

### Slide deck

Start from the Artifact **Slides** type, 16:9, titled "District <N> update – <Month YYYY>".
At most 8 slides:

1. Title: district, month, "Data as of <date>".
2. Headline numbers (4 tiles at most).
3. Since last month.
4. Division league table.
5. Area visits: who still needs to visit, and by when.
6. Officer training round in progress.
7. Watch list.
8. Three asks.

Speaker notes carry the detail; slides carry one idea each. The deck is a snapshot: write the
figures as of the report date into the slides, check them against the report page, and say
"Data as of <date>" on every slide.

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
  YYYY–YYYY · data as of <date>", and the tagline "Where Leaders Are Made". Place the logo on the
  right only if the user supplied one.
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

Give the user the links to the page and deck, two or three sentences on the main story, and any
data notes. Offer to make a division report (`tm-division-report`) for the weakest division.
