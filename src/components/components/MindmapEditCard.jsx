import React, { useState, useEffect } from "react";
import * as api from "./../../api";
import ParticipantList from "./ParticipantList";
import "./../styles/MindmapEditCard.css";

const MindmapEditCard = ({ mindmap, onSave, onCancel }) => {
	const [title, setTitle] = useState(mindmap.title);
	const [description, setDescription] = useState(mindmap.description || "");
	const [isPublic, setIsPublic] = useState(mindmap.isPublic || false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [exportType, setExportType] = useState("png");

	useEffect(() => {
		setTitle(mindmap.title);
		setDescription(mindmap.description || "");
		setIsPublic(mindmap.isPublic || false);
	}, [mindmap]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const response = await api.updateMindmap(mindmap.id, {
				title,
				description,
				isPublic,
			});

			if (onSave) onSave(response.data);
		} catch (err) {
			console.error("Update failed:", err);
			setError("Failed to update mindmap.");
		} finally {
			setLoading(false);
		}
	};

	const handleExport = (e) => {
		e.preventDefault();
		// Handle export functionality
		console.log(`Exporting as ${exportType}`);
		// Implement export logic
	};

	return (
		<div className="mindmap-edit-card">
			<h3>Edit Mindmap</h3>
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label className="form-label">Title</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
						className="form-control"
						placeholder="Enter mindmap title"
					/>
				</div>

				<div className="form-group">
					<label className="form-label">Description</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={3}
						className="form-control"
						placeholder="Enter a brief description"
					/>
				</div>

				<div className="checkbox-wrapper">
					<input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
					<label htmlFor="isPublic">Загальнодоступна?</label>
				</div>

				<div className="export-container">
					<select className="export-select" value={exportType} onChange={(e) => setExportType(e.target.value)}>
						<option value="png">PNG</option>
						<option value="pdf">PDF</option>
					</select>
					<button type="button" className="export-button" onClick={handleExport}>
						Експорт
					</button>
				</div>

				{error && <div className="error-message">{error}</div>}

				<ParticipantList mindmap={mindmap} isEditable={false} />

				<div className="button-group">
					<button type="button" onClick={onCancel} className="btn btn-cancel">
						Cancel
					</button>
					<button type="submit" disabled={loading} className="btn btn-primary">
						{loading ? "Saving..." : "Save"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default MindmapEditCard;
