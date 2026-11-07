import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Creates a staging deploy configuration from the plugin-generated Worker
 * config.
 *
 * The `@cloudflare/vite-plugin` writes `build/server/wrangler.json` as a
 * redirected deploy configuration ("Deploy configuration" for
 * `.wrangler/deploy/config.json`), and Wrangler's `--env` overrides are
 * silently ignored for redirected configs. To deploy a separate staging
 * Worker, this script derives a sibling config with a distinct service name
 * and the staging custom-domain route, relative paths unchanged so `main` and
 * `assets` still resolve inside `build/server/`.
 */
const source = path.join("build", "server", "wrangler.json");
const target = path.join("build", "server", "wrangler.staging.json");

const config = JSON.parse(await readFile(source, "utf8"));

if (config.topLevelName !== config.name) {
	throw new Error(
		`Expected an unscoped deploy config for ${config.topLevelName}, got ${config.name}`,
	);
}

const STAGING_HOST = "staging.docs.0xbuff.com";
const stagingConfig = {
	...config,
	name: `${config.name}-staging`,
	routes: [{ pattern: STAGING_HOST, custom_domain: true }],
};

// Drop plugin-redirect metadata; deploying with `-c` uses this file as-is.
delete stagingConfig.userConfigPath;
delete stagingConfig.configPath;
delete stagingConfig.definedEnvironments;

await mkdir(path.dirname(target), { recursive: true });
await writeFile(target, `${JSON.stringify(stagingConfig)}\n`);
console.log(`Wrote ${target} for ${stagingConfig.name} at ${STAGING_HOST}`);
