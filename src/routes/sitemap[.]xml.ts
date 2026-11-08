import { ROUTES, toSiteUrl } from "../lib/site";
import { getDocumentedProducts } from "../lib/catalog.server";
import type { Route } from "./+types/sitemap[.]xml";
import { source } from "../lib/source";

export async function loader({ context }: Route.LoaderArgs) {
	const products = await getDocumentedProducts(context);
	const allowed = new Set(products.map((product) => product.slug));
	const pages = source.getPages().filter((page) => allowed.has(page.slugs[0]));

	const urls = [
		{ loc: toSiteUrl(ROUTES.home), changefreq: "daily", priority: "1.0" },
		...(products.length ? [{ loc: toSiteUrl(ROUTES.docs), changefreq: "daily", priority: "0.9" }] : []),
		{
			loc: toSiteUrl(ROUTES.manifesto),
			changefreq: "monthly",
			priority: "0.9",
		},
		{ loc: toSiteUrl(ROUTES.llms), changefreq: "weekly", priority: "0.6" },
		{ loc: toSiteUrl(ROUTES.llmsFull), changefreq: "weekly", priority: "0.6" },
		...pages
			.filter((page) => page.url !== ROUTES.docs)
			.map((page) => ({
				loc: toSiteUrl(page.url),
				changefreq: "weekly",
				priority: page.url === ROUTES.docsDefault ? "0.9" : "0.8",
			})),
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(url) => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
	)
	.join("\n")}
</urlset>`;

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
		},
	});
}
