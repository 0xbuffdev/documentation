import assert from "node:assert/strict";
import test from "node:test";
import type { Root } from "fumadocs-core/page-tree";
import { DEFAULT_DOCS_PRODUCT, filterPublishedProductRoots, hasDefaultDocsProduct } from "./docs-navigation.ts";

test("Assay is the explicit default regardless of catalog ordering", () => {
	assert.equal(DEFAULT_DOCS_PRODUCT, "assay");
	assert.equal(hasDefaultDocsProduct([{ slug: "throughline" }, { slug: "assay" }]), true);
	assert.equal(hasDefaultDocsProduct([{ slug: "assay" }, { slug: "throughline" }]), true);
	assert.equal(hasDefaultDocsProduct([{ slug: "throughline" }]), false);
	assert.equal(hasDefaultDocsProduct([]), false);
});

test("published product folders retain index-only roots and exclude unpublished roots", () => {
	const page = (slug: string) => ({ type: "page" as const, name: slug, url: `/docs/${slug}` });
	const tree: Root = {
		name: "Docs",
		children: [
			{ type: "folder", name: "Assay", root: true, index: page("assay"), children: [] },
			{ type: "folder", name: "Throughline", root: true, children: [page("throughline")] },
			{ type: "folder", name: "Unpublished", root: true, index: page("unpublished"), children: [] },
		],
	};
	const filtered = filterPublishedProductRoots(tree, new Set(["/docs/assay", "/docs/throughline"]));
	assert.deepEqual(filtered.children.map((node) => node.name), ["Assay", "Throughline"]);
	assert.equal(tree.children.length, 3);
	assert.deepEqual(filterPublishedProductRoots(tree, new Set()).children, []);
});
