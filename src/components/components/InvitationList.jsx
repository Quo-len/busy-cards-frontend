import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as api from "../../api";
import "./../styles/MindmapList.css";
import InvitationCard from "./InvitationCard";
import ReactPaginate from "react-paginate";

import Loader from "./Loader";
import Empty from "./Empty";

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

const MindmapList = ({ filters, onEditMindmap, refreshTrigger }) => {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const [invitations, setInvitations] = useState([]);
	const [totalMindmaps, setTotalInvitations] = useState(0);

	const query = useQuery();
	const currentPage = parseInt(query.get("page")) || 1;
	const [itemsPerPage, setItemsPerPage] = useState(5);
	const [totalPages, setTotalPages] = useState(0);

	useEffect(() => {
		const fetchInvitations = async () => {
			setIsLoading(true);
			setError(null);
			try {
				let data;
				data = await api.getPaginatedInvitations({
					currentPage: currentPage,
					...filters,
				});

				setInvitations(data.mindmaps);

				setItemsPerPage(data.pagination.itemsPerPage);
				setTotalPages(data.pagination.totalPages);
				setTotalInvitations(data.pagination.totalMindmaps);
			} catch (err) {
				setError("Failed to fetch mindmaps");
			}
			setIsLoading(false);
		};

		fetchInvitations();

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
		return <Loader message="Завантаження запрошень, будь ласка, зачекайте." flexLayout="true" />;
	}

	if (invitations.length === 0 || error) {
		return <Empty message="Запорошення відсутні." />;
	}

	return (
		<div className="invitation-list-container">
			<div className="invitation-cards">
				{invitations.map((invitation) => (
					<InvitationCard key={invitation._id} onEdit={() => onEditMindmap(invitation)} mindmap={invitation} />
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
				Показано {Math.min(itemsPerPage, invitations.length)} із {totalMindmaps} запрошень
			</div>
		</div>
	);
};

export default MindmapList;
