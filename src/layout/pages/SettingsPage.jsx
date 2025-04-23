import { useState, useEffect } from "react";
import { useAuth } from "./../../utils/authContext";
import "./../styles/SettingsPage.css";
import * as api from "./../../api";
import { useNavigate } from "react-router-dom";

import Loader from "../../components/components/Loader";
import NotFound from "../../components/components/NotFound";

const SettingsPage = () => {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const { user, setUser, logoutUser } = useAuth();
	const [successMessage, setSuccessMessage] = useState("");
	const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
	const [newPasswordVisible, setNewPasswordVisible] = useState(false);

	const [avatarFile, setAvatarFile] = useState(null);
	const [username, setUsername] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [email, setEmail] = useState("");
	const [bio, setBio] = useState("");

	useEffect(() => {
		document.title = `Налаштування - Busy-cards`;

		if (!user) {
			const authCheckTimer = setTimeout(() => {
				if (!user) {
					navigate("/signin");
				}
				setIsLoading(false);
			}, 500);

			return () => clearTimeout(authCheckTimer);
		} else {
			setIsLoading(false);
		}
	}, [user, navigate]);

	const handleUsernameSubmit = async (e) => {
		e.preventDefault();
		try {
			const updatedData = { username: username };
			const response = await api.updateUser(user._id, updatedData);
			setUser(response);

			console.log("Username updated:", username);
			setSuccessMessage("Username updated successfully");
			setTimeout(() => setSuccessMessage(""), 3000);
		} catch (err) {
			console.log("Failed to update username:" + err.message);
		}
	};

	const handleBioSubmit = async (e) => {
		e.preventDefault();
		try {
			const updatedData = { bio: bio };
			const response = await api.updateUser(user._id, updatedData);
			setUser(response);

			console.log("Bio updated:", username);
			setSuccessMessage("Bio updated successfully");
			setTimeout(() => setSuccessMessage(""), 3000);
		} catch (err) {
			console.log("Failed to update bio:" + err.message);
		}
	};

	const handlePasswordSubmit = async (e) => {
		e.preventDefault();
		try {
			await api.updatePassword(currentPassword, newPassword);

			console.log("Password updated");
			setSuccessMessage("Password updated successfully");
			setTimeout(() => setSuccessMessage(""), 3000);
			setCurrentPassword("");
			setNewPassword("");
		} catch (err) {
			console.log("Failed to update password" + err.message);
		}
	};

	const handleEmailSubmit = async (e) => {
		e.preventDefault();
		try {
			const updatedData = { email: email };
			const response = await api.updateUser(user._id, updatedData);
			setUser(response);

			console.log("Email updated:", email);
			setSuccessMessage("Email updated successfully");
			setTimeout(() => setSuccessMessage(""), 3000);
		} catch (err) {
			console.log("Failed to update email:" + err.message);
		}
	};

	const handleAvatarChange = (e) => {
		const file = e.target.files[0];
		if (file) setAvatarFile(file);
	};

	const handleAvatarUpload = async () => {
		if (!avatarFile) return;
		try {
			const updatedUser = await api.uploadUserAvatar(user._id, avatarFile);
			const localAvatarURL = URL.createObjectURL(avatarFile);

			setUser((prev) => ({
				...prev,
				...updatedUser,
				avatar: localAvatarURL,
			}));
			setSuccessMessage("Аватар оновлено");
			setTimeout(() => setSuccessMessage(""), 3000);
			setAvatarFile(null);
		} catch (err) {
			console.error("Не вдалося оновити аватар:", err.message);
		}
	};

	const handleDeleteAccount = async () => {
		if (window.confirm("Ви впевнені, що хочете видалити свій обліковий запис? Цю дію не можна скасувати.")) {
			try {
				await api.updateUser(user.id);

				console.log("Account deleted");
				logoutUser();
			} catch (err) {
				console.log("Failed to delete account:" + err.message);
			}
		}
	};

	if (isLoading) {
		return <Loader message="Завантаження налаштувань, зачекайте" />;
	}

	if (!user) {
		return <NotFound message="Авторизуйтесь для продовження роботи" />;
	}

	return (
		<div className="settings-container">
			{successMessage && <div className="success-message">{successMessage}</div>}

			<section className="settings-section">
				<h2>Ім&apos;я користувача</h2>
				<p className="settings-description">
					Ваше ім&apos;я користувача, яке використовується лише для відображення в системі. Ім&apos;я, яке буде
					відображатися для колег - <strong>{user?.username}</strong>
				</p>
				<form onSubmit={handleUsernameSubmit} className="settings-form">
					<div className="form-group">
						<input
							type="text"
							className="form-input"
							placeholder="Ваше ім'я"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							minLength={6}
						/>
					</div>
					<button type="submit" className="btn-primary">
						Оновити ім&apos;я
					</button>
				</form>
			</section>

			<section className="settings-section">
				<h2>Пароль</h2>
				<p className="settings-description">Змініть свій пароль: Для вашої безпеки введіть 6 символів або більше.</p>
				<form onSubmit={handlePasswordSubmit} className="settings-form">
					<div className="form-group">
						<div className="password-container">
							<input
								type={currentPasswordVisible ? "text" : "password"}
								className="form-input"
								placeholder="Поточний пароль"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								required
								minLength={6}
							/>
							<button
								type="button"
								className="password-toggle"
								onClick={() => setCurrentPasswordVisible(!currentPasswordVisible)}
							>
								{currentPasswordVisible ? "Приховати" : "Показати"}
							</button>
						</div>
					</div>
					<div className="form-group">
						<div className="password-container">
							<input
								type={newPasswordVisible ? "text" : "password"}
								className="form-input"
								placeholder="Новий пароль"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								required
								minLength={6}
							/>
							<button
								type="button"
								className="password-toggle"
								onClick={() => setNewPasswordVisible(!newPasswordVisible)}
							>
								{newPasswordVisible ? "Приховати" : "Показати"}
							</button>
						</div>
					</div>
					<button type="submit" className="btn-primary">
						Оновити пароль
					</button>
				</form>
			</section>

			<section className="settings-section">
				<h2>Електронна пошта</h2>
				<p className="settings-description">
					Змінити адресу електронної пошти - <strong>{user?.email}</strong>.
				</p>
				<form onSubmit={handleEmailSubmit} className="settings-form">
					<div className="form-group">
						<input
							type="email"
							className="form-input"
							placeholder="Email"
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<button type="submit" className="btn-primary">
						Оновити пошту
					</button>
				</form>
			</section>

			<section className="settings-section">
				<h2>Фото профілю</h2>
				<div className="profile-photo-container">
					{user?.avatar ? (
						<img src={user.avatar} alt="Profile" className="profile-photo" />
					) : (
						<div className="profile-initials">{user?.username ? user.username.charAt(0).toUpperCase() : "U"}</div>
					)}
				</div>
				<input type="file" onChange={handleAvatarChange} accept="image/*" />
				<button className="btn-secondary" onClick={handleAvatarUpload}>
					Оновити фото профілю
				</button>
			</section>

			<section className="settings-section danger-zone">
				<h2>Видалити акаунт</h2>
				<p className="settings-description">
					Щоб повністю видалити свій обліковий запис, включаючи всі створені вами інтелект-карти, натисніть кнопку
					нижче.
				</p>
				<button className="btn-danger" onClick={handleDeleteAccount}>
					Видалити акаунт
				</button>
			</section>

			<section className="settings-section">
				<h2>Про себе</h2>
				<p className="settings-description">Змінини інформацію та опис про себе.</p>
				<form onSubmit={handleBioSubmit} className="settings-form">
					<div className="form-group">
						<input
							type="bio"
							className="form-input"
							defaultValue={user?.bio}
							onChange={(e) => setBio(e.target.value)}
							required
						/>
					</div>
					<button type="submit" className="btn-primary">
						Оновити інформацію про себе
					</button>
				</form>
			</section>
		</div>
	);
};

export default SettingsPage;
