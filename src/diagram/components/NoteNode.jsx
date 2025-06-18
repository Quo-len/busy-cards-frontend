import React, { memo } from "react";
import { NodeResizer } from "reactflow";
import { useNodeResize } from "../utils/utils";
import "../styles/NoteNode.css";

const NoteNode = ({ id, data, selected }) => {
	const handleResize = useNodeResize(id);

	return (
		<div
			className={`note-node ${selected ? "selected" : ""}`}
			style={{
				background: data.color ? data.color : "#fff",
				width: data.width,
				height: data.height,
			}}
		>
			<NodeResizer color="#ff0071" isVisible={selected} minWidth={150} minHeight={50} onResize={handleResize} />

			<div className="custom-node-content">{data.label}</div>
		</div>
	);
};

export default memo(NoteNode);
