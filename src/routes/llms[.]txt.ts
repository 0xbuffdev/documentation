import { SITE } from "../lib/site";
import { source } from "../lib/source";

export async function loader() {
	const pages = source.getPages();
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
