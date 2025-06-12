import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import "../styles/LinkNode.css";

const LinkNode = ({ id, data, selected }) => {
	return (
		<div className="link-node">
			<div>{data.label}</div>
		</div>
	);
};

export default memo(LinkNode);
