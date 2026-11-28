import { generate as DefaultImage } from "fumadocs-ui/og/takumi";
import { ImageResponse } from "takumi-js/response";
import { SITE } from "../../../lib/site";
import { resolveDocPage } from "../../../lib/source";
import type { Route } from "./+types/$";

export async function loader({ params }: Route.LoaderArgs) {
	const rawSlug = (params as Record<string, string | undefined>)["*"] || "";
	const { page } = resolveDocPage(rawSlug, { stripTrailingImage: true });

	return new ImageResponse(
		<DefaultImage
			title={page.data.title}
			description={page.data.description}
				site={SITE.name}
				primaryColor={SITE.primaryColor}
			icon={
				<svg
					width="40"
					height="40"
					viewBox="0 0 24 24"
					fill="none"
						stroke={SITE.primaryColor}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
						<title>{SITE.name}</title>
						<path d="M4 5h7v7H4zM13 5l7 7m0-7-7 7" />
						<path d="M13 15h7v6h-7z" fill={SITE.primaryColor} stroke="none" />
				</svg>
			}
		/>,
		{
			width: 1200,
			height: 630,
			format: "webp",
		},
	);
}
