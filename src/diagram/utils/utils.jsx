import { getOutgoers, getIncomers, Position, internalsSymbol, useReactFlow } from "reactflow";
import { useCallback } from "react";
import useCanvasStore from "../../store/useCanvasStore";

export function createNodesAndEdges(xNodes = 10, yNodes = 10) {
	const nodes = [];
	const edges = [];
	let nodeId = 1;
	let recentNodeId = null;

	for (let y = 0; y < yNodes; y++) {
		for (let x = 0; x < xNodes; x++) {
			const position = { x: x * 150, y: y * 100 };
			const data = { label: `Node ${nodeId}` };
			const node = {
				id: `stress-${nodeId.toString()}`,
				style: { width: 100, fontSize: 15 },
				data,
				position,
				type: "default",
			};
			nodes.push(node);

			if (recentNodeId && nodeId <= xNodes * yNodes) {
				edges.push({
					id: `${x}-${y}`,
					source: `stress-${recentNodeId.toString()}`,
					target: `stress-${nodeId.toString()}`,
					type: "default",
				});
			}

			recentNodeId = nodeId;
			nodeId++;
		}
	}

	return { nodes, edges };
}

export function generateRandomColor() {
	"#" + Math.floor(Math.random() * 16777215).toString(16);
}

export const isNodeDescendant = (node, targetNode, nodes, edges) => {
	const visited = new Set();
	const queue = [node];

	while (queue.length > 0) {
		const currentNode = queue.shift();

		if (visited.has(currentNode.id)) continue;
		visited.add(currentNode.id);

		const relatives = [...getIncomers(currentNode, nodes, edges), ...getOutgoers(currentNode, nodes, edges)];

		for (const relative of relatives) {
			if (relative.id === targetNode.id) return true;
			queue.push(relative);
		}
	}

	return false;
};

export const isValidConnection = (connection) => {
	const nodes = useCanvasStore.getState().getNodesArray();
	const edges = useCanvasStore.getState().getEdgesArray();

	const sourceNode = nodes.find((node) => node.id === connection.source);
	const targetNode = nodes.find((node) => node.id === connection.target);

	if (connection.source === connection.target) return false;

	const existingEdge = edges.some(
		(edge) =>
			(edge.source === connection.source && edge.target === connection.target) ||
			(edge.source === connection.target && edge.target === connection.source)
	);

	if (existingEdge) return false;

	if (isNodeDescendant(sourceNode, targetNode, nodes, edges) || isNodeDescendant(targetNode, sourceNode, nodes, edges))
		return false;

	return true;
};

export const findInvalidTargetNodes = (sourceId, nodes, edges) => {
	if (!sourceId) return [];

	const sourceNode = nodes.find((node) => node.id === sourceId);

	if (!sourceNode) return [];

	return nodes
		.filter((node) => {
			if (node.id === sourceId) return true;

			const testConnection = {
				source: sourceId,
				target: node.id,
			};

			return !isValidConnection(testConnection, nodes, edges);
		})
		.map((node) => node.id);
};

export const useNodeResize = (id) => {
	const { updateNode } = useCanvasStore();

	const handleResizing = useCallback(
		(event, node) => {
			const newWidth = node.width;
			const newHeight = node.height;

			updateNode(id, { ...node, data: { ...node.data, width: newWidth, height: newHeight } });
		},
		[id, updateNode]
	);

	return handleResizing;
};

function getParams(nodeA, nodeB) {
	const centerA = getNodeCenter(nodeA);
	const centerB = getNodeCenter(nodeB);

	const horizontalDiff = Math.abs(centerA.x - centerB.x);
	const verticalDiff = Math.abs(centerA.y - centerB.y);

	let position;

	if (horizontalDiff > verticalDiff) {
		position = centerA.x > centerB.x ? Position.Left : Position.Right;
	} else {
		position = centerA.y > centerB.y ? Position.Top : Position.Bottom;
	}

	const [x, y] = getHandleCoordsByPosition(nodeA, position);
	return [x, y, position];
}

function getHandleCoordsByPosition(node, handlePosition) {
	const handle = node[internalsSymbol].handleBounds.source.find((h) => h.position === handlePosition);

	let offsetX = handle.width / 2;
	let offsetY = handle.height / 2;

	switch (handlePosition) {
		case Position.Left:
			offsetX = 0;
			break;
		case Position.Right:
			offsetX = handle.width;
			break;
		case Position.Top:
			offsetY = 0;
			break;
		case Position.Bottom:
			offsetY = handle.height;
			break;
	}

	const x = node.positionAbsolute.x + handle.x + offsetX;
	const y = node.positionAbsolute.y + handle.y + offsetY;

	return [x, y];
}

function getNodeCenter(node) {
	return {
		x: node.positionAbsolute.x + node.width / 2,
		y: node.positionAbsolute.y + node.height / 2,
	};
}

export function getEdgeParams(source, target) {
	const [sx, sy, sourcePos] = getParams(source, target);
	const [tx, ty, targetPos] = getParams(target, source);

	return {
		sx,
		sy,
		tx,
		ty,
		sourcePos,
		targetPos,
	};
}
