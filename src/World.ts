export type World = { nodes: Record<string, Node> };

export function parseTsv(tsv: string | undefined): World | undefined {
	const nodes: Record<string, Node> = {};

	if (!tsv) return undefined;

	const rows = tsv
		.split("\n")
		.map((row) => row.split("\t").map((cell) => cell.trim()));
	const cols: Record<string, number> = {};
	rows[0].forEach((cell, i) => {
		if (cell) cols[cell] = i;
	});

	const xyzHeaders = "X	Y	Z".split("\t");
	const regionHeaders = "Quadrant	Region	L3 Region	L4 Region	L5 Region	Stop".split(
		"\t"
	);

	rows.slice(1).forEach((row, rowNr) => {
		rowNr += 2; // 1-based, including header
		try {
			const [x, y, z] = xyzHeaders
				.map((h) => row[cols[h]])
				.map((v) => (v ? +v.replace("~", "") : undefined));
			if (!isFinite(x!)) return;
			if (!isFinite(z!)) return;
			const location = { x: x!, y, z: z! };

			const regions = uniq(
				regionHeaders.map((h) => row[cols[h]]).filter((c) => c)
			);

			const id = row[cols.Name];

			nodes[id] = { id, location, regions };
		} catch (err) {
			console.error(`Error in row`, rowNr, err);
		}
	});

	return { nodes };
}

export interface Node {
	id: string;
	location: { x: number; y?: number; z: number };
	regions: string[];
}

export function uniq<T extends string | number>(arr: T[]) {
	const seen = {} as Record<T, number>;
	return arr.filter((e) => (seen[e] = (seen[e] || 0) + 1) < 2);
}
