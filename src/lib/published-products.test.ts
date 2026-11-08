import assert from "node:assert/strict";
import test from "node:test";
import type { Product } from "@0xbuff/content-contract";
import { selectDocumentedProducts } from "./published-products.ts";

function product(
	slug: string,
	pid: string,
	options: { url?: string; kicker?: string } = {},
): Product {
	return {
		slug,
		pid,
		hash: "abcdef12",
		file: `${slug}.abcdef12.md`,
		name: slug,
		status: "alpha",
		kicker: options.kicker ?? "A practical tool",
		description: "Detailed description",
		features: [{ title: "Feature", description: "Details" }],
		...(options.url ? { url: options.url } : {}),
	};
}

test("only products with local docs and no destination are rendered in pid order", () => {
	const entries = [
		product("throughline", "0x03"),
		product("external-tool", "0x01", { url: "https://example.com" }),
		product("not-documented", "0x02"),
		product("yes", "0x04"),
		product("../invalid", "0x05"),
	];
	const selected = selectDocumentedProducts(entries, (slug) =>
		["throughline", "yes"].includes(slug),
	);
	assert.deepEqual(selected.map((p) => p.slug), ["throughline", "yes"]);
	assert.equal(selected[0].tagline, "A practical tool");
	assert.equal("file" in selected[0], false);
	assert.equal("features" in selected[0], false);
});

test("rejects conflicting pids and slugs even on hidden products", () => {
	assert.throws(
		() => selectDocumentedProducts([product("one", "0x01"), product("two", "0x01")], () => true),
		/duplicate product identifiers/,
	);
	assert.throws(
		() => selectDocumentedProducts([product("one", "0x01"), product("one", "0x02")], () => true),
		/duplicate product identifiers/,
	);
});
