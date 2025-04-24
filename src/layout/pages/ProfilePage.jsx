import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as api from "./../../api";
import "../styles/ProfilePage.css";
import MindmapList from "../../components/components/MindmapList";
import Loader from "../../components/components/Loader";
import NotFoundPage from "./NotFoundPage";
import { PiGraphBold } from "react-icons/pi";

const ProfilePage = () => {
	const { userId } = useParams();
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await api.getUser(userId);
				setUser(response);
				console.log(response);
			} catch (error) {
				console.log("Failed to get user");
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

	if (isLoading) {
		return <Loader message="Завантаження профілю користувача, зачекайте" />;
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
							{new Date(user?.lastLogin).toLocaleDateString("uk-UA", {
								day: "numeric",
								month: "long",
								year: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</div>
					</div>

					{user?.bio && <div className="profile-bio">{user.bio}</div>}

					<button className="invite-button">Запросити до співпраці</button>
				</div>
			</div>

			<div className="mindmaps-section">
				<div className="section-title">
					<PiGraphBold className="logo" />
					<h3>Інтелект-карти користувача</h3>
				</div>
				<MindmapList userId={userId} />
			</div>
		</div>
	);
};

export default ProfilePage;
