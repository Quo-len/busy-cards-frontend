import { useCallback, useMemo, useEffect, useState } from "react";
import ReactFlow, { ReactFlowProvider, ConnectionMode, useReactFlow } from "reactflow";
import "reactflow/dist/style.css";
import { nodeTypes, edgeTypes } from "../../diagram/components";

const FlowWithControls = ({ parsedNodes, parsedEdges, panOnDrag }) => {
	const reactFlowInstance = useReactFlow();

	useEffect(() => {
		if (reactFlowInstance && parsedNodes.length > 0) {
			setTimeout(() => {
				reactFlowInstance.fitView({
					includeHiddenNodes: true,
					minZoom: 0.1,
					maxZoom: 1,
				});
			}, 50);
		}
	}, [reactFlowInstance, parsedNodes, parsedEdges]);

	const onNodeDragStart = useCallback((event) => {
		event.preventDefault();
		return false;
	}, []);

	const onPaneClick = useCallback((event) => {
		event.preventDefault();
		return false;
	}, []);

	const onSelectionChange = useCallback(() => {
		return false;
	}, []);

	const onMouseDown = useCallback(
		(event) => {
			if (!panOnDrag) {
				event.preventDefault();
				return false;
			}
		},
		[panOnDrag]
	);

	return (
		<ReactFlow
			nodeTypes={nodeTypes}
			edgeTypes={edgeTypes}
			nodes={parsedNodes}
			edges={parsedEdges}
			nodesDraggable={false}
			nodesConnectable={false}
			elementsSelectable={false}
			zoomOnScroll={false}
			zoomOnPinch={false}
			panOnScroll={false}
			panOnDrag={panOnDrag}
			onNodeDragStart={onNodeDragStart}
			onPaneClick={onPaneClick}
			onSelectionChange={onSelectionChange}
			onMouseDown={onMouseDown}
			connectionMode={ConnectionMode.Loose}
			proOptions={{ hideAttribution: true }}
			onlyRenderVisibleElements={false}
			preventScrolling={true}
			minZoom={0.1}
			maxZoom={2}
			defaultEdgeOptions={{
				interactive: false,
			}}
		/>
	);
};

const StaticMindmap = ({ nodes, edges, panOnDrag = false }) => {
	const [isInitialized, setIsInitialized] = useState(false);

	const parsedNodes = useMemo(() => {
		try {
			if (!nodes) return [];
			const obj = JSON.parse(nodes);
			return Object.values(obj).map((node) => ({
				...node,
				style: {
					...node.style,
					width: node.style?.width ? node.style.width * 0.8 : undefined,
					height: node.style?.height ? node.style.height * 0.8 : undefined,
					fontSize: "10px",
				},
			}));
		} catch (e) {
			//	console.error("Error parsing nodes:", e);
			return [];
		}
	}, [nodes]);

	const parsedEdges = useMemo(() => {
		try {
			if (!edges) return [];
			const obj = JSON.parse(edges);
			return Object.values(obj);
		} catch (e) {
			//	console.error("Error parsing edges:", e);
			return [];
		}
	}, [edges]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsInitialized(true);
		}, 100);

		return () => clearTimeout(timer);
	}, []);

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				cursor: panOnDrag ? "grab" : "default",
				pointerEvents: panOnDrag ? "auto" : "none",
				background: "#f9f9f9",
			}}
		>
			<ReactFlowProvider>
				{isInitialized && (
					<FlowWithControls parsedNodes={parsedNodes} parsedEdges={parsedEdges} panOnDrag={panOnDrag} />
				)}
			</ReactFlowProvider>
		</div>
	);
};

export default StaticMindmap;
