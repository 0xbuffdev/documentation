# 0xBUFF Documentation

Public documentation for 0xBUFF products, built with React Router 8, Fumadocs MDX and Cloudflare Workers. Articles are maintained in `content/docs/`; the published **product catalog** is read at runtime from the private 0xBUFF R2 content bucket. The documentation Worker does not access 0xNAND's private learning content or assessment assets.

## Documentation organization

Fumadocs owns the documentation navigation. The repository is organized by tool, not by individual feature:

```text
content/docs/
├── meta.json                  # Shared tool order
├── throughline/
│   ├── meta.json              # Throughline navigation
│   ├── index.mdx              # Tool overview
│   └── *.mdx                  # Guides and references
└── <new-tool>/
    ├── meta.json
    ├── index.mdx
    └── *.mdx
```

- The root `content/docs/meta.json` lists Throughline first and uses Fumadocs' `"..."` entry to include future tools automatically.
- Give every tool its own `content/docs/<slug>/` directory with an `index.mdx` and `meta.json`. Set `"root": true` in the tool's metadata so its navigation is separate from other tools. Give it a clear title, a short description, and an explicit `pages` order. Section separators such as `"---Reference---"` group related pages without changing URLs.
- Use stable filenames: Fumadocs derives each public address from its MDX path. Navigation changes must not unnecessarily change existing addresses.
- New tools also need a published product entry in the R2 catalog, with no outbound `url`, before they appear on the public site. Content files alone do not publish a product.
- Keep product-specific descriptions in the product's own MDX and metadata. Shared site metadata must describe the full documentation library.

The navigation validation tests run with `pnpm test`. They verify tool roots, declared pages, and document frontmatter.

## Interactive Throughline examples

Selected Throughline guides render the published `@0xbuff/throughline@0.0.2` React player. Sources are kept in `src/lib/throughline-demos.ts`; MDX pages use `<ThroughlineDemo id="..." />`. The component is registered in `src/components/mdx.tsx`. Its compiler, player and namespaced CSS load in a separate module only when a demo is rendered. All other 0xBUFF tool documentation remains independent of Throughline.

The showcase is deliberately limited to a few pages and does not automatically transform every `thl` code fence. This preserves portable source examples and avoids unnecessary client JavaScript. `scripts/throughline-interactive.test.mjs` compiles every showcased trace with the installed package; CI also typechecks and builds both environments.

## Content ownership and publication

The private `0xbuffdev/content` repository owns the product records and publishes them to independent 0xBUFF buckets via its validated content pipeline. Documentation reads `manifest.json` and the referenced `products/manifest.json` through its Worker `CONTENT` R2 binding and validates them with `@0xbuffdev/content-contract@0.1.0` (imported as `@0xbuff/content-contract`).

Only published product records with **no outbound `url`** and a matching `content/docs/<slug>/index.mdx` are listed. The R2 catalog controls the homepage, documentation routes, sidebar, sitemap, search index and LLM exports. The MDX articles themselves are compiled from this repository and require a documentation deployment to update. Catalog changes appear after the 60-second edge cache expires; no documentation rebuild is needed for catalog changes alone.

The two production-facing buckets are **not interchangeable**:

| Target | Worker | Public domain | Private `CONTENT` bucket |
| --- | --- | --- | --- |
| Staging | `0xbuff-docs-staging` | `staging.docs.0xbuff.com` | `content-staging` |
| Production | `0xbuff-docs` | `docs.0xbuff.com` | `content` |

The top-level Wrangler configuration is production. `env.staging` overrides the domain, bucket, and `DOCS_ENV` binding. `DOCS_ENV` also isolates cached manifests.

## Development

Node 24 and pnpm 11.2.2 are required.

```bash
pnpm install
pnpm typecheck
pnpm test
```

GitHub Packages read permission is required for the private content contract. The tracked `.npmrc` scopes the registry; supply an appropriate read-only `NODE_AUTH_TOKEN` locally. **Never commit a token.** GitHub Actions uses `GITHUB_TOKEN` with `packages: read`; grant this repository Actions read permission in the private package's settings.

For local development, build and partition the **Content** repository first (from that repository):

```bash
pnpm run build:content
node scripts/publish-targets.ts
```

From this documentation repository, seed only the **local** Miniflare R2 state using the resulting 0xBUFF partition:

```bash
pnpm seed:content /absolute/path/to/content/.cache/publish/0xbuff
pnpm dev
```

The seed command validates the published manifest and uploads `manifest.json` and `products/manifest.json` to the local `content` bucket with Wrangler `--local`. It never writes to remote R2. Re-seed after changing local product metadata. Set local `RESEND_API_KEY` in an untracked `.dev.vars` only when newsletter testing is necessary; `.dev.vars.example` documents it.

## Build and deployment

```bash
pnpm build
pnpm bundle:report
pnpm build:staging
```

- `pnpm build`: production target, using top-level Wrangler settings.
- `pnpm build:staging`: selects `env.staging` with `CLOUDFLARE_ENV=staging` **during the Vite build**.
- `pnpm bundle:report`: prints compressed JS/CSS asset sizes, largest first. The sum of all chunks is **not** the initial browser download; route-level MDX and Mermaid remain lazy, and the search dialog is deferred.
- `scripts/check-deploy-config.mjs staging|production`: asserts the generated `build/server/wrangler.json` carries the intended Worker name, custom domain, runtime environment, and R2 bucket.

With the Cloudflare Vite plugin, `wrangler deploy` uses the generated deployment config; `wrangler deploy --env staging` **must not** be used after the build.

Code merges do **not** deploy to Cloudflare. The deployment workflow follows 0xNAND's explicit release boundary:

1. Merge the reviewed and signed code into `main` after CI passes. This alone does not deploy either environment.
2. Set up GitHub Environments named `staging` and `production`. Verify each environment's R2 content, domain, credentials, and Worker secrets. Set environment variable `DOCS_RELEASE_READY=true` **only after** verifying that environment.
3. Run **Actions → Deploy Documentation → Run workflow** from the `main` branch, choose `staging`, and enter `DEPLOY_STAGING`. The workflow checks readiness, builds the staging environment, confirms the generated binding, deploys, and probes the live endpoints.
4. Once staging is verified, dispatch the same workflow from `main` targeting `production` with `DEPLOY_PRODUCTION` and a separately verified production environment (`DOCS_RELEASE_READY=true`).

Pull requests continue to typecheck, test, build **both** target configurations, verify the generated R2 bindings and report client asset sizes without deploying.

Cloudflare deployment requires repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` with the minimum permissions for Workers and the configured custom domains. Newsletter `RESEND_API_KEY` is a **Worker secret**, set independently for the production and staging Workers. The staging `RESEND_SEGMENT_ID` is intentionally empty to prevent accidental subscriptions to the production audience; configure a separate staging segment before testing signup delivery.

Before either deployment, independently confirm the relevant R2 bucket exists, contains a valid `manifest.json` and `products/manifest.json`, is accessible to that Worker's `CONTENT` binding, and that Cloudflare domains and credentials are provisioned. CI cannot create or verify those Cloudflare resources by reading the repository. The deployment smoke tests request the homepage and `/docs` to check real R2 access, plus the LLM, search, robots, sitemap and subscription routes. Staging serves `robots.txt` with `Disallow: /` and sets `X-Robots-Tag: noindex, nofollow, noarchive` on Worker responses.

## Bundle strategy

Fumadocs MDX uses `async: true`, so individual documents are compiled into page-level lazy chunks. Mermaid loads through a dynamic import when a diagram mounts. The search UI is also loaded on demand; the content search index is fetched from the same R2-authorized product set and cached briefly. The bundle report provides reproducible size evidence in pull-request and deploy workflows. Compare it with a browser network waterfall before claiming any percentage reduction in initial transfer or setting budgets.

## Worker types

`worker-configuration.d.ts` is generated locally by `wrangler types` and is intentionally **not tracked**. `pnpm typecheck` regenerates it before React Router types and the TypeScript compiler run; run `pnpm exec wrangler types` separately after changing bindings if editor types need refreshing. `opencode.json` is also ignored as machine-specific OpenCode configuration. The `CONTENT` R2 binding and `DOCS_ENV` are accessed server-side only, and no R2 credentials are shipped to the browser.
