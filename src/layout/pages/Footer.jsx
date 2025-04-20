import React from "react";
import "./../styles/Footer.css"; // Don't forget to create this CSS file

const Footer = () => {
	return (
		<footer className="footer">
			<div className="copyright">© 2025 Busy-Cards</div>
			<div className="footer-links">
				<a href="#" className="footer-link">
					Privacy
				</a>
				<a href="#" className="footer-link">
					Terms
				</a>
				<a href="#" className="footer-link">
					Contact
				</a>
			</div>
		</footer>
	);
};

export default Footer;
