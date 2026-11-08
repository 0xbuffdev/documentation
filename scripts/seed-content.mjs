import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const source = process.argv[2] ?? process.env.CONTENT_PUBLISH_DIR;
if (!source) {
	throw new Error(
		"Usage: pnpm seed:content /absolute/path/to/content/.cache/publish/0xbuff",
	);
}

const root = path.resolve(source);
const topPath = path.join(root, "manifest.json");
const top = JSON.parse(await readFile(topPath, "utf8"));
if (top.sections?.products !== "products/manifest.json") {
	throw new Error("Expected a published 0xBUFF manifest with a products section");
}

const productsPath = path.join(root, top.sections.products);
const products = JSON.parse(await readFile(productsPath, "utf8"));
if (!Array.isArray(products.items) || products.count !== products.items.length) {
	throw new Error("Invalid published products manifest");
}

const config = JSON.parse(await readFile("wrangler.jsonc", "utf8"));
const bucket = config.r2_buckets?.find((item) => item.binding === "CONTENT")?.bucket_name;
if (!bucket) throw new Error("Missing local CONTENT bucket name");

const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
for (const [key, file] of [
	["products/manifest.json", productsPath],
	["manifest.json", topPath],
]) {
	const args = [
		"exec",
		"wrangler",
		"r2",
		"object",
		"put",
		`${bucket}/${key}`,
		"--file",
		file,
		"--local",
		"--content-type",
		"application/json",
	];
	const result = spawnSync(command, args, {
		stdio: "inherit",
		shell: process.platform === "win32",
	});
	if (result.error) throw result.error;
	if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(`Seeded local CONTENT (${bucket}) from ${root}; no remote buckets modified`);
