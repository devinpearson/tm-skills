// Checks every skill's SKILL.md frontmatter and the plugin manifests. Run: node scripts/validate.mjs
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const pluginDir = join(root, "plugins", "toastmasters-reports");
const skillsDir = join(pluginDir, "skills");
const errors = [];

for (const file of [
  join(root, ".claude-plugin", "marketplace.json"),
  join(pluginDir, ".claude-plugin", "plugin.json"),
  join(pluginDir, ".mcp.json"),
]) {
  try {
    JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${file}: ${error.message}`);
  }
}

const skills = readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory());
for (const { name: dir } of skills) {
  const file = join(skillsDir, dir, "SKILL.md");
  if (!existsSync(file)) {
    errors.push(`${dir}: missing SKILL.md`);
    continue;
  }
  const match = readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    errors.push(`${dir}: SKILL.md has no frontmatter`);
    continue;
  }
  const fields = Object.fromEntries(
    match[1].split("\n").map((line) => {
      const at = line.indexOf(":");
      return [line.slice(0, at).trim(), line.slice(at + 1).trim()];
    }),
  );
  if (fields.name !== dir) errors.push(`${dir}: name "${fields.name}" must match the folder`);
  if (!/^tm-[a-z0-9-]+$/.test(dir)) errors.push(`${dir}: folder must be kebab-case starting with tm-`);
  if (!fields.description) errors.push(`${dir}: missing description`);
  else if (fields.description.length > 1024) errors.push(`${dir}: description over 1024 characters`);
  if (/[<>]/.test(fields.description ?? "")) errors.push(`${dir}: description must not contain < or >`);
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`OK: ${skills.length} skills`);
