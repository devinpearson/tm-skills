# tm-skills

Claude skills for Toastmasters district, division and area leaders. They turn the daily
Toastmasters club reports into branded reports and slide decks, and help Area Directors test
their plans against the numbers.

> Not an official Toastmasters International product. Toastmasters International, the
> Toastmasters logo and related marks are trademarks of Toastmasters International. These skills
> use the brand colours and fonts for district and club leaders' own reporting, and never draw
> or alter the logo. See [BRAND.md](BRAND.md).

## Skills

| Skill | Who it's for | What you get |
| --- | --- | --- |
| [`tm-district-report`](plugins/toastmasters-reports/skills/tm-district-report/SKILL.md) | District Director, district council | A report page and an 8-slide deck: headline numbers, last month's change, division league table, area visits, officer training, watch list, three asks. |
| [`tm-division-report`](plugins/toastmasters-reports/skills/tm-division-report/SKILL.md) | Division Director, Area Directors | A report page and an 8-slide deck: Distinguished Division progress, area scorecard, clubs needing help, bright spots, each Area Director's top action. |
| [`tm-area-report`](plugins/toastmasters-reports/skills/tm-area-report/SKILL.md) | Area Director, area council | A 7-slide deck (page optional): area snapshot, club status cards, membership and Distinguished charts, watch list, three asks. |
| [`tm-grill-area-plan`](plugins/toastmasters-reports/skills/tm-grill-area-plan/SKILL.md) | Area Director (or a Division Director coaching one) | An interactive review: one question at a time, checked against the area's data, ending in a scorecard and dated commitments. |

Try asking:

- "District report for District 74"
- "Division E report for the council meeting, deck only"
- "Grill my plan for area E02 in District 74"

## Data source

All skills read from the Toastmasters dashboard MCP server, which serves the Toastmasters daily
club, area, division and district reports with the Distinguished Program rules already applied:

```text
https://tm-api.devinpearson.me/mcp
```

It is read-only and needs no sign-in. Contact details and members' names are never returned.
Its tools: `search_clubs`, `get_club`, `get_club_history`, `get_area`, `get_division`,
`get_district`, `get_data_freshness`, `simulate_area`, `simulate_division`; resources
`toastmasters://rules/dcp` and `toastmasters://glossary`.

## Install

### Claude Code

```text
/plugin marketplace add devinpearson/tm-skills
/plugin install toastmasters-reports@tm-skills
```

The plugin adds the skills and the `toastmasters` MCP server in one step.

### Claude apps (claude.ai, desktop, mobile)

1. Add the data source: **Settings → Connectors → Add custom connector**, name it
   "My Toastmasters Dashboards", URL `https://tm-api.devinpearson.me/mcp`.
2. Add each skill: download the skill zip from the
   [latest release](https://github.com/devinpearson/tm-skills/releases), or build them with
   `node scripts/package.mjs`, then upload it in **Settings → Capabilities → Skills**.

Reports come out as Artifacts (a report page and a slide deck) where the app supports them.

## Repository layout

```text
.claude-plugin/marketplace.json        Claude Code marketplace listing
plugins/toastmasters-reports/
  .claude-plugin/plugin.json           plugin manifest
  .mcp.json                            the dashboard MCP server
  skills/<skill-name>/SKILL.md         one folder per skill
scripts/validate.mjs                   checks every skill's frontmatter
scripts/package.mjs                    builds dist/<skill-name>.zip for upload
```

## Privacy

The skills send only district, division, area and club numbers to the dashboard MCP server.
The server is read-only, needs no sign-in, and returns club performance figures, never members'
names or contact details.

## Contributing

New skills are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

[MIT](LICENSE).
