# 0xBUFF Documentation

The documentation site is built with React Router and Fumadocs and deployed to Cloudflare Workers. Documentation is authored in `content/docs/`; Fumadocs generates the page tree, search index, sitemap, and LLM exports from that content.

## Development

```bash
pnpm install
pnpm dev
pnpm typecheck
```

The homepage catalog and docs sidebar use `src/lib/tools.generated.json`. Refresh it with `pnpm sync:tools`. The script reads product frontmatter from the content repository and validates it against `@0xbuff/content-contract`. It includes records without a destination URL when a matching `content/docs/<slug>/index.mdx` exists. Only cataloged products have documentation published on this site; there is nothing else to discover via search or the sitemap.

By default, the sync fetches the same content commit pinned in the contract dependency, so the build environment needs Git access to `0xbuffdev/content`. To develop against a local checkout, set `CONTENT_REPO_PATH` to its absolute path; that override reads the checkout's working tree. Update the contract dependency commit to publish a newer catalog. Content changes require a documentation rebuild to appear.

## Build and deploy

```bash
pnpm build
pnpm exec vite preview
```

CI (`.github/workflows/`) deploys on merge; no manual deploy is required.

- `staging` branch → `pnpm exec wrangler deploy -c build/server/wrangler.staging.json`
  deploys Worker `0xbuff-docs-staging` at `https://staging.docs.0xbuff.com`. The
  staging config is derived from the build output by `scripts/stage-deploy.mjs`:
  the `@cloudflare/vite-plugin` emits a redirected deploy config that ignores
  Wrangler `--env` overrides, so staging cannot be expressed as a Wrangler
  environment. It reuses the production newsletter vars; point
  `RESEND_SEGMENT_ID` at a test segment (in `scripts/stage-deploy.mjs`) before
  testing live mail.
- `main` branch → `wrangler deploy` publishes production at
  `https://docs.0xbuff.com`.

Both need repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
The token requires Workers Scripts edit plus Zone Settings and DNS edit for the
`0xbuff.com` zone (custom-domain routes). Worker secrets are set once per
environment from an authenticated shell, never in the repo:

```bash
pnpm exec wrangler secret put RESEND_API_KEY # production
pnpm exec wrangler secret put RESEND_API_KEY -c build/server/wrangler.staging.json # staging
```

For local development, copy `.dev.vars.example` to `.dev.vars` and set the key.
Non-secret newsletter configuration is in `wrangler.jsonc`. Regenerate Worker
types with `pnpm exec wrangler types` after changing bindings.
