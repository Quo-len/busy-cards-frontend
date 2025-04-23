import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as api from "./../../api";
import "../styles/ProfilePage.css";
import MindmapList from "../../components/components/MindmapList";
import Loader from "../../components/components/Loader";
import NotFound from "../../components/components/NotFound";

const ProfilePage = () => {
	const [isLoading, setIsLoading] = useState(true);
	const { userId } = useParams();
	const [user, setUser] = useState(null);

	useEffect(() => {
		if (userId) {
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
			fetchUser();
		}
	}, []);

	useEffect(() => {
		document.title = `Профіль: ${user?.username} - Busy-cards`;
	}, [user]);

	if (isLoading) {
		return <Loader message="Завантаження профілю користувача, зачекайте" />;
	}

	if (!user) {
		return <NotFound message="Користувача не знайдено, перевірте посилання" />;
	}

	return (
		<div>
			{user?.avatar ? (
				<img src={user.avatar} alt="Profile" className="profile-photo" />
			) : (
				<div className="profile-initials">{user?.username ? user.username.charAt(0).toUpperCase() : "U"}</div>
			)}
			<div>Ім&apos;я</div>
			<div>{user?.username}</div>
			<div>Пошта:</div>
			<div>{user?.email}</div>
			<div>Приєднався:</div>
			<div>{new Date(user?.createdAt).toLocaleDateString()}</div>
			<div>Остання активність:</div>
			<div>{new Date(user?.lastLogin).toLocaleDateString()}</div>
			<div>Про себе:</div>
			<div>{user?.bio}</div>
			<button>Запросити</button>
			<div>Інтелект-карти:</div>
			{}
		</div>
	);
};

export default ProfilePage;
