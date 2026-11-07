import { defineDocs } from "fumadocs-mdx/macro";

/**
 * Client-safe docs collections.
 *
 * This module must stay free of server-only imports (the page-tree loader,
 * icon plugins, node builtins): route components import it in the browser to
 * render MDX bodies. MDX content is loaded on demand — only frontmatter is
 * eager — so individual pages are split into their own lazy chunks.
 */
export const docs = defineDocs({
	// Fumadocs requires a literal; keep it aligned with docs-config.json.
	dir: "content/docs",
	docs: {
		async: true,
		postprocess: { includeProcessedMarkdown: true },
	},
});

export const manifestoDocs = defineDocs({
	// Fumadocs requires a literal; keep it aligned with docs-config.json.
	dir: "content/manifesto",
	docs: {
		async: true,
		postprocess: { includeProcessedMarkdown: true },
	},
});
