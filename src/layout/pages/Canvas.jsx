import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import ReactFlow, {
	ReactFlowProvider,
	Background,
	BackgroundVariant,
	ConnectionMode,
	useReactFlow,
	SelectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import { v4 as uuidv4 } from "uuid";

import CanvasControls from "../../diagram/components/CanvasControls";
import MindmapSerializer from "../../diagram/components/MindmapSerializer";
import BoundingLines from "../../diagram/components/BoundingLines";
import CanvasMinimap from "../../diagram/components/CanvasMinimap";
import SearchBar from "../../diagram/components/SearchBar";
import Loader from "../../components/components/Loader";
import Sidebar from "../../diagram/components/Sidebar";
import DropBar from "../../diagram/components/DropBar";
import NotFoundPage from "./../pages/NotFoundPage";
import "../styles/Canvas.css";

import { findInvalidTargetNodes, isValidConnection } from "../../diagram/utils/utils";
import { DnDProvider, useDnD } from "../../diagram/utils/DnDContext";
import { useNodeSearch } from "../../diagram/hooks/useNodeSearch";
import { nodeTypes, edgeTypes } from "../../diagram/components";
import useCanvasStore from "../../store/useCanvasStore";
import * as api from "../../api";

const translateExtent = [
	[-4300, -2000],
	[4300, 2000],
];

const nodeExtent = [
	[-4000, -1700],
	[4000, 1700],
];

const userPermissioons = {
	viewer: {
		canEdit: false,
		canComment: false,
		canManageParticipants: false,
	},
	commenter: {
		canEdit: false,
		canComment: true,
		canManageParticipants: false,
	},
	editor: {
		canEdit: true,
		canComment: true,
		canManageParticipants: false,
	},
	owner: {
		canEdit: true,
		canComment: true,
		canManageParticipants: true,
	},
};

const Canvas = () => {
	const [role] = useState("owner");
	const { mindmapId } = useParams();
	const [mindmap, setMindmap] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [type, setType] = useDnD();
	const flowRef = useRef(null);
	const { setViewport } = useReactFlow();
	const reactFlowInstance = useReactFlow();

	const {
		initializeYjs,
		cleanupYjs,
		addNode,
		updateNode,
		removeNode,
		addEdge,
		removeEdge,
		getNodesArray,
		getEdgesArray,
	} = useCanvasStore();

	const nodes = getNodesArray();
	const edges = getEdgesArray();

	const [invalidTargetNodes, setInvalidTargetNodes] = useState([]);
	const [connectionStartNodeId, setConnectionStartNodeId] = useState(null);

	const [isOpen, setIsOpen] = useState({
		leftBar: true,
		rightBar: true,
		searchBar: true,
		minimap: true,
		serializer: false,
	});

	const {
		searchQuery,
		setSearchQuery,
		searchResults,
		currentSearchIndex,
		handleSearch,
		clearSearch,
		navigateSearchResults,
		navigateToNode,
		getLocalNodeStyle,
	} = useNodeSearch(nodes, reactFlowInstance);

	const updateIsOpen = (key, value) => {
		setIsOpen((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	useEffect(() => {
		let timeoutId;

		const fetchMindmap = async () => {
			try {
				const response = await api.getMindmap(mindmapId);
				setMindmap(response);
			} catch {
				console.log("Failed to get mindmap");
			}
		};

		const run = async () => {
			if (!mindmapId) return;

			await Promise.all([
				(async () => {
					initializeYjs(mindmapId);
				})(),
				new Promise((resolve) => {
					timeoutId = setTimeout(() => {
						initializeYjs(mindmapId);
						resolve();
					}, 1000);
				}),
			]);

			setIsLoading(false);
		};

		fetchMindmap();
		run();

		return () => {
			clearTimeout(timeoutId);
			cleanupYjs();
		};
	}, [mindmapId, initializeYjs, cleanupYjs]);

	useEffect(() => {
		if (mindmap && mindmap.title) {
			document.title = `${mindmap.title} - Busy-cards`;
		} else if (mindmap) {
			// Fixed: Ensure title is updated even if mindmap exists but title is empty
			document.title = "Untitled - Busy-cards";
		}
	}, [mindmap]);

	const handleToCenter = useCallback(() => {
		const flowWidth = flowRef.current?.clientWidth || window.innerWidth;
		const flowHeight = flowRef.current?.clientHeight || window.innerHeight;

		const x = flowWidth / 2;
		const y = flowHeight / 2;

		setViewport({ x, y, zoom: 1 }, { duration: 800 });
	}, [setViewport, flowRef]);

	const onConnectStart = useCallback(
		(_, { nodeId }) => {
			setConnectionStartNodeId(nodeId);

			if (nodeId) {
				const currentNodes = getNodesArray();
				const currentEdges = getEdgesArray();

				const invalidNodes = findInvalidTargetNodes(nodeId, currentNodes, currentEdges);
				setInvalidTargetNodes(invalidNodes);
			}
		},
		[getNodesArray, isValidConnection]
	);

	const onConnectEnd = useCallback(() => {
		setConnectionStartNodeId(null);
		setInvalidTargetNodes([]);
	}, []);

	const onConnect = useCallback(
		(connection) => {
			if (!connection.source || !connection.target) return;
			const id = uuidv4();
			const newEdge = {
				id,
				type: "custom",
				source: connection.source,
				target: connection.target,
				sourceHandle: connection.sourceHandle || undefined,
				targetHandle: connection.targetHandle || undefined,
			};

			addEdge(newEdge);
		},
		[addEdge]
	);

	const [selectedNodeId, setSelectedNodeId] = useState(null);

	const handleNodeClick = useCallback((event, node) => {
		event.stopPropagation();
		setSelectedNodeId((prevSelectedId) => (prevSelectedId === node.id ? null : node.id));
	}, []);

	const onPaneClick = useCallback(() => {
		setSelectedNodeId(null);
	}, []);

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
				...(type === "mygroup" ? { zIndex: -999 } : {}),
			};
			addNode(newNode);
		},
		[reactFlowInstance, type, addNode]
	);

	const onDragStart = (event, nodeType) => {
		setType(nodeType);
		event.dataTransfer.setData("text/plain", nodeType);
		event.dataTransfer.effectAllowed = "move";
	};

	const styledNodes = React.useMemo(() => {
		return nodes.map((node) => {
			// Get local highlight style if it exists
			const localHighlight = getLocalNodeStyle(node.id);

			return {
				...node,
				selected: node.id === selectedNodeId,
				style: {
					...node.style,
					// Connection highlighting (existing logic)
					...(connectionStartNodeId &&
						connectionStartNodeId !== node.id &&
						!invalidTargetNodes.includes(node.id) && {
							border: "2px solid #4CAF50", // Green for valid targets
							boxShadow: "0 0 10px rgba(76, 175, 80, 0.5)",
						}),
					...(connectionStartNodeId &&
						invalidTargetNodes.includes(node.id) && {
							border: "2px solid #FF5252", // Red for invalid targets
							boxShadow: "0 0 10px rgba(255, 82, 82, 0.5)",
						}),
					...(connectionStartNodeId === node.id && {
						border: "2px solid #0041d0", // Blue for source node
						boxShadow: "0 0 10px rgba(0, 65, 208, 0.5)",
					}),
					// Apply local highlight style if it exists (takes precedence)
					...(localHighlight && {
						border: localHighlight.border,
						boxShadow: localHighlight.boxShadow,
						...(localHighlight.zIndex && { zIndex: localHighlight.zIndex }),
					}),
				},
			};
		});
	}, [nodes, selectedNodeId, connectionStartNodeId, invalidTargetNodes, getLocalNodeStyle]);

	const [buffer, setBuffer] = useState(null);

	const copyToBuffer = (selectedNodeId) => {
		const node = nodes.find((node) => node.id === selectedNodeId);

		if (node) {
			console.log("Copied node:", node);
			setBuffer(node);
		}
	};

	const pasteFromBuffer = () => {
		if (buffer) {
			const id = uuidv4();
			const newNode = {
				...buffer,
				id: id,
				position: {
					x: buffer.position.x + 15,
					y: buffer.position.y + 15,
				},
				data: {
					...buffer.data,
					label: buffer.data.label + "(копія)",
				},
			};

			console.log("Pasted new node:", newNode);

			setSelectedNodeId(id);
			addNode(newNode);
			navigateToNode(newNode);
		}
	};

	useEffect(() => {
		const handleKeyDown = (event) => {
			if (
				(event.ctrlKey && event.key.toLowerCase() === "c") ||
				event.key.toLowerCase() === "с" ||
				event.key.toLowerCase() === "с"
			) {
				copyToBuffer(selectedNodeId);
			}

			if (
				(event.ctrlKey && event.key.toLowerCase() === "v") ||
				event.key.toLowerCase() === "м" ||
				event.key.toLowerCase() === "м"
			) {
				pasteFromBuffer();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [reactFlowInstance, selectedNodeId, nodes, buffer]);

	const { getIntersectingNodes } = useReactFlow();

	// make button to mount to group node if theres interesction with node and type is group

	const handleAttachment = () => {
		const node = nodes.find((n) => n.id === selectedNodeId);

		if (node.parentId) {
			// Detaching from parent
			// When detaching, we need to convert relative position to absolute position
			const parentNode = nodes.find((n) => n.id === node.parentId);

			// Calculate absolute position based on parent's position and node's relative position
			const absolutePosition = {
				x: parentNode.position.x + node.position.x,
				y: parentNode.position.y + node.position.y,
			};

			// Update node with no parent and absolute position
			updateNode(node.id, {
				parentId: "",
				extent: "",
				position: absolutePosition,
			});
		} else {
			// Attaching to parent
			const intersections = getIntersectingNodes(node).map((n) => n.id);

			if (intersections.length > 0) {
				// Get the first intersecting node as the parent
				const parentId = intersections[0];
				const parentNode = nodes.find((n) => n.id === parentId);

				// Calculate relative position based on parent's position
				const relativePosition = {
					x: node.position.x - parentNode.position.x,
					y: node.position.y - parentNode.position.y,
				};

				// Update node with parent info and relative position
				updateNode(node.id, {
					parentId: parentId,
					extent: "parent",
					position: relativePosition,
				});
			}
		}
	};

	const printYDocState = useCanvasStore((state) => state.printYDocState);

	if (isLoading) {
		return <Loader message="Завантаження інтелект-карти, будь ласка, зачекайте." flexLayout="false" />;
	}

	// if (role || mindmap.isPublic) {
	// 	<NotFoundPage title="Доступ забронено" message="У вас недостатньо прав для перегляду інтелект-карти." code="403" />;
	// }

	if (!mindmap) {
		return (
			<NotFoundPage title="Інтелект-карта не знайдена" message="Інтелект-карту не знайдено, перевірте посилання." />
		);
	}

	return (
		<div style={{ flex: 1, position: "relative", overflow: "hidden" }} ref={flowRef}>
			<button style={{ position: "absolute", right: 10, top: 740, zIndex: 4 }} onClick={printYDocState}>
				Print Y.Doc State (Server)
			</button>
			<button
				style={{ position: "absolute", right: 10, top: 760, zIndex: 4 }}
				onClick={() => {
					initializeYjs(mindmapId);
				}}
			>
				INIT Y.Doc State (Server)
			</button>
			<button style={{ position: "absolute", right: 10, top: 780, zIndex: 4 }} onClick={handleAttachment}>
				Parent set {selectedNodeId}
			</button>

			<ReactFlow
				translateExtent={translateExtent}
				nodeExtent={nodeExtent}
				nodes={styledNodes}
				edges={edges}
				onNodesChange={(changes) => {
					changes.forEach((change) => {
						if (change.type === "position") {
							updateNode(change.id, { position: change.position, dragging: change.dragging });
						} else if (change.type === "remove") {
							removeNode(change.id);
						}
					});
				}}
				onEdgesChange={(changes) => {
					changes.forEach((change) => {
						if (change.type === "remove") {
							removeEdge(change.id);
						}
					});
				}}
				onConnect={onConnect}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				onNodeClick={handleNodeClick}
				onPaneClick={onPaneClick}
				onConnectStart={onConnectStart}
				onConnectEnd={onConnectEnd}
				fitView
				snapToGrid={true}
				snapGrid={[10, 10]}
				isValidConnection={isValidConnection}
				connectionMode={ConnectionMode.Loose}
				minZoom={0.2}
				maxZoom={1.7}
				onDrop={onDrop}
				onDragStart={onDragStart}
				onDragOver={onDragOver}
				proOptions={{ hideAttribution: true }}
				nodesDraggable={userPermissioons[role].canEdit}
				nodesConnectable={userPermissioons[role].canEdit}
				elementsSelectable={userPermissioons[role].canEdit}
				selectionOnDrag
				connectOnClick={true}
				selectionMode={SelectionMode.Full}
				className="touchdevice-flow"
			>
				<Background id="1" gap={10} color="#f1f1f1" variant={BackgroundVariant.Lines} />
				<Background id="2" gap={100} color="#ccc" variant={BackgroundVariant.Lines} />
				<BoundingLines translateExtent={nodeExtent} />
				<CanvasControls isOpen={isOpen} onUpdate={updateIsOpen} onCenter={handleToCenter} />
				<CanvasMinimap
					connectionStartNodeId={connectionStartNodeId}
					invalidTargetNodes={invalidTargetNodes}
					isVisible={isOpen.minimap}
				/>
				<Sidebar isVisible={isOpen.rightBar} selectedNodeId={selectedNodeId} />
				<SearchBar
					onSearch={handleSearch}
					onClear={clearSearch}
					onNavigatePrev={() => navigateSearchResults(-1)}
					onNavigateNext={() => navigateSearchResults(+1)}
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					currentIndex={currentSearchIndex + 1}
					totalResults={searchResults.length}
					isVisible={isOpen.searchBar}
				/>
				<MindmapSerializer mindmap={mindmap} isVisible={isOpen.serializer} />
			</ReactFlow>
			<DropBar isVisible={isOpen.leftBar} isVisibleMap={isOpen.minimap} />
		</div>
	);
};

const CanvasPage = () => {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "92.3vh",
				width: "100vw",
			}}
		>
			<ReactFlowProvider>
				<DnDProvider>
					<Canvas />
				</DnDProvider>
			</ReactFlowProvider>
		</div>
	);
};

export default CanvasPage;
