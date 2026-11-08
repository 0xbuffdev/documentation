import type { Config } from "@react-router/dev/config";
import { STATIC_PRERENDER_PATHS } from "./src/lib/site";

/** R2-backed pages are served by the Worker, never prerendered at build time. */
export default {
	ssr: true,
	appDirectory: "src",
	prerender: [...STATIC_PRERENDER_PATHS],
} satisfies Config;
