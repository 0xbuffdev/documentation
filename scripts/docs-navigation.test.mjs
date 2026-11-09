import { strict as assert } from "node:assert";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const docsDir = fileURLToPath(new URL("../content/docs/", import.meta.url));

async function readMeta(directory) {
  return JSON.parse(await readFile(join(directory, "meta.json"), "utf8"));
}

const toolDirs = (await readdir(docsDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

test("global navigation lists the first tool and discovers future tools", async () => {
  const meta = await readMeta(docsDir);
  assert.equal(meta.title, "0xBUFF Documentation");
  assert.ok(typeof meta.description === "string" && meta.description.trim());
  assert.ok(Array.isArray(meta.pages));
  assert.equal(meta.pages[0], "throughline");
  assert.equal(meta.pages.at(-1), "...", "Fumadocs must include future tool folders");
  assert.equal(new Set(meta.pages).size, meta.pages.length, "duplicate global entries");
  for (const entry of meta.pages.filter((name) => name !== "...")) {
    assert.ok(toolDirs.includes(entry), `unknown tool in global navigation: ${entry}`);
  }
});

test("each tool has an overview, a separate root, and complete navigation", async () => {
  for (const tool of toolDirs) {
    const directory = join(docsDir, tool);
    const meta = await readMeta(directory);
    assert.equal(meta.root, true, `${tool}: missing Fumadocs root tab`);
    for (const field of ["title", "description"]) {
      assert.ok(typeof meta[field] === "string" && meta[field].trim(), `${tool}: missing ${field}`);
    }
    assert.ok(Array.isArray(meta.pages) && meta.pages.length, `${tool}: missing page order`);
    assert.equal(meta.pages[0], "index", `${tool}: start with the tool overview`);

    const entries = await readdir(directory, { withFileTypes: true });
    const articles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
      .map((entry) => entry.name.slice(0, -4));
    const folders = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    assert.ok(articles.includes("index"), `${tool}: missing index.mdx`);

    const listed = meta.pages.filter((name) => !name.startsWith("---") && name !== "...");
    assert.equal(new Set(listed).size, listed.length, `${tool}: duplicate navigation entries`);
    for (const entry of listed) {
      assert.ok(articles.includes(entry) || folders.includes(entry),
        `${tool}: missing page or section ${entry}`);
    }
    if (!meta.pages.includes("...")) {
      assert.deepEqual(articles.sort(), listed.filter((entry) => articles.includes(entry)).sort(),
        `${tool}: an article is absent from navigation`);
    }

    for (const name of articles) {
      const content = await readFile(join(directory, `${name}.mdx`), "utf8");
      const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      assert.ok(frontmatter, `${tool}/${name}: missing frontmatter`);
      assert.match(frontmatter[1], /^title:\s*\S/m, `${tool}/${name}: missing page title`);
      assert.match(frontmatter[1], /^description:\s*\S/m,
        `${tool}/${name}: missing page description`);
    }
  }
});
