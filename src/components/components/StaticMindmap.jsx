import { useCallback } from "react";
import ReactFlow, { Background, BackgroundVariant, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import { createNodesAndEdges } from "./../../utils/utils";
import CustomNode from "./CustomNode";
import CustomEdge from "./CustomEdge";

const nodeTypes = {
	custom: CustomNode,
};

const edgeTypes = {
	custom: CustomEdge,
};

const StaticMindmap = ({ nodes1, edges1, panOnDrag }) => {
	const { nodes, edges } = createNodesAndEdges(10, 15);

	const onNodeDragStart = useCallback((event) => {
		event.preventDefault();
		return false;
	}, []);

	return (
		<div style={{ width: "100%", height: "200px", cursor: "pointer" }}>
			<ReactFlowProvider>
				<ReactFlow
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
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
					fitView
					attributionPosition="bottom-right"
				></ReactFlow>
			</ReactFlowProvider>
		</div>
	);
};

export default StaticMindmap;
