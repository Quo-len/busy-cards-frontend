import React, { useState, useEffect } from "react";
import * as api from "./../../api";
import ParticipantList from "./ParticipantList";

const MindmapEditCard = ({ mindmap, onSave, onCancel }) => {
	const [title, setTitle] = useState(mindmap.title);
	const [description, setDescription] = useState(mindmap.description || "");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		setTitle(mindmap.title);
		setDescription(mindmap.description);
	}, [mindmap]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const response = await api.updateMindmap(mindmap._id, { title, description });

			if (onSave) onSave(response.data);
		} catch (err) {
			console.error("Update failed:", err);
			setError("Failed to update mindmap.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			style={{
				border: "1px solid #ddd",
				padding: "20px",
				borderRadius: "8px",
				backgroundColor: "#f9f9f9",
			}}
		>
			<h3>Edit Mindmap</h3>
			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: "10px" }}>
					<label style={{ display: "block", fontWeight: "bold" }}>Title</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
						style={{
							width: "100%",
							padding: "8px",
							borderRadius: "4px",
							border: "1px solid #ccc",
						}}
					/>
				</div>
				<div style={{ marginBottom: "10px" }}>
					<label style={{ display: "block", fontWeight: "bold" }}>Description</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={3}
						style={{
							width: "100%",
							padding: "8px",
							borderRadius: "4px",
							border: "1px solid #ccc",
						}}
					/>
				</div>

				{error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

				<div>
					<div>Загальнодоступна?</div>
					<input type="checkbox" />
				</div>

				<div>
					<select name="type">
						<option value="png">PNG</option>
						<option value="pdf">PDF</option>
					</select>
					<button>Експорт</button>
				</div>

				<ParticipantList mindmap={mindmap} isEditable={false} />

				<div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
					<button
						type="button"
						onClick={onCancel}
						style={{
							padding: "8px 12px",
							backgroundColor: "#ccc",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
						}}
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={loading}
						style={{
							padding: "8px 12px",
							backgroundColor: "#3498db",
							color: "white",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
						}}
					>
						{loading ? "Saving..." : "Save"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default MindmapEditCard;
