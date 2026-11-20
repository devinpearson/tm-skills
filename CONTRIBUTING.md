# Contributing a skill

1. Create `plugins/toastmasters-reports/skills/<skill-name>/SKILL.md`. The folder name and the
   `name:` in the frontmatter must match, in kebab-case, starting with `tm-`.
2. Write a one-sentence `description:` that says what the skill makes and when to use it
   (under 1024 characters). Claude decides when to use a skill from this line alone.
3. Get data only from the dashboard MCP tools. Never let a skill guess or invent a number: if
   a figure is missing, the output says so.
4. Use the connector's `insights` as given. They apply the Distinguished Program rules as of the
   report date; don't recompute them in the skill.
5. If the skill produces anything visual, copy the branding section from [BRAND.md](BRAND.md)
   into the SKILL.md.
6. Run `node scripts/validate.mjs`, and try the skill on a real district before opening a pull
   request. Say in the pull request which district, division or area you tried.
7. Add the skill to the table in [README.md](README.md) and bump `version` in
   `plugins/toastmasters-reports/.claude-plugin/plugin.json`.
