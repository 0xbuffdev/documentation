export const DEFAULT_DOCS_PRODUCT = "assay";
export const DEFAULT_DOCS_PATH = `/docs/${DEFAULT_DOCS_PRODUCT}`;

/** Both entry routes redirect directly to the default MDX overview. */
export function defaultDocsLocation(requestUrl: string): string {
	return DEFAULT_DOCS_PATH + new URL(requestUrl).search;
}
