// CustomEdge.js - Basic implementation
import React from "react";
import { BaseEdge, getStraightPath } from "reactflow";

function CustomEdge({ id, sourceX, sourceY, targetX, targetY }) {
	const [edgePath] = getStraightPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
	});

	return (
		<BaseEdge
			id={id}
			path={edgePath}
			style={{
				stroke: "#888",
				strokeWidth: 2,
			}}
		/>
	);
}

export default CustomEdge;
