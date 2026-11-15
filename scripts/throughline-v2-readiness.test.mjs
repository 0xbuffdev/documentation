import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const root = new URL("../", import.meta.url);
const load = path => readFileSync(new URL(path, root), "utf8");
const packageJson = JSON.parse(load("package.json"));
const pinned = packageJson.dependencies?.["@0xbuff/throughline"];
const mdx = load("source.config.ts");
const components = load("src/components/mdx.tsx");
const plan = load("docs/throughline-v2-integration-handoff.md");

test("the docs app never silently adopts an unpublished Throughline v2 API", () => {
	assert.equal(typeof pinned, "string");
	// Before the verified public v2 release, preserve the working old package
	// and do not add a v2 import that cannot compile from the registry.
	if (pinned === "0.0.2") {
		assert.doesNotMatch(mdx, /from ["']@0xbuff\/throughline\/remark["']/);
		assert.doesNotMatch(components, /from ["']@0xbuff\/throughline\/react["']/);
	} else {
		// The future integration PR must prove the actual source wiring.
		assert.match(mdx, /remarkThroughline/);
		assert.match(components, /ThroughlineEmbed/);
	}
});

test("the planned upgrade retains the established Fumadocs, math and Mermaid path", () => {
	assert.match(mdx, /remarkMath/);
	assert.match(mdx, /remarkMdxMermaid/);
	assert.match(mdx, /rehypeKatex/);
	assert.match(components, /defaultMdxComponents/);
	assert.match(components, /Mermaid/);
	assert.match(plan, /remarkThroughline/);
	assert.match(plan, /createNodeThroughlineHost/);
	assert.match(plan, /TL-U19/);
	assert.match(plan, /TL-U20/);
	assert.match(plan, /unpublished package dependency/);
});
