import { useWebSocket } from "../../utils/WebSocketContext";
import { Handle, Position, NodeResizer } from "reactflow";
import { useNodeResize } from "../utils/utils";
import { memo } from "react";
import "../styles/ActorNode.css";

const ActorNode = ({ id, data, selected }) => {
	const { ydoc } = useWebSocket();
	const handleResizeEnd = useNodeResize(id, ydoc);

	return (
		<div
			style={{
				width: data.width,
				height: data.height,
			}}
			className={`actor-node ${selected ? "selected" : ""}`}
		>
			{/* Actor figure (stick figure) */}
			<div className="actor-figure">
				<svg width="40" height="60" viewBox="0 0 40 60">
					{/* Head */}
					<circle cx="20" cy="10" r="8" stroke="black" strokeWidth="1.5" fill="none" />

					{/* Body */}
					<line x1="20" y1="18" x2="20" y2="35" stroke="black" strokeWidth="1.5" />

					{/* Arms */}
					<line x1="20" y1="25" x2="5" y2="20" stroke="black" strokeWidth="1.5" />
					<line x1="20" y1="25" x2="35" y2="20" stroke="black" strokeWidth="1.5" />

					{/* Legs */}
					<line x1="20" y1="35" x2="10" y2="50" stroke="black" strokeWidth="1.5" />
					<line x1="20" y1="35" x2="30" y2="50" stroke="black" strokeWidth="1.5" />
				</svg>
			</div>

			{/* Label below the figure */}
			<div className="actor-label">{data?.label || "Actor"}</div>

			<NodeResizer color="#ff0071" isVisible={selected} minWidth={80} minHeight={110} onResizeEnd={handleResizeEnd} />

			{/* Connection handles */}
			<Handle type="source" id="left" position={Position.Left} />
			<Handle type="source" id="right" position={Position.Right} />
			<Handle type="source" id="top" position={Position.Top} />
			<Handle type="source" id="bottom" position={Position.Bottom} />
		</div>
	);
};

export default memo(ActorNode);
