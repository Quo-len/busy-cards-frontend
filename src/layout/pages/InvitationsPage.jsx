import React, { useState, useEffect } from "react";
import * as api from "./../../api";
import "../styles/profilepage.css";
import InvitationCard from "../../components/components/InvitationCard";

const InvitationsPage = () => {
	document.title = `Busy-cards: Invitations`;
	const [invitations, setInvitations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchInvitations();
	}, []);

	const fetchInvitations = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await api.getInvitationsByReceiverId(userId);

			setInvitations(response);
			setLoading(false);
		} catch (err) {
			setError("Failed to fetch invitations");
			setLoading(false);
		}
	};

	return (
		<div>
			{invitations.map((invitation, index) => {
				<InvitationCard key={index} invitation={invitation} />;
			})}
		</div>
	);
};

export default InvitationsPage;
