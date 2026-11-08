import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const root = path.resolve("build/client");
const assets = [];

async function inspect(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const file = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			await inspect(file);
		} else if (/\.(?:js|css)$/.test(entry.name)) {
			const bytes = await readFile(file);
			assets.push({
				file: path.relative(root, file),
				bytes: (await stat(file)).size,
				gzip: gzipSync(bytes).byteLength,
			});
		}
	}
}

await inspect(root);
assets.sort((a, b) => b.gzip - a.gzip);
const total = assets.reduce((sum, item) => sum + item.gzip, 0);
const kb = (size) => (size / 1024).toFixed(1);
console.log("Largest client assets (gzip, not necessarily initial-load):");
for (const item of assets.slice(0, 20)) {
	console.log(`${kb(item.gzip).padStart(8)} KiB  ${kb(item.bytes).padStart(8)} KiB raw  ${item.file}`);
}
console.log(`Total ${assets.length} JS/CSS assets: ${kb(total)} KiB gzip`);

// Do not confuse the sum of every lazy chunk with initial-load size.
// Compare the entrypoint and network waterfall in browser DevTools before
// choosing hard budgets or manually overriding Vite's chunk graph.
