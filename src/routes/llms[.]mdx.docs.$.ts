import { getLLMText } from "../lib/get-llm-text";
import { resolveDocPage } from "../lib/source";
import { getDocumentedProducts } from "../lib/catalog.server";
import type { Route } from "./+types/llms[.]mdx.docs.$";

export async function loader({ params, context }: Route.LoaderArgs) {
	const rawSlug = (params as Record<string, string | undefined>)["*"] ?? "";
	const { page } = resolveDocPage(rawSlug);
	const published = await getDocumentedProducts(context);
	if (!published.some((product) => product.slug === page.slugs[0])) {
		throw new Response("Not found", { status: 404 });
	}

	const content = await getLLMText(page);

	return new Response(content, {
		headers: {
			"Content-Type": "text/markdown; charset=utf-8",
			"Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
		},
	});
}
