import { getDocumentedProducts } from "../lib/catalog.server";
import { redirectToDefaultDocs } from "../lib/docs-entry.server";
import type { Route } from "./+types/index";

export async function loader({ request, context }: Route.LoaderArgs) {
	return redirectToDefaultDocs(request, await getDocumentedProducts(context));
}
