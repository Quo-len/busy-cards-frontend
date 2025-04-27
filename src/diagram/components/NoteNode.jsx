import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import "../styles/NoteNode.css";

const NoteNode = ({ id, data, selected }) => {
	return (
		<div className="note-node">
			<div>{data.label}</div>
		</div>
	);
};

export default memo(NoteNode);
