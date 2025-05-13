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
import InvitePopup from "../../components/components/InvitePopup";
import { useAuth } from "../../utils/authContext";

const ProfilePage = () => {
	const { user, isLoggedIn } = useAuth();
	const { userId } = useParams();
	const [profileUser, setProfileUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	const [sortBy, setSortBy] = useState("updatedAt");
	const [sortOrder, setSortOrder] = useState("desc");
	const [itemsPerPage, setItemsPerPage] = useState(5);

	const [isPopupOpen, setIsPopupOpen] = useState(false);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await api.getUser(userId);
				setProfileUser(response);
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
		if (profileUser && profileUser.username) {
			document.title = `Профіль: ${profileUser?.username} - Busy-cards`;
		}
	}, [profileUser]);

	const filters = useMemo(
		() => ({
			sortBy: sortBy,
			sortOrder: sortOrder,
			itemsPerPage: itemsPerPage,
			owner: profileUser?.id,
			isPublic: true,
		}),
		[sortBy, sortOrder, itemsPerPage, profileUser]
	);

	if (isLoading) {
		return <Loader message="Завантаження профілю користувача, зачекайте" flexLayout="true" fullPage="true" />;
	}

	if (!profileUser) {
		return <NotFoundPage title="Профіль не знайдено" message="Користувача не знайдено, перевірте посилання." />;
	}

	return (
		<div>
			{isPopupOpen && <InvitePopup onClose={() => setIsPopupOpen(false)} profileUser={profileUser} />}
			<div className="profile-container">
				<div className="profile-header">
					<div className="profile-photo-container">
						{profileUser?.avatar ? (
							<img src={profileUser.avatar} alt="Profile" className="profile-photo" />
						) : (
							<div className="profile-initials">
								{profileUser?.username ? profileUser.username.charAt(0).toUpperCase() : "U"}
							</div>
						)}
					</div>

					<div className="profile-info">
						<h1 className="profile-username">{profileUser?.username}</h1>

						<div className="profile-details">
							<div className="profile-label">Пошта:</div>
							<div className="profile-value">{profileUser?.email}</div>

							<div className="profile-label">Приєднався:</div>
							<div className="profile-value">
								{new Date(profileUser?.createdAt).toLocaleDateString("uk-UA", {
									day: "numeric",
									month: "long",
									year: "numeric",
								})}
							</div>

							<div className="profile-label">Остання активність:</div>
							<div className="profile-value">
								{new Date(profileUser?.updatedAt).toLocaleDateString("uk-UA", {
									day: "numeric",
									month: "long",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</div>
						</div>

						{profileUser?.bio && <FormattedBio bioText={profileUser.bio} />}

						{isLoggedIn && user?.id !== profileUser?.id && (
							<button
								className="invite-button"
								onClick={() => {
									setIsPopupOpen(true);
								}}
							>
								<PiTelegramLogo /> Запросити до співпраці
							</button>
						)}
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
		</div>
	);
};

export default ProfilePage;
