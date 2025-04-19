import React, { useState, useEffect } from "react";
import MindmapList from "../../components/components/MindmapList";
import MindmapEditCard from "../../components/components/MindmapEditCard";

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
		<div
			className="homepage-container"
			style={{
				padding: "20px",
				display: "flex",
				justifyContent: "center",
			}}
		>
			<div
				style={{
					display: "flex",
					gap: "20px",
					maxWidth: "1200px",
					width: "100%",
				}}
			>
				{/* LEFT COLUMN: Vertical tabs */}
				<div
					className="category-tabs"
					style={{
						display: "flex",
						flexDirection: "column",
						minWidth: "200px",
						borderRight: "1px solid #e0e0e0",
						paddingRight: "10px",
					}}
				>
					{categories.map((category) => (
						<div
							key={category.id}
							onClick={() => setActiveCategory(category.id)}
							style={{
								padding: "12px 16px",
								cursor: "pointer",
								borderLeft: activeCategory === category.id ? "4px solid #3498db" : "4px solid transparent",
								color: activeCategory === category.id ? "#3498db" : "#333",
								fontWeight: activeCategory === category.id ? "bold" : "normal",
								backgroundColor: activeCategory === category.id ? "#f0f8ff" : "transparent",
								transition: "background-color 0.2s",
								marginBottom: "8px",
								borderRadius: "4px",
							}}
						>
							{category.label}
						</div>
					))}
				</div>

				{/* CENTER COLUMN: Mindmap list */}
				<div style={{ flex: "2" }}>
					<MindmapList categoryType={activeCategory} onEditMindmap={handleMindmapClick} refreshTrigger={refreshKey} />
				</div>

				{/* RIGHT COLUMN: Mindmap editor */}
				<div style={{ flex: "1", minWidth: "300px" }}>
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
						<div
							style={{
								opacity: 0.6,
								fontStyle: "italic",
								padding: "20px",
								backgroundColor: "#f9f9f9",
								border: "1px dashed #ddd",
								borderRadius: "8px",
								textAlign: "center",
							}}
						>
							Select a mindmap to edit
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default HomePage;
