import { createSearchAPI } from "fumadocs-core/search/server";
import { source } from "../lib/source";

/**
 * Build the search index from the same local MDX collection as the pages.
 * Fumadocs' client loads it only when search is opened.
 */
export async function loader() {
	const indexes = await Promise.all(
		source
			.getPages()
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
