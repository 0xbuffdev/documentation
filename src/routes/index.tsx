import { redirectToDefaultDocs } from "../lib/docs-entry.server";
import type { Route } from "./+types/index";

export function loader({ request }: Route.LoaderArgs) {
	return redirectToDefaultDocs(request);
}
