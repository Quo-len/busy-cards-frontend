import { useCallback, useMemo } from "react";
import ReactFlow, { ReactFlowProvider, ConnectionMode } from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "../../diagram/components/CustomNode";
import CustomEdge from "../../diagram/components/CustomEdge";

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

const StaticMindmap = ({ nodes, edges, panOnDrag }) => {
	const onNodeDragStart = useCallback((event) => {
		event.preventDefault();
		return false;
	}, []);

	const parsedNodes = useMemo(() => {
		try {
			const obj = JSON.parse(nodes);
			return Object.values(obj);
		} catch (e) {
			console.error("Помилка парсингу вузлів:", e);
			return [];
		}
	}, [nodes]);

	const parsedEdges = useMemo(() => {
		try {
			const obj = JSON.parse(edges);
			return Object.values(obj);
		} catch (e) {
			console.error("Помилка парсингу ребер:", e);
			return [];
		}
	}, [edges]);

	return (
		<div style={{ width: "100%", height: "200px", cursor: "pointer" }}>
			<ReactFlowProvider>
				<ReactFlow
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					defaultNodes={parsedNodes}
					defaultEdges={parsedEdges}
					nodesDraggable={false}
					nodesConnectable={false}
					elementsSelectable={false}
					zoomOnScroll={false}
					zoomOnPinch={false}
					panOnScroll={false}
					panOnDrag={panOnDrag}
					onNodeDragStart={onNodeDragStart}
					fitView
					connectionMode={ConnectionMode.Loose}
					proOptions={{ hideAttribution: true }}
				/>
			</ReactFlowProvider>
		</div>
	);
};

export default StaticMindmap;
