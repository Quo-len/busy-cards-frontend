import React, { useState, useEffect } from "react";
import * as api from "./../../api";
import ParticipantItem from "./ParticipantItem";
import "./../styles/ParticipantList.css";

const ParticipantList = ({ mindmap, isEditable }) => {
	const [participants, setParticipants] = useState([]);

	useEffect(() => {
		fetchParticipants();
	}, [mindmap]);

	const fetchParticipants = async () => {
		try {
			//const response = await api.getParticipants(mindmap._id);
			setParticipants(mindmap.participants || []);
		} catch (error) {
			console.error("Error fetching participants:", error);
		}
	};

	const handleRemove = (idToRemove) => {
		setParticipants((prev) => prev.filter((p) => p._id !== idToRemove));
	};

	return (
		<div className="participant-list-container">
			<div className="participant-list-header">
				<div className="participant-list-title">Учасники</div>
			</div>

			<div className="participants-wrapper">
				{participants.length === 0 ? (
					<div className="empty-participants">Учасники відсутні.</div>
				) : (
					participants.map((participant) => (
						<ParticipantItem
							key={participant._id}
							participant={participant}
							isEditable={true}
							onRemove={handleRemove}
						/>
					))
				)}
			</div>
		</div>
	);
};

export default ParticipantList;
