import { useDnD } from "../utils/DnDContext";
import { useReactFlow } from "reactflow";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import "../styles/DropBar.css";
import useCanvasStore from "../../store/useCanvasStore";

const DropBar = ({ isVisible, isVisibleMap }) => {
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
		setType(nodeType);
		event.dataTransfer.effectAllowed = "move";
		console.log(nodeType);
	};

	const onAddNodeToCenter = (nodeType) => {
		const { x, y, zoom } = reactFlowInstance.getViewport();
		const width = window.innerWidth;
		const height = window.innerHeight;

		const centerX = (width / 2 - x) / zoom - 50;
		const centerY = (height / 2 - y) / zoom - 30;

		const id = uuidv4();
		const newNode = {
			id,
			position: { x: centerX, y: centerY },
			data: { label: `${nodeType} node` },
			type: nodeType,
			...(nodeType === "mygroup" ? { zIndex: -999 } : {}),
		};

		addNode(newNode);
	};

	if (!isVisible && animationClass === "slide-out-complete") {
		return null;
	}

	const minimapClass = isVisibleMap ? "minimap-visible" : "";

	return (
		<aside className={`dropbar ${animationClass} ${minimapClass}`}>
			<div className="description">
				Ви можете перетягнути ці вузли на панель праворуч або натиснути на них для додавання.
			</div>
			<button
				className="custom-node"
				onClick={() => onAddNodeToCenter("custom")}
				onDragStart={(event) => onDragStart(event, "custom")}
				draggable
			>
				Вимога
			</button>
			<button
				className="group-node"
				onClick={() => onAddNodeToCenter("mygroup")}
				onDragStart={(event) => onDragStart(event, "mygroup")}
				draggable
			>
				Моя Група
			</button>

			<button
				className="actor-node"
				onClick={() => onAddNodeToCenter("actor")}
				onDragStart={(event) => onDragStart(event, "actor")}
				draggable
			>
				Актор
			</button>
			<button
				className="note-node"
				onClick={() => onAddNodeToCenter("note")}
				onDragStart={(event) => onDragStart(event, "note")}
				draggable
			>
				Замітка
			</button>
			<button
				className="link-node"
				onClick={() => onAddNodeToCenter("link")}
				onDragStart={(event) => onDragStart(event, "link")}
				draggable
			>
				Посилання
			</button>
			<button
				className="image-node"
				onClick={() => onAddNodeToCenter("image")}
				onDragStart={(event) => onDragStart(event, "image")}
				draggable
			>
				Зображення
			</button>

			<button
				className="default"
				onClick={() => onAddNodeToCenter("default")}
				onDragStart={(event) => onDragStart(event, "default")}
				draggable
			>
				Default
			</button>
		</aside>
	);
};

export default DropBar;
