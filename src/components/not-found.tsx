import { Link } from "react-router";
import { BrandWordmark } from "./brand-wordmark";
import { ROUTES, SITE } from "~/lib/site";

export function NotFoundPage() {
	return (
		<main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-5 px-6 py-12">
			<Link to={ROUTES.docsDefault} className="w-fit font-display font-bold tracking-tight">
				<BrandWordmark /> <span className="text-muted-foreground font-normal">/ docs</span>
			</Link>
			<p className="font-mono text-sm text-muted-foreground">404</p>
			<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Page not found</h1>
			<p className="text-muted-foreground">This documentation page may have moved or no longer exists.</p>
			<div className="flex flex-wrap gap-4 text-sm">
				<Link className="font-medium text-primary underline underline-offset-4" to={ROUTES.docsDefault}>
					Back to documentation
				</Link>
				<a className="text-muted-foreground underline underline-offset-4" href={SITE.companyUrl}>
					0xBUFF website
				</a>
			</div>
		</main>
	);
}
