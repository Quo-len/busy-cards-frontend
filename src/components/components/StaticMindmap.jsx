import { useCallback } from "react";
import ReactFlow, { Background, BackgroundVariant, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";

const StaticMindmap = ({ nodes1, edges1, panOnDrag }) => {
	const nodes = [
		{
			id: "1",
			type: "default",
			data: { label: "Main Concept" },
			position: { x: 250, y: 150 },
			style: { background: "#f5f5f5", border: "1px solid #ddd", borderRadius: "8px", padding: "10px" },
		},
		{
			id: "2",
			type: "default",
			data: { label: "Idea 1" },
			position: { x: 100, y: 300 },
			style: { background: "#e6f7ff", border: "1px solid #91d5ff", borderRadius: "8px", padding: "10px" },
		},
		{
			id: "3",
			type: "default",
			data: { label: "Idea 2" },
			position: { x: 400, y: 300 },
			style: { background: "#f6ffed", border: "1px solid #b7eb8f", borderRadius: "8px", padding: "10px" },
		},
		{
			id: "4",
			type: "default",
			data: { label: "Sub-idea 1.1" },
			position: { x: 50, y: 450 },
			style: { background: "#fff2e8", border: "1px solid #ffbb96", borderRadius: "8px", padding: "10px" },
		},
		{
			id: "5",
			type: "default",
			data: { label: "Sub-idea 2.1" },
			position: { x: 350, y: 450 },
			style: { background: "#f9f0ff", border: "1px solid #d3adf7", borderRadius: "8px", padding: "10px" },
		},
	];

	const edges = [
		{ id: "e1-2", source: "1", target: "2", animated: false, style: { stroke: "#91d5ff" } },
		{ id: "e1-3", source: "1", target: "3", animated: false, style: { stroke: "#b7eb8f" } },
		{ id: "e2-4", source: "2", target: "4", animated: false, style: { stroke: "#ffbb96" } },
		{ id: "e3-5", source: "3", target: "5", animated: false, style: { stroke: "#d3adf7" } },
	];

	const onNodeDragStart = useCallback((event) => {
		event.preventDefault();
		return false;
	}, []);

	return (
		<div style={{ width: "100%", height: "200px", cursor: "pointer" }}>
			<ReactFlowProvider>
				<ReactFlow
					defaultNodes={nodes}
					defaultEdges={edges}
					nodesDraggable={false}
					nodesConnectable={false}
					elementsSelectable={false}
					zoomOnScroll={false}
					zoomOnPinch={false}
					panOnScroll={false}
					panOnDrag={panOnDrag}
					onNodeDragStart={onNodeDragStart}
					fitView={true}
					attributionPosition="bottom-right"
				></ReactFlow>
			</ReactFlowProvider>
		</div>
	);
};

export default StaticMindmap;
