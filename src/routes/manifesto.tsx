import { redirect } from "react-router";
import { SITE } from "../lib/site";

/** Preserve external bookmarks while the manifesto moves to the 0xBUFF site. */
export function loader() {
	return redirect(`${SITE.companyUrl}/products/memofs/manifesto`, 301);
}
