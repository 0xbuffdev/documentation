import { getLLMText } from "../lib/get-llm-text";
import { source } from "../lib/source";
import { getDocumentedProducts } from "../lib/catalog.server";
import type { Route } from "./+types/llms-full[.]txt";

export async function loader({ context }: Route.LoaderArgs) {
	const allowed = new Set((await getDocumentedProducts(context)).map((p) => p.slug));
	const scan = source.getPages().filter((p) => allowed.has(p.slugs[0])).map(getLLMText);
	const scanned = await Promise.all(scan);

	return new Response(scanned.join("\n\n---\n\n"), {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
		},
	});
}
