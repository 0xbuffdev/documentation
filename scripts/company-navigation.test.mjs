import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("company links are below the desktop and mobile page navigation, not product navigation", async () => {
  const [site, layout, page, company] = await Promise.all([
    "src/lib/site.ts",
    "src/lib/layout.shared.tsx",
    "src/routes/docs/$.tsx",
    "src/components/company-navigation.tsx",
  ].map((path) => readFile(path, "utf8")));

  const links = site.match(/export const PRIMARY_NAVIGATION = \[([\s\S]*?)\] as const;/)?.[1];
  assert.ok(links);
  assert.deepEqual([...links.matchAll(/text: "([^"]+)"/g)].map((match) => match[1]),
    ["0xBUFF", "0xNAND", "Changelog", "Notes"]);
  assert.doesNotMatch(layout, /PRIMARY_NAVIGATION|text: "Documentation"/);
  assert.match(page, /tableOfContent=\{\{ style: "clerk", footer: <CompanyNavigation \/> \}\}/);
  assert.match(page, /tableOfContentPopover=\{\{ footer: <CompanyNavigation \/> \}\}/);
  assert.match(company, /PRIMARY_NAVIGATION\.map/);
  assert.match(company, /aria-label="Company links"/);
  assert.match(company, /rel="noopener noreferrer"/);
});
