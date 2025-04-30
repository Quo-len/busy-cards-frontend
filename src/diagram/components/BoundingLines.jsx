import React, { useCallback } from "react";
import { useStore, useStoreApi, useReactFlow } from "reactflow";

const BoundingLines = ({ translateExtent }) => {
	const store = useStoreApi();
	const { getViewport } = useReactFlow();
	const transform = useStore((state) => state.transform);

	const [[minX, minY], [maxX, maxY]] = translateExtent;

	const getTransformedPosition = useCallback(
		(x, y) => {
			const { x: transformX, y: transformY, zoom } = getViewport();
			return {
				x: x * zoom + transformX,
				y: y * zoom + transformY,
				zoom,
			};
		},
		[getViewport]
	);

	const viewportWidth = useStore((state) => state.width);
	const viewportHeight = useStore((state) => state.height);

	const minPos = getTransformedPosition(minX, minY);
	const maxPos = getTransformedPosition(maxX, maxY);
	const centerPos = getTransformedPosition(0, 0);

	const lineThickness = 2;
	const lineColor = "rgba(0, 0, 0, 0.7)";

	const getLineStyle = (direction) => {
		const baseStyle = {
			position: "absolute",
			border: "none",
			borderStyle: "dashed",
			borderColor: lineColor,
			borderWidth: `${lineThickness}px`,
			backgroundColor: "transparent",
			zIndex: -10,
			pointerEvents: "none",
		};

		switch (direction) {
			case "top":
				return {
					...baseStyle,
					left: `${minPos.x}px`,
					top: `${minPos.y}px`,
					width: `${maxPos.x - minPos.x}px`,
					height: `${lineThickness}px`,
				};
			case "right":
				return {
					...baseStyle,
					right: `${viewportWidth - maxPos.x}px`,
					top: `${minPos.y}px`,
					width: `${lineThickness}px`,
					height: `${maxPos.y - minPos.y}px`,
				};
			case "bottom":
				return {
					...baseStyle,
					left: `${minPos.x}px`,
					top: `${maxPos.y}px`,
					width: `${maxPos.x - minPos.x}px`,
					height: `${lineThickness}px`,
				};
			case "left":
				return {
					...baseStyle,
					left: `${minPos.x}px`,
					top: `${minPos.y}px`,
					width: `${lineThickness}px`,
					height: `${maxPos.y - minPos.y}px`,
				};
			default:
				return baseStyle;
		}
	};

	const getLabelStyle = (corner) => {
		const baseStyle = {
			position: "absolute",
			backgroundColor: "rgba(255, 255, 255, 0.8)",
			padding: "2px 4px",
			fontSize: "10px",
			fontWeight: "bold",
			color: "black",
			borderRadius: "3px",
			pointerEvents: "none",
			zIndex: -10,
			border: "1px solid black",
		};

		switch (corner) {
			case "topLeft":
				return {
					...baseStyle,
					left: `${minPos.x}px`,
					top: `${minPos.y}px`,
					transform: "translate(-50%, -50%)",
				};
			case "topRight":
				return {
					...baseStyle,
					left: `${maxPos.x}px`,
					top: `${minPos.y}px`,
					transform: "translate(-50%, -50%)",
				};
			case "bottomLeft":
				return {
					...baseStyle,
					left: `${minPos.x}px`,
					top: `${maxPos.y}px`,
					transform: "translate(-50%, -50%)",
				};
			case "bottomRight":
				return {
					...baseStyle,
					left: `${maxPos.x}px`,
					top: `${maxPos.y}px`,
					transform: "translate(-50%, -50%)",
				};
			case "center":
				return {
					...baseStyle,
					left: `${centerPos.x}px`,
					top: `${centerPos.y}px`,
					transform: "translate(-50%, -50%)",
				};
			default:
				return baseStyle;
		}
	};

	const isVisible = minPos.x < viewportWidth && maxPos.x > 0 && minPos.y < viewportHeight && maxPos.y > 0;

	if (!isVisible) return null;

	return (
		<>
			<div className="boundary-line top" style={getLineStyle("top")} />
			<div className="boundary-line right" style={getLineStyle("right")} />
			<div className="boundary-line bottom" style={getLineStyle("bottom")} />
			<div className="boundary-line left" style={getLineStyle("left")} />

			<div className="boundary-label top-left" style={getLabelStyle("topLeft")}>
				[{minX},{minY}]
			</div>
			<div className="boundary-label top-right" style={getLabelStyle("topRight")}>
				[{maxX},{minY}]
			</div>
			<div className="boundary-label bottom-left" style={getLabelStyle("bottomLeft")}>
				[{minX},{maxY}]
			</div>
			<div className="boundary-label bottom-right" style={getLabelStyle("bottomRight")}>
				[{maxX},{maxY}]
			</div>

			<div className="boundary-label center" style={getLabelStyle("center")}>
				[0,0]
			</div>
		</>
	);
};

export default BoundingLines;
