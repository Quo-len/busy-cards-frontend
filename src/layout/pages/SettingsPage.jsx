import React, { useState, useEffect } from "react";
import { useAuth } from "./../../utils/authContext";
import "./../styles/SettingsPage.css";
import * as api from "./../../api";

const SettingsPage = () => {
	const { user, setUser } = useAuth();
	const [loading, setLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
	const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
	const [newPasswordVisible, setNewPasswordVisible] = useState(false);

	// Form state
	const [username, setUsername] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [email, setEmail] = useState("");

	useEffect(() => {
		document.title = `Налаштування - Busy-cards`;
		if (user?.email) {
			setEmail(user.email);
		}
	}, [user]);

	const handleUsernameSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			// API call would go here
			const updatedData = { username: username };
			const response = await api.updateUser(user._id, updatedData);
			setUser(response);

			console.log("Username updated:", username);
			setSuccessMessage("Username updated successfully");
			setTimeout(() => setSuccessMessage(""), 3000);
		} catch (err) {
			console.log("Failed to update username:" + err.message);
		} finally {
			setLoading(false);
		}
	};

	const handlePasswordSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			// API call would go here
			await api.updatePassword(currentPassword, newPassword);

			console.log("Password updated");
			setSuccessMessage("Password updated successfully");
			setTimeout(() => setSuccessMessage(""), 3000);
			setCurrentPassword("");
			setNewPassword("");
		} catch (err) {
			console.log("Failed to update password");
		} finally {
			setLoading(false);
		}
	};

	const handleEmailSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			// API call would go here
			const updatedData = { email: email };
			const response = await api.updateUser(user._id, updatedData);
			setUser(response);

			console.log("Email updated:", email);
			setSuccessMessage("Email updated successfully");
			setTimeout(() => setSuccessMessage(""), 3000);
		} catch (err) {
			console.log("Failed to update email:" + err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteAccount = async () => {
		if (window.confirm("Ви впевнені, що хочете видалити свій обліковий запис? Цю дію не можна скасувати.")) {
			try {
				// API call would go here
				await api.updateUser(user.id);

				console.log("Account deleted");
				// Redirect to logout or home
			} catch (err) {
				console.log("Failed to delete account:" + err.message);
			}
		}
	};

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
					<button type="submit" className="btn-primary" disabled={loading}>
						{loading ? "Оновлення..." : "Оновити ім'я"}
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
					<button type="submit" className="btn-primary" disabled={loading}>
						{loading ? "Оновлення..." : "Оновити пароль"}
					</button>
				</form>
			</section>

			<section className="settings-section">
				<h2>Електронна пошта</h2>
				<p className="settings-description">Змінити адресу електронної пошти.</p>
				<form onSubmit={handleEmailSubmit} className="settings-form">
					<div className="form-group">
						<input
							type="email"
							className="form-input"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<button type="submit" className="btn-primary" disabled={loading}>
						{loading ? "Оновлення..." : "Оновити пошту"}
					</button>
				</form>
			</section>

			<section className="settings-section">
				<h2>Фото профілю</h2>
				<div className="profile-photo-container">
					{user?.photoUrl ? (
						<img src={user.photoUrl} alt="Profile" className="profile-photo" />
					) : (
						<div className="profile-initials">{user?.username ? user.username.charAt(0).toUpperCase() : "U"}</div>
					)}
				</div>
				<button className="btn-secondary">Оновити фото профілю</button>
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
		</div>
	);
};

export default SettingsPage;
