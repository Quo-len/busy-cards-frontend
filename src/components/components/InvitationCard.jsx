import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "../styles/mindmapcard.css";
import MindmapCard from "./MindmapCard";

const InvitationCard = ({ invitation, onEdit }) => {
	const navigator = useNavigate();

	return (
		<div>
			<div>{invitation.title}</div>
			<div>{invitation.message}</div>
			<button onClick={onEdit}>Видалити</button>
			<div>
				Відравник:
				<strong onClick={() => navigator(`/profile/${invitation.sender._id}`)}>{invitation.sender.username}</strong>
			</div>
			<div>
				Отримувач:
				<strong onClick={() => navigator(`/profile/${invitation.receiver._id}`)}>{invitation.receiver.username}</strong>
			</div>
			<MindmapCard mindmap={invitation.mindmap} onEdit={() => {}} />
			<button>Прийняти</button>
			<button>Відхилити</button>
		</div>
	);
};

export default InvitationCard;
