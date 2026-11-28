import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { DEFAULT_DOCS_PATH, DEFAULT_DOCS_PRODUCT, defaultDocsLocation } from "./docs-navigation.ts";

test("the default product has a local MDX overview and appears first in navigation", async () => {
	assert.equal(DEFAULT_DOCS_PRODUCT, "assay");
	assert.equal(DEFAULT_DOCS_PATH, "/docs/assay");
	const root = new URL("../../content/docs/", import.meta.url);
	const meta = JSON.parse(await readFile(new URL("meta.json", root), "utf8"));
	assert.equal(meta.pages[0], DEFAULT_DOCS_PRODUCT);
	const overview = await readFile(new URL(`${DEFAULT_DOCS_PRODUCT}/index.mdx`, root), "utf8");
	assert.match(overview, /^---\r?\n/);
});

test("both entry paths resolve directly to Assay and preserve query strings", () => {
	for (const path of ["/", "/docs", "/docs/"]) {
		assert.equal(defaultDocsLocation(`https://docs.0xbuff.com${path}`), "/docs/assay");
		assert.equal(defaultDocsLocation(`https://docs.0xbuff.com${path}?q=a%20b&x=1`), "/docs/assay?q=a%20b&x=1");
	}
});
