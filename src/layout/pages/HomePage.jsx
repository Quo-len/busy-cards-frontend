import React, { useState, useEffect, useMemo } from "react";
import MindmapList from "../../components/components/MindmapList";
import MindmapEditCard from "../../components/components/MindmapEditCard";
import "./../styles/HomePage.css";
import * as api from "../../api/";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../utils/authContext";
import { GrSelect } from "react-icons/gr";
import { FaPlus } from "react-icons/fa";

const categories = [
	{ id: "my", label: "Мої інтелект-карти" },
	{ id: "shared", label: "Спільна робота" },
	{ id: "favorites", label: "Вподобані" },
	{ id: "public", label: "Загальнодоступні" },
];

const HomePage = (props) => {
	const { user, isLoggedIn } = useAuth();
	const navigate = useNavigate();
	const [activeCategory, setActiveCategory] = useState(isLoggedIn ? "my" : "public");
	const [selectedMindmap, setSelectedMindmap] = useState(null);
	const [showEditor, setShowEditor] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

	const [sortBy, setSortBy] = useState("lastModified");
	const [sortOrder, setSortOrder] = useState("desc");
	const [itemsPerPage, setItemsPerPage] = useState(5);

	const filters = useMemo(
		() => ({
			category: activeCategory,
			sortBy: sortBy,
			sortOrder: sortOrder,
			itemsPerPage: itemsPerPage,
			owner: activeCategory === "my" && isLoggedIn ? user?._id : undefined,
			participant: activeCategory === "shared" && isLoggedIn ? user?._id : undefined,
			favorite: activeCategory === "favorites" && isLoggedIn ? user?._id : undefined,
			isPublic: activeCategory === "public" ? true : undefined,
		}),
		[activeCategory, sortBy, sortOrder, itemsPerPage, isLoggedIn, user]
	);

	useEffect(() => {
		const selectedCategory = categories.find((cat) => cat.id === activeCategory);
		document.title = `${selectedCategory.label} - Busy-cards`;
	}, [activeCategory]);

	const handleMindmapClick = (mindmap) => {
		if (selectedMindmap?._id !== mindmap._id) {
			setSelectedMindmap(mindmap);
			setShowEditor(true);
		} else {
			setSelectedMindmap(null);
			setShowEditor(false);
		}
	};

	const handleCreateMindmap = async () => {
		try {
			const response = await api.createMindmap();
			navigate(`/mindmap/${response._id}`);
			toast.success(`Інтелект-карту успішно створено!`);
		} catch (error) {
			toast.error(`Не вдалося створити інтелект-карту: ${error.message}`);
		}
	};

	return (
		<div className="homepage-container">
			<div className="homepage-content">
				<div className="sidebar-column">
					<div className="category-tabs">
						{isLoggedIn && (
							<button className="create-mindmap-btn" onClick={handleCreateMindmap}>
								<FaPlus />
								Створити нову інтелект-карту
							</button>
						)}
						{isLoggedIn && (
							<>
								<div
									className={`category-tab ${activeCategory === "my" ? "active" : ""}`}
									onClick={() => setActiveCategory("my")}
								>
									Мої інтелект-карти
								</div>
								<div
									className={`category-tab ${activeCategory === "shared" ? "active" : ""}`}
									onClick={() => setActiveCategory("shared")}
								>
									Спільна робота
								</div>
								<div
									className={`category-tab ${activeCategory === "favorites" ? "active" : ""}`}
									onClick={() => setActiveCategory("favorites")}
								>
									Вподобані
								</div>
							</>
						)}
						<div
							className={`category-tab ${activeCategory === "public" ? "active" : ""}`}
							onClick={() => setActiveCategory("public")}
						>
							Загальнодоступні
						</div>
					</div>

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
				</div>

				<div className="mindmap-list-column">
					<MindmapList filters={filters} onEditMindmap={handleMindmapClick} refreshTrigger={refreshKey} />
				</div>

				<div className="editor-column">
					{showEditor && selectedMindmap ? (
						<MindmapEditCard
							mindmap={selectedMindmap}
							onSave={(updatedMindmap) => {
								setShowEditor(false);
								setSelectedMindmap(null);
								setRefreshKey((prev) => prev + 1);
							}}
							onCancel={() => {
								setShowEditor(false);
								setSelectedMindmap(null);
							}}
						/>
					) : (
						<div className="empty-editor-state">
							<GrSelect />
							Оберіть інтелект-карту для перегляду
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default HomePage;
