import { RootProvider } from "fumadocs-ui/provider/react-router";
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { DeferredSearchDialog } from "./components/deferred-search-dialog";
import { NotFoundPage } from "./components/not-found";
import { ROUTES, SITE } from "./lib/site";

export const meta: Route.MetaFunction = () => [
	{ name: "theme-color", content: SITE.themeColor },
];

export const links: Route.LinksFunction = () => [
	{ rel: "icon", type: "image/svg+xml", href: SITE.faviconPath },
	{ rel: "icon", type: "image/x-icon", href: SITE.faviconIcoPath },
	{ rel: "apple-touch-icon", sizes: "192x192", href: SITE.iconPath },
	{ rel: "manifest", href: SITE.manifestPath },
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<RootProvider
					search={{
						SearchDialog: DeferredSearchDialog,
						options: { type: "static", api: ROUTES.searchIndex },
					}}
				>
					{children}
				</RootProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	if (isRouteErrorResponse(error) && error.status === 404) {
		return <NotFoundPage />;
	}

	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = "Error";
		details = error.statusText || details;
	} else if (error && error instanceof Error) {
		console.error("ErrorBoundary caught error:", error);
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
