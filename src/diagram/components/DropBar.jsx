import React from "react";
import { useDnD } from "../../utils/DnDContext";
import "../../components/styles/CustomNode.css";
import "../styles/DropBar.css";

const DropBar = ({ onAddNode }) => {
	const [_, setType] = useDnD();

	const onDragStart = (event, nodeType) => {
		setType(nodeType);
		event.dataTransfer.effectAllowed = "move";
	};

	return (
		<aside>
			<div className="description">You can drag these nodes to the pane on the right.</div>
			<div
				className="customnode"
				onClick={() => onAddNode("custom")}
				onDragStart={(event) => onDragStart(event, "custom")}
				draggable
			>
				Input Node
			</div>
			<div
				className="dndnode"
				onClick={() => onAddNode("default")}
				onDragStart={(event) => onDragStart(event, "default")}
				draggable
			>
				Default Node
			</div>
			<div
				className="customnode"
				onClick={() => onAddNode("custom")}
				onDragStart={(event) => onDragStart(event, "custom")}
				draggable
			>
				Output Node
			</div>
			<div
				className="group"
				onClick={() => onAddNode("custom")}
				onDragStart={(event) => onDragStart(event, "group")}
				draggable
			>
				Group
			</div>
		</aside>
	);
};

export default DropBar;
