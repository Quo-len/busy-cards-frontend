import React, { memo, useCallback } from "react";
import { useStore, BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from "reactflow";
import { useWebSocket } from "../../utils/WebSocketContext";
import "../styles/CustomEdge.css";

import { getEdgeParams } from "../utils/utils";

const CustomEdge = ({ id, source, target, sourcePosition, targetPosition, style = {}, markerEnd }) => {
	const { setEdges } = useReactFlow();
	const { ydoc } = useWebSocket();

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
		if (!ydoc) return;
		// Remove edge from Yjs shared map
		const edgesMap = ydoc.getMap("edges");
		edgesMap.delete(id);
		// Remove edge from local state
		setEdges((edges) => edges.filter((edge) => edge.id !== id));
	};

	return (
		<>
			<BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
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
					<button className="edgebutton" onClick={onEdgeClick}>
						×
					</button>
				</div>
			</EdgeLabelRenderer>
		</>
	);
};

export default memo(CustomEdge);
