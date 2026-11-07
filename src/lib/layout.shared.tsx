import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { XMark } from "~/components/brand-icons/x-mark";
import { YoutubeMark } from "~/components/brand-icons/youtube-mark";
import { BrandWordmark } from "~/components/brand-wordmark";
import { PRIMARY_NAVIGATION, ROUTES, SITE } from "./site";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			url: ROUTES.home,
			transparentMode: "top",
			title: (
				<span className="font-display font-bold tracking-tight">
					<BrandWordmark />{" "}
					<span className="text-muted-foreground font-normal">/</span>{" "}
					<span className="font-normal">docs</span>
				</span>
			),
		},
		links: [
			...PRIMARY_NAVIGATION,
			{
				type: "icon",
				label: "X",
				icon: <XMark size={16} />,
				text: "X",
				url: SITE.xUrl,
				external: true,
				secondary: true,
			},
			{
				type: "icon",
				label: "YouTube",
				icon: <YoutubeMark size={16} />,
				text: "YouTube",
				url: SITE.youtubeUrl,
				external: true,
				secondary: true,
			},
		],
		githubUrl: SITE.githubUrl,
	};
}
