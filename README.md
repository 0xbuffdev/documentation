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
pnpm deploy
```

The build refreshes the tool catalog and prerenders the documentation. Set `RESEND_API_KEY` as a Cloudflare Worker secret for newsletter subscriptions. For local development, copy `.dev.vars.example` to `.dev.vars` and set the key. Non-secret newsletter configuration is in `wrangler.jsonc`. Regenerate Worker types with `pnpm exec wrangler types` after changing bindings.
