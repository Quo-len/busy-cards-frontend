import { useNavigate } from "react-router-dom";
import { useAuth } from "./../../utils/authContext";
import { PiGraphFill } from "react-icons/pi";
import { GiDeathSkull } from "react-icons/gi";
import { GiGate } from "react-icons/gi";
import { IoSettingsOutline } from "react-icons/io5";
import { FcInvite } from "react-icons/fc";
import { HiOutlineUserCircle } from "react-icons/hi";

import "./../styles/Header.css";

const Header = () => {
	const navigate = useNavigate();
	const { user, isLoggedIn, logoutUser } = useAuth();

	return (
		<header className="header">
			<div className="logo" onClick={() => navigate("/")}>
				<PiGraphFill className="logo-icon spin" />
				<span className="logo-text">Busy-Cards</span>
			</div>
			<nav className="nav">
				{isLoggedIn ? (
					<div className="user-controls">
						<div className="welcome-text">Вітаю, {user?.username}</div>
						<div className="buttons-group">
							<button
								className="header-button settings-button"
								onClick={() => {
									navigate(`/profile/${user.id}`);
								}}
							>
								<HiOutlineUserCircle className="button-icon" />
								<span>Профіль</span>
							</button>
							<button
								className="header-button settings-button"
								onClick={() => {
									navigate("/invitations");
								}}
							>
								<FcInvite className="button-icon" />
								<span>Запрошення</span>
							</button>
							<button
								className="header-button settings-button"
								onClick={() => {
									navigate("/settings");
								}}
							>
								<IoSettingsOutline className="button-icon" />
								<span>Налаштування</span>
							</button>
							<button
								className="header-button logout-button"
								onClick={() => {
									logoutUser();
								}}
							>
								<GiDeathSkull className="button-icon" />
								<span>Вихід</span>
							</button>
						</div>
					</div>
				) : (
					<button
						className="header-button signin-button"
						onClick={() => {
							navigate("/signin");
						}}
					>
						<GiGate className="button-icon" />
						<span>Вхід</span>
					</button>
				)}
			</nav>
		</header>
	);
};

export default Header;
