# MemoFS Documentation

The public home for MemoFS documentation — guides and technical references for MemoFS, its agents, connectors, and tooling. Docs live at `/docs`; the MemoFS Manifesto lives at `/manifesto`; the site root redirects to `/docs`. This React Router + Fumadocs app is deployed to Cloudflare Pages.

## Architecture

- `content/docs/` is the single source of truth for MemoFS documentation. It powers the docs pages, search index, sitemap, and LLM text exports.
- `src/lib/site.ts` owns public URLs, internal route constants, and shared navigation data.
- `src/lib/meta.ts` produces consistent canonical, Open Graph, and Twitter metadata.
- `functions/subscribe.ts` is the only server-side endpoint. Everything else is prerendered into `build/client` and served statically by Cloudflare Pages.

The design-system stylesheet, content styles, and UI components used by this app are maintained in this repository, so it can be installed and developed independently.

## Development

From this repository root:

```bash
npm install
npm run dev
```

Run the type check with:

```bash
npm run typecheck
```

## Build and deploy

```bash
npm run build
```

Deploy `build/client` as the Cloudflare Pages output directory. `/` redirects to `/docs` via a prerendered meta refresh.

For local newsletter development, copy `.dev.vars.example` to `.dev.vars` and set `RESEND_API_KEY`. In Cloudflare Pages, configure `RESEND_API_KEY` as a secret; `RESEND_SEGMENT_ID` and `RESEND_FROM` are non-secret vars in `wrangler.jsonc`.
