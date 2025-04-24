import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import ReactFlow, {
	Background,
	Controls,
	useNodesState,
	useEdgesState,
	reconnectEdge,
	addEdge,
	getOutgoers,
	getIncomers,
	MiniMap,
	BackgroundVariant,
	ConnectionMode,
	useReactFlow,
	useOnSelectionChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { v4 as uuidv4 } from "uuid";

import Sidebar from "../../components/components/Sidebar";
import CustomNode from "../../components/components/CustomNode";
import CustomEdge from "../../components/components/CustomEdge";
import Loader from "../../components/components/Loader";
import NotFoundPage from "./../pages/NotFoundPage";
import { useWebSocket } from "../../utils/WebSocketContext";
import { createNodesAndEdges, isNodeDescendant } from "../../utils/utils";
import * as api from "../../api";

const nodeTypes = {
	custom: CustomNode,
};

const edgeTypes = {
	custom: CustomEdge,
};

const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdges(0, 0);

export default function Canvas() {
	const { mindmapId } = useParams();
	const [isLoading, setIsLoading] = useState(true);

	const [mindmap, setMindmap] = useState(null);
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [selectedNodeId, setSelectedNodeId] = useState(null);

	// Track which nodes cannot be connected to when dragging a connection
	const [invalidTargetNodes, setInvalidTargetNodes] = useState([]);
	const [connectionStartNodeId, setConnectionStartNodeId] = useState(null);

	const reactFlowInstance = useReactFlow();

	useEffect(() => {
		const fetchMindmap = async () => {
			try {
				const response = await api.getMindmap(mindmapId);
				setMindmap(response);
				console.log(response);
			} catch (error) {
				console.log("Failed to get mindmap");
			}
			setIsLoading(false);
		};

		if (mindmapId) {
			fetchMindmap();
		}
	}, []);

	useEffect(() => {
		if (mindmap && mindmap.title) {
			document.title = `${mindmap.title} - Busy-cards`;
		}
	}, [mindmap]);

	const [selectedNodes, setSelectedNodes] = useState([]);
	const [selectedEdges, setSelectedEdges] = useState([]);

	const onChange = useCallback(({ nodes, edges }) => {
		setSelectedNodes(nodes.map((node) => node.id));
		setSelectedEdges(edges.map((edge) => edge.id));
	}, []);

	useOnSelectionChange({
		onChange,
	});

	// Use the WebSocket context
	const { ydoc, provider } = useWebSocket();

	const flowRef = useRef(null);
	const { getNodes, getEdges } = useReactFlow();

	const handleNodesChange = useCallback(
		(changes) => {
			onNodesChange(changes);

			if (!ydoc) return;

			changes.forEach((change) => {
				console.log(change);
				if (change.resizing) {
					console.log("ahhh");
					const node = nodes.find((n) => n.id === change.id);
					if (node) {
						const updatedNode = {
							...node,
							position: change.position || node.position,
							width: change.width,
							height: change.height,
							dimensions: {
								height: change.dimensions?.height,
								width: change.dimensions?.width,
							},
						};
						ydoc.getMap("nodes").set(change.id, JSON.parse(JSON.stringify(updatedNode)));
					}
				}
				if (change.type === "position") {
					const node = nodes.find((n) => n.id === change.id);
					if (node) {
						const updatedNode = {
							...node,
							position: change.position || node.position,
							width: change.width,
							height: change.height,
							dimensions: {
								height: change.dimensions?.height,
								width: change.dimensions?.width,
							},
						};
						ydoc.getMap("nodes").set(change.id, JSON.parse(JSON.stringify(updatedNode)));
					}
				}
				if (change.type === "remove") {
					if (change.type === "remove") {
						ydoc.getMap("nodes").delete(change.id);
					}
				}
			});
		},
		[nodes, onNodesChange, ydoc]
	);

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

	const isValidConnection = useCallback(
		(connection) => {
			const nodes = getNodes();
			const edges = getEdges();

			const sourceNode = nodes.find((node) => node.id === connection.source);
			const targetNode = nodes.find((node) => node.id === connection.target);

			// Prevent connecting a node to itself
			if (connection.source === connection.target) return false;

			// Prevent multiple connections between same nodes
			const existingEdge = edges.some(
				(edge) =>
					(edge.source === connection.source && edge.target === connection.target) ||
					(edge.source === connection.target && edge.target === connection.source)
			);

			if (existingEdge) return false;

			// Prevent cycles
			if (
				isNodeDescendant(sourceNode, targetNode, nodes, edges) ||
				isNodeDescendant(targetNode, sourceNode, nodes, edges)
			)
				return false;

			return true;
		},
		[getNodes, getEdges]
	);

	// Function to find all invalid target nodes for a given source node
	const findInvalidTargetNodes = useCallback(
		(sourceId) => {
			if (!sourceId) return [];

			const currentNodes = getNodes();
			const currentEdges = getEdges();
			const sourceNode = currentNodes.find((node) => node.id === sourceId);

			if (!sourceNode) return [];

			return currentNodes
				.filter((node) => {
					// Skip check for the source node itself
					if (node.id === sourceId) return true;

					// Create a test connection
					const testConnection = {
						source: sourceId,
						target: node.id,
					};

					// Check if this would be an invalid connection
					return !isValidConnection(testConnection);
				})
				.map((node) => node.id);
		},
		[getNodes, getEdges, isValidConnection]
	);

	// Handle connection start
	const onConnectStart = useCallback(
		(_, { nodeId }) => {
			setConnectionStartNodeId(nodeId);
			if (nodeId) {
				const invalidNodes = findInvalidTargetNodes(nodeId);
				setInvalidTargetNodes(invalidNodes);
			}
		},
		[findInvalidTargetNodes]
	);

	// Handle connection end
	const onConnectEnd = useCallback(() => {
		setConnectionStartNodeId(null);
		setInvalidTargetNodes([]);
	}, []);

	const addNewNode = useCallback(() => {
		if (!ydoc) return;

		const { x, y, zoom } = reactFlowInstance.getViewport();

		// Calculate center position in the flow coordinates
		const width = flowRef.current ? flowRef.current.offsetWidth : window.innerWidth;
		const height = flowRef.current ? flowRef.current.offsetHeight : window.innerHeight;

		const centerX = (width / 2 - x) / zoom - 50;
		const centerY = (height / 2 - y) / zoom - 30;

		const id = uuidv4();
		const newNode = {
			id,
			position: {
				x: centerX,
				y: centerY,
			},
			data: {
				label: `Node ${id.slice(-4)}`,
			},
			type: "custom",
		};

		ydoc.getMap("nodes").set(newNode.id, newNode);
		setNodes((nds) => nds.concat(newNode));
	}, [ydoc, setNodes, reactFlowInstance]);

	const onReconnect = useCallback(
		(oldEdge, newConnection) => setEdges((els) => reconnectEdge(oldEdge, newConnection, els)),
		[]
	);

	const onConnect = useCallback(
		(connection) => {
			if (!connection.source || !connection.target || !ydoc) return;
			const id = uuidv4();
			const newEdge = {
				id,
				type: "custom",
				source: connection.source,
				target: connection.target,
				sourceHandle: connection.sourceHandle || undefined,
				targetHandle: connection.targetHandle || undefined,
			};

			ydoc.getMap("edges").set(newEdge.id, newEdge);
			setEdges((eds) => addEdge(connection, eds));
		},
		[ydoc, setEdges]
	);

	useEffect(() => {
		if (!ydoc || !provider) return;

		const nodesMap = ydoc.getMap("nodes");
		const edgesMap = ydoc.getMap("edges");

		if (nodesMap.size === 0) {
			initialNodes.forEach((node) => nodesMap.set(node.id, JSON.parse(JSON.stringify(node))));
		}

		if (edgesMap.size === 0) {
			initialEdges.forEach((edge) => edgesMap.set(edge.id, JSON.parse(JSON.stringify(edge))));
		}

		if (nodesMap.size === 0) {
			initialNodes.forEach((node) => {
				nodesMap.set(node.id, JSON.parse(JSON.stringify(node)));
			});
		}

		const nodesObserver = () => {
			const yNodes = Array.from(nodesMap.values());
			const validNodes = yNodes.map((node) => ({
				id: node.id,
				type: node.type || "default",
				data: node.data,
				position: {
					x: node.position.x,
					y: node.position.y,
				},
			}));
			setNodes(validNodes);
		};

		const edgesObserver = () => {
			const yEdges = Array.from(edgesMap.values());
			setEdges(yEdges);
		};

		nodesMap.observe(nodesObserver);
		edgesMap.observe(edgesObserver);

		const initialYNodes = Array.from(nodesMap.values());
		const validNodes = initialYNodes.map((node) => ({
			id: node.id,
			type: node.type || "default",
			data: node.data,
			position: {
				x: node.position.x,
				y: node.position.y,
			},
		}));
		setNodes(validNodes);
		setEdges(Array.from(edgesMap.values()));

		// Cleanup observers
		return () => {
			nodesMap.unobserve(nodesObserver);
			edgesMap.unobserve(edgesObserver);
		};
	}, [ydoc, provider, setNodes, setEdges]);

	const handleNodeClick = useCallback((event, node) => {
		// Prevent default selection behavior
		event.stopPropagation();

		// Toggle node selection
		setSelectedNodeId((prevSelectedId) => (prevSelectedId === node.id ? null : node.id));
	}, []);

	const updatePos = useCallback(() => {
		if (!ydoc) return;

		const nodesMap = ydoc.getMap("nodes");

		setNodes((nds) => {
			return nds.map((node) => {
				const newPosition = {
					x: Math.random() * 1500,
					y: Math.random() * 1500,
				};

				// Update the node in the Yjs shared document
				const updatedNode = {
					...node,
					position: newPosition,
				};

				nodesMap.set(node.id, updatedNode);

				return {
					...node,
					position: newPosition,
				};
			});
		});
	}, [ydoc]);

	// Apply visual styles to nodes based on connection state
	const styledNodes = React.useMemo(() => {
		return nodes.map((node) => ({
			...node,
			selected: node.id === selectedNodeId,
			// Add styles for invalid nodes during connection
			style: {
				...node.style,
				// Highlight invalid target nodes in red when connecting
				...(connectionStartNodeId &&
					!invalidTargetNodes.includes(node.id) && {
						border: "2px solid red",
						boxShadow: "0 0 10px rgba(255, 0, 0, 0.5)",
					}),
				// Make source node slightly highlighted when connecting
				...(connectionStartNodeId === node.id && {
					border: "2px solid #0041d0",
					boxShadow: "0 0 10px rgba(0, 65, 208, 0.5)",
				}),
			},
		}));
	}, [nodes, selectedNodeId, connectionStartNodeId, invalidTargetNodes]);

	if (isLoading) {
		return <Loader message="Завантаження інтелект-карти, зачекайте" />;
	}

	if (!mindmap) {
		return (
			<NotFoundPage title="Інтелект-карта не знайдена" message="Інтелект-карту не знайдено, перевірте посилання." />
		);
	}

	return (
		<div style={{ flex: 1, position: "relative", overflow: "hidden" }} ref={flowRef}>
			<button onClick={updatePos} style={{ position: "absolute", right: 10, top: 30, zIndex: 4 }}>
				change pos
			</button>
			<button onClick={addNewNode}>Add Node</button>
			<button
				onClick={() => {
					console.log("Testing Y.js connection");
					if (ydoc) {
						// Print current state
						console.log("Current nodes in Y.doc:", Array.from(ydoc.getMap("nodes").entries()));
						console.log("Current edges in Y.doc:", Array.from(ydoc.getMap("edges").entries()));

						// Check if provider is connected
						if (provider) {
							console.log("WebSocket connected:", provider.wsconnected);

							// Send test message to server
							if (provider.wsconnected) {
								provider.ws.send(JSON.stringify({ type: "print_state" }));
							}
						}
					} else {
						console.log("Y.doc not initialized");
					}
				}}
			>
				Debug Connection
			</button>
			<button>Delete Node</button>
			<button>Re-sync</button>
			<ReactFlow
				nodes={styledNodes}
				edges={edges}
				onNodesChange={handleNodesChange}
				onEdgesChange={handleEdgesChange}
				onConnect={onConnect}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				onNodeClick={handleNodeClick}
				onConnectStart={onConnectStart}
				onConnectEnd={onConnectEnd}
				fitView
				snapToGrid={true}
				onReconnect={onReconnect}
				isValidConnection={isValidConnection}
				connectionMode={ConnectionMode.Loose}
				minZoom={0.2}
				maxZoom={4}
			>
				<Background id="1" gap={10} color="#ccc" variant={BackgroundVariant.Dots} />
				<Controls
					position="top-left"
					style={{
						left: "10px",
						top: "50%",
						transform: "translateY(-50%)",
					}}
				/>
				<MiniMap
					position="bottom-left"
					zoomStep={1}
					pannable
					zoomable
					nodeStrokeColor={(n) => {
						// Change node outline color in minimap when it's an invalid target
						if (connectionStartNodeId && invalidTargetNodes.includes(n.id)) return "red";
						if (n.style?.background) return `${n.style.background}`;
						if (n.type === "custom") return "#0041d0";
						return "#eee";
					}}
					nodeColor={(n) => {
						if (n.style?.background) return `${n.style.background}`;
						return "#fff";
					}}
					nodeBorderRadius={2}
					style={{
						width: 300,
						height: 200,
						border: "1px solid black",
					}}
					maskColor="rgb(0,0,0, 0.1)"
				/>
			</ReactFlow>
			<Sidebar />
		</div>
	);
}
