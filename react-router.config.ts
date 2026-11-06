import { glob } from "node:fs/promises";
import type { Config } from "@react-router/dev/config";
import { createGetUrl, getSlugs } from "fumadocs-core/source";
import { CONTENT_DIRS, ROUTES, STATIC_PRERENDER_PATHS } from "./src/lib/site";

	const getUrl = createGetUrl(ROUTES.docs);

export default {
	ssr: true,
	// Cloudflare Pages deploys the prerendered client bundle without the React
	// Router server build. Load the complete route manifest in each document so
	// client navigation never requests the unavailable `/__manifest` endpoint.
	routeDiscovery: { mode: "initial" },
	appDirectory: "src",
	async prerender({ getStaticPaths }) {
		const paths = new Set<string>(getStaticPaths());

		for (const path of STATIC_PRERENDER_PATHS) {
			paths.add(path);
		}

		for await (const entry of glob("**/*.mdx", { cwd: CONTENT_DIRS.docs })) {
			const slugs = getSlugs(entry);
			paths.add(getUrl(slugs));
		}

		return Array.from(paths);
	},
} satisfies Config;
