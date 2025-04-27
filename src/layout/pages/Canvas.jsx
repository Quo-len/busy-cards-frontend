import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import ReactFlow, {
	ReactFlowProvider,
	Background,
	useNodesState,
	useEdgesState,
	reconnectEdge,
	addEdge,
	BackgroundVariant,
	ConnectionMode,
	useReactFlow,
	useOnSelectionChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { v4 as uuidv4 } from "uuid";

import Draggable from "react-draggable"; // import the draggable component

import Sidebar from "../../components/components/Sidebar";
import CustomNode from "../../components/components/CustomNode";
import CustomEdge from "../../components/components/CustomEdge";
import Loader from "../../components/components/Loader";
import NotFoundPage from "./../pages/NotFoundPage";
import { useWebSocket, WebSocketProvider } from "../../utils/WebSocketContext";
import { createNodesAndEdges, isNodeDescendant } from "../../utils/utils";
import * as api from "../../api";
import { DnDProvider, useDnD } from "../../utils/DnDContext";

import DropBar from "../../diagram/components/DropBar";

import CanvasControls from "../../diagram/components/CanvasControls";
import CanvasMinimap from "../../diagram/components/CanvasMinimap";

const nodeTypes = {
	custom: CustomNode,
};

const edgeTypes = {
	custom: CustomEdge,
};

const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdges(0, 0);

const Canvas = () => {
	const { mindmapId } = useParams();
	const [isLoading, setIsLoading] = useState(true);
	const [type] = useDnD();

	const [isOpen, setIsOpen] = useState({
		leftBar: true,
		rightBar: true,
		searchBar: true,
		minimap: true,
	});

	const updateIsOpen = (key, value) => {
		setIsOpen((prev) => ({
			...prev,
			[key]: value,
		}));
	};

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

			if (connection.source === connection.target) return false;

			const existingEdge = edges.some(
				(edge) =>
					(edge.source === connection.source && edge.target === connection.target) ||
					(edge.source === connection.target && edge.target === connection.source)
			);

			if (existingEdge) return false;

			if (
				isNodeDescendant(sourceNode, targetNode, nodes, edges) ||
				isNodeDescendant(targetNode, sourceNode, nodes, edges)
			)
				return false;

			return true;
		},
		[getNodes, getEdges]
	);

	const findInvalidTargetNodes = useCallback(
		(sourceId) => {
			if (!sourceId) return [];

			const currentNodes = getNodes();
			const sourceNode = currentNodes.find((node) => node.id === sourceId);

			if (!sourceNode) return [];

			return currentNodes
				.filter((node) => {
					if (node.id === sourceId) return true;

					const testConnection = {
						source: sourceId,
						target: node.id,
					};

					return !isValidConnection(testConnection);
				})
				.map((node) => node.id);
		},
		[getNodes, isValidConnection]
	);

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

	const onConnectEnd = useCallback(() => {
		setConnectionStartNodeId(null);
		setInvalidTargetNodes([]);
	}, []);

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

	const onDragOver = useCallback((event) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	const onDrop = useCallback(
		(event) => {
			event.preventDefault();

			if (!type) {
				return;
			}

			const position = reactFlowInstance.screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});

			const id = uuidv4();
			const newNode = {
				id: id,
				type,
				position,
				data: { label: `${type} node` },
			};

			ydoc.getMap("nodes").set(newNode.id, newNode);
			setNodes((nds) => nds.concat(newNode));
		},
		[ydoc, reactFlowInstance, setNodes, type]
	);

	const onDragStart = (event, nodeType) => {
		setType(nodeType);
		event.dataTransfer.setData("text/plain", nodeType);
		event.dataTransfer.effectAllowed = "move";
	};

	const onAddNodeToCenter = (nodeType) => {
		// Додаємо вузол в центр
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
			dimensions: {
				width: "300",
			},
		};

		reactFlowInstance.addNodes(newNode); // додаємо одразу через reactflow
		ydoc.getMap("nodes").set(newNode.id, newNode);
	};

	const searchNodes = (searchText, nodes) => {
		if (!searchText || searchText.trim() === "") {
			return []; // Return empty array if search text is empty
		}

		const normalizedSearchText = searchText.toLowerCase().trim();
		const containsSearchText = (obj) => {
			// Base case: if value is string, check if it contains search text
			if (typeof obj === "string") {
				return obj.toLowerCase().includes(normalizedSearchText);
			}

			// Base case: if value is number, convert to string and check
			if (typeof obj === "number") {
				return obj.toString().includes(normalizedSearchText);
			}

			// Skip if null or undefined
			if (obj === null || obj === undefined) {
				return false;
			}

			// For arrays, check if any element contains search text
			if (Array.isArray(obj)) {
				return obj.some((item) => containsSearchText(item));
			}

			// For objects, check all property values
			if (typeof obj === "object") {
				return Object.values(obj).some((value) => containsSearchText(value));
			}

			return false;
		};

		// Find all nodes that match the search text in any field
		return nodes.filter((node) => {
			// Check entire node object for search text
			return containsSearchText(node);
		});
	};

	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);

	const handleSearch = (event) => {
		if (searchQuery === "") return;

		const matchingNodes = searchNodes(searchQuery, nodes);
		setSearchResults(matchingNodes);

		// Highlight matching nodes (same as before)
		if (searchQuery.trim() !== "") {
			const matchingNodeIds = new Set(matchingNodes.map((node) => node.id));

			if (matchingNodeIds.length > 0) setCurrentSearchIndex(-1);

			setNodes((prevNodes) =>
				prevNodes.map((node) => ({
					...node,
					style: {
						...node.style,
						...(matchingNodeIds.has(node.id)
							? {
									boxShadow: "0 0 10px #ff9900",
									border: "2px solid #ff9900",
							  }
							: {}),
					},
				}))
			);
		} else {
			// Reset highlighting
			setNodes((prevNodes) =>
				prevNodes.map((node) => ({
					...node,
					style: {
						...node.style,
						boxShadow: undefined,
						border: undefined,
					},
				}))
			);
		}
		navigateSearchResults(0);
	};

	const clearSearch = useCallback(() => {
		setSearchQuery("");
		setSearchResults([]);
		setCurrentSearchIndex(0);

		// Reset all node styles
		setNodes((prevNodes) =>
			prevNodes.map((node) => ({
				...node,
				style: {
					...node.style,
					boxShadow: undefined,
					border: undefined,
				},
			}))
		);
	}, [setNodes]);

	const navigateSearchResults = useCallback(
		(direction) => {
			if (searchResults.length === 0) return;

			let newIndex;
			if (direction > 0) {
				newIndex = currentSearchIndex >= searchResults.length - 1 ? 0 : currentSearchIndex + 1;
			} else if (direction < 0) {
				newIndex = currentSearchIndex <= 0 ? searchResults.length - 1 : currentSearchIndex - 1;
			} else {
				newIndex = 0;
			}

			setCurrentSearchIndex(newIndex);

			const targetNode = searchResults[newIndex];
			if (targetNode) {
				reactFlowInstance.setCenter(
					targetNode.position.x + (targetNode.width || 0) / 2,
					targetNode.position.y + (targetNode.height || 0) / 2,
					{ zoom: 1.5, duration: 800 }
				);

				setNodes((prevNodes) =>
					prevNodes.map((node) => ({
						...node,
						style: {
							...node.style,
							...(node.id === targetNode.id
								? {
										boxShadow: "0 0 15px #ff5500",
										border: "3px solid #ff5500",
										zIndex: 1000,
								  }
								: searchResults.some((r) => r.id === node.id)
								? {
										boxShadow: "0 0 10px #ff9900",
										border: "2px solid #ff9900",
								  }
								: {}),
						},
					}))
				);
			}
		},
		[searchResults, currentSearchIndex, reactFlowInstance, setNodes]
	);

	if (isLoading) {
		return <Loader message="Завантаження інтелект-карти, будь ласка, зачекайте." flexLayout="false" />;
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
			<button
				style={{ position: "absolute", right: 10, top: 70, zIndex: 4 }}
				onClick={() => {
					console.log("Testing Y.js connection");
					if (ydoc) {
						// Print current state
						console.log("Current nodes in Y.doc:", Array.from(ydoc.getMap("nodes").entries()));
						console.log("Current edges in Y.doc:", Array.from(ydoc.getMap("edges").entries()));

						if (provider) {
							console.log("WebSocket connected:", provider.wsconnected);

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
			<button style={{ position: "absolute", right: 10, top: 110, zIndex: 4 }}>Re-sync</button>
			<ReactFlow
				translateExtent={[
					[-2000, -2000],
					[2000, 2000],
				]}
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
				onDrop={onDrop}
				onDragStart={onDragStart}
				onDragOver={onDragOver}
				proOptions={{ hideAttribution: true }}
				onlyRenderVisibleElements={true}
			>
				<Background id="1" gap={10} color="#ccc" variant={BackgroundVariant.Dots} />
				<CanvasControls isOpen={isOpen} onUpdate={updateIsOpen} />
				{isOpen.minimap && (
					<CanvasMinimap connectionStartNodeId={connectionStartNodeId} invalidTargetNodes={invalidTargetNodes} />
				)}
				{isOpen.leftBar && (
					<div style={{ position: "absolute", left: 20, top: 150, zIndex: 10 }}>
						<DropBar onAddNode={onAddNodeToCenter} />
					</div>
				)}
				{isOpen.rightBar && <Sidebar />}
				{isOpen.searchBar && (
					<div>
						<input
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Пошук по вузлах..."
							style={{ position: "absolute", right: 10, top: 270, zIndex: 4 }}
						></input>
						<button onClick={handleSearch} style={{ position: "absolute", right: 10, top: 140, zIndex: 4 }}>
							Знайти
						</button>
						<button
							onClick={() => {
								navigateSearchResults(-1);
							}}
							style={{ position: "absolute", right: 10, top: 170, zIndex: 4 }}
						>
							Минулий
						</button>
						<button
							onClick={() => {
								navigateSearchResults(+1);
							}}
							style={{ position: "absolute", right: 10, top: 200, zIndex: 4 }}
						>
							Наступний
						</button>
						<button onClick={clearSearch} style={{ position: "absolute", right: 10, top: 230, zIndex: 4 }}>
							Очистити
						</button>
						<div style={{ position: "absolute", right: 10, top: 300, zIndex: 4 }}>
							{currentSearchIndex + 1} із {searchResults.length}
						</div>
					</div>
				)}
			</ReactFlow>
		</div>
	);
};

const CanvasPage = () => {
	const { mindmapId } = useParams();

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "92.3vh",
				width: "100vw",
			}}
		>
			<WebSocketProvider mindmapId={mindmapId}>
				<ReactFlowProvider>
					<DnDProvider>
						<Canvas />
					</DnDProvider>
				</ReactFlowProvider>
			</WebSocketProvider>
		</div>
	);
};

export default CanvasPage;
