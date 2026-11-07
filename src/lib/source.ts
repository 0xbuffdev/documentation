import { loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/plugins/lucide-icons";
import { docs, manifestoDocs } from "./docs";
import { ROUTES } from "./site";

export { docs, manifestoDocs };

/**
 * Server-side page-tree loader.
 *
 * Only loaders and other server entry points should import this module: the
 * lucide icon plugin inlines the full `lucide-react` icon set, which we do not
 * want in the client bundle. Route client code imports from `./docs` instead.
 */
export const source = loader({
	baseUrl: ROUTES.docs,
	source: docs.toFumadocsSource(),
	plugins: [lucideIconsPlugin()],
});

/**
 * Normalizes a raw route slug string into a clean segment array by stripping
 * extensions (.data, .mdx, .md, trailing .webp) and filtering out empty segments.
 */
export function parseDocSlugs(
	rawSlug: string | undefined,
	options?: { stripTrailingImage?: boolean },
): string[] {
	let slug = rawSlug ?? "";
	if (slug.endsWith(".data")) {
		slug = slug.slice(0, -5);
	}
	if (slug.endsWith(".mdx")) {
		slug = slug.slice(0, -4);
	} else if (slug.endsWith(".md")) {
		slug = slug.slice(0, -3);
	}

	let segments = slug.split("/").filter((v) => v.length > 0 && v !== ".data");
	if (options?.stripTrailingImage && segments.at(-1)?.endsWith(".webp")) {
		segments = segments.slice(0, -1);
	}
	return segments;
}

/**
 * Resolves a doc page from a raw slug parameter. Throws 404 Response if not found.
 */
export function resolveDocPage(
	rawSlug: string | undefined,
	options?: { stripTrailingImage?: boolean },
) {
	const slugs = parseDocSlugs(rawSlug, options);
	const page = source.getPage(slugs);
	if (!page) {
		throw new Response("Not found", { status: 404 });
	}
	return { page, slugs };
}
