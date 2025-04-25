import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import * as api from "./../../api";
import MindmapList from "../../components/components/MindmapList";
import Loader from "../../components/components/Loader";
import NotFoundPage from "./NotFoundPage";
import { PiGraphBold } from "react-icons/pi";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
	const { userId } = useParams();
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	const [sortBy, setSortBy] = useState("lastModified");
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
			owner: user?._id,
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
				<div className="mindmaps-content">
					<div className="mindmaps-list-container">
						<MindmapList filters={filters} />
					</div>
					<div className="profile-filters-panel">
						<h3 className="profile-filters-title">Фільтри</h3>
						<div className="profile-filters-group">
							<div className="profile-filter-item">
								<label htmlFor="sort-filter">Сортування:</label>
								<select
									id="sort-filter"
									value={`${sortBy}-${sortOrder}`}
									onChange={(e) => {
										const [newSortBy, newSortOrder] = e.target.value.split("-");
										setSortBy(newSortBy);
										setSortOrder(newSortOrder);
									}}
								>
									<option value="lastModified-desc">Останні зміни</option>
									<option value="lastModified-asc">Найстаріші зміни</option>
									<option value="createdAt-desc">Нещодавно створені</option>
									<option value="createdAt-asc">Найстаріші створення</option>
									<option value="title-asc">Назва (А-Я)</option>
									<option value="title-desc">Назва (Я-А)</option>
								</select>
							</div>

							<div className="profile-filter-item">
								<label htmlFor="items-per-page">Елементів на сторінці:</label>
								<select
									id="items-per-page"
									value={itemsPerPage}
									onChange={(e) => {
										setItemsPerPage(parseInt(e.target.value));
									}}
								>
									<option value={5}>5</option>
									<option value={10}>10</option>
									<option value={20}>20</option>
								</select>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
