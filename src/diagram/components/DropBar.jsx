import { useDnD } from "../utils/DnDContext";
import { useReactFlow } from "reactflow";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import "../styles/DropBar.css";
import useCanvasStore from "../../store/useCanvasStore";
import { nodeTypeNamesUa } from "../../diagram/components";

const DropBar = ({ isVisible, isVisibleMap, isEditable }) => {
	const reactFlowInstance = useReactFlow();
	const [_, setType] = useDnD();
	const [animationClass, setAnimationClass] = useState("");

	const { addNode } = useCanvasStore();

	useEffect(() => {
		if (isVisible) {
			setAnimationClass("slide-in");
		} else {
			setAnimationClass("slide-out");
		}
	}, [isVisible]);

	const onDragStart = (event, nodeType) => {
		if (!isEditable) {
			event.preventDefault();
			return;
		}
		setType(nodeType);
		event.dataTransfer.effectAllowed = "move";
	};

	const onAddNodeToCenter = (nodeType) => {
		if (!isEditable) return;

		const { x, y, zoom } = reactFlowInstance.getViewport();
		const width = window.innerWidth;
		const height = window.innerHeight;

		const centerX = (width / 2 - x) / zoom - 50;
		const centerY = (height / 2 - y) / zoom - 30;

		const id = uuidv4();
		const newNode = {
			id,
			position: { x: centerX, y: centerY },
			data: { label: `${nodeTypeNamesUa[nodeType]}` },
			type: nodeType,
			...(nodeType === "mygroup" ? { zIndex: -999 } : {}),
		};

		addNode(newNode);
	};

	if (!isVisible && animationClass === "slide-out-complete") {
		return null;
	}

	const minimapClass = isVisibleMap ? "minimap-visible" : "";
	const disabledClass = !isEditable ? "disabled" : "";

	return (
		<aside className={`dropbar ${animationClass} ${minimapClass} ${disabledClass}`}>
			<div className="description">
				{isEditable
					? "Ви можете перетягнути ці вузли на панель праворуч або натиснути на них для додавання."
					: "Режим перегляду - додавання вузлів недоступне"}
			</div>
			<button
				className="custom-node"
				onClick={() => onAddNodeToCenter("custom")}
				onDragStart={(event) => onDragStart(event, "custom")}
				draggable={isEditable}
				disabled={!isEditable}
			>
				Вимога
			</button>
			<button
				className="group-node"
				onClick={() => onAddNodeToCenter("mygroup")}
				onDragStart={(event) => onDragStart(event, "mygroup")}
				draggable={isEditable}
				disabled={!isEditable}
			>
				Група
			</button>

			<button
				className="actor-node"
				onClick={() => onAddNodeToCenter("actor")}
				onDragStart={(event) => onDragStart(event, "actor")}
				draggable={isEditable}
				disabled={!isEditable}
			>
				Актор
			</button>
			<button
				className="note-node"
				onClick={() => onAddNodeToCenter("note")}
				onDragStart={(event) => onDragStart(event, "note")}
				draggable={isEditable}
				disabled={!isEditable}
			>
				Замітка
			</button>
			<button
				className="image-node"
				onClick={() => onAddNodeToCenter("image")}
				onDragStart={(event) => onDragStart(event, "image")}
				draggable={isEditable}
				disabled={!isEditable}
			>
				Зображення
			</button>
		</aside>
	);
};

export default DropBar;
