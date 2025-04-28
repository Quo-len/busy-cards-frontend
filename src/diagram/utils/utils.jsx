import { getOutgoers, getIncomers, Position, internalsSymbol, useReactFlow } from "reactflow";
import { useCallback } from "react";

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

	const checkDescendants = (currentNode) => {
		if (visited.has(currentNode.id)) return false;
		visited.add(currentNode.id);

		const relatives = [...getIncomers(currentNode, nodes, edges), ...getOutgoers(currentNode, nodes, edges)];

		for (const relative of relatives) {
			if (relative.id === targetNode.id) return true;
			if (checkDescendants(relative)) return true;
		}

		return false;
	};

	return checkDescendants(node);
};

function getParams(nodeA, nodeB) {
	const centerA = getNodeCenter(nodeA);
	const centerB = getNodeCenter(nodeB);

	const horizontalDiff = Math.abs(centerA.x - centerB.x);
	const verticalDiff = Math.abs(centerA.y - centerB.y);

	let position;

	// when the horizontal difference between the nodes is bigger, we use Position.Left or Position.Right for the handle
	if (horizontalDiff > verticalDiff) {
		position = centerA.x > centerB.x ? Position.Left : Position.Right;
	} else {
		// here the vertical difference between the nodes is bigger, so we use Position.Top or Position.Bottom for the handle
		position = centerA.y > centerB.y ? Position.Top : Position.Bottom;
	}

	const [x, y] = getHandleCoordsByPosition(nodeA, position);
	return [x, y, position];
}

function getHandleCoordsByPosition(node, handlePosition) {
	// all handles are from type source, that's why we use handleBounds.source here
	const handle = node[internalsSymbol].handleBounds.source.find((h) => h.position === handlePosition);

	let offsetX = handle.width / 2;
	let offsetY = handle.height / 2;

	// this is a tiny detail to make the markerEnd of an edge visible.
	// The handle position that gets calculated has the origin top-left, so depending which side we are using, we add a little offset
	// when the handlePosition is Position.Right for example, we need to add an offset as big as the handle itself in order to get the correct position
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

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
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

export const useNodeResize = (id, ydoc) => {
	const { setNodes } = useReactFlow();

	const handleResizeEnd = useCallback(
		(event, node) => {
			const newWidth = node.width;
			const newHeight = node.height;

			// Update local state
			setNodes((nodes) =>
				nodes.map((n) => {
					if (n.id === id) {
						return {
							...n,
							data: {
								...n.data,
								width: newWidth,
								height: newHeight,
							},
						};
					}
					return n;
				})
			);

			// Update in y-doc if available
			if (ydoc) {
				const nodesMap = ydoc.getMap("nodes");
				const nodeData = nodesMap.get(id);
				if (nodeData) {
					const updatedNode = {
						...nodeData,
						data: {
							...nodeData.data,
							width: newWidth,
							height: newHeight,
						},
					};
					nodesMap.set(id, updatedNode);
				}
			}
		},
		[id, setNodes, ydoc]
	);

	return handleResizeEnd;
};
