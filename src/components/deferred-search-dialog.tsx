import { lazy, Suspense, useEffect, useState } from "react";

type SearchDialogProps = React.ComponentProps<
	typeof import("fumadocs-ui/components/dialog/search-default")["default"]
>;

const SearchDialog = lazy(
	() => import("fumadocs-ui/components/dialog/search-default"),
);

/**
 * Do not hydrate the search library until the visitor opens the dialog.
 * Keep it mounted after the first open to preserve its input state.
 */
export function DeferredSearchDialog(props: SearchDialogProps) {
	const [opened, setOpened] = useState(false);
	useEffect(() => {
		if (props.open) setOpened(true);
	}, [props.open]);

	if (!opened) return null;
	return (
		<Suspense fallback={null}>
			<SearchDialog {...props} />
		</Suspense>
	);
}
