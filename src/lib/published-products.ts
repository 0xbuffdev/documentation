import type { Product } from "@0xbuff/content-contract";

export type DocumentedProduct = Pick<
	Product,
	"slug" | "pid" | "name" | "status" | "description"
> & { tagline: string };

/**
 * Only cataloged products with a local documentation entry are published.
 * Their identities and display copy come from R2; the MDX repo owns the pages.
 */
export function selectDocumentedProducts(
	items: readonly Product[],
	hasPage: (slug: string) => boolean,
): DocumentedProduct[] {
	const pids = new Set<string>();
	const slugs = new Set<string>();
	for (const item of items) {
		if (pids.has(item.pid) || slugs.has(item.slug)) {
			throw new Error("[documentation] duplicate product identifiers in R2");
		}
		pids.add(item.pid);
		slugs.add(item.slug);
	}

	return items
		.filter(
			(item) =>
				!item.url &&
				/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) &&
				hasPage(item.slug),
		)
		.map(({ slug, pid, name, status, kicker, description }) => ({
			slug,
			pid,
			name,
			status,
			tagline: kicker,
			description,
		}))
		.sort((a, b) => a.pid.localeCompare(b.pid));
}
