import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "./../../api";
import "./../styles/MindmapList.css";
import MindmapCard from "./MindmapCard";
import ReactPaginate from "react-paginate";

import Loader from "../../components/components/Loader";
import Empty from "../../components/components/Empty";

const categoryEndpoints = {
	my: "/api/mindmaps/my",
	shared: "/api/mindmaps/shared",
	favorites: "/api/mindmaps/favorites",
	public: "/api/mindmaps/public",
};

// https://github.com/deoxyribonuclease/over-shoped-frontend/blob/5324592cd82877555d91441ac68cd259801ef58d/src/components/components/ProductGrid.jsx#L13

const MindmapList = ({ categoryType, onEditMindmap, refreshTrigger }) => {
	const [mindmaps, setMindmaps] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [totalMindmaps, setTotalMindmaps] = useState(0);
	const [totalPages, setTotalPages] = useState(0);

	const [sortBy, setSortBy] = useState("lastModified");
	const [sortOrder, setSortOrder] = useState("desc");

	useEffect(() => {
		const fetchMindmaps = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await api.getPaginatedMindmaps(currentPage, itemsPerPage, sortBy, sortOrder);

				setMindmaps(response.mindmaps);

				setCurrentPage(response.pagination.currentPage);
				setItemsPerPage(response.pagination.itemsPerPage);
				setTotalPages(response.pagination.totalPages);
				setTotalMindmaps(response.pagination.totalMindmaps);
			} catch (err) {
				setError("Failed to fetch mindmaps");
			}
			setIsLoading(false);
		};

		fetchMindmaps();
	}, [categoryType, refreshTrigger]);

	const handleCreateMindmap = async () => {
		try {
			const response = await axios.post("/api/mindmaps", {
				title: `Mindmap ${new Date().toLocaleString()}`,
				description: "New mindmap",
			});

			navigate(`/mindmap/${response.data._id}`);
		} catch (err) {
			setError("Failed to create mindmap");
		}
	};

	const handlePageChange = (newPage) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	const handleSortChange = (column) => {
		if (sortBy === column) {
			// Toggle order if clicking the same column
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			// Default to descending for a new column
			setSortBy(column);
			setSortOrder("desc");
		}
	};

	const handleItemsPerPageChange = (e) => {
		setItemsPerPage(parseInt(e.target.value));
		setCurrentPage(1); // Reset to first page when changing items per page
	};

	if (error) return <div>{error}</div>;

	if (isLoading) {
		return <Loader message="Завантаження інтелект-карт, зачекайте" />;
	}

	if (mindmaps.length === 0) {
		return <Empty message="Інтелект-карти не знайдено" />;
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				padding: "20px",
				width: "100%",
				maxWidth: "800px",
				margin: "0 auto",
				overflow: "hidden",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "20px",
				}}
			>
				<h1>My Mindmaps</h1>
				<button
					onClick={handleCreateMindmap}
					style={{
						padding: "10px 15px",
						backgroundColor: "#3498db",
						color: "white",
						border: "none",
						borderRadius: "5px",
						cursor: "pointer",
					}}
				>
					Створити нову інтелект-карту
				</button>
			</div>

			{/* Sorting controls */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "15px",
				}}
			>
				<div>
					<span>Sort by: </span>
					<select
						value={`${sortBy}-${sortOrder}`}
						onChange={(e) => {
							const [newSortBy, newSortOrder] = e.target.value.split("-");
							setSortBy(newSortBy);
							setSortOrder(newSortOrder);
						}}
						style={{
							padding: "5px",
							borderRadius: "4px",
							marginRight: "10px",
						}}
					>
						<option value="lastModified-desc">Latest modified</option>
						<option value="lastModified-asc">Oldest modified</option>
						<option value="createdAt-desc">Recently created</option>
						<option value="createdAt-asc">Oldest created</option>
						<option value="title-asc">Title (A-Z)</option>
						<option value="title-desc">Title (Z-A)</option>
					</select>
				</div>

				<div>
					<span>Items per page: </span>
					<select
						value={itemsPerPage}
						onChange={handleItemsPerPageChange}
						style={{
							padding: "5px",
							borderRadius: "4px",
						}}
					>
						<option value={5}>5</option>
						<option value={10}>10</option>
						<option value={20}>20</option>
						<option value={50}>50</option>
					</select>
				</div>
			</div>

			<div>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "12px",
						marginBottom: "20px",
					}}
				>
					{mindmaps.map((mindmap) => (
						<MindmapCard key={mindmap._id} onEdit={() => onEditMindmap(mindmap)} mindmap={mindmap} />
					))}
				</div>

				{/* Pagination controls */}
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginTop: "20px",
						padding: "10px",
						backgroundColor: "#f8f9fa",
						borderRadius: "5px",
					}}
				>
					<div>
						Showing {mindmaps.length} of {totalMindmaps} mindmaps
					</div>

					<div style={{ display: "flex", alignItems: "center" }}>
						<button
							onClick={() => handlePageChange(1)}
							disabled={currentPage === 1}
							style={{
								padding: "5px 10px",
								margin: "0 5px",
								backgroundColor: currentPage === 1 ? "#f0f0f0" : "#fff",
								border: "1px solid #ddd",
								borderRadius: "3px",
								cursor: currentPage === 1 ? "default" : "pointer",
								opacity: currentPage === 1 ? 0.6 : 1,
							}}
						>
							&laquo;
						</button>

						<button
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
							style={{
								padding: "5px 10px",
								margin: "0 5px",
								backgroundColor: currentPage === 1 ? "#f0f0f0" : "#fff",
								border: "1px solid #ddd",
								borderRadius: "3px",
								cursor: currentPage === 1 ? "default" : "pointer",
								opacity: currentPage === 1 ? 0.6 : 1,
							}}
						>
							&lsaquo;
						</button>

						<span style={{ margin: "0 10px" }}>
							Page {currentPage} of {totalPages}
						</span>

						<button
							onClick={() => handlePageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
							style={{
								padding: "5px 10px",
								margin: "0 5px",
								backgroundColor: currentPage === totalPages ? "#f0f0f0" : "#fff",
								border: "1px solid #ddd",
								borderRadius: "3px",
								cursor: currentPage === totalPages ? "default" : "pointer",
								opacity: currentPage === totalPages ? 0.6 : 1,
							}}
						>
							&rsaquo;
						</button>

						<button
							onClick={() => handlePageChange(totalPages)}
							disabled={currentPage === totalPages}
							style={{
								padding: "5px 10px",
								margin: "0 5px",
								backgroundColor: currentPage === totalPages ? "#f0f0f0" : "#fff",
								border: "1px solid #ddd",
								borderRadius: "3px",
								cursor: currentPage === totalPages ? "default" : "pointer",
								opacity: currentPage === totalPages ? 0.6 : 1,
							}}
						>
							&raquo;
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MindmapList;
