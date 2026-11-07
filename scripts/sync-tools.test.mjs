import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./sync-tools.mjs", import.meta.url));
const contract = "github:0xbuffdev/content#c4fb9c944700cd6e686d7268be25c9039fde43e2";
const product = (pid, name, extra = "") => `---\npid: "${pid}"\nname: "${name}"\nstatus: alpha\nkicker: "A useful tool"\ndescription: "A developer tool."\nfeatures:\n  - title: "Feature"\n    description: "Useful feature"\n${extra}---\n`;

test("sync includes documented tools and rejects invalid content", async () => {
	const root = await mkdtemp(path.join(tmpdir(), "catalog-test-"));
	try {
		const products = path.join(root, "content-repo/content/0xbuff/products");
		await mkdir(products, { recursive: true });
		await mkdir(path.join(root, "content/docs/tool"), { recursive: true });
		await mkdir(path.join(root, "content/docs/hosted"), { recursive: true });
		await mkdir(path.join(root, "src/lib"), { recursive: true });
		await writeFile(path.join(root, "package.json"), JSON.stringify({ dependencies: { "@0xbuff/content-contract": contract } }));
		await writeFile(path.join(root, "content/docs/tool/index.mdx"), "# Tool");
		await writeFile(path.join(root, "content/docs/hosted/index.mdx"), "# Hosted");
		await writeFile(path.join(products, "tool.md"), product("0x03", "Tool"));
		await writeFile(path.join(products, "hosted.md"), product("0x02", "Hosted", 'url: "https://example.com"\n'));
		await writeFile(path.join(products, "undocumented.md"), product("0x01", "Undocumented"));
		const options = { cwd: root, env: { ...process.env, CONTENT_REPO_PATH: path.join(root, "content-repo") }, stdio: "pipe" };
		execFileSync(process.execPath, [script], options);
		const result = JSON.parse(await readFile(path.join(root, "src/lib/tools.generated.json"), "utf8"));
		assert.deepEqual(result.map((item) => item.slug), ["tool"]);
		await writeFile(path.join(products, "bad.md"), product("invalid", "Bad"));
		assert.throws(() => execFileSync(process.execPath, [script], options));
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});
