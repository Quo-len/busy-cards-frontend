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
import {
	nodeTypes,
	edgeTypes,
	nodeTypeNamesUa,
	userPermissions,
	translateExtent,
	nodeExtent,
} from "../../diagram/components";
import useCanvasStore from "../../store/useCanvasStore";
import * as api from "../../api";

const Canvas = () => {
	const { mindmapId } = useParams();
	const [role, setRole] = useState("Власник");
	const [mindmap, setMindmap] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

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
				setMindmap(response.mindmap);
				setRole(response.role);
				await Promise.all([
					(async () => {
						initializeYjs(mindmapId, response.role);
					})(),
					new Promise((resolve) => {
						timeoutId = setTimeout(() => {
							initializeYjs(mindmapId, response.role);
							resolve();
						}, 1000);
					}),
				]);

				setIsLoading(false);
			} catch (err) {
				if (err.response) {
					const statusCode = err.response.status;

					if (statusCode === 403) {
						setError({
							title: "Доступ заборонено",
							message: "У вас недостатньо прав для перегляду інтелект-карти.",
							code: "403",
						});
					} else if (statusCode === 404) {
						setError({
							title: "Інтелект-карта не знайдена",
							message: "Інтелект-карту не знайдено, перевірте посилання.",
							code: "404",
						});
					} else if (statusCode === 500) {
						setError({
							title: "Помилка сервера",
							message: "Виникла помилка на сервері. Спробуйте пізніше.",
							code: "500",
						});
					} else {
						setError({
							title: "Помилка",
							message: "Виникла невідома помилка. Спробуйте пізніше.",
							code: statusCode.toString(),
						});
					}
				} else {
					setError({
						title: "Помилка з'єднання",
						message: "Не вдалося встановити з'єднання з сервером. Перевірте ваше підключення до інтернету.",
						code: "Network Error",
					});
				}
				setIsLoading(false);
			}
		};

		if (mindmapId) {
			fetchMindmap();
		}

		return () => {
			clearTimeout(timeoutId);
			cleanupYjs();
		};
	}, [mindmapId, initializeYjs, cleanupYjs]);

	useEffect(() => {
		if (mindmap && mindmap.title) {
			document.title = `${mindmap.title} - Busy-cards`;
		} else if (mindmap) {
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
				data: { label: `${nodeTypeNamesUa[type]}` },
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
						!invalidTargetNodes.includes(node.id) &&
						!["mygroup", "note"].includes(node.type) && {
							border: "2px solid #4CAF50", // Green for valid targets
							boxShadow: "0 0 10px rgba(76, 175, 80, 0.5)",
						}),
					...(connectionStartNodeId &&
						(invalidTargetNodes.includes(node.id) || ["mygroup", "note"].includes(node.type)) && {
							border: "2px solid #FF5252", // Red for invalid targets
							boxShadow: "0 0 10px rgba(255, 82, 82, 0.5)",
						}),
					...(connectionStartNodeId === node.id && {
						border: "2px solid #0041d0",
						boxShadow: "0 0 10px rgba(0, 65, 208, 0.5)",
					}),
					...(localHighlight && {
						border: localHighlight.border,
						boxShadow: localHighlight.boxShadow,
						...(localHighlight.zIndex && { zIndex: localHighlight.zIndex }),
					}),
				},
			};
		});
	}, [nodes, selectedNodeId, connectionStartNodeId, invalidTargetNodes, getLocalNodeStyle]);

	if (isLoading) {
		return <Loader message="Завантаження інтелект-карти, будь ласка, зачекайте." flexLayout="false" />;
	}

	if (error) {
		return <NotFoundPage title={error.title} message={error.message} code={error.code} />;
	}

	return (
		<div style={{ flex: 1, position: "relative", overflow: "hidden" }} ref={flowRef}>
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
				nodesDraggable={userPermissions[role].canEdit}
				nodesConnectable={userPermissions[role].canEdit}
				elementsSelectable={userPermissions[role].canEdit}
				selectionOnDrag
				connectOnClick={true}
				selectionMode={SelectionMode.Partial}
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
				<Sidebar
					isVisible={isOpen.rightBar}
					selectedNodeId={selectedNodeId}
					isEditable={userPermissions[role].canEdit}
					isCommentable={userPermissions[role].canComment}
				/>
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
				<MindmapSerializer mindmap={mindmap} isVisible={isOpen.serializer} isEditable={userPermissions[role].canEdit} />
			</ReactFlow>
			<DropBar isVisible={isOpen.leftBar} isVisibleMap={isOpen.minimap} isEditable={userPermissions[role].canEdit} />
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
