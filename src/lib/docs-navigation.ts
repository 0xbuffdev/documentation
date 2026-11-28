import type { Root } from "fumadocs-core/page-tree";

export const DEFAULT_DOCS_PRODUCT = "assay";

export function hasDefaultDocsProduct(published: readonly { slug: string }[]): boolean {
	return published.some(({ slug }) => slug === DEFAULT_DOCS_PRODUCT);
}

/** Keep only authorized product roots, including Fumadocs folder index pages. */
export function filterPublishedProductRoots(tree: Root, availableUrls: ReadonlySet<string>): Root {
	const isPublished = (url: string) => availableUrls.has(url.replace(/\/$/, ""));
	return {
		...tree,
		children: tree.children.filter((node) =>
			node.type === "folder" &&
			((node.index != null && isPublished(node.index.url)) ||
				node.children.some((child) => child.type === "page" && isPublished(child.url))),
		),
	};
}
