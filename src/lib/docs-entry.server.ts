import { redirect } from "react-router";
import { defaultDocsLocation } from "./docs-navigation";

export function redirectToDefaultDocs(request: Request) {
	return redirect(defaultDocsLocation(request.url), {
		status: 302,
		headers: { "Cache-Control": "no-store" },
	});
}
