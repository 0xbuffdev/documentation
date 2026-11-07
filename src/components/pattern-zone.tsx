import { cn } from "~/lib/utils";

export const PATTERN_COLS = 16;
export const PATTERN_ROWS = 7;

export function hash(input: string): number {
	let h = 2166136261;
	for (let i = 0; i < input.length; i++) {
		h ^= input.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

export type ByteTone = "hot" | "warm" | "cold" | "void";

export function byteCells(
	seed: string,
	cols: number,
	rows: number,
	dim = false,
): ByteTone[] {
	const seedNum = hash(seed);
	return Array.from({ length: cols * rows }, (_, i) => {
		const v = (seedNum >> (i % 31)) ^ (i * 2654435761);
		const r = ((v >>> 0) % 100) / 100;
		if (dim) return r > 0.94 ? "warm" : r > 0.62 ? "cold" : "void";
		return r > 0.82 ? "hot" : r > 0.55 ? "warm" : "cold";
	});
}

export type LatticeTones = Record<ByteTone, string>;

export const LATTICE_TONES: LatticeTones = {
	hot: "bg-primary/70 group-hover:bg-primary",
	warm: "bg-primary/50 group-hover:bg-primary/80",
	cold: "bg-foreground/5 group-hover:bg-foreground/9",
	void: "bg-transparent",
};

export function ByteLattice({
	seed,
	cols = PATTERN_COLS,
	rows = PATTERN_ROWS,
	dim = true,
	tones = LATTICE_TONES,
	className,
}: {
	seed: string;
	cols?: number;
	rows?: number;
	dim?: boolean;
	tones?: LatticeTones;
	className?: string;
}) {
	return (
		<div
			className={cn("grid gap-1.5", className)}
			style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
		>
			{byteCells(seed, cols, rows, dim).map((tone, i) => (
				<span
					className={cn(
						"size-1.5 rounded-[1px] transition-colors duration-300",
						tones[tone],
					)}
					key={i}
				/>
			))}
		</div>
	);
}

export function PatternZone({
	seed,
	watermark,
}: {
	seed: string;
	watermark: string;
}) {
	return (
		<div
			aria-hidden="true"
			className="mask-[radial-gradient(110%_100%_at_bottom_right,black_60%,transparent_95%)] pointer-events-none absolute inset-x-0 bottom-0 h-[65%] select-none overflow-hidden"
		>
			<div className="absolute right-3 bottom-3 transition-transform duration-500 ease-out group-hover:scale-[1.03] sm:right-4 sm:bottom-4">
				<ByteLattice cols={PATTERN_COLS} rows={PATTERN_ROWS} seed={seed} />
			</div>

			<span className="absolute -right-1 -bottom-2.5 font-black font-mono text-6xl text-foreground/[0.07] leading-none tracking-tighter transition-all duration-300 ease-out group-hover:scale-[1.03] group-hover:text-primary/[0.14] sm:text-7xl lg:text-8xl">
				{watermark}
			</span>
		</div>
	);
}

export const CELL_SHEEN = cn(
	"pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500",
	"group-hover:opacity-100",
	"bg-[radial-gradient(120%_80%_at_0%_0%,color-mix(in_oklch,var(--primary)_9%,transparent),transparent_60%)]",
);
