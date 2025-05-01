import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as api from "../../api";
import "./../styles/InvitationList.css";
import InvitationCard from "./InvitationCard";
import ReactPaginate from "react-paginate";

import Loader from "./Loader";
import Empty from "./Empty";

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

const InvitationsList = ({ filters }) => {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const [invitations, setInvitations] = useState([]);
	const [totalInvitations, setTotalInvitations] = useState(0);

	const query = useQuery();
	const currentPage = parseInt(query.get("page")) || 1;
	const [itemsPerPage, setItemsPerPage] = useState(5);
	const [totalPages, setTotalPages] = useState(0);

	useEffect(() => {
		const fetchInvitations = async () => {
			setIsLoading(true);
			setError(null);
			console.log(filters);
			try {
				let data;
				data = await api.getPaginatedInvitations({
					currentPage: currentPage,
					...filters,
				});
				console.log(data);
				setInvitations(data.invitations);

				setItemsPerPage(data.pagination.itemsPerPage);
				setTotalPages(data.pagination.totalPages);
				setTotalInvitations(data.pagination.totalInvitations);
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
	}, [filters, currentPage]);

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
			<div className="list-header">
				<h2 className="list-title">Усі запрошення</h2>
				<span className="list-count">{totalInvitations}</span>
			</div>

			<div className="invitation-cards">
				{invitations.map((invitation) => (
					<InvitationCard key={invitation.id} onEdit={() => {}} invitation={invitation} />
				))}
			</div>

			{totalPages > 1 && (
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
			)}

			<div className="pagination-info">
				Показано {Math.min(itemsPerPage, invitations.length)} із {totalInvitations} запрошень
			</div>
		</div>
	);
};

export default InvitationsList;
