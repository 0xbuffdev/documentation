import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const config = JSON.parse(await readFile("wrangler.jsonc", "utf8"));

test("staging and production have independent domains and no R2 dependency", () => {
	assert.equal(config.name, "0xbuff-docs");
	assert.deepEqual(config.r2_buckets ?? [], []);
	assert.equal(config.vars.DOCS_ENV, "production");
	assert.deepEqual(config.env.staging.r2_buckets ?? [], []);
	assert.equal(config.env.staging.vars.DOCS_ENV, "staging");
	assert.equal(config.routes[0].pattern, "docs.0xbuff.com");
	assert.equal(config.env.staging.routes[0].pattern, "staging.docs.0xbuff.com");
	assert.equal(config.env.staging.vars.RESEND_SEGMENT_ID, "");
});

async function sourceFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = await Promise.all(entries.map(async (entry) => {
		const path = join(directory, entry.name);
		return entry.isDirectory() ? sourceFiles(path) : [path];
	}));
	return files.flat();
}

test("documentation builds without the private content package or catalog", async () => {
	const manifest = JSON.parse(await readFile("package.json", "utf8"));
	assert.equal(manifest.scripts["seed:content"], undefined);
	for (const group of [manifest.dependencies, manifest.devDependencies]) {
		assert.ok(!Object.keys(group).some((name) => name.includes("content-contract")));
	}
	assert.doesNotMatch(await readFile("pnpm-lock.yaml", "utf8"), /content-contract|npm\.pkg\.github\.com/);
	for (const path of [...await sourceFiles("src"), ...await sourceFiles("workers")]) {
		if (!/\.[jt]sx?$/.test(path)) continue;
		assert.doesNotMatch(await readFile(path, "utf8"), /getDocumentedProducts|catalog\.server|@0xbuff\/content-contract|R2Bucket/, path);
	}
});
