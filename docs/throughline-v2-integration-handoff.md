# Throughline schema-2 documentation integration — release-gated handoff

**State:** prepared for TL-U20; not enabled, not merged or deployed.
**Prerequisite:** TL-U10 source PR merged, TL-U19 version independently verified
and published to npm with provenance, documentation build targeting that exact
published version. Do not add an unpublished package dependency to this repo.

The live documentation application currently installs
`@0xbuff/throughline@0.0.2` and relies on the historical player and
domain-tagged demo examples. This is intentionally left unchanged by this
preparation PR. The v2 package contract **drops domain-tagged input and old
compile()/ThroughlinePlayer compatibility**; the upgrade requires a deliberate
conversion of all Throughline content and an independent staging deployment.

## Verified current integration points

- `source.config.ts` owns the Fumadocs MDX `remarkPlugins` and
  `rehypePlugins` arrays. Preserve `remarkMath`,
  `remarkMdxMermaid`, `rehypeKatex`, and the existing callback hooks.
- `src/components/mdx.tsx` contains the Fumadocs component map.
  Register `ThroughlineEmbed` there, not by changing unrelated MDX.
- `src/components/throughline-demo-player.tsx` contains the old
  compiler/player import, behind the lazy-loading wrapper. Replace it with
  the v2 `compileArtifact` and `ThroughlineGraphPlayer`.
- `src/lib/throughline-demos.ts` still contains domain-tagged,
  string-based examples. Replace them with reviewed typed schema-2
  artifacts from the published `./examples` export and truthful
  source/evidence labels, never silently parse v1 strings.
- `content/docs/throughline/*.mdx` includes pages for `flow`,
  `bindings`, `callstack`, `binary`, `matrix`,
  legacy compatibility, API types, demos, etc. All must be audited and
  rewritten for one unqualified `thl` fence. Do not simply rewrite
  the fence header while retaining legacy DSL bodies.

## Target code once a published schema-2 version is available

Use these host-level wiring rules, **not** ad hoc Markdown execution:

~~~ts
// source.config.ts, after a verified published upgrade
import { remarkThroughline } from "@0xbuff/throughline/remark";
import { createNodeThroughlineHost } from "@0xbuff/throughline/node";

const host = createNodeThroughlineHost({
  root: process.cwd(),
  // Omit manifestPath only while every thl fence is strict schema-2 JSON.
  manifestPath: "throughline/manifest.json",
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: existing => [
      remarkMath,
      remarkMdxMermaid,
      [remarkThroughline, { mode: "mdx", ...host }],
      ...existing,
    ],
    rehypePlugins: existing => [rehypeKatex, ...existing],
  },
});
~~~

The existing `ThroughlineEmbed` component from
`@0xbuff/throughline/react` must be registered in the MDX map.
It receives **only** a literal, validated `artifactJson` string.
The v2 host's trusted filesystem root maps actual VFile absolute paths to
repository-relative manifest keys and disallows symlink/path escapes.
Descriptive prose requires the separate editorial approval and
`thl check` evidence; strict direct JSON needs no sidecar.

For simple selectable demos, load `EXAMPLES` from the published
`@0xbuff/throughline/examples`, compile each reference's typed
`artifact` via `compileArtifact`, and display the native
`ThroughlineGraphPlayer`. Its checkout model is an **authored hypothetical
scenario** with no proven packet loss or real payment-provider guarantee.

## Migration sequence and acceptance

1. Verify the newly published npm version, its signed source tag,
   provenance and independent install against the exact intended version.
   Update `package.json` and the committed lockfile **in the later TL-U20
   implementation PR**, never in this preparation PR.
2. Audit the actual Fumadocs generated MDX AST, VFile location and plugin
   order. Add the optional Node host to the build only after the new
   package is installed. Keep math, Mermaid, KaTeX and unrelated MDX
   transforms unchanged.
3. Convert each legacy Throughline page and the
   `throughline-demos.ts` catalog to actual schema-2 artifacts or reviewed
   prose sidecars. Update every Quick Start, grammar example, API table,
   diagram and pre-existing package-version claim. Legacy `thl domain`
   syntax is not accepted or translated.
4. Add honest static baseline questions and evidence IDs for factorial,
   matrix, binary and checkout. State clearly that no learning-outcome
   superiority or real payment-provider behavior has been measured.
5. Run `thl check content/docs --manifest throughline/manifest.json`
   (or omit `--manifest` for direct-JSON-only content) and require zero
   unreviewed/stale/missing entries before building.
6. Typecheck and compile a **real Fumadocs MDX document containing both
   a strict JSON fence and an approved prose sidecar**. Verify the
   compiled component receives inert literal JSON and no arbitrary
   expression. A malformed fence later in the document must prevent
   partial transformation.
7. Verify math/KaTeX and Mermaid still render, normal Markdown/MDX pages
   stay unchanged, React SSR and hydration produce a functional player,
   keyboard and mobile views work and no core-only consumer installs React
   or an AI package.
8. Deploy documentation **to staging first** only after the separate
   package release and user-approved integration merge. Production rollout
   remains a separate manual authorization.

### Security and build gates

- No default AI provider, credential, arbitrary local-file read, MDX code
  execution or network access in the Throughline parser.
- Reviewed hash-bound sidecars, strict path/Unicode validation and stable
  source-located diagnostics; absence or stale review fails closed.
- The old pinned 0.0.2 package remains functional until the published
  schema-2 package and new docs are ready. This is a *deployment boundary*,
  **not** a v2 compatibility shim.
- Do not claim real documentation deployment, new version publication,
  human comprehension results or successful production adoption before
  those are verified in TL-U19/TL-U20.

This document is an implementation handoff, not enabled source changes.
It is safe to review without installing an unpublished package.
