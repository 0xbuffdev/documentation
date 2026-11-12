import { remarkMdxMermaid } from "fumadocs-core/mdx-plugins";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { CONTENT_DOCS_OPTIONS } from "./src/lib/content-options";

export default defineConfig({
	mdxOptions: {
		remarkPlugins: (v) => [remarkMath, remarkMdxMermaid, ...v],
		rehypePlugins: (v) => [rehypeKatex, ...v],
	},
});

export const { docs, meta } = defineDocs({
	// Fumadocs requires a literal; keep it aligned with docs-config.json.
	dir: "content/docs",
	...CONTENT_DOCS_OPTIONS,
});
