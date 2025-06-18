import React, { memo } from "react";
import { Handle, Position, NodeResizer } from "reactflow";
import "../styles/ImageNode.css";
import { useNodeResize } from "../utils/utils";

const ImageNode = ({ id, data, selected }) => {
	const handleResize = useNodeResize(id);

	return (
		<div
			className={`image-node ${selected ? "selected" : ""}`}
			style={{
				background: data.color ? data.color : "#fff",
				width: data.width || 200,
				height: data.height || 100,
			}}
		>
			<div className="node-label">{data.label}</div>
			{data.image && (
				<div className="image-container">
					<img src={data.image} alt={data.label || "Node Image"} />
				</div>
			)}

			<NodeResizer color="#ff0071" isVisible={selected} minWidth={200} minHeight={100} onResize={handleResize} />

			<Handle type="source" id="left" position={Position.Left} />
			<Handle type="source" id="right" position={Position.Right} />
			<Handle type="source" id="top" position={Position.Top} />
			<Handle type="source" id="bottom" position={Position.Bottom} />
		</div>
	);
};

export default memo(ImageNode);
