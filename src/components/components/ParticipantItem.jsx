import React, { useState } from "react";
import * as api from "./../../api";
import "./../styles/ParticipantItem.css";

const accessLevels = ["Глядач", "Коментатор", "Редактор"];

const ParticipantItem = ({ participant, isEditable, onRemove }) => {
	const [selectedRole, setSelectedRole] = useState(participant.accessLevel);

	const handleAccessLevelChange = async (e) => {
		const newLevel = e.target.value;
		setSelectedRole(newLevel);

		try {
			await api.updateParticipant(participant.mindmap, participant.user.id, newLevel);
		} catch (error) {
			console.error("Failed to update access level:", error);
			setSelectedRole(participant.accessLevel);
		}
	};

	const handleRemoveParticipant = async () => {
		try {
			console.log("remove");
			await api.deleteParticipant(participant.mindmap, participant.user.id);
			onRemove(participant.id);
		} catch (error) {
			console.error("Failed to remove participant:", error);
		}
	};

	const getInitials = () => {
		const username = participant.user.username || "";
		return username.charAt(0).toUpperCase();
	};

	const formatDate = () => {
		try {
			if (!participant.joinedAt) return "";
			const date = new Date(participant.joinedAt);
			return date.toLocaleDateString();
		} catch (e) {
			return participant.joinedAt || "";
		}
	};

	return (
		<div className="participant-item">
			<div className="participant-avatar">
				{participant.user?.avatar ? (
					<img src={participant.user.avatar} alt={participant.user.username} />
				) : (
					getInitials()
				)}
			</div>

			<div className="participant-info">
				<div className="participant-name">{participant.user.username}</div>
				<div className="participant-email">{participant.user.email}</div>
				<div className="participant-joined">{formatDate()}</div>
			</div>

			<div className="participant-controls">
				{isEditable ? (
					<>
						<select className="access-level-select" value={selectedRole} onChange={handleAccessLevelChange}>
							{accessLevels.map((level) => (
								<option key={level} value={level}>
									{level}
								</option>
							))}
						</select>
						<div className="remove-participant" onClick={handleRemoveParticipant}>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<polyline points="3 6 5 6 21 6"></polyline>
								<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
								<line x1="10" y1="11" x2="10" y2="17"></line>
								<line x1="14" y1="11" x2="14" y2="17"></line>
							</svg>
							<span style={{ marginLeft: "4px" }}>Вигнати</span>
						</div>
					</>
				) : (
					<div className="access-level-display">{participant.accessLevel}</div>
				)}
			</div>
		</div>
	);
};

export default ParticipantItem;
