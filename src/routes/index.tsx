import { Link } from "react-router";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { ArrowRight } from "lucide-react";
import { Footer } from "~/components/footer";
import { CELL_SHEEN, PatternZone } from "~/components/pattern-zone";
import { Badge } from "~/components/ui/badge";
import { baseOptions } from "~/lib/layout.shared";
import { createPageMeta } from "~/lib/meta";
import { ROUTES } from "~/lib/site";
import tools from "~/lib/tools.generated.json";
import type { Route } from "./+types/index";

const DOCS_META = {
  title: "Documentation",
  description:
    "Explore guides, technical references, and implementation details for 0xBUFF products and tools.",
} as const;

export const meta: Route.MetaFunction = () => {
	return createPageMeta({
		title: DOCS_META.title,
		description: DOCS_META.description,
		path: ROUTES.home,
	});
};

type ProductCardItem = (typeof tools)[number];

function ProductBentoCard({ product }: { product: ProductCardItem }) {
	const statusLabel = product.status;

	const content = (
		<div className="relative flex h-full flex-col justify-between p-6">
			<span aria-hidden="true" className={CELL_SHEEN} />
			<PatternZone seed={product.name} watermark={product.pid} />

			<div className="relative z-10 flex h-full flex-col justify-between">
				<div>
					<div className="flex items-start justify-between gap-4">
						<div>
							<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
								PID {product.pid}
							</p>
							<h2 className="mt-2 font-semibold text-foreground text-xl tracking-tight">
								{product.name}
							</h2>
						</div>
						<span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors group-hover:text-primary">
							Read the Docs
							<ArrowRight
								aria-hidden="true"
								className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
							/>
						</span>
					</div>
					<p className="mt-1 font-medium text-xs text-primary/90">
						{product.tagline}
					</p>
					<p className="mt-2.5 max-w-sm text-pretty text-muted-foreground text-sm leading-relaxed">
						{product.description}
					</p>
				</div>

				<div className="mt-8 flex items-center justify-between gap-2">
					<Badge
						variant={"outline"}
						className="font-mono text-[10px] rounded-sm capitalize border-border"
					>
						{statusLabel}
					</Badge>
				</div>
			</div>
		</div>
	);

	return (
		<Link
			aria-label={`${product.name}, read documentation`}
			className="group relative min-h-56 rounded-sm border border-border bg-card/60 transition-all duration-300 hover:border-primary/40 hover:bg-card/90 overflow-hidden shadow-sm"
			to={`${ROUTES.docs}/${product.slug}`}
		>
			{content}
		</Link>
	);
}

export default function DocumentationLandingPage() {
	return (
		<HomeLayout {...baseOptions()}>
			<div className="relative flex min-h-[calc(100dvh-3.5rem)] w-full flex-col bg-background text-foreground">
				<main className="flex flex-1 justify-between px-4 w-full mx-auto md:px-12 lg:px-16 pt-8 md:pt-12 pb-16 md:pb-24 max-w-6xl">
					<div className="w-full max-w-5xl mx-auto z-10">
						<div className="mb-12">
							<h1
								className="text-4xl md:text-5xl mb-4 text-foreground  font-medium tracking-tight"
								style={{ lineHeight: 1.13, letterSpacing: "-0.035em" }}
							>
								{DOCS_META.title}
							</h1>
							<p className="text-lg md:text-xl text-muted-foreground font-normal leading-relaxed">
								{DOCS_META.description}
							</p>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4">
							{tools.map((product) => (
								<ProductBentoCard key={product.pid} product={product} />
							))}
						</div>
					</div>
				</main>

				<Footer />
			</div>
		</HomeLayout>
	);
}
