export const THROUGHLINE_DEMOS = {
	counter: {
		title: "Follow a changing value",
		description: "Use Play or the step controls to see how the counter changes.",
		source: [
			"thl flow",
			'node counter "Counter" = 0',
			'step "Increment"',
			"  set counter = 1",
			'  note "The counter is now one."',
			'step "Increment again"',
			"  set counter = 2",
			'  note "The counter is now two."',
		].join("\n"),
		expectedFrames: 3,
	},
	references: {
		title: "Watch two references share an array",
		description: "Step through copying a reference, mutating the array, and moving one pointer.",
		source: [
			"thl bindings",
			"let list = [1, 2]",
			"let alias = list",
			"alias.push(3)",
			"alias = [7]",
		].join("\n"),
		expectedFrames: 5,
	},
	binary: {
		title: "See binary addition, one bit at a time",
		description: "Advance through each bit and carry, then reveal the final sum.",
		source: "thl binary\na = 1011\nb = 0110",
		expectedFrames: 6,
	},
} as const;

export type ThroughlineDemoId = keyof typeof THROUGHLINE_DEMOS;
