import type { Config } from "@react-router/dev/config";

/** R2-backed pages are served by the Worker, never prerendered at build time. */
export default {
	ssr: true,
	appDirectory: "src",
} satisfies Config;
