import React from "react";

const Loader = ({ message = "Завантаження...", icon, style = {}, className = "" }) => {
	return (
		<div className="no-mindmaps-placeholder-item">
			<p>{message}</p>
			<img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Loading_icon.gif" alt="empty" />
		</div>
	);
};

export default Loader;
