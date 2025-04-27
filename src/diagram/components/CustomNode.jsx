import React, { memo, useCallback } from "react";
import { Handle, Position, NodeResizer, NodeToolbar, useReactFlow } from "reactflow";
import "../styles/CustomNode.css";
import { useWebSocket } from "../../utils/WebSocketContext";

// Node colors
const nodeColors = {
	blue: "#3498db",
	green: "#2ecc71",
	red: "#e74c3c",
	purple: "#9b59b6",
	orange: "#e67e22",
	yellow: "#f1c40f",
	gray: "#95a5a6",
};

const CustomNode = ({ id, data, selected }) => {
	const { ydoc } = useWebSocket();
	const { setNodes } = useReactFlow();

	const handleResizeEnd = useCallback(
		(event, node) => {
			const newWidth = node.width;
			const newHeight = node.height;

			// Update local state
			setNodes((nodes) =>
				nodes.map((n) => {
					if (n.id === id) {
						return {
							...n,
							data: {
								...n.data,
								width: newWidth,
								height: newHeight,
							},
						};
					}
					return n;
				})
			);

			// Update in y-doc if available
			if (ydoc) {
				const nodesMap = ydoc.getMap("nodes");
				const node = nodesMap.get(id);
				if (node) {
					const updatedNode = {
						...node,
						data: {
							...node.data,
							width: newWidth,
							height: newHeight,
						},
					};
					nodesMap.set(id, updatedNode);
				}
			}
		},
		[id, setNodes, ydoc]
	);

	return (
		<div
			className="customnode"
			style={{
				padding: "10px",
				background: data.color ? nodeColors[data.color] : "#fff",
				border: "1px solid black",
				borderRadius: "15px",
				fontSize: "12px",
				position: "relative",
				minWidth: "100px",
				minHeight: "30px",
				width: data.width,
				height: data.height,
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					wordBreak: "break-word",
					width: "100%",
					height: "100%",
				}}
			>
				{data.label}
			</div>

			<NodeResizer color="#ff0071" isVisible={selected} minWidth={100} minHeight={30} onResizeEnd={handleResizeEnd} />

			<Handle type="source" id="left" position={Position.Left} />
			<Handle type="source" id="right" position={Position.Right} />
			<Handle type="source" id="top" position={Position.Top} />
			<Handle type="source" id="bottom" position={Position.Bottom} />

			<NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
				<button>delete</button>
				<button>copy</button>
				<button>expand</button>
			</NodeToolbar>
		</div>
	);
};

export default memo(CustomNode);
