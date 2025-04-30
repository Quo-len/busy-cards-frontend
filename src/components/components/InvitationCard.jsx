import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import MindmapCard from "./MindmapCard";
import { useAuth } from "./../../utils/authContext";
import * as api from "./../../api";
import "../styles/InvitationCard.css";

const InvitationCard = ({ invitation, onEdit }) => {
	const navigate = useNavigate();
	const { user } = useAuth();

	useEffect(() => {
		const fetchFavorite = async () => {
			try {
				const response = await api.getFavorite(user._id, mindmap._id);
				setIsFavorite(!!response);
			} catch {
				setIsFavorite(false);
			}
		};
		fetchFavorite();
	}, [user?._id, mindmap._id]);

	const handleSenderClick = () => {
		navigate(`/mindmap/${mindmap._id}`);
	};

	const handleClick = () => {
		navigate(`/profile/${mindmap.owner._id}`);
	};

	return (
		<div>
			<div>{invitation?.title}</div>
			<div>{invitation?.message}</div>
			<button onClick={onEdit}>Видалити</button>
			<div>
				Відравник:
				<strong onClick={() => navigate(`/profile/${invitation?.sender._id}`)}>{invitation?.sender.username}</strong>
			</div>
			<div>
				Отримувач:
				<strong onClick={() => navigate(`/profile/${invitation?.receiver._id}`)}>
					{invitation?.receiver.username}
				</strong>
			</div>
			<MindmapCard mindmap={invitation?.mindmap} onEdit={() => {}} />
			<button>Прийняти</button>
			<button>Відхилити</button>
		</div>
	);
};

export default InvitationCard;
