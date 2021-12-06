import { memo } from "react";
import { BoundsFlat } from "./App";
import "./CivMap.css";

export const ccmapTilesRoot =
	"https://raw.githubusercontent.com/ccmap/tiles/master/";

export const BaseMapTilesSVG = memo(function BaseMapTilesSVG(props: {
	bounds: BoundsFlat;
	zoom: number;
	baseMapId: string;
	tilesRoot?: string;
}) {
	const { bounds, baseMapId, zoom, tilesRoot = ccmapTilesRoot } = props;
	const [west, north, width, height] = bounds;
	const east = west + width;
	const south = north + height;
	const project = projectZoom(zoom);
	const txMin = Math.floor(project(west) / 256);
	const tzMin = Math.floor(project(north) / 256);
	const txMax = Math.ceil(project(east) / 256);
	const tzMax = Math.ceil(project(south) / 256);
	const tiles: [number, number][] = [];
	for (let tz = tzMin; tz < tzMax; ++tz) {
		for (let tx = txMin; tx < txMax; ++tx) {
			tiles.push([tx, tz]);
		}
	}
	return (
		<g className="civmap-tiles">
			{tiles.map(([tx, tz]) => (
				<TileSVG
					{...{ tx, tz, zoom, baseMapId, tilesRoot }}
					key={`${tx} ${tz}`}
				/>
			))}
		</g>
	);
});

function TileSVG(props: {
	tx: number;
	tz: number;
	zoom: number;
	baseMapId: string;
	tilesRoot: string;
}) {
	const { tx, tz, zoom, baseMapId, tilesRoot } = props;
	const tileUrl = tilesRoot + baseMapId + `/z${zoom}/${tx},${tz}.png`;
	const unproject = unprojectZoom(zoom);
	return (
		<image
			href={tileUrl}
			x={unproject(tx * 256)}
			y={unproject(tz * 256)}
			width={unproject(256)}
			height={unproject(256)}
		/>
	);
}

const projectZoom = (zoomLevel: number) => {
	const scale = Math.pow(2, zoomLevel);
	return (num: number) => num * scale;
};
const unprojectZoom = (zoomLevel: number) => {
	const scale = Math.pow(2, zoomLevel);
	return (num: number) => num / scale;
};
