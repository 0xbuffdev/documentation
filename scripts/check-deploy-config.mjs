import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const target = process.argv[2];
const expected = {
	staging: {
		name: "0xbuff-docs-staging",
		domain: "staging.docs.0xbuff.com",
		bucket: "content-staging",
	},
	production: {
		name: "0xbuff-docs",
		domain: "docs.0xbuff.com",
		bucket: "content",
	},
}[target];
if (!expected) throw new Error("Expected staging or production target");

const config = JSON.parse(
	await readFile("build/server/wrangler.json", "utf8"),
);
assert.equal(config.name, expected.name, "Incorrect Worker target");
assert.equal(config.vars?.DOCS_ENV, target, "Incorrect runtime environment");
assert.deepEqual(config.r2_buckets, [
	{ binding: "CONTENT", bucket_name: expected.bucket },
]);
assert.ok(
	config.routes?.some(
		(route) =>
			route.pattern === expected.domain && route.custom_domain === true,
	),
	"Incorrect Worker custom domain",
);
console.log(
	`Verified ${config.name} → ${expected.domain} with R2 CONTENT=${expected.bucket}`,
);
