import * as fs from "node:fs";
import * as pathModule from "node:path";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
	EditOnGitHub,
	PageLastUpdate,
} from "fumadocs-ui/layouts/docs/page";
import { redirect } from "react-router";
import type { TOCItemType } from "fumadocs-core/toc";
import { LLMCopyButton, ViewOptions } from "../../components/ai/page-actions";
import { getMDXComponents } from "../../components/mdx";
import { baseOptions } from "../../lib/layout.shared";
import { createPageMeta } from "../../lib/meta";
import { createRelativeLink } from "../../lib/relative-link";
import { getPageImagePath } from "../../lib/shared";
import {
	CONTENT_DIRS,
	ROUTES,
	SITE,
} from "../../lib/site";
import { docs } from "../../lib/docs";
import { resolveDocPage, source } from "../../lib/source";
import tools from "../../lib/tools.generated.json";
import type { Route } from "./+types/$";

export async function loader({ params, request }: Route.LoaderArgs) {
	const rawSlug = (params as Record<string, string | undefined>)["*"] ?? "";

	// Redirect bare /docs to the default product.
	if (rawSlug === "" || rawSlug === "/") {
		throw redirect(ROUTES.docsDefault);
	}

	const isMarkdownRequested =
		rawSlug.endsWith(".md") ||
		rawSlug.endsWith(".mdx") ||
		request.headers.get("Accept")?.includes("text/markdown");

	const { page } = resolveDocPage(rawSlug);

	if (isMarkdownRequested) {
		throw redirect(`/llms.mdx/docs/${page.slugs.join("/")}`, {
			headers: { Vary: "Accept" },
		});
	}

	let lastModified: number | undefined;
	const cleanPath = page.path.replace(/\.mdx?$/, "");
	try {
		const mdxPath = pathModule.join(
			process.cwd(),
			CONTENT_DIRS.docs,
			`${cleanPath}.mdx`,
		);
		const stat = fs.statSync(mdxPath);
		lastModified = stat.mtimeMs;
	} catch {
		try {
			const mdPath = pathModule.join(
				process.cwd(),
				CONTENT_DIRS.docs,
				`${cleanPath}.md`,
			);
			const stat = fs.statSync(mdPath);
			lastModified = stat.mtimeMs;
		} catch {
			// ignore
		}
	}

	const tree = source.getPageTree();
	const availableUrls = new Set(tools.map(({ slug }) => `${ROUTES.docs}/${slug}`));
	const sidebarTree = {
		...tree,
		children: tree.children.filter((node) =>
			node.type === "folder" &&
			node.children.some((child) => child.type === "page" && availableUrls.has(child.url.replace(/\/$/, ""))),
		),
	};

	return {
		toc: (await page.data.load()).toc as unknown as TOCItemType[],
		path: page.path,
		url: page.url,
		title: page.data.title,
		description: page.data.description,
		imagePath: getPageImagePath(page.slugs),
		lastModified,
		pageTree: await source.serializePageTree(sidebarTree),
	};
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
	const data = await serverLoader();
	await docs.getPage(data.path)?.preload();
	return data;
}

export const meta: Route.MetaFunction = ({  loaderData }) => {
	const data = loaderData
	return createPageMeta({
		title: data.title,
		description: data?.description || SITE.description,
		path: data.url,
		imagePath: data.imagePath,
	});
};

function Content({
	path,
	url,
	lastModified,
	toc,
}: {
	path: string;
	url: string;
	lastModified?: number;
	toc: TOCItemType[];
}) {
	const page = docs.getPage(path);
	if (!page) throw new Error(`unknown page: ${path}`);

	const Mdx = page.body;
	const cleanDocPath =
		path.endsWith(".mdx") || path.endsWith(".md") ? path : `${path}.mdx`;
	const markdownUrl = `${url}.md`;
	const githubUrl = `${SITE.githubUrl}/blob/main/${CONTENT_DIRS.docs}/${cleanDocPath}`;

	return (
		<DocsPage
			toc={toc}
			tableOfContent={{ style: "clerk" }}
			className="max-w-3xl px-4 sm:px-6"
		>
			<DocsTitle>{page.title}</DocsTitle>
			<DocsDescription>{page.description}</DocsDescription>
			<div className="not-prose my-4 flex flex-row items-center gap-2 border-b border-dashed border-border pb-4">
				<LLMCopyButton markdownUrl={markdownUrl} />
				<ViewOptions markdownUrl={markdownUrl} githubUrl={githubUrl} />
			</div>
			<DocsBody className="max-w-3xl">
				<Mdx
					components={getMDXComponents({
						a: createRelativeLink({ url }),
					})}
				/>
			</DocsBody>
			<div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-dashed border-border pt-4 text-xs text-muted-foreground dark:border-border">
				<EditOnGitHub href={githubUrl} />
				{lastModified ? <PageLastUpdate date={new Date(lastModified)} /> : null}
			</div>
		</DocsPage>
	);
}

export default function Page({ loaderData }: Route.ComponentProps) {
	const { path, pageTree } = useFumadocsLoader(loaderData);

	return (
		<DocsLayout {...baseOptions()} tree={pageTree}>
			{/* SerializeFrom widens `toc.title` to the MDX macro's loose node
			    type; the wire format is plain JSON, so re-narrow it here. */}
			<Content
				path={path}
				url={loaderData.url}
				lastModified={loaderData.lastModified}
				toc={loaderData.toc as unknown as TOCItemType[]}
			/>
		</DocsLayout>
	);
}
