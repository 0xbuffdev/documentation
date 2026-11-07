import { createRequestHandler, RouterContextProvider } from "react-router";
import { cloudflareContext } from "../src/lib/cloudflare-context";

const handleRequest = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const context = new RouterContextProvider();
		context.set(cloudflareContext, { env, ctx });
		return handleRequest(request, context);
	},
} satisfies ExportedHandler<Env>;
