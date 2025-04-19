import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
	Background,
	Controls,
	MiniMap,
	useNodesState,
	useEdgesState,
	addEdge,
	BackgroundVariant,
	ConnectionMode,
	useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import { useWebSocket } from "./2WebSocketContext";
import { getCurrentUser } from "./2CollaborationUtils";
import Cursor from "./2Cursor";
import CustomNode from "./2CustomNode";
import CustomEdge from "./2CustomEdge";

// Define node and edge types
const nodeTypes = {
	custom: CustomNode,
};

const edgeTypes = {
	custom: CustomEdge,
};

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
				type: "custom",
			};
			nodes.push(node);

			if (recentNodeId && nodeId <= xNodes * yNodes) {
				edges.push({
					id: `${x}-${y}`,
					source: `stress-${recentNodeId.toString()}`,
					target: `stress-${nodeId.toString()}`,
					type: "custom",
				});
			}

			recentNodeId = nodeId;
			nodeId++;
		}
	}

	return { nodes, edges };
}

const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdges(15, 10);

const CollaborativeFlow = ({ roomId = 1 }) => {
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [cursors, setCursors] = useState(new Map());
	const [selectedNodeId, setSelectedNodeId] = useState(null);

	const { ydoc, provider } = useWebSocket();
	const flowRef = useRef(null);
	const currentUser = useRef(getCurrentUser());
	const { getNodes, getEdges } = useReactFlow();

	// Handle node changes (position updates, etc.)
	const handleNodesChange = useCallback(
		(changes) => {
			onNodesChange(changes);

			if (!ydoc) return;

			changes.forEach((change) => {
				if (change.type === "position" && change.position) {
					const node = nodes.find((n) => n.id === change.id);
					if (node) {
						const updatedNode = {
							...node,
							position: change.position,
							positionAbsolute: change.positionAbsolute || change.position,
							// Include any additional node properties that need to be preserved
						};
						ydoc.getMap("nodes").set(change.id, JSON.parse(JSON.stringify(updatedNode)));
					}
				}
			});
		},
		[nodes, onNodesChange, ydoc]
	);

	// Handle edge changes (deletion, etc.)
	const handleEdgesChange = useCallback(
		(changes) => {
			onEdgesChange(changes);

			if (!ydoc) return;

			changes.forEach((change) => {
				if (change.type === "remove") {
					ydoc.getMap("edges").delete(change.id);
				}
			});
		},
		[onEdgesChange, ydoc]
	);

	// Check if a connection is valid
	const isValidConnection = useCallback(
		(connection) => {
			const nodes = getNodes();
			const edges = getEdges();

			// Prevent connecting a node to itself
			if (connection.source === connection.target) return false;

			// Prevent multiple connections between same nodes in the same direction
			const existingEdge = edges.some((edge) => edge.source === connection.source && edge.target === connection.target);

			return !existingEdge;
		},
		[getNodes, getEdges]
	);

	// Handle adding a new node
	const addNewNode = useCallback(() => {
		if (!ydoc) return;

		const id = `node-${Date.now()}`;
		const newNode = {
			id,
			position: {
				x: Math.random() * 400 + 100,
				y: Math.random() * 400 + 100,
			},
			data: {
				label: `Node ${id.slice(-4)}`,
			},
			type: "custom",
		};

		ydoc.getMap("nodes").set(newNode.id, newNode);
	}, [ydoc]);

	// Handle connecting nodes
	const onConnect = useCallback(
		(connection) => {
			if (!connection.source || !connection.target || !ydoc) return;

			const newEdge = {
				id: `e${connection.source}-${connection.target}`,
				type: "custom",
				source: connection.source,
				target: connection.target,
				sourceHandle: connection.sourceHandle || null,
				targetHandle: connection.targetHandle || null,
			};

			ydoc.getMap("edges").set(newEdge.id, newEdge);
		},
		[ydoc]
	);

	// Handle mouse movements for cursor tracking
	const handleMouseMove = useCallback(
		(e) => {
			if (!provider?.awareness || !flowRef.current) return;

			const bounds = flowRef.current.getBoundingClientRect();
			const cursor = {
				x: e.clientX - bounds.left,
				y: e.clientY - bounds.top,
			};

			provider.awareness.setLocalState({
				cursor,
				color: currentUser.current.color,
				name: currentUser.current.name,
				clientId: provider.awareness.clientID,
			});
		},
		[provider]
	);

	// Handle mouse leaving the flow area
	const handleMouseLeave = useCallback(() => {
		if (!provider?.awareness) return;

		provider.awareness.setLocalState({
			cursor: null,
			color: currentUser.current.color,
			name: currentUser.current.name,
			clientId: provider.awareness.clientID,
		});
	}, [provider]);

	// Handle node clicks for selection
	const handleNodeClick = useCallback((event, node) => {
		event.stopPropagation();
		setSelectedNodeId((prevSelectedId) => (prevSelectedId === node.id ? null : node.id));
	}, []);

	// Initialize Yjs document and observe changes
	useEffect(() => {
		if (!ydoc || !provider) return;

		const nodesMap = ydoc.getMap("nodes");
		const edgesMap = ydoc.getMap("edges");

		// Initialize the document with initial data if empty
		if (nodesMap.size === 0 && initialNodes.length > 0) {
			initialNodes.forEach((node) => {
				nodesMap.set(node.id, JSON.parse(JSON.stringify(node)));
			});
		}

		if (edgesMap.size === 0 && initialEdges.length > 0) {
			initialEdges.forEach((edge) => {
				edgesMap.set(edge.id, JSON.parse(JSON.stringify(edge)));
			});
		}

		// Set up awareness for cursors
		provider.awareness.setLocalState({
			cursor: null,
			color: currentUser.current.color,
			name: currentUser.current.name,
			clientId: provider.awareness.clientID,
		});

		// Listen for awareness changes (cursor movements)
		provider.awareness.on("change", () => {
			const states = new Map(provider.awareness.getStates());
			setCursors(states);
		});

		// Observer for node changes
		const nodesObserver = () => {
			const yNodes = Array.from(nodesMap.values());
			setNodes(
				yNodes.map((node) => ({
					...node,
					type: node.type || "custom",
				}))
			);
		};

		// Observer for edge changes
		const edgesObserver = () => {
			const yEdges = Array.from(edgesMap.values());
			setEdges(yEdges);
		};

		// Register observers
		nodesMap.observe(nodesObserver);
		edgesMap.observe(edgesObserver);

		// Initial data loading
		nodesObserver();
		edgesObserver();

		// Cleanup observers
		return () => {
			nodesMap.unobserve(nodesObserver);
			edgesMap.unobserve(edgesObserver);
			provider.awareness.off("change");
		};
	}, [ydoc, provider, initialNodes, initialEdges, setNodes, setEdges]);

	return (
		<div
			style={{ width: "100%", height: "100%", position: "relative" }}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			ref={flowRef}
		>
			<ReactFlow
				nodes={nodes.map((node) => ({
					...node,
					selected: node.id === selectedNodeId,
				}))}
				edges={edges}
				onNodesChange={handleNodesChange}
				onEdgesChange={handleEdgesChange}
				onConnect={onConnect}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				onNodeClick={handleNodeClick}
				fitView
				connectionMode={ConnectionMode.Loose}
				isValidConnection={isValidConnection}
				minZoom={0.2}
				maxZoom={4}
			>
				<Background variant={BackgroundVariant.Dots} gap={12} size={1} />
				<Controls position="top-left" />
				<MiniMap
					nodeStrokeColor={(n) => {
						if (n.selected) return "#ff0072";
						return "#555";
					}}
					nodeColor={(n) => {
						return "#fff";
					}}
				/>
			</ReactFlow>

			{/* Display other users' cursors */}
			{Array.from(cursors.entries()).map(([clientId, state]) => {
				if (!state.cursor || clientId === provider?.awareness?.clientID) {
					return null;
				}
				return <Cursor key={clientId} x={state.cursor.x} y={state.cursor.y} color={state.color} name={state.name} />;
			})}

			<button
				onClick={addNewNode}
				style={{
					position: "absolute",
					bottom: "20px",
					right: "20px",
					zIndex: 10,
					padding: "8px 12px",
					backgroundColor: "#3498db",
					color: "white",
					border: "none",
					borderRadius: "4px",
					cursor: "pointer",
				}}
			>
				Add Node
			</button>
		</div>
	);
};

export default CollaborativeFlow;
