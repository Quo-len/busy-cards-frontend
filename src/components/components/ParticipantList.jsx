import React, { useState, useEffect } from "react";
import * as api from "./../../api";
import ParticipantItem from "./ParticipantItem";

const ParticipantList = ({ mindmap, isEditable }) => {
	const [participants, setParticipants] = useState([]);

	useEffect(() => {
		fetchParticipants();
	}, [mindmap]);

	const fetchParticipants = async () => {
		try {
			const response = await api.getParticipants(mindmap._id);
			setParticipants(response || []);
		} catch (error) {
			console.error("Error fetching participants:", error);
		}
	};

	return (
		<div>
			{participants.length === 0 ? (
				<div>Учасники відсутні.</div>
			) : (
				<div>
					<div>Учасники</div>
					{participants.map((participant) => (
						<ParticipantItem key={participant._id} participant={participant} isEditable={false} />
					))}
				</div>
			)}
		</div>
	);
};

export default ParticipantList;
