import { redirect } from "react-router";
import { ROUTES } from "../lib/site";
import type { Route } from "./+types/index";

export function loader({ request }: Route.LoaderArgs) {
	return redirect(ROUTES.docs + new URL(request.url).search, 308);
}
