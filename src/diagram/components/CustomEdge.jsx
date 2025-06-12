import { memo, useCallback, useMemo, useState } from "react";
import { useStore, BaseEdge, EdgeLabelRenderer, getBezierPath } from "reactflow";
import "../styles/CustomEdge.css";
import useCanvasStore from "../../store/useCanvasStore";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";

import { getEdgeParams } from "../utils/utils";

const EDGE_TYPES = {
	"not-defined": {
		label: "Не визначено",
		stroke: "#95a5a6",
		strokeDasharray: undefined,
	},
	dependency: {
		label: "Залежність",
		stroke: "#000000",
		strokeDasharray: undefined,
	},
	inclusion: {
		label: "Включення",
		stroke: "#2ecc71",
		strokeDasharray: undefined,
	},
	sequence: {
		label: "Послідовність",
		stroke: "#3498db",
		strokeDasharray: "5,5",
	},
	alternative: {
		label: "Альтернатива",
		stroke: "#e67e22",
		strokeDasharray: undefined,
		bidirectional: true,
	},
	conflict: {
		label: "Конфлікт",
		stroke: "#e74c3c",
		strokeDasharray: "10,5,5,5",
		zigzag: true,
	},
	supplement: {
		label: "Доповнення",
		stroke: "#9b59b6",
		strokeDasharray: "2,2",
	},
};

const CustomEdge = ({ id, source, target, sourcePosition, targetPosition, style = {}, markerEnd, data = {} }) => {
	const { removeEdge, updateEdge } = useCanvasStore();
	const [edgeType, setEdgeType] = useState(data.edgeType || "not-defined");

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

	const onEdgeTypeNext = (e) => {
		e.stopPropagation();

		const edgeTypes = Object.keys(EDGE_TYPES);

		let currentIndex = edgeTypes.indexOf(edgeType);

		let nextIndex = (currentIndex + 1) % edgeTypes.length;
		let nextType = edgeTypes[nextIndex];

		setEdgeType(nextType);

		const edgeData = useCanvasStore.getState().edges.get(id) || {};
		updateEdge(id, {
			...edgeData,
			data: {
				...edgeData.data,
				edgeType: nextType,
			},
		});
	};

	const onEdgeTypePrev = (e) => {
		e.stopPropagation();

		const edgeTypes = Object.keys(EDGE_TYPES);

		let currentIndex = edgeTypes.indexOf(edgeType);

		let prevIndex = currentIndex <= 0 ? edgeTypes.length - 1 : currentIndex - 1;
		let prevType = edgeTypes[prevIndex];

		setEdgeType(prevType);

		const edgeData = useCanvasStore.getState().edges.get(id) || {};
		updateEdge(id, {
			...edgeData,
			data: {
				...edgeData.data,
				edgeType: prevType,
			},
		});
	};

	const edgeStyles = useMemo(() => {
		const edgeTypeConfig = EDGE_TYPES[edgeType] || EDGE_TYPES["not-defined"];

		const baseStyle = {
			strokeWidth: data.strokeWidth || 2,
			stroke: edgeTypeConfig.stroke,
			strokeDasharray: edgeTypeConfig.strokeDasharray,
			...style,
		};

		return baseStyle;
	}, [edgeType, data, style]);

	return (
		<>
			<BaseEdge path={edgePath} style={edgeStyles} className={`${edgeType === "conflict" ? "zigzag-edge" : ""}`} />
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
					<div className="edge-controls">
						<button className="edgebutton edgetype-button" onClick={onEdgeTypePrev}>
							<MdNavigateBefore />
						</button>
						<button className="edgebutton" onClick={onEdgeClick}>
							×
						</button>
						<button className="edgebutton edgetype-button" onClick={onEdgeTypeNext}>
							<MdNavigateNext />
						</button>
					</div>
					{/* <div className="edge-type-label" style={{ color: edgeStyles.stroke }}>
						{EDGE_TYPES[edgeType]?.label || "Не визначено"}
					</div> */}
				</div>
			</EdgeLabelRenderer>
		</>
	);
};

export default memo(CustomEdge);
