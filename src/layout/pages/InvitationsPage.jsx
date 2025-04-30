import React, { useState, useEffect, useMemo } from "react";
import * as api from "./../../api";
import "../styles/InvitationPage.css";
import InvitationList from "../../components/components/InvitationList";
import Loader from "../../components/components/Loader";
import Empty from "../../components/components/Empty";
import { useAuth } from "../../utils/authContext";
import { toast } from "react-toastify";

const categories = [
	{ id: "to-me", label: "Надіслані мені" },
	{ id: "my", label: "Надіслані мною" },
];

const InvitationsPage = () => {
	document.title = `Запрошення - Busy-cards`;
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [invitations, setInvitations] = useState([]);
	const [error, setError] = useState(null);

	const [refreshKey, setRefreshKey] = useState(0);

	const [sortBy, setSortBy] = useState("lastModified");
	const [sortOrder, setSortOrder] = useState("desc");
	const [itemsPerPage, setItemsPerPage] = useState(5);
	const [activeCategory, setActiveCategory] = useState("to-me");

	const filters = useMemo(
		() => ({
			category: activeCategory,
			sortBy: sortBy,
			sortOrder: sortOrder,
			itemsPerPage: itemsPerPage,
			receiver: (activeCategory === activeCategory) === "to-me" ? user?._id : undefined,
			sender: (activeCategory === activeCategory) === "my" ? user?._id : undefined,
		}),
		[activeCategory, sortBy, sortOrder, itemsPerPage, user]
	);

	useEffect(() => {
		fetchInvitations();
	}, []);

	const fetchInvitations = async () => {
		setError(null);
		try {
			const response = await api.getPaginatedInvitations(userId);

			setInvitations(response);
			setIsLoading(false);
		} catch (err) {
			setError("Failed to fetch invitations");
			setIsLoading(false);
		}
	};

	if (invitations.length === 0) {
		return <Empty message="Запрошення відсутні, спробуйте пізніше" />;
	}

	if (isLoading) {
		return <Loader message="Завантаження запрошень, зачекайте" />;
	}

	return (
		<div>
			<div className="filters-panel">
				<h3 className="filters-title">Фільтри</h3>
				<div className="filters-group">
					<div className="filter-item">
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

					<div className="filter-item">
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

			<div className="mindmap-list-column">
				<InvitationList filters={filters} />;
			</div>
		</div>
	);
};

export default InvitationsPage;
