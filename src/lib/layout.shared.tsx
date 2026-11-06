import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { BrandWordmark } from "~/components/brand-wordmark";
import { PRIMARY_NAVIGATION, ROUTES, SITE } from "./site";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			url: ROUTES.home,
			transparentMode: "top",
			title: (
				<span className="font-display font-bold tracking-tight">
					<BrandWordmark />
				</span>
			),
		},
		links: [...PRIMARY_NAVIGATION],
		githubUrl: SITE.githubUrl,
	};
}
