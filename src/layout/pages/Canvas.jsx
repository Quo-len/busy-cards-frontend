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

import Loader from "../../components/components/Loader";
import NotFoundPage from "./../pages/NotFoundPage";

import { createNodesAndEdges, isNodeDescendant } from "../../diagram/utils/utils";
import { useWebSocket, WebSocketProvider } from "../../utils/WebSocketContext";
import { DnDProvider, useDnD } from "../../diagram/utils/DnDContext";
import * as api from "../../api";

import Sidebar from "../../components/components/Sidebar";
import SearchBar from "../../diagram/components/SearchBar";
import DropBar from "../../diagram/components/DropBar";
import CanvasControls from "../../diagram/components/CanvasControls";
import CanvasMinimap from "../../diagram/components/CanvasMinimap";

import { useNodeSearch } from "../../diagram/hooks/useNodeSearch";
import { nodeTypes, edgeTypes } from "../../diagram/components";

const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdges(0, 0);

const Canvas = () => {
	const { mindmapId } = useParams();
	const [mindmap, setMindmap] = useState(null);
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [selectedNodeId, setSelectedNodeId] = useState(null);

	// Track which nodes cannot be connected to when dragging a connection
	const [invalidTargetNodes, setInvalidTargetNodes] = useState([]);
	const [connectionStartNodeId, setConnectionStartNodeId] = useState(null);

	const [isLoading, setIsLoading] = useState(true);
	const [type] = useDnD();

	const { ydoc, provider } = useWebSocket();
	const flowRef = useRef(null);
	const { getNodes, getEdges, setViewport } = useReactFlow();

	const reactFlowInstance = useReactFlow();

	const [isOpen, setIsOpen] = useState({
		leftBar: true,
		rightBar: true,
		searchBar: true,
		minimap: true,
	});

	const {
		searchQuery,
		setSearchQuery,
		searchResults,
		currentSearchIndex,
		handleSearch,
		clearSearch,
		navigateSearchResults,
	} = useNodeSearch(nodes, setNodes, reactFlowInstance);

	const updateIsOpen = (key, value) => {
		setIsOpen((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	useEffect(() => {
		const fetchMindmap = async () => {
			try {
				const response = await api.getMindmap(mindmapId);
				setMindmap(response);
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

	const handleToCenter = useCallback(() => {
		const flowWidth = flowRef.current?.clientWidth || window.innerWidth;
		const flowHeight = flowRef.current?.clientHeight || window.innerHeight;

		const x = flowWidth / 2;
		const y = flowHeight / 2;

		setViewport({ x, y, zoom: 1 }, { duration: 800 });
	}, [setViewport, flowRef]);

	const handleNodesChange = useCallback(
		(changes) => {
			onNodesChange(changes);

			if (!ydoc) return;

			changes.forEach((change) => {
				if (change.type === "position") {
					const node = nodes.find((n) => n.id === change.id);
					if (node) {
						const updatedNode = {
							...node,
							position: change.position || node.position,
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
		[edges, onEdgesChange, ydoc]
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
				//	onlyRenderVisibleElements={true}
			>
				<Background gap={10} color="#ccc" variant={BackgroundVariant.Dots} />
				<CanvasControls isOpen={isOpen} onUpdate={updateIsOpen} onCenter={handleToCenter} />
				{isOpen.minimap && (
					<CanvasMinimap connectionStartNodeId={connectionStartNodeId} invalidTargetNodes={invalidTargetNodes} />
				)}

				{isOpen.rightBar && <Sidebar />}
				{isOpen.searchBar && (
					<SearchBar
						onSearch={handleSearch}
						onClear={clearSearch}
						onNavigatePrev={() => navigateSearchResults(-1)}
						onNavigateNext={() => navigateSearchResults(+1)}
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						currentIndex={currentSearchIndex}
						totalResults={searchResults.length}
					/>
				)}
			</ReactFlow>
			{isOpen.leftBar && (
				<div style={{ position: "absolute", left: 20, top: 150, zIndex: 10 }}>
					<DropBar />
				</div>
			)}
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
