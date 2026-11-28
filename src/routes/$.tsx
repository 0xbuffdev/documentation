import { NotFoundPage } from "../components/not-found";
import { SITE } from "../lib/site";
import type { Route } from "./+types/$";

export function loader() {
	throw new Response("Not found", { status: 404 });
}

export const meta: Route.MetaFunction = () => [
	{ title: `Page not found | ${SITE.name}` },
	{ name: "robots", content: "noindex, nofollow" },
];

export default function NotFound() {
	return <NotFoundPage />;
}
