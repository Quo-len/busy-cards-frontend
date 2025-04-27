import { useDnD } from "../../utils/DnDContext";
import "../styles/DropBar.css";

import "../styles/CustomNode.css";
import "../styles/ActorNode.css";

const DropBar = ({ onAddNode }) => {
	const [_, setType] = useDnD();

	const onDragStart = (event, nodeType) => {
		setType(nodeType);
		event.dataTransfer.effectAllowed = "move";
	};

	return (
		<aside>
			<div className="description">
				Ви можете перетягнути ці вузли на панель праворуч або натиснути на них для додавання.
			</div>
			<div
				className="customnode"
				onClick={() => onAddNode("custom")}
				onDragStart={(event) => onDragStart(event, "custom")}
				draggable
			>
				Вимога
			</div>
			<div
				className="group"
				onClick={() => onAddNode("custom")}
				onDragStart={(event) => onDragStart(event, "group")}
				draggable
			>
				Група
			</div>
			<div
				className="actor-node"
				onClick={() => onAddNode("actor")}
				onDragStart={(event) => onDragStart(event, "actor")}
				draggable
			>
				Актор
			</div>
			<div
				className="note-node"
				onClick={() => onAddNode("note")}
				onDragStart={(event) => onDragStart(event, "note")}
				draggable
			>
				Замітка
			</div>
			<div
				className="link-node"
				onClick={() => onAddNode("link")}
				onDragStart={(event) => onDragStart(event, "link")}
				draggable
			>
				Посилання
			</div>
			<div
				className="image-node"
				onClick={() => onAddNode("image")}
				onDragStart={(event) => onDragStart(event, "image")}
				draggable
			>
				Зображення
			</div>
		</aside>
	);
};

export default DropBar;
