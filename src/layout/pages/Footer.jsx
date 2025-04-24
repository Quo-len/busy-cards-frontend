import React from "react";
import "../styles/Footer.css";

const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="footer">
			<div className="footer-container">
				<div className="footer-main">
					<div className="footer-brand">
						<div className="brand-title">
							<div className="brand-name">Busy-Cards</div>
							<div className="brand-tag">Інтелект-карти</div>
						</div>
						<div className="copyright">© {currentYear} Busy-Cards • Всі права захищено</div>
					</div>

					<div className="footer-links">
						<div className="footer-section">
							<h4>Ресурси</h4>
							<ul>
								<li>
									<a href="#">Документація</a>
								</li>
								<li>
									<a href="#">Уроки</a>
								</li>
							</ul>
						</div>

						<div className="footer-section">
							<h4>Юридична інформація</h4>
							<ul>
								<li>
									<a href="#">Політика конфіденційності</a>
								</li>
								<li>
									<a href="#">Умови використання</a>
								</li>
							</ul>
						</div>

						<div className="footer-section">
							<h4>Зв'язок</h4>
							<ul>
								<li>
									<a href="#">Зв'язатися з нами</a>
								</li>
								<li>
									<a href="#">Підтримка</a>
								</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="footer-bottom">
					<div className="social-links">
						<a href="#">Facebook</a>
						<a href="#">Twitter</a>
						<a href="#">LinkedIn</a>
					</div>
					<div className="footer-tagline">Зроблено для ентузіастів інтелект-карт</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
