import { createRequestHandler, RouterContextProvider } from "react-router";
import { cloudflareContext } from "../src/lib/cloudflare-context";

const handleRequest = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const context = new RouterContextProvider();
		context.set(cloudflareContext, { env, ctx });
		const response = await handleRequest(request, context);
		if ((env as Env & { DOCS_ENV?: string }).DOCS_ENV !== "staging") {
			return response;
		}
		const headers = new Headers(response.headers);
		headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers,
		});
	},
} satisfies ExportedHandler<Env>;
