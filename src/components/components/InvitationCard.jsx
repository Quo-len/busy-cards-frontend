import React from "react";
import { useNavigate } from "react-router-dom";
import MindmapCard from "./MindmapCard";
import { useAuth } from "./../../utils/authContext";
import "../styles/InvitationCard.css";
import * as api from "../../api";
import { toast } from "react-toastify";

const InvitationCard = ({ invitation, onEdit }) => {
	const navigate = useNavigate();
	const { user } = useAuth();

	const handleReply = (status) => {
		try {
			const response = api.updateInvitation(invitation.id, { status });
			toast.success("Відповідь успішно надіслана");
		} catch (error) {
			toast.error("Помилка надсилання відповіді.");
		}
	};

	const handleDelete = (status) => {
		try {
			const response = api.deleteInvitation(invitation.id);
			toast.success("Відповідь успішно надіслана");
		} catch (error) {
			toast.error("Помилка видалення запрошення.");
		}
	};

	return (
		<div className="invitation-card">
			<div className="invitation-header">
				<h3 className="invitation-title">{invitation?.title}</h3>
				<div className="invitation-controls">
					<button className="delete-button" onClick={onEdit}>
						Видалити
					</button>
				</div>
			</div>

			<div className="invitation-message">{invitation?.message}</div>

			<div className="invitation-users">
				<div className="invitation-user sender">
					<span className="user-label">Відправник:</span>
					<span className="user-name" onClick={() => navigate(`/profile/${invitation?.sender.id}`)}>
						{invitation?.sender.username}
					</span>
				</div>

				<div className="invitation-user receiver">
					<span className="user-label">Отримувач:</span>
					<span className="user-name" onClick={() => navigate(`/profile/${invitation?.receiver.id}`)}>
						{invitation?.receiver.username}
					</span>
				</div>

				<div className="invitation-status">
					<span className="status-label">Статус:</span>
					<span className="status">{invitation?.status}</span>
				</div>
			</div>

			<div style={{ padding: "10px" }}>
				<MindmapCard mindmap={invitation?.mindmap} onEdit={() => {}} />
			</div>

			<div className="invitation-actions">
				<button className="invitation-button accept-button">Прийняти</button>
				<button className="invitation-button decline-button">Відхилити</button>
			</div>
		</div>
	);
};

export default InvitationCard;
