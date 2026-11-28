import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile("src/app.css", "utf8");
const pkg = JSON.parse(await readFile("package.json", "utf8"));
const lock = await readFile("pnpm-lock.yaml", "utf8");

test("documentation uses the platform fonts and separate brand color", () => {
  for (const name of ["geist", "geist-mono", "orbitron"]) {
    assert.ok(pkg.dependencies["@fontsource-variable/" + name]);
    assert.ok(css.includes('@import "@fontsource-variable/' + name + '";'));
    assert.ok(lock.includes("'@fontsource-variable/" + name + "@5.3.0'"));
  }
  assert.doesNotMatch(css, /DM Sans|JetBrains Mono|--brand-primary/);
  assert.doesNotMatch(lock, /@fontsource-variable\/(dm-sans|jetbrains-mono)/);
  assert.match(css, /--font-sans:\s*'Geist Variable'/);
  assert.match(css, /--font-mono:\s*'Geist Mono Variable'/);
  assert.match(css, /--color-brand-orange:\s*var\(--brand-orange\)/);
  assert.match(css, /--radius:\s*0\.375rem/);
});

test("Fumadocs uses platform surfaces and semantic colors in both themes", () => {
  for (const [selector, background, primary, brand] of [
    [":root", "#fafafa", "#171717", "#c2410c"],
    [".dark", "#0a0a0a", "#ededed", "#ff7148"],
  ]) {
    const blocks = [...css.matchAll(/(:root|\.dark)\s*\{([^}]+)\}/g)]
      .filter((match) => match[1] === selector).map((match) => match[2]).join("\n");
    assert.ok(blocks.includes("--background: " + background + ";"));
    assert.ok(blocks.includes("--primary: " + primary + ";"));
    assert.ok(blocks.includes("--brand-orange: " + brand + ";"));
    for (const token of ["background", "foreground", "primary", "primary-foreground", "border", "ring"]) {
      assert.ok(blocks.includes("--color-fd-" + token + ": var(--" + token + ");"));
    }
  }
});
