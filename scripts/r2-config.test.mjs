import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const config = JSON.parse(await readFile("wrangler.jsonc", "utf8"));

test("production and staging use distinct published 0xBUFF buckets", () => {
	assert.equal(config.name, "0xbuff-docs");
	assert.deepEqual(config.r2_buckets, [{ binding: "CONTENT", bucket_name: "content" }]);
	assert.equal(config.vars.DOCS_ENV, "production");
	assert.deepEqual(config.env.staging.r2_buckets, [
		{ binding: "CONTENT", bucket_name: "content-staging" },
	]);
	assert.equal(config.env.staging.vars.DOCS_ENV, "staging");
	assert.equal(config.routes[0].pattern, "docs.0xbuff.com");
	assert.equal(config.env.staging.routes[0].pattern, "staging.docs.0xbuff.com");
	assert.notEqual(
		config.env.staging.r2_buckets[0].bucket_name,
		config.r2_buckets[0].bucket_name,
	);
	assert.equal(config.env.staging.vars.RESEND_SEGMENT_ID, "");
});
