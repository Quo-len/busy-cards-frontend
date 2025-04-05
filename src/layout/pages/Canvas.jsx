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

import Sidebar from "../../components/components/Sidebar";
import CustomNode from "../../components/components/CustomNode";
import CustomEdge from "../../components/components/CustomEdge";
import { useWebSocket } from "../../utils/WebSocketContext";
import Cursor from "../../components/components/Cursor";

const generateRandomColor = () => "#" + Math.floor(Math.random() * 16777215).toString(16);

const isNodeDescendant = (node, targetNode, nodes, edges) => {
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

const nodeTypes = {
	custom: CustomNode,
};

const edgeTypes = {
	custom: CustomEdge,
};

import { createNodesAndEdges } from "../../utils/utils";

const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdges(15, 10);

// const initialNodes = [
//   { id: '1',  type: 'custom', data: { label: 'Node 1', description: 'First node'  }, position: { x: 100, y: 200 } },
//   { id: '2',  type: 'custom', data: { label: 'Node 2', description: 'Second  node' }, position: { x: 100, y: 300 } },
//   { id: '3',  type: 'custom', data: { label: 'Node 3', description: 'Thr node' }, position: { x: 100, y: 400 } },
//   { id: '4',  type: 'custom', data: { label: 'Node 4', description: 'Fo node' }, position: { x: 100, y: 500 } }
// ];
// const initialEdges = [
//   { id: 'e1-2', type: 'custom', source: '1', target: '2', },
//   { id: 'e1-3', type: 'custom', source: '1', target: '3', },
// ];

export default function Canvas() {
	const { mindmapId } = useParams();
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [cursors, setCursors] = useState(new Map());
	const [selectedNodeId, setSelectedNodeId] = useState(null);

	useEffect(() => {
		console.log("Current Mindmap ID:", mindmapId);
		// You can do additional setup or logging here
	}, [mindmapId]);

	/////
	const [selectedNodes, setSelectedNodes] = useState([]);
	const [selectedEdges, setSelectedEdges] = useState([]);

	const onChange = useCallback(({ nodes, edges }) => {
		setSelectedNodes(nodes.map((node) => node.id));
		setSelectedEdges(edges.map((edge) => edge.id));
	}, []);

	useOnSelectionChange({
		onChange,
	});
	///////

	// Use the WebSocket context
	const { ydoc, provider } = useWebSocket();

	const flowRef = useRef(null);
	const userColor = useRef(generateRandomColor());

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
							width: change.width,
							height: change.height,
						};
						ydoc.getMap("nodes").set(change.id, JSON.parse(JSON.stringify(updatedNode)));
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

	const { getNodes, getEdges } = useReactFlow();

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

			const incomers = getIncomers(targetNode, nodes, edges);
			if (incomers.length > 0) return false;

			return true;
		},
		[getNodes, getEdges]
	);

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
		setNodes((nds) => nds.concat(newNode));
	}, [ydoc, setNodes]);

	const onReconnect = useCallback(
		(oldEdge, newConnection) => setEdges((els) => reconnectEdge(oldEdge, newConnection, els)),
		[]
	);

	const onConnect = useCallback(
		(connection) => {
			if (!connection.source || !connection.target || !ydoc) return;

			const newEdge = {
				id: `e${connection.source}-${connection.target}`,
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
				color: userColor.current,
				clientId: provider.awareness.clientID,
			});
		},
		[provider]
	);

	const handleMouseLeave = useCallback(() => {
		if (!provider?.awareness) return;

		provider.awareness.setLocalState({
			cursor: null,
			color: userColor.current,
			clientId: provider.awareness.clientID,
		});
	}, [provider]);

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

		provider.awareness.setLocalState({
			cursor: null,
			color: userColor.current,
			clientId: provider.awareness.clientID,
		});

		provider.awareness.on("change", () => {
			const states = new Map(provider.awareness.getStates());
			setCursors(states);
		});

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

	return (
		<div
			style={{ flex: 1, position: "relative", overflow: "hidden" }}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			ref={flowRef}
		>
			<button onClick={updatePos} style={{ position: "absolute", right: 10, top: 30, zIndex: 4 }}>
				change pos
			</button>
			<button
				onClick={addNewNode}
				style={{
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
				onNodeDrag={handleMouseMove}
				onNodeClick={handleNodeClick}
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
			{/* <div>
        {Array.from(cursors.entries()).map(([clientId, state]) => {
          if (
            !state.cursor ||
            clientId === provider.current?.awareness?.clientID
          ) {
            return null;
          }
          return (
            <Cursor
              key={clientId}
              x={state.cursor.x}
              y={state.cursor.y}
              color={state.color}
            />
          );
        })}
      </div> */}
		</div>
	);
}
