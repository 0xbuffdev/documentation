import { Link } from "react-router";
import { BrandWordmark } from "~/components/brand-wordmark";
import { RULED_BAND_TOP } from "~/components/frame";
import { COMPANY_LINKS, LEGAL_LINKS, ROUTES, SITE } from "~/lib/site";
import { cn } from "~/lib/utils";

/**
 * The docs site footer: four link columns mirroring the 0xBUFF company footer
 * (products → education → resources → company + connect), with a docs-specific
 * first column for documentation links (sitemap, llms.txt, etc.).
 *
 * The bottom bar renders legal links and the branded sign-off.
 *
 * Every destination in this list is a real page — there is no `#` filler.
 */
type FooterLink = { label: string; href: string; external?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
	{
		title: "products",
		links: [
			{ label: "Products", href: `${SITE.companyUrl}/products`, external: true },
			{ label: "Pricing", href: `${SITE.companyUrl}/pricing`, external: true },
			{ label: "Documentation", href: ROUTES.docs },
		],
	},
	{
		title: "education",
		links: [
			{ label: "0xNAND", href: "https://nand.0xbuff.com", external: true },
			{ label: "OEE", href: "https://github.com/0xbuffdev/open-engineering-education", external: true },
			{ label: "Mentorship", href: `${SITE.companyUrl}/mentorship`, external: true },
		],
	},
	{
		title: "resources",
		links: [
			{ label: "Notes", href: COMPANY_LINKS.notes, external: true },
			{ label: "Changelog", href: COMPANY_LINKS.changelog, external: true },
			{ label: "The Dispatch", href: `${SITE.companyUrl}/dispatch`, external: true },
			{ label: "MemoFS Manifesto", href: ROUTES.manifesto },
			{ label: "llms.txt", href: ROUTES.llms },
			{ label: "Sitemap", href: ROUTES.sitemap },
		],
	},
	{
		title: "company",
		links: [
			{ label: "About", href: `${SITE.companyUrl}/about`, external: true },
			{ label: "X", href: SITE.xUrl, external: true },
			{ label: "GitHub", href: SITE.githubUrl, external: true },
			{ label: "YouTube", href: SITE.youtubeUrl, external: true },
			{ label: SITE.forkEmail, href: `mailto:${SITE.forkEmail}` },
		],
	},
];

const footerLinkClassName =
	"font-mono text-muted-foreground text-sm transition-colors hover:text-foreground";

export function Footer() {
	const year = new Date().getFullYear();

	return (
		
		<footer className={RULED_BAND_TOP}>
			<div className="overflow-hidden">
				<div className="mx-auto w-full max-w-5xl px-6 pt-16 md:px-8 md:pt-20">
					<nav
						aria-label="Footer"
						className="grid grid-cols-2 gap-x-12 gap-y-10 lg:grid-cols-4"
					>
						{COLUMNS.map((column) => (
							<div key={column.title}>
								<p className="font-mono text-primary text-xs uppercase tracking-wider">
									{column.title}
								</p>
								<ul className="mt-4 space-y-2.5">
									{column.links.map((link) => (
										<li key={link.label}>
											{link.external ? (
												<a
													className={footerLinkClassName}
													href={link.href}
													rel="noopener noreferrer"
													target="_blank"
												>
													{link.label}
													<span
														aria-hidden="true"
														className="text-muted-foreground/40"
													>
														{" ↗"}
													</span>
												</a>
											) : (
												<Link className={footerLinkClassName} to={link.href}>
													{link.label}
												</Link>
											)}
										</li>
									))}
								</ul>
							</div>
						))}
					</nav>
				</div>

				{/* Oversized wordmark. `aria-hidden` because the real brand name
				    is already in the header's link label. */}
				<p
					aria-hidden="true"
					className={cn(
						"mt-12 select-none text-center font-bold font-display text-[18vw]",
						"text-foreground/[0.04] leading-none tracking-tighter xl:text-[14rem]",
					)}
				>
					<BrandWordmark accentClassName="text-primary/20" />
				</p>
			</div>

			<div className={RULED_BAND_TOP}>
				<div
					className={cn(
						"mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-6 py-5 sm:px-10 md:px-16",
						"font-mono text-muted-foreground text-xs sm:flex-row sm:flex-wrap",
					)}
				>
					<span>© {year} 0xBUFF. All rights reserved.</span>
					<span>
						<a
							className="transition-colors hover:text-foreground"
							href={LEGAL_LINKS.privacy}
							target="_blank"
							rel="noopener noreferrer"
						>
							Privacy Policy
						</a>
						{" "}
						<span className="text-primary">/</span>
						{" "}
						<a
							className="transition-colors hover:text-foreground"
							href={LEGAL_LINKS.terms}
							target="_blank"
							rel="noopener noreferrer"
						>
							Terms of Service
						</a>
						{" "}
						<span className="text-primary">/</span>
						{" "}
						<span className="text-primary">EOF</span>
					</span>
				</div>
			</div>
		</footer>
	);
}
