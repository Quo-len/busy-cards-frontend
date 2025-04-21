import React, { useEffect, useState } from "react";
import { Background, ReactFlow } from "reactflow";
import { useNavigate } from "react-router-dom";
import StaticMindmap from "./StaticMindmap";
import { useAuth } from "./../../utils/authContext";
import * as api from "./../../api";

const MindmapCard = ({ mindmap, onEdit }) => {
	const { isLoggedIn, user } = useAuth();
	const [isFavorite, setIsFavorite] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchFavorite = async () => {
			try {
				const response = await api.getFavorite(user._id, mindmap._id);
				if (response) {
					setIsFavorite(true);
				} else {
					setIsFavorite(true);
				}
			} catch (error) {
				setIsFavorite(false);
			}
		};
		fetchFavorite();
	}, []);

	const handleClick = () => {
		navigate(`/mindmap/${mindmap._id}`);
	};

	const handleUserClick = () => {
		navigate(`/profile/${mindmap.owner._id}`);
	};

	const getParticipantWord = (count) => {
		const lastDigit = count % 10;
		const lastTwoDigits = count % 100;

		if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "учасників";
		if (lastDigit === 1) return "учасник";
		if (lastDigit >= 2 && lastDigit <= 4) return "учасники";
		return "учасників";
	};

	const toggleFavorite = async () => {
		if (!user) {
			return;
		}

		try {
			if (isFavorite) {
				await api.deleteFavorite(user._id, mindmap._id);
				console.log("Mindmap removed from favorites");
			} else {
				await api.addFavorite(user._id, mindmap._id);
				console.log("Mindmap added to favorites");
			}
			setIsFavorite(!isFavorite);
		} catch (error) {
			console.log("Error toggling favorite:" + error.message);
		}
	};

	return (
		<div
			onClick={onEdit}
			onDoubleClick={handleClick}
			style={{
				border: "1px solid #ddd",
				borderRadius: "8px",
				padding: "15px",
				cursor: "pointer",
				transition: "all 0.2s ease",
				display: "flex",
				flexDirection: "column",
				backgroundColor: "#ffffff",
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
				e.currentTarget.style.backgroundColor = "#f9f9f9";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.boxShadow = "none";
				e.currentTarget.style.backgroundColor = "#ffffff";
			}}
		>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "stretch", gap: "20px" }}>
				<div style={{ width: "100%", height: "200px", minWidth: "200px" }}>
					<StaticMindmap nodes={mindmap.nodes} edges={mindmap.edges} panOnDrag={false} />
				</div>

				<div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
					<div>
						<h3 style={{ margin: "0 0 8px 0" }}>{mindmap.title || "Untitled Mindmap"}</h3>
						<p style={{ margin: "0 0 10px 0", color: "#555" }}>{mindmap.description || "No description"}</p>
					</div>

					<div style={{ marginTop: "auto" }}>
						<div
							style={{
								display: "flex",
								fontSize: "0.8rem",
								color: "#888",
								justifyContent: "space-between",
							}}
						>
							<div>Created: {new Date(mindmap.createdAt).toLocaleDateString()}</div>
							{mindmap.lastModified && <div>Modified: {new Date(mindmap.lastModified).toLocaleDateString()}</div>}
						</div>

						<div>{mindmap.isPublic ? "Загальнодоступна" : "Приватна"}</div>

						<div>
							Власник: <strong onClick={handleUserClick}>{mindmap.owner.username}</strong>
						</div>

						{isLoggedIn && <div onClick={toggleFavorite}>{isFavorite ? "UnLike" : "Like"}</div>}

						<div>
							{mindmap.participants.length !== 0
								? `Спільна робота: ${mindmap.participants.length} ${getParticipantWord(mindmap.participants.length)}`
								: "Учасники відсутні"}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MindmapCard;
