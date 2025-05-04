import { useNavigate } from "react-router-dom";
import MindmapCard from "./MindmapCard";
import { useAuth } from "./../../utils/authContext";
import "../styles/InvitationCard.css";
import * as api from "../../api";
import { toast } from "react-toastify";

const InvitationCard = ({ invitation, onEdit }) => {
	const navigate = useNavigate();
	const { user } = useAuth();

	const handleReply = async (status) => {
		try {
			await api.updateInvitation(invitation.id, { status });
			if (status == "Принято") {
				navigate(`/mindmap/${invitation.mindmap.id}`);
			}
			toast.success("Відповідь успішно надіслана.");
		} catch (error) {
			toast.error("Помилка надсилання відповіді.");
		}
		onEdit();
	};

	const handleDelete = async (status) => {
		if (window.confirm("Ви впевнені, що хочете видалити запрошення? Цю дію не можна скасувати.")) {
			try {
				await api.deleteInvitation(invitation.id);
				toast.success("Запрошення усішно видалено.");
			} catch (error) {
				console.log(error);
				toast.error("Помилка видалення запрошення.");
			}
			onEdit();
		}
	};

	// Helper function to determine status class
	const getStatusClass = (status) => {
		if (status === "Принято") return "accepted";
		if (status === "Відхилено") return "declined";
		return "pending";
	};

	return (
		<div className="invitation-card">
			<div className="invitation-header">
				<h3 className="invitation-title">{invitation?.title}</h3>
				<div className="invitation-controls">
					{invitation.sender.id === user.id && (
						<button className="delete-button" onClick={handleDelete}>
							Видалити
						</button>
					)}
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

				<div className="invitation-user">
					<span className="user-label">Статус:</span>
					<span className={`status-badge ${getStatusClass(invitation?.status)}`}>{invitation?.status}</span>
				</div>
			</div>

			<div style={{ padding: "10px" }}>
				<MindmapCard mindmap={invitation?.mindmap} onEdit={() => {}} />
			</div>

			{invitation.receiver.id === user.id && invitation?.status === "В очікуванні" && (
				<div className="invitation-actions">
					<button
						className="invitation-button accept-button"
						onClick={() => {
							handleReply("Принято");
						}}
					>
						Прийняти
					</button>
					<button
						className="invitation-button decline-button"
						onClick={() => {
							handleReply("Відхилено");
						}}
					>
						Відхилити
					</button>
				</div>
			)}
		</div>
	);
};

export default InvitationCard;
