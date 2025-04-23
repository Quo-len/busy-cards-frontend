import React from "react";

const NotFound = ({ message = "Вміст не знайдено", icon, style = {}, className = "" }) => {
	return (
		<div className="no-mindmaps-placeholder-item">
			<p>{message}</p>
			<img src="https://ru.hostings.info/upload/images/2021/12/e11044b915dc39afc3004430606bd6d1.jpg" alt="empty" />
		</div>
	);
};

export default NotFound;
