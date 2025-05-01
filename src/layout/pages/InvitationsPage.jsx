import React, { useState, useEffect, useMemo } from "react";
import "../styles/InvitationPage.css";
import InvitationList from "../../components/components/InvitationList";
import { useAuth } from "../../utils/authContext";
import FiltersPanel from "../../components/components/FiltersPanel";

const InvitationsPage = () => {
	document.title = `Запрошення - Busy-cards`;
	const { user } = useAuth();

	const [refreshKey, setRefreshKey] = useState(0);

	const [sortBy, setSortBy] = useState("updatedAt");
	const [sortOrder, setSortOrder] = useState("desc");
	const [itemsPerPage, setItemsPerPage] = useState(5);
	const [activeCategory, setActiveCategory] = useState("to-me");

	const filters = useMemo(
		() => ({
			category: activeCategory,
			sortBy: sortBy,
			sortOrder: sortOrder,
			itemsPerPage: itemsPerPage,
			receiver: activeCategory === "to-me" ? user?.id : undefined,
			sender: activeCategory === "my" ? user?.id : undefined,
		}),
		[activeCategory, sortBy, sortOrder, itemsPerPage, user]
	);

	return (
		<div className="invitation-page-container">
			<div className="invitation-header">
				<h1 className="invitation-title">Запрошення</h1>
				<p className="invitation-subtitle">Керуйте своїми запрошеннями</p>
			</div>

			<div className="tabs-container">
				<div
					className={`category-tab ${activeCategory === "my" ? "active" : ""}`}
					onClick={() => setActiveCategory("my")}
				>
					Надіслані
				</div>
				<div
					className={`category-tab ${activeCategory === "to-me" ? "active" : ""}`}
					onClick={() => setActiveCategory("to-me")}
				>
					Отримані
				</div>
			</div>

			<div className="invitation-content">
				<FiltersPanel
					className="invitation-filters-panel"
					sortBy={sortBy}
					setSortBy={setSortBy}
					sortOrder={sortOrder}
					setSortOrder={setSortOrder}
					itemsPerPage={itemsPerPage}
					setItemsPerPage={setItemsPerPage}
				/>

				<div className="mindmap-list-column">
					<InvitationList filters={filters} />
				</div>
			</div>
		</div>
	);
};

export default InvitationsPage;
