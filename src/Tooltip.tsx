import { useEffect, useRef } from "react";

export type TooltipProps = { children: React.ReactNode };

export function Tooltip(props: { children: React.ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const handle = (e: MouseEvent) => {
			if (!ref.current) return;
			const px = e.pageX;
			const py = e.pageY;
			const ww = window.innerWidth;
			const wh = window.innerHeight;
			const pos =
				e.screenX < ww / 2
					? e.screenY < wh / 2
						? { left: px + 10, top: py + 10 }
						: { left: px + 10, bottom: wh - py + 10 }
					: e.screenY < wh / 2
					? { right: ww - px + 10, top: py + 10 }
					: { right: ww - px + 10, bottom: wh - py + 10 };
			ref.current.style.left = pos.left !== undefined ? pos.left + "px" : "";
			ref.current.style.right = pos.right !== undefined ? pos.right + "px" : "";
			ref.current.style.top = pos.top !== undefined ? pos.top + "px" : "";
			ref.current.style.bottom =
				pos.bottom !== undefined ? pos.bottom + "px" : "";
		};
		document.addEventListener("mousemove", handle);
		return () => document.removeEventListener("mousemove", handle);
	}, []);

	return (
		<div
			ref={ref}
			style={{
				position: "absolute",
				backgroundColor: "white",
				padding: "1em",
			}}
		>
			{props.children}
		</div>
	);
}
