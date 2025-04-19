import React, { useState, useEffect } from "react";
import * as api from "./../../api";

const accessLevels = ["Глядач", "Коментатор", "Редактор"];

const ParticipantItem = ({ participant, isEditable }) => {
	const [selectedRole, setSelectedRole] = useState(participant.accessLevel);

	return (
		<div>
			<img src="" alt="user image" />
			<div>{participant.username}</div>
			<div>{participant.email}</div>
			<div>{participant.joinedAt}</div>
			{isEditable ? (
				<div>{participant.accessLevel}</div>
			) : (
				<div>
					<div></div>
					<div>X</div>
				</div>
			)}
		</div>
	);
};

export default ParticipantItem;
