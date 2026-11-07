import { DocsBody } from "fumadocs-ui/layouts/docs/page";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { Footer } from "../components/footer";
import { getMDXComponents } from "../components/mdx";
import { baseOptions } from "../lib/layout.shared";
import { createPageMeta } from "../lib/meta";
import { createRelativeLink } from "../lib/relative-link";
import { ROUTES } from "../lib/site";
import { manifestoDocs } from "../lib/docs";
import type { Route } from "./+types/manifesto";

export const meta: Route.MetaFunction = ({ loaderData }) => {
	const data = loaderData
	return createPageMeta({
		title: data.title,
		description: data?.description ?? "The MemoFS Manifesto.",
		path: ROUTES.manifesto,
	});
};

// Module scope: identical on every render (pure object spread, no hooks).
const manifestoComponents = getMDXComponents({
	a: createRelativeLink({ url: ROUTES.manifesto }),
});

export async function loader() {
	const entry = manifestoDocs.getPage("index.md");
	if (!entry) {
		throw new Response("Manifesto document not found", { status: 404 });
	}

	return {
		docPath: "index.md",
		title: entry.title,
		description: entry.description,
	};
}

export default function ManifestoPage({
	loaderData: _loaderData,
}: Route.ComponentProps) {
	const entry = manifestoDocs.getPage("index.md");
	if (!entry) {
		throw new Response("Manifesto document not found", { status: 404 });
	}
	const Mdx = entry.body;

	return (
		<HomeLayout {...baseOptions()}>
			<div className="relative w-full bg-background text-foreground">
				<main className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 sm:py-12 lg:px-8">
					<DocsBody className="max-w-none">
						<Mdx components={manifestoComponents} />
					</DocsBody>
				</main>

				<Footer />
			</div>
		</HomeLayout>
	);
}
