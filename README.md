# 0xBUFF Documentation

Public documentation for 0xBUFF products, built with React Router 8, Fumadocs MDX and Cloudflare Workers. Articles and navigation live in `content/docs/`. The app compiles and serves this public collection without a runtime content store.

## Documentation organization

Fumadocs owns the documentation navigation. The repository is organized by tool, not by individual feature:

```text
content/docs/
├── meta.json                  # Shared tool order
├── assay/                   # Default product
│   ├── meta.json
│   └── index.mdx
├── throughline/
│   ├── meta.json              # Throughline navigation
│   ├── index.mdx              # Tool overview
│   └── *.mdx                  # Guides and references
└── <new-tool>/
    ├── meta.json
    ├── index.mdx
    └── *.mdx
```

- The root `content/docs/meta.json` lists Assay first, then Throughline and uses Fumadocs' `"..."` entry to include future tools automatically.
- Give every tool its own `content/docs/<slug>/` directory with an `index.mdx` and `meta.json`. Set `"root": true` in the tool's metadata so its navigation is separate from other tools. Give it a clear title, a short description, and an explicit `pages` order. Section separators such as `"---Reference---"` group related pages without changing URLs.
- Use stable filenames: Fumadocs derives each public address from its MDX path. Navigation changes must not unnecessarily change existing addresses.
- Add only material intended for public release. Every MDX article in the collection is public after deployment and is eligible for search and LLM exports.
- Keep product-specific descriptions in the product's own MDX and metadata. Shared site metadata must describe the full documentation library.

The navigation validation tests run with `pnpm test`. They verify tool roots, declared pages, and document frontmatter.

## Interactive Throughline examples

Selected Throughline guides render the published `@0xbuff/throughline@0.0.2` React player. The overview leads with a multi-system checkout recovery trace; introductory pages retain smaller teaching examples. Sources are kept in `src/lib/throughline-demos.ts`; MDX pages use `<ThroughlineDemo id="..." />`. The component is registered in `src/components/mdx.tsx`. Its compiler, player and namespaced CSS load in a separate module only when a demo is rendered. All other 0xBUFF tool documentation remains independent of Throughline.

The showcase is deliberately limited to a few pages and does not automatically transform every `thl` code fence. The official `remarkThroughline({ mode: "mdx" })` integration and `ThroughlineEmbed` require a subsequent package release; v0.0.2 must not be assumed to contain them. This preserves portable source examples and avoids unnecessary client JavaScript. `scripts/throughline-interactive.test.mjs` compiles every showcased trace with the installed package; CI also typechecks and builds both environments.

## Routing and publication

Fumadocs builds the page tree, search index, sitemap and Markdown exports from the local MDX collection. Both `/` and `/docs` redirect directly to `/docs/assay`. Unknown articles return HTTP 404. Updating the collection requires a documentation deployment; the company product catalog is independent.

| Target | Worker | Public domain |
| --- | --- | --- |
| Staging | `0xbuff-docs-staging` | `staging.docs.0xbuff.com` |
| Production | `0xbuff-docs` | `docs.0xbuff.com` |

The top-level Wrangler configuration is production. `env.staging` overrides the domain and `DOCS_ENV` value.

## Development

Node 24 and pnpm 11.2.2 are required.

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm dev
```

No private registry credentials or content seeding are required. Set local `RESEND_API_KEY` in an untracked `.dev.vars` only when newsletter testing is necessary; `.dev.vars.example` documents it.

## Build and deployment

```bash
pnpm build
pnpm bundle:report
pnpm build:staging
```

- `pnpm build`: production target, using top-level Wrangler settings.
- `pnpm build:staging`: selects `env.staging` with `CLOUDFLARE_ENV=staging` **during the Vite build**.
- `pnpm bundle:report`: prints compressed JS/CSS asset sizes, largest first. The sum of all chunks is **not** the initial browser download; route-level MDX and Mermaid remain lazy, and the search dialog is deferred.
- `scripts/check-deploy-config.mjs staging|production`: asserts the generated `build/server/wrangler.json` carries the intended Worker name, custom domain, runtime environment, and absence of R2 bindings.

With the Cloudflare Vite plugin, `wrangler deploy` uses the generated deployment config; `wrangler deploy --env staging` **must not** be used after the build.

Code merges do **not** deploy to Cloudflare. The deployment workflow follows 0xNAND's explicit release boundary:

1. Merge the reviewed and signed code into `main` after CI passes. This alone does not deploy either environment.
2. Set up GitHub Environments named `staging` and `production`. Verify each environment's domain, credentials, and any newsletter secrets. Set environment variable `DOCS_RELEASE_READY=true` **only after** verifying that environment.
3. Run **Actions → Deploy Documentation → Run workflow** from the `main` branch, choose `staging`, and enter `DEPLOY_STAGING`. The workflow checks readiness, builds the staging environment, checks the generated Worker configuration, deploys, and probes the live endpoints.
4. Once staging is verified, dispatch the same workflow from `main` targeting `production` with `DEPLOY_PRODUCTION` and a separately verified production environment (`DOCS_RELEASE_READY=true`).

Pull requests continue to typecheck, test, build **both** target configurations, verify the generated Worker configuration and report client asset sizes without deploying.

Cloudflare deployment requires repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` with the minimum permissions for Workers and the configured custom domains. Newsletter `RESEND_API_KEY` is a **Worker secret**, set independently for the production and staging Workers. The staging `RESEND_SEGMENT_ID` is intentionally empty to prevent accidental subscriptions to the production audience; configure a separate staging segment before testing signup delivery.

Before either deployment, confirm the Cloudflare domain and credentials are provisioned. The deployment smoke tests verify both redirects, Assay and Throughline pages, a missing page, Markdown exports, LLM indexes, search, robots, sitemap and subscription routes. Staging serves `robots.txt` with `Disallow: /` and sets `X-Robots-Tag: noindex, nofollow, noarchive` on Worker responses.

## Bundle strategy

Fumadocs MDX uses `async: true`, so individual documents are compiled into page-level lazy chunks. Mermaid loads through a dynamic import when a diagram mounts. The search UI is also loaded on demand; the search index is generated from the compiled MDX collection and cached briefly. The bundle report provides reproducible size evidence in pull-request and deploy workflows. Compare it with a browser network waterfall before claiming any percentage reduction in initial transfer or setting budgets.

## Worker types

`worker-configuration.d.ts` is generated locally by `wrangler types` and is intentionally **not tracked**. `pnpm typecheck` regenerates it before React Router types and the TypeScript compiler run; run `pnpm exec wrangler types` separately after changing bindings if editor types need refreshing. `opencode.json` is also ignored as machine-specific OpenCode configuration. The `DOCS_ENV` value is used server-side to keep staging out of search indexes.

## Design system

The shared tokens, fonts and base styles in `src/app.css` are synchronized from [the platform design system](https://github.com/0xbuffdev/platform/blob/16241087830ddd0c96ae7dd7ba81023cd8892365/packages/ui/src/styles/app.css). Keep the Fumadocs adapter, local source detection and documentation-specific rules when updating that snapshot. The documentation application does not import the platform's private workspace packages.

## Assay documentation

The Assay collection documents the public release [v0.0.1](https://github.com/0xbuffdev/assay/tree/v0.0.1). Use its package exports, contract types, tests and versioned guides as the technical source of truth. Do not document unreleased behavior as available.

Organize pages by reader task. Start with installation and a complete tutorial, keep procedural guides separate from conceptual explanations, and maintain a reference for records, exported APIs, outcomes and limits. Use sentence-case titles, direct language, explicit prerequisites and expected results. Keep code fragments distinct from complete examples. Use Mermaid for data flows and trust boundaries, not decorative diagrams.

The editorial approach draws on [Vercel's writing guidelines](https://github.com/vercel-labs/writing-guidelines), [Cloudflare's style guide](https://developers.cloudflare.com/style-guide/), [Mintlify's developer documentation checklist](https://www.mintlify.com/library/developer-documentation-best-practices) and [Diátaxis](https://diataxis.fr/). Apply the Content repository's humanizer skill when editing prose.

Run `pnpm test` for the documentation structure and internal-link checks. Run `node scripts/verify-assay-examples.mjs` to install the pinned public release in a temporary directory, execute the marked examples, and compare the documented API and limits with the installed package. This requires registry access and Node 24; it does not add Assay to the documentation application's dependency graph. CI and the release workflow run both checks. Update the example verification and all affected version references when adopting a new Assay release.
