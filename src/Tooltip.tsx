export type TooltipProps = { e: React.MouseEvent; children: React.ReactNode };

export function Tooltip(props: TooltipProps) {
	const { e, children } = props;
	const px = e.pageX;
	const py = e.pageY;
	const ww = window.innerWidth;
	const wh = window.innerHeight;
	const positioning =
		e.screenX < ww / 2
			? e.screenY < wh / 2
				? { left: px + 10, top: py + 10 }
				: { left: px + 10, bottom: wh - py + 10 }
			: e.screenY < wh / 2
			? { right: ww - px + 10, top: py + 10 }
			: { right: ww - px + 10, bottom: wh - py + 10 };

	return (
		<div
			style={{
				position: "absolute",
				...positioning,
				backgroundColor: "white",
				padding: "1em",
			}}
		>
			{children}
		</div>
	);
}
