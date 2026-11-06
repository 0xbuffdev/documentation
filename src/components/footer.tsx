import { Link } from "react-router";
import { BrandWordmark } from "~/components/brand-wordmark";
import { PAGE_COLUMN, RULED_BAND_TOP } from "~/components/frame";
import { COMPANY_LINKS, LEGAL_LINKS, ROUTES, SITE } from "~/lib/site";
import { cn } from "~/lib/utils";

/**
 * The docs site footer: mono link columns in the page column, an oversized
 * wordmark against the dotted backdrop, and a ruled meta band at the bottom.
 *
 * Every destination in this list is a real page — there is no `#` filler.
 */
type FooterLink = { label: string; href: string; external?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
	{
		title: "docs",
		links: [
			{ label: "documentation", href: ROUTES.docs },
			{ label: "memo fs manifesto", href: ROUTES.manifesto },
			{ label: "llms.txt", href: ROUTES.llms },
		],
	},
	{
		title: "company",
		links: [{ label: "notes", href: COMPANY_LINKS.notes, external: true }],
	},
	{
		title: "legal",
		links: [
			{ label: "Privacy Policy", href: LEGAL_LINKS.privacy, external: true },
			{ label: "Terms of Service", href: LEGAL_LINKS.terms, external: true },
		],
	},
	{
		title: "social",
		links: [
			{ label: "X", href: SITE.xUrl, external: true },
			{ label: "github", href: SITE.githubUrl, external: true },
		],
	},
];

const footerLinkClassName =
	"font-mono text-muted-foreground text-sm transition-colors hover:text-foreground";

export function Footer({
	hasPrecedingRule = false,
}: {
	/**
	 * True when the element above the footer already ends in a full-bleed
	 * ruled band (e.g. a navigate band), so the footer should not draw a
	 * second rule along the same seam.
	 */
	hasPrecedingRule?: boolean;
}) {
	return (
		// `overflow-hidden` (which contains the oversized wordmark) lives on an inner
		// wrapper, not on the band: on the band it would clip the half of the
		// intersection marker that sits above the footer's top rule.
		<footer className={hasPrecedingRule ? undefined : RULED_BAND_TOP}>
			<div className="overflow-hidden">
				<div className={cn("mx-auto px-4 pt-20 md:px-8", PAGE_COLUMN)}>
					<div className="grid grid-cols-2 gap-10 md:grid-cols-4">
						{COLUMNS.map((column) => (
							<nav aria-label={column.title} key={column.title}>
								<p className="font-mono text-primary text-xs">{column.title}</p>
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
							</nav>
						))}
					</div>
				</div>

				{/* Oversized wordmark. `aria-hidden` because the real brand name
				    is already in the header's link label. */}
				<p
					aria-hidden="true"
					className="mt-16 select-none text-center font-bold font-display text-[19vw] text-foreground/[0.05] leading-[0.8] tracking-tighter xl:text-[15rem]"
				>
					<BrandWordmark accentClassName="text-primary/20" />
				</p>
			</div>

			<div className={RULED_BAND_TOP}>
				<div
					className={cn(
						"mx-auto flex flex-col justify-between gap-2 px-4 py-5 font-mono text-muted-foreground text-xs md:flex-row md:px-8",
						PAGE_COLUMN,
					)}
				>
					<span>© 2026 0xBUFF. All processes reserved.</span>
					<span>
						<a
							className="hover:text-foreground"
							href={`mailto:${SITE.forkEmail}`}
						>
							{SITE.forkEmail}
						</a>
						{" · "}
						<span className="text-primary">EOF</span> · process exited with code
						0
					</span>
				</div>
			</div>
		</footer>
	);
}
