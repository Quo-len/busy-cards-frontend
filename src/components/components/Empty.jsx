import React from "react";
import "./../styles/Empty.css";

const Empty = ({
	message = "Вміст не знайдено",
	description = "Спробуйте змінити параметри пошуку або створіть новий елемент",
	icon,
	showButton = false,
	buttonText = "Створити",
	onButtonClick,
	style = {},
	className = "",
	compact = false,
}) => {
	return (
		<div className={`empty-container ${compact ? "compact" : ""} ${className}`} style={style}>
			{icon && <div className="empty-icon">{icon}</div>}

			<img
				src="https://img.freepik.com/premium-vector/vector-illustration-about-concept-no-items-found-no-results-found_675567-6665.jpg"
				alt="Немає даних"
				className="empty-illustration"
			/>

			<div className="empty-message">{message}</div>
			<div className="empty-description">{description}</div>

			{showButton && (
				<button className="empty-action-btn" onClick={onButtonClick}>
					{buttonText}
				</button>
			)}
		</div>
	);
};

export default Empty;
