import { lazy, Suspense } from "react";
import {
	THROUGHLINE_DEMOS,
	type ThroughlineDemoId,
} from "../lib/throughline-demos";

// Only load the compiler, React player, and player CSS on pages with a demo.
const DemoPlayer = lazy(() => import("./throughline-demo-player"));

export function ThroughlineDemo({ id }: { id: ThroughlineDemoId }) {
	const example = THROUGHLINE_DEMOS[id];

	return (
		<figure className="not-prose my-7 overflow-hidden rounded-lg border border-border bg-card">
			<figcaption className="border-b border-border px-4 py-3">
				<p className="font-medium text-sm text-foreground">{example.title}</p>
				<p className="mt-1 text-sm text-muted-foreground">{example.description}</p>
			</figcaption>
			<div className="p-3 sm:p-4">
				<Suspense
					fallback={
						<div role="status" className="py-10 text-center text-sm text-muted-foreground">
							Loading the interactive player…
						</div>
					}
				>
					<DemoPlayer source={example.source} />
				</Suspense>
			</div>
			<details className="group border-t border-border">
				<summary className="cursor-pointer px-4 py-3 text-sm font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary">
					View trace source
				</summary>
				<pre className="m-0 max-h-80 overflow-auto border-t border-border bg-muted/30 px-4 py-3 text-xs leading-relaxed text-foreground">
					<code>{example.source}</code>
				</pre>
			</details>
		</figure>
	);
}
