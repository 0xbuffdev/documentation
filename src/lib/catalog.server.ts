import {
	ProductSchema,
	sectionManifestSchema,
	TopManifestSchema,
	type Product,
} from "@0xbuff/content-contract";
import type { RouterContextProvider } from "react-router";
import { cloudflareContext } from "./cloudflare-context";
import { source } from "./source";

export type DocumentedProduct = Pick<
	Product,
	"slug" | "pid" | "name" | "status" | "description"
> & { tagline: string };

const MANIFEST_TTL = 60;

async function readManifest(
	bucket: R2Bucket,
	key: string,
	environment: string,
	ctx: ExecutionContext,
): Promise<unknown> {
	const cache = (globalThis as typeof globalThis & {
		caches?: { default?: Cache };
	}).caches?.default;
	const cacheKey = `https://${environment}.docs-content.invalid/${key}`;
	let raw: string | undefined;

	if (cache) {
		try {
			const cached = await cache.match(cacheKey);
			if (cached) raw = await cached.text();
		} catch {
			// Cache is best-effort; R2 remains authoritative.
		}
	}
	if (raw === undefined) {
		const object = await bucket.get(key);
		if (!object) throw new Error(`[documentation] missing R2 content: ${key}`);
		raw = await object.text();
		if (cache) {
			ctx.waitUntil(
				cache
					.put(
						cacheKey,
						new Response(raw, {
							headers: {
								"Content-Type": "application/json; charset=utf-8",
								"Cache-Control": `public, max-age=${MANIFEST_TTL}`,
							},
						}),
					)
					.catch(() => {}),
			);
		}
	}

	try {
		return JSON.parse(raw);
	} catch {
		throw new Error(`[documentation] invalid JSON in R2 content: ${key}`);
	}
}

export async function getDocumentedProducts(
	context: RouterContextProvider,
): Promise<DocumentedProduct[]> {
	const { env, ctx } = context.get(cloudflareContext);
	const bucket = (env as Env & { CONTENT?: R2Bucket }).CONTENT;
	if (!bucket) {
		throw new Error("[documentation] R2 CONTENT binding is missing");
	}

	const environment = (env as Env & { DOCS_ENV?: string }).DOCS_ENV;
	if (environment !== "development" && environment !== "staging" && environment !== "production") {
		throw new Error("[documentation] invalid DOCS_ENV");
	}

	const top = TopManifestSchema.parse(
		await readManifest(bucket, "manifest.json", environment, ctx),
	);
	if (top.sections.products !== "products/manifest.json") {
		throw new Error("[documentation] R2 manifest does not publish products");
	}
	const manifest = sectionManifestSchema(ProductSchema).parse(
		await readManifest(bucket, top.sections.products, environment, ctx),
	);
	if (manifest.count !== manifest.items.length) {
		throw new Error("[documentation] product manifest count mismatch");
	}

	const pids = new Set<string>();
	const slugs = new Set<string>();
	for (const item of manifest.items) {
		if (pids.has(item.pid) || slugs.has(item.slug)) {
			throw new Error("[documentation] duplicate product identifiers in R2");
		}
		pids.add(item.pid);
		slugs.add(item.slug);
	}

	return manifest.items
		.filter(
			(item) =>
				!item.url &&
				/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) &&
				source.getPage([item.slug]) != null,
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
