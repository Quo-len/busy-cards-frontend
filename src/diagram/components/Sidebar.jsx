import { useCallback, memo, useState, useEffect } from "react";
import "../styles/Sidebar.css";
import { GrSelect } from "react-icons/gr";
import useCanvasStore from "../../store/useCanvasStore";
import { useAuth } from "../../utils/authContext";
import { v4 as uuidv4 } from "uuid";
import { nodeColors, nodeShapes, nodeFields, statusOptions, priorityOptions } from "../../diagram/components";

function Sidebar({ isVisible, selectedNodeId, isEditable, isCommentable }) {
	const { user } = useAuth();

	const { updateNode, getNodesArray, removeNode, addNode } = useCanvasStore();
	const nodes = getNodesArray();

	const selectedNode = nodes.find((node) => node.id === selectedNodeId);

	const [newOption, setNewOption] = useState("");
	const [animationClass, setAnimationClass] = useState("");
	const [activeTab, setActiveTab] = useState("properties");
	const [newComment, setNewComment] = useState("");
	const [editingCommentId, setEditingCommentId] = useState(null);
	const [editingCommentText, setEditingCommentText] = useState("");

	const nodeType = selectedNode?.type || "custom";
	const availableFields = nodeFields[nodeType]?.fields || nodeFields.custom.fields;

	useEffect(() => {
		if (isVisible) {
			setAnimationClass("slide-in");
		} else {
			setAnimationClass("slide-out");
		}
	}, [isVisible]);

	const copyNode = () => {
		const node = nodes.find((node) => node.id === selectedNodeId);
		if (node) {
			const id = uuidv4();
			const newNode = {
				...node,
				id: id,
				position: {
					x: node.position.x + 15,
					y: node.position.y + 15,
				},
				data: {
					...node.data,
					label: node.data.label + "(копія)",
				},
			};

			addNode(newNode);
		}
	};

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
							<label>Статус:</label>
							<select
								name="status"
								value={value}
								onChange={(e) => updateNodeProperty(selectedNode.id, field, e.target.value)}
								disabled={!isEditable}
							>
								{statusOptions.map((option) => (
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
							<label>Пріоритет:</label>
							<select
								name="priority"
								value={value}
								onChange={(e) => updateNodeProperty(selectedNode.id, field, e.target.value)}
								disabled={!isEditable}
							>
								{priorityOptions.map((option) => (
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
							<label>Колір:</label>
							<select
								name="color"
								value={value}
								onChange={(e) => updateNodeProperty(selectedNode.id, field, e.target.value)}
								disabled={!isEditable}
							>
								{Object.entries(nodeColors).map(([name, hex]) => (
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
							<label>Форма:</label>
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
							<label>Обмеження/ризики:</label>
							<ul className="options-list">
								{options.map((option) => (
									<li key={option.id}>
										{option.text}
										{isEditable && <button onClick={() => removeOption(selectedNode.id, option.id)}>Видалити</button>}
									</li>
								))}
							</ul>
							{isEditable && (
								<div>
									{" "}
									<input
										type="text"
										value={newOption}
										onChange={(e) => setNewOption(e.target.value)}
										placeholder="..."
										disabled={!isEditable}
									/>
									<button className="add-button" onClick={() => addOption(selectedNode.id)}>
										+
									</button>{" "}
								</div>
							)}
						</div>
					);
				}
				if (field === "description" || field === "label") {
					return (
						<div key={field} className="form-group">
							<label>{field === "description" ? "Опис" : "Назва"}</label>
							<textarea
								name={field}
								value={value}
								onChange={(e) => updateNodeProperty(selectedNode.id, field, e.target.value)}
								placeholder={`Введіть текст`}
								disabled={!isEditable}
								className="property-input"
							/>
						</div>
					);
				}
				if (field === "image") {
					return (
						<div key={field} className="form-group">
							<label>Фото (Завантаження або URL):</label>
							<input
								type="url"
								placeholder="Введіть URL фото"
								value={value.startsWith("data:") ? "" : value}
								onChange={(e) => updateNodeProperty(selectedNode.id, "image", e.target.value)}
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
											<span className="edited-indicator">(відредаговано {formatTimestamp(comment.editTimestamp)})</span>
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
				{isEditable && (
					<div className="sidebar-tabs">
						<button className={`remove-button`} onClick={() => removeNode(selectedNodeId)}>
							Видалити
						</button>
						<button className={`copy-button`} onClick={() => copyNode()}>
							Скопіювати
						</button>
					</div>
				)}
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
