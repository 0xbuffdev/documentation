import {
	ProductSchema,
	sectionManifestSchema,
	TopManifestSchema,
} from "@0xbuff/content-contract";
import type { RouterContextProvider } from "react-router";
import { cloudflareContext } from "./cloudflare-context";
import { source } from "./source";
import { selectDocumentedProducts } from "./published-products";

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
	context: Readonly<RouterContextProvider>,
): Promise<ReturnType<typeof selectDocumentedProducts>> {
	const { env, ctx } = context.get(cloudflareContext);
	const bucket = (env as Env & { CONTENT?: R2Bucket }).CONTENT;
	if (!bucket) {
		throw new Error("[documentation] R2 CONTENT binding is missing");
	}

	const environment = (env as { DOCS_ENV?: string }).DOCS_ENV;
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

	return selectDocumentedProducts(manifest.items, (slug) => source.getPage([slug]) != null);
}
