import { useState, useEffect } from "react";
import * as api from "../../api";
import { toast } from "react-toastify";
import { useAuth } from "../../utils/authContext";
import MindmapCard from "../components/MindmapCard";
import { PiTelegramLogo, PiXCircle, PiPaperPlaneTilt, PiUserCircle } from "react-icons/pi";
import "../styles/InvitePopup.css";

const accessLevels = [
	{ id: "Глядач", label: "Глядач", description: "Може переглядати, але не редагувати" },
	{ id: "Коментатор", label: "Коментатор", description: "Може переглядати та коментувати" },
	{ id: "Редактор", label: "Редактор", description: "Може редагувати вміст" },
];

const InvitePopup = ({ onClose, profileUser }) => {
	const { user } = useAuth();
	const [receiverId, setReceiverId] = useState("");
	const [receiverEmail, setReceiverEmail] = useState("");
	const [receiverUsername, setReceiverUsername] = useState("");
	const [title, setTitle] = useState("");
	const [message, setMessage] = useState("");
	const [mindmaps, setMindmaps] = useState([]);
	const [selectedMindmap, setSelectedMindmap] = useState("");
	const [selectedRole, setSelectedRole] = useState(accessLevels[0].id);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [searchResults, setSearchResults] = useState([]);
	const [showSearchResults, setShowSearchResults] = useState(false);

	useEffect(() => {
		if (profileUser) {
			setReceiverId(profileUser.id);
			setReceiverEmail(profileUser.email);
			setReceiverUsername(profileUser.username || "");
		}
	}, [profileUser]);

	useEffect(() => {
		const fetchMindmaps = async () => {
			try {
				const data = await api.getPaginatedMindmaps({
					owner: user.id,
					sortOrder: "desc",
					sortBy: "updatedAt",
				});
				setMindmaps(data.mindmaps);
				if (data.mindmaps.length > 0) {
					setSelectedMindmap(data.mindmaps[0].id);
				}
			} catch (err) {
				toast.error("Не вдалося завантажити інтелект-карти");
			}
		};

		fetchMindmaps();
	}, [user.id]);

	const handleUserSearch = async (email) => {
		setReceiverEmail(email);
		if (email.length < 3) {
			setShowSearchResults(false);
			return;
		}
	};

	const handleSendInvitation = async () => {
		if (!receiverEmail) {
			toast.error("Будь ласка, введіть email користувача");
			return;
		}

		if (!selectedMindmap) {
			toast.error("Будь ласка, виберіть інтелект-карту");
			return;
		}

		setIsSubmitting(true);

		try {
			const data = {
				sender: user?.id,
				receiver: receiverId,
				mindmap: selectedMindmap,
				accessLevel: selectedRole,
				title: title || `Запрошення до співпраці над інтелект-картою`,
				message: message || `Привіт! Запрошую до співпраці над інтелект-картою.`,
			};

			await api.createInvitation(data);
			toast.success("Запрошення успішно надіслано.");
			onClose();
		} catch (error) {
			toast.error("Помилка надсилання запрошення: " + error.response.data.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const selectedMindmapObject = mindmaps.find((m) => m.id === selectedMindmap);

	return (
		<div className="invite-popup-overlay">
			<div className="invite-popup-container">
				<div className="invite-popup-header">
					<div className="invite-popup-title">
						<PiTelegramLogo />
						<h2>Запросити до співпраці</h2>
					</div>
					<button className="invite-popup-close" onClick={onClose}>
						<PiXCircle />
					</button>
				</div>

				<div className="invite-popup-content">
					<div className="invite-popup-form">
						<div className="form-group">
							<label htmlFor="invitation-receiver">Користувач</label>
							<div className="search-input-container">
								<input
									type="text"
									id="invitation-receiver"
									value={receiverEmail}
									onChange={(e) => handleUserSearch(e.target.value)}
									placeholder="Введіть email або ім'я користувача"
									className="invite-input"
									readOnly={!!profileUser}
								/>
							</div>
						</div>

						<div className="form-group">
							<label htmlFor="invitation-mindmap">Інтелект-карта</label>
							<select
								id="invitation-mindmap"
								className="invite-select"
								value={selectedMindmap}
								onChange={(e) => setSelectedMindmap(e.target.value)}
							>
								{mindmaps.length === 0 ? (
									<option value="">У вас немає інтелект-карт</option>
								) : (
									mindmaps.map((mindmap) => (
										<option key={mindmap.id} value={mindmap.id}>
											{mindmap.title}
										</option>
									))
								)}
							</select>
						</div>

						{selectedMindmapObject && (
							<div className="invite-mindmap-preview">
								<MindmapCard mindmap={selectedMindmapObject} />
							</div>
						)}

						<div className="form-group">
							<label htmlFor="invitation-access-level">Рівень доступу</label>
							<div className="access-level-selector">
								{accessLevels.map((level) => (
									<div
										key={level.id}
										className={`access-level-option ${selectedRole === level.id ? "selected" : ""}`}
										onClick={() => setSelectedRole(level.id)}
									>
										<div className="option-header">
											<span className="option-radio"></span>
											<span className="option-title">{level.label}</span>
										</div>
										<p className="option-description">{level.description}</p>
									</div>
								))}
							</div>
						</div>

						<div className="form-group">
							<label htmlFor="invitation-title">Заголовок (необов'язково)</label>
							<input
								type="text"
								id="invitation-title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Заголовок запрошення"
								className="invite-input"
							/>
						</div>

						<div className="form-group">
							<label htmlFor="invitation-message">Повідомлення (необов'язково)</label>
							<textarea
								id="invitation-message"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								placeholder="Напишіть персональне повідомлення для запрошення"
								className="invite-textarea"
								rows="3"
							/>
						</div>
					</div>
				</div>

				<div className="invite-popup-actions">
					<button className="cancel-button" onClick={onClose} disabled={isSubmitting}>
						Скасувати
					</button>
					<button
						className="send-button"
						onClick={handleSendInvitation}
						disabled={isSubmitting || !receiverEmail || !selectedMindmap}
					>
						<PiPaperPlaneTilt />
						{isSubmitting ? "Надсилання..." : "Надіслати запрошення"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default InvitePopup;
