import React, { useState, useEffect } from "react";
import ParticipantList from "./ParticipantList";
import "./../styles/MindmapEditCard.css";
import { useAuth } from "../../utils/authContext";
import { toast } from "react-toastify";
import * as api from "../../api";

const MindmapEditCard = ({ mindmap, onSave, onCancel, onDelete }) => {
	const { user, isLoggedIn } = useAuth();
	const [title, setTitle] = useState(mindmap.title);
	const [description, setDescription] = useState(mindmap.description || "");
	const [isPublic, setIsPublic] = useState(mindmap.isPublic || false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [exportType, setExportType] = useState("png");

	const isOwner = mindmap.owner?.id === user?.id;

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

			if (onDelete) onSave(response.data);
		} catch (err) {
			console.error("Update failed:", err);
			setError("Failed to update mindmap.");
		} finally {
			setLoading(false);
		}
	};

	const handleExport = (e) => {
		e.preventDefault();
		console.log(`Exporting as ${exportType}`);
	};

	const handleDeleteMindmap = async () => {
		if (window.confirm("Ви впевнені, що хочете видалити інтелект-карту? Цю дію не можна скасувати.")) {
			try {
				await api.deleteMindmap(mindmap.id);

				toast.success(`Інтелект-карту успішно видалено.`);
				if (onDelete) onDelete();
			} catch (error) {
				toast.error(`Не вдалося видалити Інтелект-карту: ${error.message}`);
			}
		}
	};

	return (
		<div className="mindmap-edit-card">
			<h3>Редагування інтелект-карти:</h3>
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					{isOwner && (
						<div className="button-group">
							<button type="submit" disabled={loading} className="btn btn-primary">
								{loading ? "Збереження..." : "Зберегти"}
							</button>
							<button type="button" onClick={onCancel} className="btn btn-cancel">
								Відміна
							</button>
							<button type="button" onClick={handleDeleteMindmap} className="btn-danger">
								Видалити
							</button>
						</div>
					)}
					<label className="form-label">Назва</label>

					{isOwner ? (
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
							className="form-control"
							placeholder="Введіть назву інтелект-карти"
						/>
					) : (
						<div className="readonly-text">{title}</div>
					)}
				</div>

				<div className="form-group">
					<label className="form-label">Опис</label>
					{isOwner ? (
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							className="form-control"
							placeholder="Введіть короткий опис"
						/>
					) : (
						<div className="readonly-text">{description}</div>
					)}
				</div>

				{isOwner && (
					<div className="checkbox-wrapper">
						<input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
						<label htmlFor="isPublic">Загальнодоступна?</label>
					</div>
				)}

				<div className="export-container">
					<select
						className="export-select"
						value={exportType}
						onChange={(e) => setExportType(e.target.value)}
						disabled={!isOwner}
					>
						<option value="png">PNG</option>
						<option value="pdf">PDF</option>
					</select>
					<button type="button" className="export-button" onClick={handleExport} disabled={!isOwner}>
						Експорт
					</button>
				</div>

				{error && <div className="error-message">{error}</div>}

				<ParticipantList mindmap={mindmap} isEditable={false} />
			</form>
		</div>
	);
};

export default MindmapEditCard;
