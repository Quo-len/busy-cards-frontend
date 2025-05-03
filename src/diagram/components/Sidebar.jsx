import { useCallback, memo, useState, useEffect } from "react";
import "../styles/Sidebar.css";
import { GrSelect } from "react-icons/gr";
import useCanvasStore from "../../store/useCanvasStore";

const nodeShapes = {
	rectangle: { width: 150, height: 40, borderRadius: 3 },
	circle: { width: 70, height: 70, borderRadius: 50 },
	hexagon: { width: 100, height: 80, clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" },
};

const NODE_COLORS = {
	blue: "#3498db",
	green: "#2ecc71",
	red: "#e74c3c",
	purple: "#9b59b6",
	orange: "#e67e22",
	yellow: "#f1c40f",
	gray: "#95a5a6",
	teal: "#1abc9c",
	navy: "#34495e",
};

const NODE_TYPES = {
	custom: {
		fields: ["label", "description", "shape", "color"],
	},
	actor: {
		fields: ["label", "description", "status", "priority", "shape", "color"],
	},
	link: {
		fields: ["label", "description", "status", "priority", "shape", "color"],
	},
	image: {
		fields: ["label", "description", "image"],
	},
	note: {
		fields: ["label", "color"],
	},
	group: {
		fields: ["label", "description", "options", "color"],
	},
};

const STATUS_OPTIONS = [
	{ value: "not-started", label: "Not Started", color: "#95a5a6" },
	{ value: "in-progress", label: "In Progress", color: "#3498db" },
	{ value: "completed", label: "Completed", color: "#2ecc71" },
	{ value: "blocked", label: "Blocked", color: "#e74c3c" },
];

const PRIORITY_OPTIONS = [
	{ value: "low", label: "Low", color: "#95a5a6" },
	{ value: "medium", label: "Medium", color: "#f1c40f" },
	{ value: "high", label: "High", color: "#e74c3c" },
];

function Sidebar({ isVisible, selectedNodeId }) {
	const { updateNode, getNodesArray } = useCanvasStore();
	const nodes = getNodesArray();

	const selectedNode = nodes.find((node) => node.id === selectedNodeId);

	const [newOption, setNewOption] = useState("");
	const [animationClass, setAnimationClass] = useState("");

	const nodeType = selectedNode?.type || "custom";
	const availableFields = NODE_TYPES[nodeType]?.fields || NODE_TYPES.custom.fields;

	useEffect(() => {
		if (isVisible) {
			setAnimationClass("slide-in");
		} else {
			setAnimationClass("slide-out");
		}
	}, [isVisible]);

	const updateNodeProperty = useCallback((nodeId, propertyName, value) => {
		const nodeData = useCanvasStore.getState().nodes.get(nodeId) || {};

		const updatedNodeData = {
			...nodeData,
			data: {
				...nodeData.data,
				[propertyName]: value,
			},
		};

		if (propertyName === "shape") {
			updatedNodeData.style = {
				...(nodeData.style || {}),
			};
		}
		updateNode(nodeId, updatedNodeData);
	}, []);

	const addOption = useCallback(
		(nodeId) => {
			if (!newOption.trim()) return;

			const nodeData = useCanvasStore.getState().nodes.get(nodeId) || {};

			const currentOptions = nodeData.data?.options || [];
			const updatedOptions = [...currentOptions, { id: Date.now().toString(), text: newOption }];

			const updatedNodeData = {
				...nodeData,
				data: {
					...nodeData.data,
					options: updatedOptions,
				},
			};

			updateNode(nodeId, updatedNodeData);
			setNewOption("");
		},
		[newOption]
	);

	const removeOption = useCallback((nodeId, optionId) => {
		const nodeData = useCanvasStore.getState().nodes.get(nodeId) || {};

		const currentOptions = nodeData.data?.options || [];
		const updatedOptions = currentOptions.filter((option) => option.id !== optionId);

		const updatedNodeData = {
			...nodeData,
			data: {
				...nodeData.data,
				options: updatedOptions,
			},
		};

		updateNode(nodeId, updatedNodeData);
	}, []);

	if (!isVisible && animationClass === "slide-out-complete") {
		return null;
	}

	if (!selectedNode) {
		return (
			<div className={`sidebar ${animationClass}`}>
				<div className="empty-state">
					<GrSelect />
					<p>Оберіть інтелект-карту для перегляду</p>
				</div>
			</div>
		);
	}

	return (
		<div className={`sidebar ${animationClass}`}>
			<div className="sidebar-container">
				<div className="sidebar-header">
					<h3>Node Properties</h3>
					<div className="node-coordinates">
						ID: {selectedNode.id} | x: {selectedNode.position.x.toFixed(1)}, y: {selectedNode.position.y.toFixed(1)}
					</div>
				</div>

				<div className="sidebar-form">
					{availableFields.map((field) => {
						const value = selectedNode.data?.[field] || "";

						if (field === "status") {
							return (
								<div key={field} className="form-group">
									<label>Status:</label>
									<select
										name="status"
										value={value}
										onChange={(e) => updateNodeProperty(selectedNode.id, field, e.target.value)}
									>
										{STATUS_OPTIONS.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
								</div>
							);
						}

						if (field === "priority") {
							return (
								<div key={field} className="form-group">
									<label>Priority:</label>
									<select
										name="priority"
										value={value}
										onChange={(e) => updateNodeProperty(selectedNode.id, field, e.target.value)}
									>
										{PRIORITY_OPTIONS.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
								</div>
							);
						}

						if (field === "color") {
							return (
								<div key={field} className="form-group">
									<label>Color:</label>
									<select
										name="color"
										value={value}
										onChange={(e) => updateNodeProperty(selectedNode.id, field, e.target.value)}
									>
										{Object.entries(NODE_COLORS).map(([name, hex]) => (
											<option key={name} value={hex}>
												{name}
											</option>
										))}
									</select>
								</div>
							);
						}

						if (field === "shape") {
							return (
								<div key={field} className="form-group">
									<label>Shape:</label>
									<select
										name="shape"
										value={value}
										onChange={(e) => updateNodeProperty(selectedNode.id, field, e.target.value)}
									>
										{Object.keys(nodeShapes).map((shape) => (
											<option key={shape} value={shape}>
												{shape}
											</option>
										))}
									</select>
								</div>
							);
						}

						if (field === "options") {
							const options = selectedNode.data?.options || [];
							return (
								<div key={field} className="form-group">
									<label>Options:</label>
									<ul className="options-list">
										{options.map((option) => (
											<li key={option.id}>
												{option.text}
												<button onClick={() => removeOption(selectedNode.id, option.id)}>Remove</button>
											</li>
										))}
									</ul>
									<input
										type="text"
										value={newOption}
										onChange={(e) => setNewOption(e.target.value)}
										placeholder="New option"
									/>
									<button onClick={() => addOption(selectedNode.id)}>Add</button>
								</div>
							);
						}

						if (field === "description" || field === "label") {
							return (
								<div key={field} className="form-group">
									<label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
									<input
										name={field}
										value={value}
										onChange={(e) => updateNodeProperty(selectedNode.id, field, e.target.value)}
										placeholder={`Enter ${field}`}
									/>
								</div>
							);
						}

						if (field === "image") {
							return (
								<div key={field} className="form-group">
									<label>Image (Upload or URL):</label>

									<input
										type="url"
										placeholder="Enter image URL"
										value={value.startsWith("data:") ? "" : value}
										onChange={(e) => updateNodeProperty(selectedNode.id, "image", e.target.value)}
									/>

									<input
										type="file"
										accept="image/*"
										onChange={(e) => {
											const file = e.target.files[0];
											if (file) {
												const reader = new FileReader();
												reader.onloadend = () => {
													updateNodeProperty(selectedNode.id, "image", reader.result);
												};
												reader.readAsDataURL(file);
											}
										}}
									/>

									{value && (
										<div className="image-preview">
											<img src={value} alt="Node preview" style={{ maxWidth: "100%", marginTop: "0.5rem" }} />
										</div>
									)}
								</div>
							);
						}

						return null;
					})}
				</div>
			</div>
		</div>
	);
}

export default memo(Sidebar);
