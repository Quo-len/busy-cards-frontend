import React, { memo } from "react";
import { Handle, Position, NodeResizer, NodeToolbar } from "reactflow";
const nodeColors = {
	blue: "#3498db",
	green: "#2ecc71",
	red: "#e74c3c",
	purple: "#9b59b6",
	orange: "#e67e22",
	yellow: "#f1c40f",
	gray: "#95a5a6",
};
const CustomNode = ({ data, selected }) => {
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
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					wordBreak: "break-word",
				}}
			>
				{data.label}
			</div>
			<NodeResizer color="#ff0071" isVisible={selected} minWidth={100} minHeight={30} />
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
