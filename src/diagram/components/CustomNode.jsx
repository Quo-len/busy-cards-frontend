import { Handle, Position, NodeResizer } from "reactflow";
import { memo } from "react";
import { useNodeResize } from "../utils/utils";
import "../styles/CustomNode.css";

const CustomNode = ({ id, data, selected }) => {
	const handleResize = useNodeResize(id);

	return (
		<div
			className={`custom-node ${selected ? "selected" : ""}`}
			style={{
				background: data.color ? data.color : "#fff",
				width: data.width,
				height: data.height,
			}}
		>
			<div className="custom-node-content">{data.label}</div>

			<NodeResizer color="#ff0071" isVisible={selected} minWidth={150} minHeight={50} onResize={handleResize} />

			<Handle type="source" id="left" position={Position.Left} className="handle left" />
			<Handle type="source" id="right" position={Position.Right} className="handle right" />
			<Handle type="source" id="top" position={Position.Top} className="handle top" />
			<Handle type="source" id="bottom" position={Position.Bottom} className="handle bottom" />
		</div>
	);
};

export default memo(CustomNode);
