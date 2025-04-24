import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StaticMindmap from "./StaticMindmap";
import { useAuth } from "./../../utils/authContext";
import * as api from "./../../api";
import { Card, CardContent, CardMedia, Typography, Box, Stack, IconButton, Avatar } from "@mui/material";
import { MdOutlineDateRange, MdPublic, MdPublicOff } from "react-icons/md";
import { RxUpdate } from "react-icons/rx";
import { GoHeartFill, GoHeart } from "react-icons/go";
import { FaUsers } from "react-icons/fa";
import PropTypes from "prop-types";

const MindmapCard = ({ mindmap, onEdit }) => {
	const { user } = useAuth();
	const [isFavorite, setIsFavorite] = useState(false);
	const navigate = useNavigate();

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

	const handleClick = () => {
		navigate(`/mindmap/${mindmap._id}`);
	};

	const handleUserClick = (e) => {
		e.stopPropagation();
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
			} else {
				await api.addFavorite(user._id, mindmap._id);
			}
			setIsFavorite(!isFavorite);
		} catch (error) {
			console.error("Error toggling favorite:", error);
		}
	};

	return (
		<Box
			sx={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				position: "relative",
			}}
		>
			<Box
				sx={{
					position: "absolute",
					top: 8,
					right: 8,
					display: "flex",
					gap: 1,
					zIndex: 2,
					backgroundColor: "rgba(255, 255, 255, 0.9)",
					padding: "4px 8px",
					borderRadius: "12px",
				}}
			>
				<IconButton
					size="small"
					onClick={(e) => {
						e.stopPropagation();
						toggleFavorite();
					}}
					sx={{
						color: isFavorite ? "red" : "inherit",
						"&:hover": {
							backgroundColor: "rgba(0, 0, 0, 0.04)",
						},
					}}
				>
					{isFavorite ? <GoHeartFill /> : <GoHeart />}
				</IconButton>
				<IconButton
					size="small"
					sx={{
						color: mindmap.isPublic ? "primary.main" : "inherit",
						"&:hover": {
							backgroundColor: "rgba(0, 0, 0, 0.04)",
						},
					}}
				>
					{mindmap.isPublic ? <MdPublic /> : <MdPublicOff />}
				</IconButton>
			</Box>
			<Card
				sx={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					transition: "transform 0.2s",
					"&:hover": {
						transform: "scale(1.02)",
						cursor: "pointer",
					},
				}}
				onClick={onEdit}
			>
				<CardMedia
					sx={{
						height: 200,
						position: "relative",
						overflow: "hidden",
						flexShrink: 0,
					}}
				>
					<Box
						sx={{
							width: "100%",
							height: "100%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: "#f5f5f5",
						}}
					>
						<StaticMindmap nodes={mindmap.nodes} edges={mindmap.edges} panOnDrag={false} />
					</Box>
				</CardMedia>
				<CardContent
					sx={{
						flexGrow: 1,
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
					}}
				>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1,
							mb: 1,
						}}
					>
						<Avatar
							sx={{
								width: 32,
								height: 32,
								cursor: "pointer",
								"&:hover": {
									opacity: 0.8,
								},
							}}
							onClick={handleUserClick}
							src={mindmap.owner?.avatar}
							alt={mindmap.owner?.username || "User"}
						>
							{(mindmap.owner?.username || "U")[0].toUpperCase()}
						</Avatar>
						<Typography
							variant="subtitle2"
							onClick={handleUserClick}
							sx={{
								cursor: "pointer",
								"&:hover": {
									color: "primary.main",
								},
							}}
						>
							{mindmap.owner?.username || "Unknown User"}
						</Typography>
					</Box>
					<Typography
						gutterBottom
						variant="h5"
						component="div"
						onClick={handleClick}
						sx={{
							"&:hover": {
								color: "primary.main",
							},
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{mindmap.title || "Untitled Mindmap"}
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{
							mb: 2,
							flexGrow: 1,
							display: "-webkit-box",
							WebkitLineClamp: 3,
							WebkitBoxOrient: "vertical",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}
					>
						{mindmap.description || "No description"}
					</Typography>
					<Stack
						direction="row"
						spacing={2}
						alignItems="center"
						sx={{
							color: "text.secondary",
							mt: "auto",
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
							<FaUsers />
							<Typography variant="caption">
								{mindmap.participants?.length || 0} {getParticipantWord(mindmap.participants?.length || 0)}
							</Typography>
						</Box>
						<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
							<MdOutlineDateRange />
							<Typography variant="caption">{new Date(mindmap.createdAt).toLocaleDateString()}</Typography>
						</Box>
						{mindmap.lastModified && (
							<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
								<RxUpdate />
								<Typography variant="caption">{new Date(mindmap.lastModified).toLocaleDateString()}</Typography>
							</Box>
						)}
					</Stack>
				</CardContent>
			</Card>
		</Box>
	);
};

MindmapCard.propTypes = {
	mindmap: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		title: PropTypes.string,
		description: PropTypes.string,
		createdAt: PropTypes.string.isRequired,
		lastModified: PropTypes.string,
		nodes: PropTypes.array.isRequired,
		edges: PropTypes.array.isRequired,
		owner: PropTypes.shape({
			_id: PropTypes.string.isRequired,
			name: PropTypes.string,
			avatar: PropTypes.string,
		}).isRequired,
		isPublic: PropTypes.bool,
		participants: PropTypes.array,
	}).isRequired,
	onEdit: PropTypes.func.isRequired,
};

export default MindmapCard;
