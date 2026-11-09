import { useMemo } from "react";
import { compile } from "@0xbuff/throughline";
import { ThroughlinePlayer } from "@0xbuff/throughline/react";
import "@0xbuff/throughline/styles/throughline.css";

export default function ThroughlineDemoPlayer({ source }: { source: string }) {
	// Compilation happens once per source. The player seeks through precomputed frames.
	const trace = useMemo(() => compile(source), [source]);
	return <ThroughlinePlayer trace={trace} theme="auto" />;
}
