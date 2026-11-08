import { spawnSync } from "node:child_process";

const environment = process.argv[2];
if (environment !== "staging") {
	throw new Error("Only the staging environment uses this build helper.");
}

const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const result = spawnSync(command, ["run", "build"], {
	stdio: "inherit",
	env: { ...process.env, CLOUDFLARE_ENV: environment },
	shell: process.platform === "win32",
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
