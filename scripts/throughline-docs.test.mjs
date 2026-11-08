import { strict as assert } from "node:assert";
import { readFile, readdir } from "node:fs/promises";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(
  new URL("../content/docs/throughline/", import.meta.url),
);

const meta = JSON.parse(
  await readFile(new URL("meta.json", new URL("../content/docs/throughline/", import.meta.url)), "utf8"),
);
const pages = meta.pages.filter((name) => !name.startsWith("---"));
const discovered = (await readdir(directory))
  .filter((name) => name.endsWith(".mdx"))
  .map((name) => name.slice(0, -4));
const names = new Set(pages);
const content = new Map(
  await Promise.all(
    discovered.map(async (name) => [
      name,
      await readFile(new URL(`${name}.mdx`, new URL("../content/docs/throughline/", import.meta.url)), "utf8"),
    ]),
  ),
);

test("Throughline sidebar lists every article exactly once", () => {
  assert.equal(meta.root, true);
  assert.equal(new Set(pages).size, pages.length, "duplicate sidebar pages");
  assert.deepEqual([...names].sort(), [...discovered].sort());
  for (const name of [
    "index",
    "getting-started",
    "flow",
    "bindings",
    "binary",
    "matrix",
    "callstack",
    "react-player",
    "styling",
    "accessibility",
    "markdown-mdx",
    "frameworks",
    "integrations",
    "programmatic-api",
    "type-reference",
    "architecture",
    "errors-and-limits",
    "compatibility",
    "custom-traces",
  ]) {
    assert.ok(names.has(name), `Missing required Throughline guide: ${name}`);
  }
});

test("Throughline articles have frontmatter, valid fences and local links", () => {
  for (const [name, doc] of content) {
    assert.match(doc, /^---\ntitle: .+\ndescription: /, `${name}: frontmatter missing`);
    assert.equal(
      doc.split("\n").filter((line) => line.startsWith("~~~")).length % 2,
      0,
      `${name}: unclosed code example`,
    );
    for (const match of doc.matchAll(/\]\(\/docs\/throughline(?:\/([a-z0-9-]+))?(?:#[^)]+)?\)/g)) {
      const target = match[1] ?? "index";
      assert.ok(names.has(target), `${name}: dead internal link to ${target}`);
    }
    assert.doesNotMatch(
      doc,
      /https:\/\/github\.com\/0xbuffdev\/throughline\/(?:blob|tree)\/[^\s)]+\/docs\//,
      `${name}: technical reference must be documented locally, not linked to GitHub docs`,
    );
  }
});

test("The CSS reference covers every public v0.0.2 theme token", () => {
  const css = content.get("styling");
  assert.ok(css, "missing CSS guide");
  for (const name of [
    "bg",
    "panel",
    "surface",
    "text",
    "muted",
    "line",
    "focus",
    "focus-bg",
    "change",
    "change-bg",
  ]) {
    assert.ok(css.includes(`--thl-${name}`), `Missing CSS token: --thl-${name}`);
  }
});

test("The API, Markdown, and framework guides remain self-contained", () => {
  assert.match(content.get("type-reference") ?? "", /type Trace =/);
  assert.match(content.get("type-reference") ?? "", /type StepApi =/);
  assert.match(content.get("markdown-mdx") ?? "", /remarkValidateThroughline/);
  assert.match(content.get("frameworks") ?? "", /Next\.js/);
  assert.match(content.get("compatibility") ?? "", /v0\.0\.2/);
  assert.match(content.get("custom-traces") ?? "", /tracer\(\)/);
});

test("Throughline public docs exclude package-contribution procedures", () => {
  for (const [name, doc] of content) {
    assert.doesNotMatch(
      doc,
      /CONTRIBUTING\.md|how to (?:add|register) (?:a|new) domain (?:inside|in) the package|(?:change|modify) Throughline(?:'s)? source files|upstream pull request/i,
      `${name}: package-maintainer instructions are not public usage documentation`,
    );
  }
});
