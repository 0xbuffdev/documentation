import { useFumadocsLoader } from "fumadocs-core/source/client";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
	EditOnGitHub,
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
import { getDocumentedProducts } from "../../lib/catalog.server";
import type { Route } from "./+types/$";

export async function loader({ params, request, context }: Route.LoaderArgs) {
	const published = await getDocumentedProducts(context);
	const rawSlug = (params as Record<string, string | undefined>)["*"] ?? "";

	// Redirect bare /docs to the default product.
	if (rawSlug === "" || rawSlug === "/") {
		if (!published[0]) throw new Response("No published documentation", { status: 404 });
		throw redirect(`${ROUTES.docs}/${published[0].slug}`);
	}

	const isMarkdownRequested =
		rawSlug.endsWith(".md") ||
		rawSlug.endsWith(".mdx") ||
		request.headers.get("Accept")?.includes("text/markdown");

	const { page } = resolveDocPage(rawSlug);
	if (!published.some(({ slug }) => slug === page.slugs[0])) {
		throw new Response("Not found", { status: 404 });
	}

	if (isMarkdownRequested) {
		throw redirect(`/llms.mdx/docs/${page.slugs.join("/")}`, {
			headers: { Vary: "Accept" },
		});
	}

	const tree = source.getPageTree();
	const availableUrls = new Set(published.map(({ slug }) => `${ROUTES.docs}/${slug}`));
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
	toc,
}: {
	path: string;
	url: string;
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
				toc={loaderData.toc as unknown as TOCItemType[]}
			/>
		</DocsLayout>
	);
}
