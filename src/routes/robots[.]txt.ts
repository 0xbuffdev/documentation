import { ROUTES, SITE, toSiteUrl } from "../lib/site";
import { cloudflareContext } from "../lib/cloudflare-context";
import type { Route } from "./+types/robots[.]txt";

const CRAWLER_RULES = `# ${SITE.name} Documentation. Open Documentation & AI Training Permitted
# All web crawlers, search engines, and AI foundation model training bots are welcome.

User-agent: *
Allow: /

# Explicit AI Training & Retrieval Agents
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Cohere-ai
Allow: /

User-agent: Bytespider
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: FacebookBot
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Diffbot
Allow: /`;

export function loader({ context }: Route.LoaderArgs) {
	const { env } = context.get(cloudflareContext);
	const staging = (env as Env & { DOCS_ENV?: string }).DOCS_ENV === "staging";
	const body = staging
		? "User-agent: *\nDisallow: /\n"
		: `${CRAWLER_RULES}\n\nSitemap: ${toSiteUrl(ROUTES.sitemap)}\n`;
	return new Response(body, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=60",
		},
	});
}
