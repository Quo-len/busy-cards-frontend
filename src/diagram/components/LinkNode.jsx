import React, { memo } from "react";
import { Handle, Position } from "reactflow";

const LinkNode = ({ id, data, selected }) => {
	return (
		<div className="link-node">
			<div>{data.label}</div>
			<Handle type="source" id="left" position={Position.Left} />
			<Handle type="source" id="right" position={Position.Right} />
			<Handle type="source" id="top" position={Position.Top} />
			<Handle type="source" id="bottom" position={Position.Bottom} />
		</div>
	);
};

export default memo(LinkNode);
