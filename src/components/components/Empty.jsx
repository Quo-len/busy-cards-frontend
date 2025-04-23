import React from "react";

const Empty = ({ message = "Вміст не знайдено", icon, style = {}, className = "" }) => {
	return (
		<div className="no-mindmaps-placeholder-item">
			<p>{message}</p>
			<img
				src="https://img.freepik.com/premium-vector/vector-illustration-about-concept-no-items-found-no-results-found_675567-6665.jpg"
				alt="empty"
			/>
		</div>
	);
};

export default Empty;
