import React from "react";
import "../styles/Loader.css";

const Loader = ({ message = "Завантаження...", style = {}, className = "", fullPage = false, flexLayout = false }) => {
	let containerClass = "loader-container";

	if (fullPage) {
		containerClass += " loader-fullpage";
	} else if (flexLayout) {
		containerClass += " loader-flex";
	}

	if (className) {
		containerClass += ` ${className}`;
	}

	return (
		<div className={containerClass} style={style}>
			<div className="loader-spinner">
				<div className="loader-circle"></div>
			</div>
			<p className="loader-message">{message}</p>
		</div>
	);
};

export default Loader;
