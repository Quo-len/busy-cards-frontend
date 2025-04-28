import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as api from "./../../api";
import "./../styles/MindmapList.css";
import MindmapCard from "./MindmapCard";
import ReactPaginate from "react-paginate";

import Loader from "../../components/components/Loader";
import Empty from "../../components/components/Empty";

const categoryEndpoints = {
	mindmaps: "/api/mindmaps/my",
	shared: "/api/mindmaps/shared",
	favorites: "/api/mindmaps/favorites",
	public: "/api/mindmaps/public",
};

// https://github.com/deoxyribonuclease/over-shoped-frontend/blob/5324592cd82877555d91441ac68cd259801ef58d/src/components/components/ProductGrid.jsx#L13

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

const MindmapList = ({ filters, onEditMindmap, refreshTrigger }) => {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const [mindmaps, setMindmaps] = useState([]);
	const [totalMindmaps, setTotalMindmaps] = useState(0);

	const query = useQuery();
	const currentPage = parseInt(query.get("page")) || 1;
	const [itemsPerPage, setItemsPerPage] = useState(5);
	const [totalPages, setTotalPages] = useState(0);

	useEffect(() => {
		const fetchMindmaps = async () => {
			setIsLoading(true);
			setError(null);
			try {
				let data;
				data = await api.getPaginatedMindmaps({
					currentPage: currentPage,
					...filters,
				});

				setMindmaps(data.mindmaps);

				setItemsPerPage(data.pagination.itemsPerPage);
				setTotalPages(data.pagination.totalPages);
				setTotalMindmaps(data.pagination.totalMindmaps);
			} catch (err) {
				setError("Failed to fetch mindmaps");
			}
			setIsLoading(false);
		};

		fetchMindmaps();

		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}, [refreshTrigger, filters, currentPage]);

	useEffect(() => {
		navigate(`?page=${1}`);
	}, []);

	const handlePageClick = ({ selected }) => {
		const newPage = selected + 1;
		navigate(`?page=${newPage}`);
	};

	if (isLoading) {
		return <Loader message="Завантаження інтелект-карт, будь ласка, зачекайте." flexLayout="true" />;
	}

	if (mindmaps.length === 0 || error) {
		return <Empty message="Інтелект-карти не знайдено." />;
	}

	return (
		<div className="mindmap-list-container">
			<div className="mindmap-cards">
				{mindmaps.map((mindmap) => (
					<MindmapCard key={mindmap._id} onEdit={() => onEditMindmap(mindmap)} mindmap={mindmap} />
				))}
			</div>

			<ReactPaginate
				previousLabel={"←"}
				nextLabel={"→"}
				breakLabel={"..."}
				pageCount={totalPages}
				onPageChange={handlePageClick}
				containerClassName={"pagination"}
				activeClassName={"active"}
				forcePage={currentPage - 1}
			/>

			<div className="pagination-info">
				Showing {Math.min(itemsPerPage, mindmaps.length)} of {totalMindmaps} mindmaps
			</div>
		</div>
	);
};

export default MindmapList;
