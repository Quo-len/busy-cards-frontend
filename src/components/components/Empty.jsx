import React from "react";
import "./../styles/Empty.css";
import { PiEmptyBold } from "react-icons/pi";

const EmptyIcon = () => (
	<div className="custom-empty-icon">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="empty-circle-animation">
			<defs>
				<linearGradient id="emptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#3182ce" />
					<stop offset="100%" stopColor="#805ad5" />
				</linearGradient>
			</defs>
			<circle
				cx="100"
				cy="100"
				r="80"
				fill="none"
				stroke="url(#emptyGradient)"
				strokeWidth="8"
				strokeDasharray="15 8"
			/>
		</svg>
		<div className="empty-icon-center">
			<PiEmptyBold size={60} />
		</div>
	</div>
);

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
			<div className="empty-content">
				<div className="empty-icon-container">{icon || <EmptyIcon />}</div>

				<div className="empty-text-container">
					<div className="empty-message">{message}</div>
					<div className="empty-description">{description}</div>
				</div>

				{showButton && (
					<button className="empty-action-btn" onClick={onButtonClick}>
						{buttonText}
					</button>
				)}
			</div>
		</div>
	);
};

export default Empty;
