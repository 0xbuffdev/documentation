import { glob } from "node:fs/promises";
import type { Config } from "@react-router/dev/config";
import { createGetUrl, getSlugs } from "fumadocs-core/source";
import { CONTENT_DIRS, ROUTES, STATIC_PRERENDER_PATHS } from "./src/lib/site";
import { getPageImagePath } from "./src/lib/shared";

const getUrl = createGetUrl(ROUTES.docs);

export default {
	ssr: true,
	appDirectory: "src",
	async prerender({ getStaticPaths }) {
		const paths = new Set<string>(getStaticPaths());

		for (const path of STATIC_PRERENDER_PATHS) {
			paths.add(path);
		}

		for await (const entry of glob("**/*.mdx", { cwd: CONTENT_DIRS.docs })) {
			const slugs = getSlugs(entry);
			paths.add(getUrl(slugs));
			paths.add(getPageImagePath(slugs));
		}

		return Array.from(paths);
	},
} satisfies Config;
