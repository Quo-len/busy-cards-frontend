import React, { useCallback, memo } from "react";
import { useNodes, useReactFlow } from "reactflow";
import { useWebSocket } from "../../utils/WebSocketContext";
import "../styles/Sidebar.css";

// Node shapes
const nodeShapes = {
	rectangle: { width: 150, height: 40, borderRadius: 3 },
	circle: { width: 70, height: 70, borderRadius: 50 },
	hexagon: { width: 100, height: 80, clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" },
};

// Node colors
const nodeColors = {
	blue: "#3498db",
	green: "#2ecc71",
	red: "#e74c3c",
	purple: "#9b59b6",
	orange: "#e67e22",
	yellow: "#f1c40f",
	gray: "#95a5a6",
};

function Sidebar() {
	const { setNodes } = useReactFlow();
	const nodes = useNodes();
	// Use the WebSocket context
	const { ydoc } = useWebSocket();

	// Get only the first selected node
	const selectedNode = nodes.find((node) => node.selected);

	// Update node properties with Yjs synchronization
	const updateNodeProperty = useCallback(
		(nodeId, propertyName, value) => {
			if (!ydoc) return;

			const nodesMap = ydoc.getMap("nodes");
			const nodeData = nodesMap.get(nodeId) || {};

			// Update node data in Yjs map
			const updatedNodeData = {
				...nodeData,
				data: {
					...nodeData.data,
					[propertyName]: value,
				},
			};

			// Apply shape and style changes separately
			if (propertyName === "shape") {
				updatedNodeData.style = {
					...(nodeData.style || {}),
					...nodeShapes[value],
				};
			}

			nodesMap.set(nodeId, updatedNodeData);
		},
		[ydoc]
	);

	const handleChangeName = useCallback(
		(nodeId, newLabel) => {
			updateNodeProperty(nodeId, "label", newLabel);
		},
		[updateNodeProperty]
	);

	const handleChangeDescription = useCallback(
		(nodeId, newDescription) => {
			updateNodeProperty(nodeId, "description", newDescription);
		},
		[updateNodeProperty]
	);

	const handleChangeShape = useCallback(
		(nodeId, newShape) => {
			updateNodeProperty(nodeId, "shape", newShape);
		},
		[updateNodeProperty]
	);

	const handleChangeColor = useCallback(
		(nodeId, newColor) => {
			updateNodeProperty(nodeId, "color", newColor);
		},
		[updateNodeProperty]
	);

	// If no nodes are selected, return null to completely hide the sidebar
	if (!selectedNode) {
		return null;
	}

	return (
		<div className={`sidebar ${selectedNode ? "sidebar-visible" : ""}`}>
			<div className="sidebar-container">
				<div className="sidebar-header">
					<h3>Node Properties</h3>
					<div className="node-coordinates">
						ID: {selectedNode.id} | x: {selectedNode.position.x.toFixed(1)}, y: {selectedNode.position.y.toFixed(1)}
					</div>
				</div>

				<div className="sidebar-form">
					<div className="form-group">
						<label htmlFor="node-name">Name:</label>
						<input
							id="node-name"
							value={selectedNode.data.label || ""}
							onChange={(e) => handleChangeName(selectedNode.id, e.target.value)}
							placeholder="Enter node name"
						/>
					</div>

					<div className="form-group">
						<label htmlFor="node-description">Description:</label>
						<textarea
							id="node-description"
							value={selectedNode.data.description || ""}
							onChange={(e) => handleChangeDescription(selectedNode.id, e.target.value)}
							placeholder="Enter node description"
							rows="4"
						/>
					</div>

					<div className="form-group">
						<label htmlFor="node-shape">Shape:</label>
						<select
							id="node-shape"
							value={selectedNode.data.shape || "rectangle"}
							onChange={(e) => handleChangeShape(selectedNode.id, e.target.value)}
						>
							{Object.keys(nodeShapes).map((shape) => (
								<option key={shape} value={shape}>
									{shape.charAt(0).toUpperCase() + shape.slice(1)}
								</option>
							))}
						</select>
					</div>

					<div className="form-group">
						<label htmlFor="node-color">Color:</label>
						<select
							id="node-color"
							value={selectedNode.data.color || "blue"}
							onChange={(e) => handleChangeColor(selectedNode.id, e.target.value)}
						>
							{Object.keys(nodeColors).map((color) => (
								<option key={color} value={color}>
									{color.charAt(0).toUpperCase() + color.slice(1)}
								</option>
							))}
						</select>
					</div>

					<div className="color-preview">
						<div
							className="color-sample"
							style={{ backgroundColor: nodeColors[selectedNode.data.color || "blue"] }}
							title={selectedNode.data.color || "blue"}
						></div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default memo(Sidebar);
