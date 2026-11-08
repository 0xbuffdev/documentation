import { createSearchAPI } from "fumadocs-core/search/server";
import { getDocumentedProducts } from "../lib/catalog.server";
import { source } from "../lib/source";
import type { Route } from "./+types/search-index[.]json";

/**
 * The static-search format is generated at request time so content that is
 * unpublished in this environment never appears in a public index.
 * Fumadocs' client still loads the index only when search is opened.
 */
export async function loader({ context }: Route.LoaderArgs) {
	const allowed = new Set((await getDocumentedProducts(context)).map((p) => p.slug));
	const indexes = await Promise.all(
		source
			.getPages()
			.filter((page) => allowed.has(page.slugs[0]))
			.map(async (page) => ({
				title: page.data.title,
				description: page.data.description,
				url: page.url,
				id: page.url,
				structuredData: await page.data.structuredData(),
			})),
	);

	const server = createSearchAPI("advanced", { indexes });
	const response = await server.staticGET();
	const headers = new Headers(response.headers);
	headers.set("Cache-Control", "public, max-age=60");
	return new Response(response.body, {
		status: response.status,
		headers,
	});
}
