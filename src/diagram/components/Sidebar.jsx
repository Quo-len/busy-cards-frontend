import { useCallback, memo, useState, useEffect } from "react";
import "../styles/Sidebar.css";
import { GrSelect } from "react-icons/gr";
import useCanvasStore from "../../store/useCanvasStore";
import { useAuth } from "../../utils/authContext";
import { v4 as uuidv4 } from "uuid";

const nodeShapes = {
	rectangle: {},
	circle: {},
	hexagon: {},
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
		fields: ["label", "description", "status", "priority", "shape", "color"],
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
	{ value: "proposed", label: "Запропоновано", color: "#3498db" },
	{ value: "approved", label: "Узгоджено", color: "#2ecc71" },
	{ value: "rejected", label: "Відхилено", color: "#e74c3c" },
	{ value: "discussing", label: "В обговоренні", color: "#9b59b6" },
];

const PRIORITY_OPTIONS = [
	{ value: "p1", label: "P1 (критичний)", color: "#e74c3c" },
	{ value: "p2", label: "P2 (високий)", color: "#e67e22" },
	{ value: "p3", label: "P3 (середній)", color: "#f1c40f" },
	{ value: "p4", label: "P4 (низький)", color: "#2ecc71" },
];

function Sidebar({ isVisible, selectedNodeId, isEditable, isCommentable }) {
	const { user, isLoggedIn } = useAuth();

	const { updateNode, getNodesArray } = useCanvasStore();
	const nodes = getNodesArray();

	const selectedNode = nodes.find((node) => node.id === selectedNodeId);

	const [newOption, setNewOption] = useState("");
	const [animationClass, setAnimationClass] = useState("");
	const [activeTab, setActiveTab] = useState("properties");
	const [newComment, setNewComment] = useState("");
	const [editingCommentId, setEditingCommentId] = useState(null);
	const [editingCommentText, setEditingCommentText] = useState("");

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

	const addComment = useCallback(
		(nodeId) => {
			if (!newComment.trim()) return;

			const nodeData = useCanvasStore.getState().nodes.get(nodeId) || {};
			const currentComments = nodeData.data?.comments || [];

			const newCommentObj = {
				id: uuidv4(),
				text: newComment,
				timestamp: new Date().toISOString(),
				author: user.username,
			};

			const updatedComments = [...currentComments, newCommentObj];

			updateNode(nodeId, {
				data: {
					comments: updatedComments,
				},
			});
			setNewComment("");
		},
		[newComment, updateNode]
	);

	const removeComment = useCallback(
		(nodeId, commentId) => {
			const nodeData = useCanvasStore.getState().nodes.get(nodeId) || {};
			const currentComments = nodeData.data?.comments || [];
			const updatedComments = currentComments.filter((comment) => comment.id !== commentId);

			updateNode(nodeId, {
				data: {
					comments: updatedComments,
				},
			});
		},
		[updateNode]
	);

	const startEditingComment = useCallback((comment) => {
		setEditingCommentId(comment.id);
		setEditingCommentText(comment.text);
	}, []);

	const cancelEditingComment = useCallback(() => {
		setEditingCommentId(null);
		setEditingCommentText("");
	}, []);

	const saveEditedComment = useCallback(
		(nodeId, commentId) => {
			if (!editingCommentText.trim()) return;

			const nodeData = useCanvasStore.getState().nodes.get(nodeId) || {};
			const currentComments = nodeData.data?.comments || [];

			const updatedComments = currentComments.map((comment) =>
				comment.id === commentId
					? {
							...comment,
							text: editingCommentText.trim(),
							edited: true,
							editTimestamp: new Date().toISOString(),
					  }
					: comment
			);

			updateNode(nodeId, {
				data: {
					comments: updatedComments,
				},
			});

			setEditingCommentId(null);
			setEditingCommentText("");
		},
		[editingCommentText, updateNode]
	);

	const formatTimestamp = (timestamp) => {
		const date = new Date(timestamp);
		return date.toLocaleString("uk-UA", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

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

	const renderPropertiesTab = () => (
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
								disabled={!isEditable}
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
								disabled={!isEditable}
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
								disabled={!isEditable}
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
								disabled={!isEditable}
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
								disabled={!isEditable}
							/>
							<button onClick={() => addOption(selectedNode.id)}>Add</button>
						</div>
					);
				}

				if (field === "description" || field === "label") {
					return (
						<div key={field} className="form-group">
							<label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
							<textarea
								name={field}
								value={value}
								onChange={(e) => updateNodeProperty(selectedNode.id, field, e.target.value)}
								placeholder={`Enter ${field}`}
								disabled={!isEditable}
								className="property-input"
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
								disabled={!isEditable}
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
								disabled={!isEditable}
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
	);

	const renderCommentsTab = () => {
		const comments = selectedNode.data?.comments || [];

		return (
			<div className="comments-section">
				<div className="comments-list">
					{comments.length === 0 ? (
						<p className="no-comments">Коментарів поки немає</p>
					) : (
						comments.map((comment) => (
							<div key={comment.id} className="comment-item">
								<div className="comment-header">
									<span className="comment-author">{comment.author}</span>
									<span className="comment-timestamp">
										{formatTimestamp(comment.timestamp)}
										{comment.edited && (
											<span className="edited-indicator">
												{" "}
												(відредаговано {formatTimestamp(comment.editTimestamp)})
											</span>
										)}
									</span>
								</div>

								{editingCommentId === comment.id ? (
									<div className="comment-edit">
										<textarea
											value={editingCommentText}
											onChange={(e) => setEditingCommentText(e.target.value)}
											className="comment-input"
											rows={3}
										/>
										<div className="comment-edit-actions">
											<button
												className="comment-edit-btn"
												onClick={() => saveEditedComment(selectedNode.id, comment.id)}
												disabled={!editingCommentText.trim()}
											>
												Зберегти
											</button>
											<button className="comment-delete" onClick={cancelEditingComment}>
												Скасувати
											</button>
										</div>
									</div>
								) : (
									<>
										<div className="comment-text">{comment.text}</div>
										{isCommentable && (
											<div className="comment-actions">
												<button className="comment-edit-btn" onClick={() => startEditingComment(comment)}>
													Редагувати
												</button>
												<button className="comment-delete" onClick={() => removeComment(selectedNode.id, comment.id)}>
													Видалити
												</button>
											</div>
										)}
									</>
								)}
							</div>
						))
					)}
				</div>

				{isCommentable && (
					<div className="add-comment">
						<textarea
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							placeholder="Додати коментар..."
							rows={3}
							className="comment-input"
						/>
						<button
							onClick={() => addComment(selectedNode.id)}
							disabled={!newComment.trim()}
							className="add-comment-btn"
						>
							Додати коментар
						</button>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className={`sidebar ${animationClass}`}>
			<div className="sidebar-container">
				<div className="sidebar-header">
					<h3>Панель редагування вузла</h3>
					<div className="node-coordinates">
						ID: {selectedNode.id} | x: {selectedNode.position.x.toFixed(1)}, y: {selectedNode.position.y.toFixed(1)}
					</div>
				</div>

				<div className="sidebar-tabs">
					<button
						className={`tab-button ${activeTab === "properties" ? "active" : ""}`}
						onClick={() => setActiveTab("properties")}
					>
						Властивості
					</button>
					<button
						className={`tab-button ${activeTab === "comments" ? "active" : ""}`}
						onClick={() => setActiveTab("comments")}
					>
						Коментарі
					</button>
				</div>

				<div className="tab-content">{activeTab === "properties" ? renderPropertiesTab() : renderCommentsTab()}</div>
			</div>
		</div>
	);
}

export default memo(Sidebar);
