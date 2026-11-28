import type { Config } from "@react-router/dev/config";

/** Render the compiled MDX collection through the Worker. */
export default {
	ssr: true,
	appDirectory: "src",
} satisfies Config;
