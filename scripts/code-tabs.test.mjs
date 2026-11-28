import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = "content/docs";
const expected = new Map([
  ["assay/getting-started.mdx", ["@0xbuff/assay"]],
  ["throughline/getting-started.mdx", ["@0xbuff/throughline@0.0.2", "react@^19 react-dom@^19"]],
  ["throughline/index.mdx", ["@0xbuff/throughline@0.0.2"]],
  ["throughline/compatibility.mdx", ["@0xbuff/throughline@0.0.2", "react@^19 react-dom@^19"]],
  ["throughline/react-player.mdx", ["@0xbuff/throughline@0.0.2 react@^19 react-dom@^19"]],
  ["throughline/markdown-mdx.mdx", ["-D unist-util-visit @types/mdast"]],
]);

function fences(source) {
  return [...source.matchAll(/^(\x60{3}|~{3})([^\n]*)\n([\s\S]*?)^\1[ \t]*$/gm)]
    .map((match) => ({ meta: match[2], body: match[3].trim(), start: match.index, end: match.index + match[0].length }));
}

test("package installation alternatives are adjacent native code tabs", async () => {
  const seen = new Set();
  for (const product of await readdir(root, { withFileTypes: true })) {
    if (!product.isDirectory()) continue;
    for (const file of await readdir(join(root, product.name))) {
      if (!file.endsWith(".mdx")) continue;
      const name = product.name + "/" + file;
      const source = await readFile(join(root, name), "utf8");
      const blocks = fences(source);
      const found = [];
      for (let i = 0; i < blocks.length; i++) {
        const first = blocks[i];
        const match = first.body.match(/^npm install (.+)$/);
        if (!/^sh(?:\s|$)/.test(first.meta) || !match) {
          if (/^sh(?:\s|$)/.test(first.meta)) assert.doesNotMatch(first.body, /^(?:pnpm add|yarn add) /, name + ": orphan package tab");
          continue;
        }
        const args = match[1];
        const pnpm = blocks[i + 1];
        const yarn = blocks[i + 2];
        assert.equal(first.meta, 'sh tab="npm" tab-group="package-manager"', name);
        assert.equal(pnpm?.meta, 'sh tab="pnpm"', name);
        assert.equal(yarn?.meta, 'sh tab="yarn"', name);
        assert.equal(pnpm.body, "pnpm add " + args, name);
        assert.equal(yarn.body, "yarn add " + args, name);
        assert.match(source.slice(first.end, pnpm.start), /^\s*$/, name);
        assert.match(source.slice(pnpm.end, yarn.start), /^\s*$/, name);
        found.push(args);
        i += 2;
      }
      assert.deepEqual(found, expected.get(name) ?? [], name);
      if (found.length) seen.add(name);
    }
  }
  assert.deepEqual([...seen].sort(), [...expected.keys()].sort());
});

test("reviewer and player theme alternatives are native tab groups", async () => {
  for (const [path, labels] of [
    ["assay/observations.mdx", ["Human", "Model"]],
    ["throughline/styling.mdx", ["System", "Light", "Dark"]],
  ]) {
    const source = await readFile(join(root, path), "utf8");
    const blocks = fences(source).filter((block) => /\btab="/.test(block.meta));
    assert.deepEqual(blocks.map((block) => block.meta.match(/\btab="([^"]+)"/)?.[1]), labels);
    for (let i = 1; i < blocks.length; i++) {
      assert.match(source.slice(blocks[i - 1].end, blocks[i].start), /^\s*$/, path);
    }
  }
});
