import { ROUTES, toSiteUrl } from "../lib/site";
import { source } from "../lib/source";

export async function loader() {
	const pages = source.getPages();

	const urls = [
		{ loc: toSiteUrl(ROUTES.llms), changefreq: "weekly", priority: "0.6" },
		{ loc: toSiteUrl(ROUTES.llmsFull), changefreq: "weekly", priority: "0.6" },
		...pages
			.filter((page) => page.url !== ROUTES.docs)
			.map((page) => ({
				loc: toSiteUrl(page.url),
				changefreq: "weekly",
				priority: page.url === ROUTES.docsDefault ? "1.0" : "0.8",
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
			"Cache-Control": "public, max-age=60",
		},
	});
}
