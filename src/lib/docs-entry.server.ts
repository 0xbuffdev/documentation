import { redirect } from "react-router";
import { hasDefaultDocsProduct } from "./docs-navigation";
import { ROUTES } from "./site";

export function redirectToDefaultDocs(request: Request, published: readonly { slug: string }[]) {
	if (!hasDefaultDocsProduct(published)) {
		throw new Response("Default documentation is not published", {
			status: 503,
			headers: { "Cache-Control": "no-store" },
		});
	}
	return redirect(ROUTES.docsDefault + new URL(request.url).search, {
		status: 302,
		headers: { "Cache-Control": "no-store" },
	});
}
