import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const target = process.argv[2];
const expected = {
	staging: {
		name: "0xbuff-docs-staging",
		domain: "staging.docs.0xbuff.com",
	},
	production: {
		name: "0xbuff-docs",
		domain: "docs.0xbuff.com",
	},
}[target];
if (!expected) throw new Error("Expected staging or production target");

const config = JSON.parse(await readFile("build/server/wrangler.json", "utf8"));
assert.equal(config.name, expected.name, "Incorrect Worker target");
assert.equal(config.vars?.DOCS_ENV, target, "Incorrect runtime environment");
assert.deepEqual(config.r2_buckets ?? [], [], "Documentation must not bind R2");
assert.ok(
	config.routes?.some(
		(route) => route.pattern === expected.domain && route.custom_domain === true,
	),
	"Incorrect Worker custom domain",
);
console.log(`Verified ${config.name} → ${expected.domain} without R2 bindings`);
