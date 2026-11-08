import { getDocumentedProducts } from "../lib/catalog.server";
import { SITE } from "../lib/site";
import { source } from "../lib/source";
import type { Route } from "./+types/llms[.]txt";

export async function loader({ context }: Route.LoaderArgs) {
	const allowed = new Set((await getDocumentedProducts(context)).map((p) => p.slug));
	const pages = source.getPages().filter((page) => allowed.has(page.slugs[0]));
	const index = [
		"# 0xBUFF Documentation",
		"",
		"Guides and references for published products.",
		"",
		...pages.map((page) =>
			`- [${page.data.title}](${new URL(page.url, SITE.docsUrl)}): ${page.data.description ?? ""}`,
		),
	].join("\n");

	return new Response(`${index}\n`, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=60",
		},
	});
}
