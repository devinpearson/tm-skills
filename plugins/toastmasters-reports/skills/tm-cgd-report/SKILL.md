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

| Level | Net club growth | Membership payments growth | Distinguished clubs |
| --- | --- | --- | --- |
| Distinguished | 1% | 1% | 45% of club base |
| Select Distinguished | 3% | 3% | 50% |
| President's Distinguished | 5% | 5% | 55% |
| Smedley Distinguished | 8% | 8% | 60% |

Growth is measured against the club base (paid clubs at 1 July) and last year's payments; goals
round up to the next whole number, and losses must be recovered first. The Distinguished clubs
column belongs to the Program Quality Director, but show it so the CGD sees the whole target.

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
- **Format** (optional). Default: deck only.

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
- **Growth scorecard**, a table: rows Net club growth, Membership payments growth (or proxy),
  Distinguished clubs; columns Now, Distinguished, Select, President's, Smedley, each target as
  a count (round up) and %. Say how many paid clubs each level needs from here.
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
- **Asks**: three numbers with deadlines from the top of the action list.

## 3. Build the deck

Start from the Artifact **Slides** type, 16:9, titled "District <n> club growth – <Month YYYY>",
in the report style below. Nine slides, no closing "Questions?" slide:

1. **Cover**: eyebrow "DISTRICT <n> · CLUB GROWTH", title "Club Growth Report", subtitle
   "Prepared for the Club Growth Director", presenter, programme year and "data as of", tagline.
2. **District <n> | club growth snapshot**: 3×2 stat grid and a "Growth signal:" line.
3. **Distinguished District growth scorecard**: the table.
4. **New clubs and the Club Growth Achievement**: the two windows as big numbers against their
   levels, then each new club with charter date and Club Success Plan deadline.
5. **Clubs to rescue before April renewals**: the table.
6. **Club Coach pipeline**: the table of coach-eligible clubs.
7. **Retention by division**: a dot chart of members as % of base by division with the district
   as the dashed line, and paid clubs / base beside it.
8. **Action list**: checkbox lines with clubs, divisions and dates.
9. **Three asks**: three big numbers with deadlines and a "Growth signal:".

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
  YYYY–YYYY · data as of <date>", and the tagline "Where Leaders Are Made". Place the logo on the
  right only if the user supplied one.
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
