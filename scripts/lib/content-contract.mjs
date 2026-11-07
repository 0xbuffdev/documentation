/**
 * Vendored subset of `@0xbuff/content-contract` @ commit c4fb9c944700cd6e686d7268be25c9039fde43e2.
 *
 * The full contract lives in the private 0xbuffdev/content repo and was
 * consumed as a git dependency; that blocks credential-less installs (CI),
 * and catalog previews only need product frontmatter. Re-vendor from a
 * newer contract commit here when the sync script is pointed at remote
 * content again.
 */
import { z } from "zod";

/** Pinned `0xbuffdev/content` commit the vendored contract was taken from. */
export const CONTENT_REVISION = "c4fb9c944700cd6e686d7268be25c9039fde43e2";

/**
 * What a record claims about its readiness.
 *
 * `running` speaks for products published or opening live, `beta`/`alpha`
 * for early but usable code, and `spawning` for announced products that have
 * not opened. No record claims more than what is shipped.
 */
export const PRODUCT_STATUSES = ["running", "beta", "alpha", "spawning"];

/** The process identifier, `0xNN`, in hex. */
const pid = z.string().regex(/^0x[0-9a-fA-F]{2}$/);

const nonEmpty = z.string().min(1);

/** Product frontmatter — one entry in the company's product catalog. */
export const ProductDocumentSchema = z.strictObject({
	pid,
	/** The product's name, spelled the way the catalog spells it. */
	name: nonEmpty,
	status: z.enum(PRODUCT_STATUSES),
	/** A brief description of the product's purpose or value proposition. */
	kicker: nonEmpty,
	/** What the product does — one paragraph an author can read aloud. */
	description: nonEmpty,
	/** The product's public destination, when it has one. */
	url: z.url().optional(),
	/** Marks a `url` that is the product itself rather than a reference. */
	external: z.boolean().optional(),
	/** The copy for the destination's link. */
	label: z.string().optional(),
	/** What the product ships — one item per capability. */
	features: z
		.array(z.strictObject({ title: nonEmpty, description: nonEmpty }))
		.min(1),
});
