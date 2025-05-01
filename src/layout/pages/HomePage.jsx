import React, { useState, useEffect, useMemo } from "react";
import MindmapList from "../../components/components/MindmapList";
import MindmapEditCard from "../../components/components/MindmapEditCard";
import FiltersPanel from "../../components/components/FiltersPanel";

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
	const [activeCategory, setActiveCategory] = useState("public");
	const [selectedMindmap, setSelectedMindmap] = useState(null);
	const [showEditor, setShowEditor] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

	const [sortBy, setSortBy] = useState("updatedAt");
	const [sortOrder, setSortOrder] = useState("desc");
	const [itemsPerPage, setItemsPerPage] = useState(5);

	useEffect(() => {
		setActiveCategory(isLoggedIn ? "my" : "public");
	}, [isLoggedIn]);

	const filters = useMemo(
		() => ({
			category: activeCategory,
			sortBy: sortBy,
			sortOrder: sortOrder,
			itemsPerPage: itemsPerPage,
			owner: activeCategory === "my" && isLoggedIn ? user?.id : undefined,
			participant: activeCategory === "shared" && isLoggedIn ? user?.id : undefined,
			favorite: activeCategory === "favorites" && isLoggedIn ? user?.id : undefined,
			isPublic: activeCategory === "public" ? true : undefined,
		}),
		[activeCategory, sortBy, sortOrder, itemsPerPage, isLoggedIn, user]
	);

	useEffect(() => {
		const selectedCategory = categories.find((cat) => cat.id === activeCategory);
		document.title = `${selectedCategory.label} - Busy-cards`;
	}, [activeCategory]);

	const handleMindmapClick = (mindmap) => {
		if (selectedMindmap?.id !== mindmap.id) {
			setSelectedMindmap(mindmap);
			setShowEditor(true);
		} else {
			setSelectedMindmap(null);
			setShowEditor(false);
		}
	};

	const handleCreateMindmap = async () => {
		try {
			await api.createMindmap({
				owner: user?.id,
			});
			setRefreshKey((prev) => prev + 1);
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

					<FiltersPanel
						sortBy={sortBy}
						setSortBy={setSortBy}
						sortOrder={sortOrder}
						setSortOrder={setSortOrder}
						itemsPerPage={itemsPerPage}
						setItemsPerPage={setItemsPerPage}
					/>
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
							onDelete={() => {
								setShowEditor(false);
								setSelectedMindmap(null);
								setRefreshKey((prev) => prev + 1);
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
