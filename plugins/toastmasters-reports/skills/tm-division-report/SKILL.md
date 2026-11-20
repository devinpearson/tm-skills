---
name: tm-division-report
description: Build a Toastmasters-branded Division Director report (web page plus slide deck) with an area-by-area scorecard from Toastmasters dashboard data (My Toastmasters Dashboards MCP server). Use for a division report, division council update, or division slides.
---

# Toastmasters Division Director report

Produce a branded report on one division for its Division Director and Area Directors: a
shareable web page, plus a short slide deck for the division council meeting. All data comes
from the Toastmasters dashboard MCP server: the "My Toastmasters Dashboards"
connector on claude.ai, or the `toastmasters` server this plugin installs in Claude Code.

## Inputs

- **District** and **division letter** (both required; ask for whichever is missing).
- **Fiscal year** (optional, `YYYY-YYYY`). Default is the current one.
- **Format** (optional). Default: both the page and the deck. Make only one if the user asks.

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

### Web page

Start from the Artifact **Data** type (quickstart with intent "other", or publish with its
type_url) titled "Division <X> report – <Month YYYY>". If that type isn't available, write a
single HTML page and publish it with the Artifact tool. Order: Distinguished progress, since
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

- Fonts: **Montserrat** for headings, **Source Sans 3** for body text (Google Fonts; the web
  stand-ins for the brand's print fonts).
- Contrast: never put white text on Happy Yellow or Cool Gray; use Loyal Blue or black on them.
  Good/bad states must not rely on colour alone.
- **Logo**: don't draw, recreate, recolour or stretch the Toastmasters logo or any trademark.
  Use a logo only if the user supplies their district's approved logo file, unaltered, with
  clear space around it.
- Footer on every page and slide: "Data as of <date> · Source: Toastmasters daily reports via
  My Toastmasters Dashboards · Not an official Toastmasters International publication."

## Tone

Encouraging and specific: recognise wins first, then name what needs attention with a next step
and a date. These reports are seen by volunteers; describe clubs' situations factually and
never shame a club or officer. Use the terms in `toastmasters://glossary`.

## Finish

Give the links to the page and deck, two or three sentences on the main story, and data notes.
Offer to run `tm-grill-area-plan` with the Area Director of the area most at risk.
