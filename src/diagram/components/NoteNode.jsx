import React, { memo } from "react";
import { Handle, Position } from "reactflow";

const NoteNode = ({ id, data, selected }) => {
	return (
		<div className="note-node">
			<div>{data.label}</div>
		</div>
	);
};

export default memo(NoteNode);
