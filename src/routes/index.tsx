import { redirect } from "react-router";
import { ROUTES, SITE } from "~/lib/site";
import type { Route } from "./+types/index";

/**
 * `/` — the docs site has no landing page of its own: it redirects to the
 * docs root. `react-router.config.ts` prerenders this route, so the served
 * HTML carries a meta refresh — the loader redirect only covers SSR/dev.
 */
export const meta: Route.MetaFunction = () => [
	{ title: `Redirecting… | ${SITE.name}` },
	{ name: "robots", content: "noindex, nofollow" },
	{ httpEquiv: "refresh", content: `0; url=${ROUTES.docs}` },
];

export function loader() {
	throw redirect(ROUTES.docs);
}

export default function HomeRedirect() {
	return (
		<main className="flex min-h-dvh items-center justify-center font-mono text-muted-foreground text-sm">
			<p>
				redirecting to <a href={ROUTES.docs}>/docs</a>…
			</p>
		</main>
	);
}
