import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const version = "0.0.1";
const directory = "content/docs/assay";
const temporary = await mkdtemp(join(tmpdir(), "assay-docs-"));
const expected = new Map([
  ["index.mdx", ["pass"]],
  ["evaluation.mdx", ["pass"]],
  ["observations.mdx", ["pass", "pass"]],
  ["integrity.mdx", ["pass withheld"]],
]);
try {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  execFileSync(npm, ["install", "--prefix", temporary, "--ignore-scripts",
    "--no-audit", "--no-fund", "--package-lock=false",
    "--registry=https://registry.npmjs.org", "@0xbuff/assay@" + version],
    { stdio: "inherit", timeout: 120_000, shell: process.platform === "win32" });

  const packageDir = join(temporary, "node_modules", "@0xbuff", "assay");
  const manifest = JSON.parse(await readFile(join(packageDir, "package.json"), "utf8"));
  assert.equal(manifest.version, version);
  const assay = await import(pathToFileURL(join(packageDir, manifest.exports["."].import)).href);
  assert.equal(assay.ASSAY_SCHEMA_VERSION, 4);
  assert.equal(assay.ASSAY_EVALUATOR_VERSION, "v0.0.5");

  const api = await readFile(join(directory, "api.mdx"), "utf8");
  for (const name of Object.keys(assay)) {
    assert.match(api, new RegExp("\\b" + name + "\\b"), "Undocumented export: " + name);
  }
  const limits = await readFile(join(directory, "contracts.mdx"), "utf8");
  for (const [name, value] of Object.entries(assay.CONTRACT_LIMITS)) {
    assert.ok(limits.includes("| " + name + " | " + value.toLocaleString("en-US") + " |"),
      "Incorrect or missing limit: " + name);
  }

  const seen = new Set();
  for (const file of (await readdir(directory)).filter((name) => name.endsWith(".mdx"))) {
    const source = await readFile(join(directory, file), "utf8");
    const examples = [...source.matchAll(/^\x60\x60\x60js\r?\n\/\/ assay-docs: runnable\r?\n([\s\S]*?)^\x60\x60\x60\s*$/gm)];
    assert.equal(examples.length, expected.get(file)?.length ?? 0, file + " example count");
    for (const [index, match] of examples.entries()) {
      const path = join(temporary, file.replace(".mdx", "-" + index + ".mjs"));
      await writeFile(path, match[1]);
      const output = execFileSync(process.execPath, [path], { encoding: "utf8", timeout: 10_000 }).trim();
      assert.equal(output, expected.get(file)?.[index], file + " example " + index);
      seen.add(file);
      console.log("Verified " + file + ": " + output);
    }
  }
  assert.deepEqual([...seen].sort(), [...expected.keys()].sort());
  console.log("Verified documented runtime exports and contract limits.");
} finally {
  await rm(temporary, { recursive: true, force: true });
}
