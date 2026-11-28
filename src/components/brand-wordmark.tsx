import { SITE } from "~/lib/site";

export function BrandWordmark({
	accentClassName = "text-brand-orange",
}: {
	accentClassName?: string;
}) {
	return (
		<>
			{SITE.wordmark.prefix}
			<span className={accentClassName}>{SITE.wordmark.accent}</span>
		</>
	);
}
