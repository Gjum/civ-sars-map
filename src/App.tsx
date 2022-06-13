import { memo, useMemo, useState } from "react";
import useSWR from "swr";
import { BaseMapTilesSVG } from "./CivMap";
import { Tooltip } from "./Tooltip";
import { isStation, parseTsv, uniq, World, XyZ } from "./World";

const tsvUrl =
	"https://docs.google.com/spreadsheets/d/1zYh7a0l1Faa05buJpwo1HNeP538MA9BxAm643n0U7tY/export?gid=0&format=tsv";

export function App() {
	const { data: tsv } = useSWR(
		tsvUrl,
		(url) => fetch(url).then((r) => r.text()),
		{ revalidateOnFocus: false, refreshInterval: 0 }
	);
	const world = useMemo(() => parseTsv(tsv), [tsv]);

	const [hoverNodeId, onHoverNode] = useState<string | null>(null);
	const [hoverRegionId, onHoverRegion] = useState<string | null>(null);

	if (!world) {
		return <div className="App">Loading rails ...</div>;
	}

	const { nodes } = world;
	const hoverNode = world.nodes[hoverNodeId || hoverRegionId || null!];

	return (
		<div className="App">
			<div>
				<p>found {Object.keys(nodes).length} nodes</p>
				<RailMap {...{ world, onHoverNode, onHoverRegion }} />
				<pre>{JSON.stringify(nodes, null, 2)}</pre>
				{hoverNodeId ? (
					<Tooltip>
						{hoverNodeId} ({isStation(hoverNode) ? "Station" : "Junction"}
						)
						<br />
						{isStation(hoverNode) && `/dest $ ${hoverNode.regions.join(" ")}`}
					</Tooltip>
				) : hoverRegionId ? (
					<Tooltip>{hoverNode.regions.join(" ")}</Tooltip>
				) : null}
			</div>
		</div>
	);
}

export const RailMap = memo(function Map(props: {
	world: World;
	onHoverNode: (id: string | null) => void;
	onHoverRegion: (id: string | null) => void;
}) {
	const { onHoverNode, world } = props;
	const { nodes } = world;

	const nodesArr = useMemo(() => Object.values(nodes), [nodes]);

	const proj = useMemo(() => {
		return new GridProjection(nodesArr);
		// return new GridProjection(nodesArr);
	}, [nodesArr]);

	const bounds0 = proj.boundsWithMargin(0);
	// point size
	const scale = bounds0[3] / 50;

	const boundsMargin = proj.boundsWithMargin(scale);

	return (
		<svg width="100%" height="80vh" viewBox={boundsMargin.join(" ")}>
			{proj instanceof RealProjection && (
				<g opacity={0.3} filter="grayscale(1)">
					<BaseMapTilesSVG
						baseMapId="terrain"
						bounds={boundsMargin}
						zoom={-4} // TODO calculate zoom from scale
					/>
				</g>
			)}
			{nodesArr.map((node) => (
				<circle
					cx={proj.projectX(node.location.x)}
					cy={proj.projectZ(node.location.z)}
					r={scale / 2}
					fill="red"
					stroke="none"
					onClick={() => console.log("clicked", node)}
					onMouseMove={() => onHoverNode(node.id)}
					onMouseLeave={() => onHoverNode(null)}
					key={node.id}
				/>
			))}
			{nodesArr.map((node) => (
				<text
					x={proj.projectX(node.location.x)}
					y={proj.projectZ(node.location.z)}
					dx={scale * 0.4}
					dy={scale * -0.4}
					fontSize={scale}
					fill="black"
					key={node.id}
				>
					{node.id}
				</text>
			))}
		</svg>
	);
});

/** west, north, width, height */
export type BoundsFlat = [number, number, number, number];

export interface Projection {
	projectX(x: number): number;
	projectZ(z: number): number;
	boundsWithMargin(margin: number): BoundsFlat;
}

export class RealProjection implements Projection {
	w: number;
	e: number;
	n: number;
	s: number;
	constructor(nodes: { location: XyZ }[]) {
		const xs = nodes.map((n) => n.location.x);
		const zs = nodes.map((n) => n.location.z);
		this.w = Math.min(...xs);
		this.e = Math.max(...xs);
		this.n = Math.min(...zs);
		this.s = Math.max(...zs);
	}
	projectX(x: number) {
		return x;
	}
	projectZ(z: number) {
		return z;
	}
	boundsWithMargin(margin: number): BoundsFlat {
		return [
			this.w - margin,
			this.n - margin,
			this.e - this.w + 2 * margin,
			this.s - this.n + 2 * margin,
		];
	}
}

/** Instead of real coordinates, everything is laid out on a grid,
 * preserving exactly-{west,east,north,south}-of but changing angles. */
export class GridProjection implements Projection {
	xs: number[];
	zs: number[];
	constructor(nodes: { location: XyZ }[]) {
		this.xs = uniq(nodes.map((n) => n.location.x).sort((a, b) => a - b));
		this.zs = uniq(nodes.map((n) => n.location.z).sort((a, b) => a - b));
	}
	projectX(x: number) {
		return this.xs.indexOf(x);
	}
	projectZ(z: number) {
		return this.zs.indexOf(z);
	}
	boundsWithMargin(margin: number): BoundsFlat {
		return [
			-margin,
			-margin,
			this.xs.length - 1 + 2 * margin,
			this.zs.length - 1 + 2 * margin,
		];
	}
}
