import { memo, useCallback, useMemo } from "react";
import { useStore, BaseEdge, EdgeLabelRenderer, getBezierPath } from "reactflow";
import "../styles/CustomEdge.css";
import useCanvasStore from "../../store/useCanvasStore";

import { getEdgeParams } from "../utils/utils";

const CustomEdge = ({ id, source, target, sourcePosition, targetPosition, style = {}, markerEnd, data = {} }) => {
	const { removeEdge } = useCanvasStore();

	const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
	const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

	if (!sourceNode || !targetNode) {
		return null;
	}

	const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX: sx,
		sourceY: sy,
		sourcePosition: sourcePos,
		targetPosition: targetPos,
		targetX: tx,
		targetY: ty,
	});

	const onEdgeClick = () => {
		removeEdge(id);
	};

	// Define edge styling based on data.type
	const edgeStyles = useMemo(() => {
		const baseStyle = {
			strokeWidth: data.strokeWidth || 2,
			...style,
		};

		// Apply different styles based on edge type
		switch (data.type) {
			case "success":
				return {
					...baseStyle,
					stroke: "#22c55e", // green
					strokeDasharray: data.animated ? "5,5" : undefined,
				};
			case "error":
				return {
					...baseStyle,
					stroke: "#ef4444", // red
					strokeDasharray: data.animated ? "5,5" : undefined,
				};
			case "warning":
				return {
					...baseStyle,
					stroke: "#f59e0b", // amber
					strokeDasharray: data.animated ? "5,5" : undefined,
				};
			case "highlight":
				return {
					...baseStyle,
					stroke: "#3b82f6", // blue
					strokeWidth: 3,
					strokeDasharray: data.animated ? "5,5" : undefined,
				};
			case "dashed":
				return {
					...baseStyle,
					strokeDasharray: "5,5",
				};
			case "dotted":
				return {
					...baseStyle,
					strokeDasharray: "2,2",
				};
			default:
				return {
					...baseStyle,
					stroke: data.color || "#64748b", // slate if no color specified
					strokeDasharray: data.animated ? "5,5" : undefined,
				};
		}
	}, [data, style]);

	// Define marker end based on data.arrow type
	const customMarkerEnd = useMemo(() => {
		if (data.arrow === "none") return undefined;

		const arrowColor = edgeStyles.stroke || "#64748b";
		const arrowType = data.arrow || "normal";

		switch (arrowType) {
			case "large":
				return `url(#edge-arrow-large-${arrowColor.replace("#", "")})`;
			case "fancy":
				return `url(#edge-arrow-fancy-${arrowColor.replace("#", "")})`;
			default:
				return markerEnd || `url(#edge-arrow-${arrowColor.replace("#", "")})`;
		}
	}, [data, edgeStyles.stroke, markerEnd]);

	return (
		<>
			<BaseEdge
				path={edgePath}
				markerEnd={customMarkerEnd}
				style={edgeStyles}
				className={data.animated ? "animated-edge" : ""}
			/>
			<EdgeLabelRenderer>
				<div
					style={{
						position: "absolute",
						transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
						fontSize: 12,
						pointerEvents: "all",
					}}
					className="nodrag"
				>
					{data.label && (
						<div
							className="edge-label"
							style={{
								background: data.labelBackground || "#f8fafc",
								color: data.labelColor || "#475569",
								padding: "2px 4px",
								borderRadius: "4px",
								marginBottom: "8px",
								fontWeight: data.labelBold ? "bold" : "normal",
								border: "1px solid #e2e8f0",
							}}
						>
							{data.label}
						</div>
					)}
					<button className="edgebutton" onClick={onEdgeClick}>
						×
					</button>
				</div>
			</EdgeLabelRenderer>
		</>
	);
};

export default memo(CustomEdge);
