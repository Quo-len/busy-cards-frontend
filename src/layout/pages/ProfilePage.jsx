import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as api from "./../../api";
import "../styles/profilepage.css";
import MindmapList from "../../components/components/MindmapList";

const ProfilePage = () => {
	const { userId } = useParams();
	const [user, setUser] = useState(null);

	useEffect(() => {
		fetchUser();
	}, []);

	const fetchUser = async () => {
		try {
			const response = await api.getUser(userId);
			setUser(response);
		} catch (error) {
			console.log("Failed to get user");
		}
	};

	useEffect(() => {
		document.title = `Profile ${user.username} - Busy-cards`;
	}, [user]);

	return (
		<div>
			<img src="" alt="Profile image" />
			<div>Ім&apos;я</div>
			<div>{user.username}</div>
			<div>Пошта:</div>
			<div>{user.email}</div>
			<div>Приєднався:</div>
			<div>{user.createdAt}</div>
			<div>Остання активність:</div>
			<div>{user.lastLogin}</div>
			<div>Про себе:</div>
			<div>{user.about}</div>
			<button>Запросити</button>
			<div>Інтелект-карти:</div>
			{}
		</div>
	);
};

export default ProfilePage;
