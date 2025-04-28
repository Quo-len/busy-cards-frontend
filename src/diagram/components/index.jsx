import CustomNode from "./CustomNode";
import ActorNode from "./ActorNode";
import NoteNode from "./NoteNode";
import LinkNode from "./LinkNode";
import ImageNode from "./ImageNode";
import GroupNode from "./GroupNode";
import RootNode from "./RootNode";

import "../styles/CustomNode.css";
import "../styles/ActorNode.css";
import "../styles/GroupNode.css";
import "../styles/NoteNode.css";
import "../styles/LinkNode.css";
import "../styles/ImageNode.css";
import "../styles/RootNode.css";

import CustomEdge from "./CustomEdge";

import "../styles/CustomEdge.css";

export const nodeTypes = {
	custom: CustomNode,
	actor: ActorNode,
	mygroup: GroupNode,
	note: NoteNode,
	link: LinkNode,
	image: ImageNode,
	root: RootNode,
};

export const edgeTypes = {
	custom: CustomEdge,
};
