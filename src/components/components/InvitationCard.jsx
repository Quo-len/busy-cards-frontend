import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "../styles/mindmapcard.css";
import MindmapCard from "./MindmapCard";

const InvitationCard = ({ invitation }) => {
	const navigator = useNavigate();

	return (
		<div>
			<div>{invitation.title}</div>
			<div>{invitation.message}</div>
			<div onClick={() => navigator(`/profile/${invitation.user._id}`)}>{invitation.user.username}</div>
			<MindmapCard mindmap={invitation.mindmap} onEdit={() => {}} />
			<button>Прийняти</button>
			<button>Відхилити</button>
		</div>
	);
};

export default InvitationCard;
