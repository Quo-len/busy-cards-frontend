import { useWebSocket } from "../../utils/WebSocketContext";
import { useDnD } from "../utils/DnDContext";
import { useReactFlow } from "reactflow";
import { v4 as uuidv4 } from "uuid";
import "../styles/DropBar.css";

const DropBar = () => {
	const reactFlowInstance = useReactFlow();
	const { ydoc } = useWebSocket();
	const [_, setType] = useDnD();

	const onDragStart = (event, nodeType) => {
		setType(nodeType);
		event.dataTransfer.effectAllowed = "move";
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
		};

		reactFlowInstance.addNodes(newNode);
		ydoc.getMap("nodes").set(newNode.id, newNode);
	};

	return (
		<aside>
			<div className="description">
				Ви можете перетягнути ці вузли на панель праворуч або натиснути на них для додавання.
			</div>
			<div
				className="customnode"
				onClick={() => onAddNodeToCenter("custom")}
				onDragStart={(event) => onDragStart(event, "custom")}
				draggable
			>
				Вимога
			</div>
			<div
				className="group-node"
				onClick={() => onAddNodeToCenter("mygroup")}
				onDragStart={(event) => onDragStart(event, "mygroup")}
				draggable
			>
				Моя Група
			</div>
			<div
				className="group-node"
				onClick={() => onAddNodeToCenter("group")}
				onDragStart={(event) => onDragStart(event, "group")}
				draggable
			>
				Група
			</div>
			<div
				className="actor-node"
				onClick={() => onAddNodeToCenter("actor")}
				onDragStart={(event) => onDragStart(event, "actor")}
				draggable
			>
				Актор
			</div>
			<div
				className="note-node"
				onClick={() => onAddNodeToCenter("note")}
				onDragStart={(event) => onDragStart(event, "note")}
				draggable
			>
				Замітка
			</div>
			<div
				className="link-node"
				onClick={() => onAddNodeToCenter("link")}
				onDragStart={(event) => onDragStart(event, "link")}
				draggable
			>
				Посилання
			</div>
			<div
				className="image-node"
				onClick={() => onAddNodeToCenter("image")}
				onDragStart={(event) => onDragStart(event, "image")}
				draggable
			>
				Зображення
			</div>
		</aside>
	);
};

export default DropBar;
