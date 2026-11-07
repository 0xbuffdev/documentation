import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { CONTENT_REVISION, ProductDocumentSchema } from "./lib/content-contract.mjs";
import { parse } from "yaml";
import docsConfig from "../src/lib/docs-config.json" with { type: "json" };

const local = process.env.CONTENT_REPO_PATH;
const temp = local ? undefined : await mkdtemp(path.join(tmpdir(), "docs-content-"));
const root = local ?? path.join(temp, "content");
try {
	if (!local) {
		execFileSync("git", ["init", "--quiet", root], { stdio: "inherit" });
		execFileSync("git", ["-C", root, "fetch", "--quiet", "--depth", "1", "https://github.com/0xbuffdev/content.git", CONTENT_REVISION], { stdio: "inherit" });
		execFileSync("git", ["-C", root, "checkout", "--quiet", "--detach", "FETCH_HEAD"], { stdio: "inherit" });
	}
	const dir = path.join(root, "content/0xbuff/products");
	const products = [];
	for (const file of await readdir(dir)) {
		if (!file.endsWith(".md") || file === "README.md") continue;
		const slug = file.slice(0, -3);
		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid product slug: ${slug}`);
		const raw = await readFile(path.join(dir, file), "utf8");
		const frontmatter = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
		if (!frontmatter) throw new Error(`Missing frontmatter: ${file}`);
		const product = ProductDocumentSchema.parse(parse(frontmatter[1]));
		if (product.url) continue;
		try { await access(path.join(docsConfig.docsContentDir, slug, "index.mdx")); }
		catch { continue; }
		products.push({ slug, pid: product.pid, name: product.name, status: product.status, tagline: product.kicker, description: product.description });
	}
	products.sort((a, b) => a.pid.localeCompare(b.pid));
	await writeFile("src/lib/tools.generated.json", `${JSON.stringify(products, null, "\t")}\n`);
} finally {
	if (temp) await rm(temp, { recursive: true, force: true });
}
