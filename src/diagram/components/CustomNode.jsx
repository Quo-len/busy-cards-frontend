import { Handle, Position, NodeResizer, NodeToolbar } from "reactflow";
import { useWebSocket } from "../../utils/WebSocketContext";
import React, { memo } from "react";
import { useNodeResize } from "../utils/utils";
import "../styles/CustomNode.css";

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
	const handleResizeEnd = useNodeResize(id, ydoc);

	return (
		<div
			className={`custom-node ${selected ? "selected" : ""}`}
			style={{
				background: data.color ? nodeColors[data.color] : "#fff",
				width: data.width,
				height: data.height,
			}}
		>
			<div className="custom-node-content">{data.label}</div>

			<NodeResizer color="#ff0071" isVisible={selected} minWidth={150} minHeight={50} onResizeEnd={handleResizeEnd} />

			<Handle type="source" id="left" position={Position.Left} className="handle left" />
			<Handle type="source" id="right" position={Position.Right} className="handle right" />
			<Handle type="source" id="top" position={Position.Top} className="handle top" />
			<Handle type="source" id="bottom" position={Position.Bottom} className="handle bottom" />

			<NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
				<button>Видалити</button>
				<button>Скопіювати</button>
				<button>Вставити</button>
			</NodeToolbar>
		</div>
	);
};

export default memo(CustomNode);
