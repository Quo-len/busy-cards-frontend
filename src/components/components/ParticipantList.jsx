import React, { useState, useEffect } from "react";
import * as api from "./../../api";
import ParticipantItem from "./ParticipantItem";
import "./../styles/ParticipantList.css";

import Loader from "../../components/components/Loader";
import Empty from "../../components/components/Empty";

const ParticipantList = ({ mindmap, isEditable }) => {
	const [participants, setParticipants] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchParticipants = async () => {
			try {
				//const response = await api.getParticipants(mindmap._id);
				setParticipants(mindmap.participants || []);
			} catch (error) {
				console.error("Error fetching participants:", error);
			}
			setIsLoading(false);
		};

		fetchParticipants();
	}, [mindmap]);

	const handleRemove = (idToRemove) => {
		setParticipants((prev) => prev.filter((p) => p._id !== idToRemove));
	};

	return (
		<div className="participant-list-container">
			<div className="participant-list-header">
				<div className="participant-list-title">Учасники</div>
			</div>

			<div className="participants-wrapper">
				{(() => {
					if (isLoading) {
						return <Loader message="Завантаження учасників, зачекайте" />;
					}

					if (participants.length === 0) {
						return <Empty message="Учасники відсутні." />;
					}

					return participants.map((participant) => (
						<ParticipantItem
							key={participant._id}
							participant={participant}
							isEditable={true}
							onRemove={handleRemove}
						/>
					));
				})()}
			</div>
		</div>
	);
};

export default ParticipantList;
