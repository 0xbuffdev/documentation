import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const directory = "content/docs/assay";
const files = (await readdir(directory)).filter((name) => name.endsWith(".mdx"));
const pages = new Set(files.map((name) => name.slice(0, -4)));

test("Assay has distinct entry, task, explanation and reference pages", async () => {
  const meta = JSON.parse(await readFile(join(directory, "meta.json"), "utf8"));
  const listed = meta.pages.filter((entry) => !entry.startsWith("---"));
  assert.deepEqual([...listed].sort(), [...pages].sort());
  assert.deepEqual(listed, ["index", "evaluation", "observations", "integrity", "api", "contracts"]);
});

test("Assay internal links resolve and complete examples are marked", async () => {
  let runnable = 0;
  for (const file of files) {
    const source = await readFile(join(directory, file), "utf8");
    runnable += [...source.matchAll(/^\x60\x60\x60js\r?\n\/\/ assay-docs: runnable\r?\n/gm)].length;
    const prose = source.replace(/^\x60\x60\x60[^\n]*\n[\s\S]*?^\x60\x60\x60\s*$/gm, "");
    for (const match of prose.matchAll(/\]\(\/docs\/assay(?:\/([a-z0-9-]+))?(?:#[^)]*)?\)/g)) {
      assert.ok(pages.has(match[1] ?? "index"), file + ": " + match[0]);
    }
    assert.doesNotMatch(prose, /\b(?:AY-I|PAQO-I)\d+\b/, file);
  }
  assert.ok(runnable >= 5, "Expected complete executable examples");
});
