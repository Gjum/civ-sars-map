import { memo, useMemo, useState } from "react";
import useSWR from "swr";
import { Tooltip, TooltipProps } from "./Tooltip";
import { parseTsv, uniq, World } from "./World";

const tsvUrl =
	"https://docs.google.com/spreadsheets/d/1zYh7a0l1Faa05buJpwo1HNeP538MA9BxAm643n0U7tY/export?gid=0&format=tsv";

export function App() {
	const { data: tsv } = useSWR(
		tsvUrl,
		(url) => fetch(url).then((r) => r.text()),
		{ revalidateOnFocus: false, refreshInterval: 0 }
	);
	const world = useMemo(() => parseTsv(tsv), [tsv]);

	const [tooltip, setTooltip] = useState<TooltipProps | null>(null);

	if (!world) {
		return <div className="App">Loading ...</div>;
	}

	const { nodes } = world;

	return (
		<div className="App">
			<div>
				<p>found {Object.keys(nodes).length} nodes</p>
				<GridMap world={world} setTooltip={setTooltip} />
				<pre>{JSON.stringify(nodes, null, 2)}</pre>
				{tooltip && <Tooltip {...tooltip} />}
			</div>
		</div>
	);
}

/** Instead of real coordinates, everything is laid out on a grid,
 * preserving exactly-{west,east,north,south}-of but changing angles. */
export const GridMap = memo(function Map(props: {
	world: World;
	setTooltip: (t: TooltipProps | null) => void;
}) {
	const { setTooltip, world } = props;
	const { nodes } = world;

	const { xs, zs } = useMemo(
		() => ({
			xs: uniq(
				Object.values(nodes)
					.map((n) => n.location.x)
					.sort((a, b) => a - b)
			),
			zs: uniq(
				Object.values(nodes)
					.map((n) => n.location.z)
					.sort((a, b) => a - b)
			),
		}),
		[nodes]
	);

	const width = xs.length + 1;
	const height = zs.length + 1;
	const margin = 0.5;

	return (
		<svg
			width="100%"
			height="80vh"
			viewBox={[
				0 - margin,
				0 - margin,
				width + 2 * margin,
				height + 2 * margin,
			].join(" ")}
			style={{ backgroundColor: "lavender" }}
		>
			{Object.values(nodes).map((node) => (
				<circle
					cx={xs.indexOf(node.location.x)}
					cy={zs.indexOf(node.location.z)}
					r={margin / 2}
					fill="red"
					stroke="none"
					onClick={() => console.log("clicked", node)}
					onMouseMove={(e) => setTooltip({ e, children: <div>{node.id}</div> })}
					onMouseLeave={() => setTooltip(null)}
					key={node.id}
				/>
			))}
		</svg>
	);
});
