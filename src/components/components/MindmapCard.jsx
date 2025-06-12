import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StaticMindmap from "./StaticMindmap";
import { useAuth } from "./../../utils/authContext";
import * as api from "./../../api";
import { MdOutlineDateRange, MdPublic, MdPublicOff } from "react-icons/md";
import { RxUpdate } from "react-icons/rx";
import { GoHeartFill, GoHeart } from "react-icons/go";
import { FaUsers } from "react-icons/fa";
import "../styles/MindmapCard.css";

const MindmapCard = ({ mindmap, onEdit }) => {
	const { user } = useAuth();
	const [isFavorite, setIsFavorite] = useState(false);

	useEffect(() => {
		const fetchFavorite = async () => {
			try {
				const response = await api.getFavorite(user.id, mindmap.id);
				setIsFavorite(!!response);
			} catch {
				setIsFavorite(false);
			}
		};
		if (user?.id && mindmap?.id) {
			fetchFavorite();
		}
	}, [user?.id, mindmap?.id]);

	const getParticipantWord = (count) => {
		const lastDigit = count % 10;
		const lastTwoDigits = count % 100;

		if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "учасників";
		if (lastDigit === 1) return "учасник";
		if (lastDigit >= 2 && lastDigit <= 4) return "учасники";
		return "учасників";
	};

	const toggleFavorite = async (e) => {
		e.preventDefault();
		e.stopPropagation();

		if (!user) {
			return;
		}

		try {
			if (isFavorite) {
				await api.deleteFavorite(user.id, mindmap.id);
			} else {
				await api.addFavorite(user.id, mindmap.id);
			}
			setIsFavorite(!isFavorite);
		} catch (error) {
			console.error("Error toggling favorite:", error);
		}
	};

	return (
		<div className="mindmap-card-container">
			<div className="mindmap-card-actions">
				<button className="icon-button" onClick={toggleFavorite}>
					{isFavorite ? <GoHeartFill className="favorite-active" /> : <GoHeart />}
				</button>
				<button className="icon-button">
					{mindmap.isPublic ? <MdPublic className="public-icon" /> : <MdPublicOff />}
				</button>
			</div>
			<div className="mindmap-card" onClick={onEdit}>
				<div className="mindmap-preview">
					<StaticMindmap nodes={mindmap.nodes} edges={mindmap.edges} panOnDrag={false} />
				</div>
				<div className="mindmap-content">
					<div className="mindmap-user">
						<Link to={`/profile/${mindmap.owner.id}`} className="mindmap-avatar" onClick={(e) => e.stopPropagation()}>
							{mindmap.owner?.avatar ? (
								<img src={mindmap.owner.avatar} alt={mindmap.owner.username || "User"} />
							) : (
								<div className="avatar-placeholder">{(mindmap.owner.username || "U")[0].toUpperCase()}</div>
							)}
						</Link>
						<Link to={`/profile/${mindmap.owner.id}`} className="mindmap-username" onClick={(e) => e.stopPropagation()}>
							{mindmap.owner.username || "Unknown User"}
						</Link>
					</div>

					<h3 className="mindmap-title">
						<Link className="mindmap-link" to={`/mindmap/${mindmap.id}`} onClick={(e) => e.stopPropagation()}>
							{mindmap.title || "Untitled Mindmap"}
						</Link>
					</h3>

					<p className="mindmap-description">{mindmap.description || "No description"}</p>

					<div className="mindmap-meta">
						<div className="meta-item">
							<FaUsers className="meta-icon" />
							<span className="meta-text">
								{mindmap.participants?.length || 0} {getParticipantWord(mindmap.participants?.length || 0)}
							</span>
						</div>
						<div className="meta-item">
							<MdOutlineDateRange className="meta-icon" />
							<span className="meta-text">{new Date(mindmap.createdAt).toLocaleDateString()}</span>
						</div>
						{mindmap.updatedAt && (
							<div className="meta-item">
								<RxUpdate className="meta-icon" />
								<span className="meta-text">{new Date(mindmap.updatedAt).toLocaleDateString()}</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default MindmapCard;
