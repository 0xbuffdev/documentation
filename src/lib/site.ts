import docsConfig from "./docs-config.json";

/**
 * Canonical site identity, navigation, and static-route metadata for the docs
 * application. Keep public URLs and shared labels here so layouts, metadata,
 * sitemap generation, and Workers stay in sync.
 */

/** Public 0xBUFF URLs, brand identity, and default social metadata. */
const BRAND_PREFIX = "0x";
const BRAND_ACCENT = "BUFF";
const BRAND_ICON_PATH = "/icon-512.png";

export const SITE = {
	name: `${BRAND_PREFIX}${BRAND_ACCENT}`,
	wordmark: { prefix: BRAND_PREFIX, accent: BRAND_ACCENT },
	title: "Tools to build with. Mastery to build well.",
	description:
		"Documentation for Throughline, the interactive step-player for learning and teaching complex systems, from 0xBUFF.",
	companyUrl: "https://0xbuff.com",
	docsUrl: "https://docs.0xbuff.com",
	githubUrl: "https://github.com/0xbuffdev/documentation",
	xUrl: "https://x.com/0xbvff",
	xHandle: "@0xbvff",
	youtubeUrl: "https://youtube.com/@0xbuff",
	/** General inbox, shown in the footer's meta band. */
	forkEmail: "fork@0xbuff.dev",
	defaultImagePath: BRAND_ICON_PATH,
	defaultImageAlt: `${BRAND_PREFIX}${BRAND_ACCENT} mark in white and orange on a charcoal background`,
	primaryColor: "#ff7148",
	themeColor: "#14120f",
	locale: "en_US",
	faviconPath: "/favicon.svg",
	faviconIcoPath: "/favicon.ico",
	iconPath: "/icon-192.png",
	manifestPath: "/manifest.webmanifest",
} as const;

/** Canonical content locations shared by the source loader and route tooling. */
export const CONTENT_DIRS = {
	docs: docsConfig.docsContentDir,
	manifesto: docsConfig.manifestoContentDir,
} as const;

/** Outbound company pages shared by the header and footer. */
export const COMPANY_LINKS = {
	changelog: `${SITE.companyUrl}/changelog`,
	notes: `${SITE.companyUrl}/notes`,
} as const;

/** Published legal pages for 0xBUFF. */
export const LEGAL_LINKS = {
	privacy: `${SITE.companyUrl}/privacy`,
	terms: `${SITE.companyUrl}/terms`,
} as const;

/** Canonical internal routes shared by navigation, metadata, and prerendering. */
export const ROUTES = {
	home: "/",
	docs: "/docs",
	/** Default product shown when navigating to /docs. */
	docsDefault: "/docs",
	manifesto: "/manifesto",
	docsOg: docsConfig.docsImageRoute,
	llms: "/llms.txt",
	llmsFull: "/llms-full.txt",
	robots: "/robots.txt",
	sitemap: "/sitemap.xml",
	searchIndex: "/search-index.json",
} as const;

/** Static application pages in addition to documentation pages discovered from MDX. */
export const STATIC_PRERENDER_PATHS = [
	ROUTES.manifesto,
] as const;

/** Primary navigation rendered by the Fumadocs layouts. */
export const PRIMARY_NAVIGATION = [
	{
		text: "Documentation",
		url: ROUTES.docsDefault,
		active: "nested-url",
		on: "all",
	},
	{
		text: "0xBUFF ↗",
		url: SITE.companyUrl,
		external: true,
		on: "all",
	},
	{
		text: "0xNAND ↗",
		url: "https://nand.0xbuff.com",
		external: true,
		on: "all",
	},
	{
		text: "Changelog ↗",
		url: COMPANY_LINKS.changelog,
		external: true,
		on: "all",
	},
	{
		text: "Notes ↗",
		url: COMPANY_LINKS.notes,
		external: true,
		on: "all",
	},
] as const;

/** Builds a public absolute URL from a canonical application path. */
export function toSiteUrl(path: string): string {
	return new URL(path, SITE.docsUrl).toString();
}
