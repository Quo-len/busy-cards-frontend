import React, { useState, useEffect } from "react";
import MindmapList from "../../components/components/MindmapList";
import MindmapEditCard from "../../components/components/MindmapEditCard";
import "./../styles/HomePage.css";

const categories = [
	{ id: "my", label: "Мої інтелект-карти", endpoint: "/api/mindmaps/my" },
	{ id: "shared", label: "Спільна робота", endpoint: "/api/mindmaps/shared" },
	{ id: "favorites", label: "Вподобані", endpoint: "/api/mindmaps/favorites" },
	{ id: "public", label: "Загальнодоступні інтелект-карти", endpoint: "/api/mindmaps/public" },
];

const HomePage = (props) => {
	const [activeCategory, setActiveCategory] = useState("my");
	const [selectedMindmap, setSelectedMindmap] = useState(null);
	const [showEditor, setShowEditor] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

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

	return (
		<div className="homepage-container">
			<div className="homepage-content">
				{/* LEFT COLUMN: Vertical tabs */}
				<div className="category-tabs">
					{categories.map((category) => (
						<div
							key={category.id}
							onClick={() => setActiveCategory(category.id)}
							className={`category-tab ${activeCategory === category.id ? "active" : ""}`}
						>
							{category.label}
						</div>
					))}
				</div>

				{/* CENTER COLUMN: Mindmap list */}
				<div className="mindmap-list-column">
					<MindmapList categoryType={activeCategory} onEditMindmap={handleMindmapClick} refreshTrigger={refreshKey} />
				</div>

				{/* RIGHT COLUMN: Mindmap editor */}
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
							<svg
								width="48"
								height="48"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
								<polyline points="14 2 14 8 20 8"></polyline>
								<line x1="12" y1="18" x2="12" y2="12"></line>
								<line x1="9" y1="15" x2="15" y2="15"></line>
							</svg>
							Оберіть інтелект-карту для перегляду
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default HomePage;
