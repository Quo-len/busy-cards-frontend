import React, { useState, useEffect } from "react";
import * as api from "./../../api";
import "../styles/profilepage.css";
import InvitationCard from "../../components/components/InvitationCard";
import Loader from "../../components/components/Loader";
import NotFound from "../../components/components/NotFound";
import Empty from "../../components/components/Empty";

const InvitationsPage = () => {
	document.title = `Запрошення- Busy-cards`;
	const [isLoading, setIsLoading] = useState(true);
	const [invitations, setInvitations] = useState([]);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchInvitations();
	}, []);

	const fetchInvitations = async () => {
		setError(null);
		try {
			const response = await api.getInvitationsByReceiverId(userId);

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
			{invitations.map((invitation, index) => {
				<InvitationCard key={index} invitation={invitation} />;
			})}
		</div>
	);
};

export default InvitationsPage;
