import React from "react";
import { Link } from "react-router-dom";
import { IoHome } from "react-icons/io5";
import "../styles/NotFoundPage.css";

function NotFoundPage({ title = "Сторінка не знайдена", message = "Сторінку не знайдено.", code = "404" }) {
	document.title = `${title} - Busy-cards`;

	return (
		<div className="not-found-container">
			<div className="not-found-content">
				<h1 className="not-found-code">{code}</h1>
				<h2 className="not-found-title">{message}</h2>

				<p className="not-found-message">
					Схоже, що ви намагаєтесь знайти сторінку, яка не існує або була переміщена. Перевірте URL або поверніться на
					головну сторінку, щоб продовжити роботу з інтелект-картами.
				</p>

				<Link to="/" className="home-button">
					<IoHome />
					На головну сторінку
				</Link>
			</div>
		</div>
	);
}

export default NotFoundPage;
