import { ExternalLink } from "lucide-react";
import { PRIMARY_NAVIGATION } from "../lib/site";

export function CompanyNavigation() {
	return (
		<nav
			aria-label="Company links"
			className="mt-4 flex shrink-0 flex-col gap-1 border-t border-border pt-3 text-sm"
		>
			{PRIMARY_NAVIGATION.map(({ text, url }) => (
				<a
					key={url}
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-2 rounded-md px-1.5 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
				>
					<ExternalLink aria-hidden="true" className="size-4 shrink-0" />
					{text}
				</a>
			))}
		</nav>
	);
}
