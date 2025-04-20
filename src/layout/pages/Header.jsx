import { useNavigate } from "react-router-dom";
import { useAuth } from "./../../utils/authContext";
import "./../styles/Header.css";

const Header = () => {
	const navigate = useNavigate();
	const { user, isLoggedIn, logoutUser } = useAuth();

	const handleLogout = () => {
		logoutUser();
	};

	const handleSignIn = () => {
		navigate("/signin");
	};

	const handleSettings = () => {
		navigate("/settings");
	};

	return (
		<header className="header">
			<div className="logo" onClick={() => navigate("/")}>
				Busy-Cards
			</div>
			<nav className="nav">
				{isLoggedIn ? (
					<div className="user-controls">
						<div className="welcome-text">Вітаю, {user?.username}</div>
						<div className="buttons-group">
							<button className="header-button settings-button" onClick={handleSettings}>
								Налаштування
							</button>
							<button className="header-button logout-button" onClick={handleLogout}>
								Вихід
							</button>
						</div>
					</div>
				) : (
					<button className="header-button signin-button" onClick={handleSignIn}>
						Вхід
					</button>
				)}
			</nav>
		</header>
	);
};

export default Header;
