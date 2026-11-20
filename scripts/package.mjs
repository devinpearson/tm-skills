// Builds dist/<skill-name>.zip for each skill, for upload in the Claude apps. Needs the zip CLI.
import { readdirSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
const skillsDir = join(root, "plugins", "toastmasters-reports", "skills");
const dist = join(root, "dist");
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);

for (const { name } of readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  execFileSync("zip", ["-qr", join(dist, `${name}.zip`), name], { cwd: skillsDir });
  console.log(`dist/${name}.zip`);
}
