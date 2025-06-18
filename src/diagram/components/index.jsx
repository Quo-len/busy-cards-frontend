import CustomNode from "./CustomNode";
import ActorNode from "./ActorNode";
import NoteNode from "./NoteNode";
import ImageNode from "./ImageNode";
import GroupNode from "./GroupNode";

import "../styles/CustomNode.css";
import "../styles/ActorNode.css";
import "../styles/GroupNode.css";
import "../styles/NoteNode.css";
import "../styles/ImageNode.css";

import CustomEdge from "./CustomEdge";

import "../styles/CustomEdge.css";

export const userPermissions = {
	Глядач: {
		canEdit: false,
		canComment: false,
		canManageParticipants: false,
	},
	Коментатор: {
		canEdit: false,
		canComment: true,
		canManageParticipants: false,
	},
	Редактор: {
		canEdit: true,
		canComment: true,
		canManageParticipants: false,
	},
	Власник: {
		canEdit: true,
		canComment: true,
		canManageParticipants: true,
	},
};

export const translateExtent = [
	[-4300, -2000],
	[4300, 2000],
];

export const nodeExtent = [
	[-4000, -1700],
	[4000, 1700],
];

export const nodeTypeNamesUa = {
	custom: "Вузол",
	actor: "Актор",
	mygroup: "Група",
	note: "Нотатка",
	link: "Посилання",
	image: "Зображення",
};

export const nodeColors = {
	Білий: "#ffffff",
	Червоний: "#e74c3c",
	Синій: "#3498db",
	Жовтий: "#f1c40f",
	Зелений: "#2ecc71",
	Фіолетовий: "#9b59b6",
	Сірий: "#ecf0f1",
	Помаранчевий: "#f39c12",
	Блакитний: "#85c1e9",
	Бірюзовий: "#1abc9c",
};

export const nodeShapes = {
	rectangle: {},
	circle: {},
	hexagon: {},
};

export const nodeFields = {
	custom: {
		fields: ["label", "description", "color", "status", "priority", "options"],
	},
	actor: {
		fields: ["label", "description", "color", "priority", "options"],
	},
	image: {
		fields: ["label", "description", "image"],
	},
	note: {
		fields: ["label", "color"],
	},
	mygroup: {
		fields: ["label", "description", "options"],
	},
};

export const statusOptions = [
	{ value: "proposed", label: "Запропоновано", color: "#3498db" },
	{ value: "approved", label: "Узгоджено", color: "#2ecc71" },
	{ value: "Відхилено", label: "Відхилено", color: "#e74c3c" },
	{ value: "В обговоренні", label: "В обговоренні", color: "#9b59b6" },
];

export const priorityOptions = [
	{ value: "p1", label: "P1 (критичний)", color: "#e74c3c" },
	{ value: "p2", label: "P2 (високий)", color: "#e67e22" },
	{ value: "p3", label: "P3 (середній)", color: "#f1c40f" },
	{ value: "p4", label: "P4 (низький)", color: "#2ecc71" },
];

export const nodeTypes = {
	custom: CustomNode,
	actor: ActorNode,
	mygroup: GroupNode,
	note: NoteNode,
	image: ImageNode,
};

export const edgeTypes = {
	custom: CustomEdge,
};
