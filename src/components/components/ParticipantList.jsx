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
		setParticipants(mindmap.participants || []);
		setIsLoading(false);
	}, [mindmap]);

	const handleRemove = (idToRemove) => {
		setParticipants((prev) => prev.filter((p) => p.id !== idToRemove));
	};

	return (
		<div className="participant-list-container">
			<div className="participant-list-header">
				<div className="participant-list-title">Учасники</div>
			</div>

			<div className="participants-wrapper">
				{(() => {
					if (isLoading) {
						return <Loader message="Завантаження учасників, зачекайте." flexLayout="true" />;
					}

					if (participants.length === 0) {
						return <Empty message="Учасники відсутні." description="Спробуйте запросити свого першого учасника!" />;
					}

					return participants.map((participant) => (
						<ParticipantItem
							key={participant.id}
							participant={participant}
							isEditable={isEditable}
							onRemove={handleRemove}
						/>
					));
				})()}
			</div>
		</div>
	);
};

export default ParticipantList;
