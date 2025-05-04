import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import * as api from "./../../api";
import MindmapList from "../../components/components/MindmapList";
import Loader from "../../components/components/Loader";
import NotFoundPage from "./NotFoundPage";
import FormattedBio from "../../components/components/FormattedBio";
import { PiGraphBold } from "react-icons/pi";
import { PiTelegramLogo } from "react-icons/pi";
import "../styles/ProfilePage.css";
import FiltersPanel from "../../components/components/FiltersPanel";

const ProfilePage = () => {
	const { userId } = useParams();
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	const [sortBy, setSortBy] = useState("updatedAt");
	const [sortOrder, setSortOrder] = useState("desc");
	const [itemsPerPage, setItemsPerPage] = useState(5);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await api.getUser(userId);
				setUser(response);
			} catch (error) {
				console.log("Failed to get user: " + error.response);
			}
			setIsLoading(false);
		};
		if (userId) {
			fetchUser();
		}
	}, []);

	useEffect(() => {
		if (user && user.username) {
			document.title = `Профіль: ${user?.username} - Busy-cards`;
		}
	}, [user]);

	const filters = useMemo(
		() => ({
			sortBy: sortBy,
			sortOrder: sortOrder,
			itemsPerPage: itemsPerPage,
			owner: user?.id,
			isPublic: true,
		}),
		[sortBy, sortOrder, itemsPerPage, user]
	);

	if (isLoading) {
		return <Loader message="Завантаження профілю користувача, зачекайте" flexLayout="true" fullPage="true" />;
	}

	if (!user) {
		return <NotFoundPage title="Профіль не знайдено" message="Користувача не знайдено, перевірте посилання." />;
	}

	return (
		<div className="profile-container">
			<div className="profile-header">
				<div className="profile-photo-container">
					{user?.avatar ? (
						<img src={user.avatar} alt="Profile" className="profile-photo" />
					) : (
						<div className="profile-initials">{user?.username ? user.username.charAt(0).toUpperCase() : "U"}</div>
					)}
				</div>

				<div className="profile-info">
					<h1 className="profile-username">{user?.username}</h1>

					<div className="profile-details">
						<div className="profile-label">Пошта:</div>
						<div className="profile-value">{user?.email}</div>

						<div className="profile-label">Приєднався:</div>
						<div className="profile-value">
							{new Date(user?.createdAt).toLocaleDateString("uk-UA", {
								day: "numeric",
								month: "long",
								year: "numeric",
							})}
						</div>

						<div className="profile-label">Остання активність:</div>
						<div className="profile-value">
							{new Date(user?.updatedAt).toLocaleDateString("uk-UA", {
								day: "numeric",
								month: "long",
								year: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</div>
					</div>

					{user?.bio && <FormattedBio bioText={user.bio} />}

					<button className="invite-button">
						<PiTelegramLogo /> Запросити до співпраці
					</button>
				</div>
			</div>

			<div className="mindmaps-section">
				<div className="section-title">
					<PiGraphBold className="logo" />
					<h3>Інтелект-карти користувача</h3>
				</div>
				<div className="mindmaps-content">
					<div className="mindmaps-list-container">
						<MindmapList filters={filters} />
					</div>
					<FiltersPanel
						className="profile-filters-panel"
						sortBy={sortBy}
						setSortBy={setSortBy}
						sortOrder={sortOrder}
						setSortOrder={setSortOrder}
						itemsPerPage={itemsPerPage}
						setItemsPerPage={setItemsPerPage}
					/>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
