import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import NotFoundPage from "../pages/NotFoundPage";
import Loader from "../../components/components/Loader";
import { useAuth } from "./../../utils/authContext";
import "./../styles/SettingsPage.css";
import * as api from "./../../api";
//import BioSection from "./../../components/components/BioSection";

const SettingsPage = () => {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const { user, setUser, logoutUser } = useAuth();
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

	const handleFieldSubmit = async (e, fieldName, value) => {
		e.preventDefault();
		try {
			const updatedData = { [fieldName]: value };
			const response = await api.updateUser(user._id, updatedData);
			setUser(response);

			const fieldNamesUa = {
				username: "Ім'я користувача",
				bio: "Біографія",
				email: "Пошта",
			};

			toast.success(`${fieldNamesUa[fieldName]} успішно оновлено.`);
		} catch (error) {
			toast.error(`Не вдалося оновити поле ${fieldName}: ${error.message}`);
		}
	};

	const handlePasswordSubmit = async (e) => {
		e.preventDefault();
		try {
			await api.updatePassword(currentPassword, newPassword);

			console.log("Password updated");
			setCurrentPassword("");
			setNewPassword("");
			toast.success(`Пароль успішно оновлено.`);
		} catch (error) {
			toast.error(`Не вдалося оновити пароль: ${error.message}`);
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
			setAvatarFile(null);
			toast.success(`Аватар успішно оновлено.`);
		} catch (error) {
			toast.error(`Не вдалося оновити аватар : ${error.message}`);
		}
	};

	const handleDeleteAccount = async () => {
		if (window.confirm("Ви впевнені, що хочете видалити свій обліковий запис? Цю дію не можна скасувати.")) {
			try {
				await api.updateUser(user.id);
				logoutUser();
				toast.success(`Профіль успішно видалено.`);
			} catch (error) {
				toast.error(`Не вдалося видалити профіль: ${error.message}`);
			}
		}
	};

	if (isLoading) {
		return <Loader message="Завантаження налаштувань, зачекайте." flexLayout="true" fullPage="true" />;
	}

	if (!user) {
		return <NotFoundPage message="Авторизуйтесь для продовження роботи." code="403" />;
	}

	return (
		<div className="settings-container">
			<section className="settings-section">
				<h2>Ім&apos;я користувача</h2>
				<p className="settings-description">
					Ваше ім&apos;я користувача, яке використовується лише для відображення в системі. Ім&apos;я, яке буде
					відображатися для колег - <strong>{user?.username}</strong>
				</p>
				<form onSubmit={(e) => handleFieldSubmit(e, "username", username)} className="settings-form">
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
				<form onSubmit={(e) => handleFieldSubmit(e, "email", email)} className="settings-form">
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

			{/* <BioSection user={user} handleFieldSubmit={handleFieldSubmit} /> */}
		</div>
	);
};

export default SettingsPage;
