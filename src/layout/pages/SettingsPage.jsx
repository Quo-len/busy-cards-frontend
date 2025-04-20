import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import * as api from "./../../api";
import "../styles/profilepage.css";
import { useForm } from "react-hook-form";
import { useAuth } from "./../../utils/authContext";

const SettingsPage = () => {
	const { user } = useAuth();
	const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
	const [newPasswordVisible, setNewPasswordVisible] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	useEffect(() => {
		document.title = `Налаштування - Busy-cards`;
	}, []);

	const fetchUser = async () => {
		try {
			const user = fetchUser();
			setUser(user);
		} catch (err) {
			console.log("Failed to fetch user");
		}
	};

	const toggleCurrentPasswordVisibility = () => {
		setCurrentPasswordVisible(!currentPasswordVisible);
	};

	const toggleNewPasswordVisibility = () => {
		setNewPasswordVisible(!newPasswordVisible);
	};

	return (
		<div>
			<div>
				<h2>Ім&apos;я користувача</h2>
				<div>
					Ваше ім&apos;я користувача, яке використовується для входу в систему - <strong>{user?.username}</strong> -
					наразі його не можна змінити. Але ви можете вільно вибрати ім&apos;я, яке буде відображатися для ваших колег і
					в публічній галереї мапи думок.
				</div>
				<input
					type="text"
					className="password-input"
					placeholder="Ваше ім'я"
					{...register("username", {
						required: "Username is required",
						minLength: {
							value: 6,
							message: "Password must be at least 6 characters long",
						},
					})}
				/>
				<button>Оновити ім&apos;я</button>
			</div>

			<div>
				<h2>Пароль</h2>
				<div>Змініть свій пароль: Для вашої безпеки введіть 6 символів або більше.</div>
				<input
					type={currentPasswordVisible ? "text" : "password"}
					className="password-input"
					placeholder="Пароль"
					{...register("currentpassword", {
						required: "Пароль обов'язковий",
						minLength: {
							value: 5,
							message: "Пароль повинен містити щонайменше 6 символів",
						},
					})}
				/>
				<button type="button" onClick={toggleCurrentPasswordVisibility} className="password-toggle">
					{currentPasswordVisible ? "Приховати" : "Показати"}
				</button>
				<input
					type={newPasswordVisible ? "text" : "password"}
					className="password-input"
					placeholder="Пароль"
					{...register("newPassword", {
						required: "Пароль обов'язковий",
						minLength: {
							value: 5,
							message: "Пароль повинен містити щонайменше 6 символів",
						},
					})}
				/>
				<button type="button" onClick={toggleNewPasswordVisibility} className="password-toggle">
					{newPasswordVisible ? "Приховати" : "Показати"}
				</button>
				<button>Оновити пароль</button>
			</div>

			<div>
				<h2></h2>
				<div>Змінити адресу електронної пошти.</div>
				<input
					type="email"
					className="email-input"
					defaultValue={user?.email}
					{...register("email", {
						required: "Email is required",
					})}
				/>
				<button>Оновити пошту</button>
			</div>

			<div>
				<h2>Фото профілю</h2>
				<div></div>
				<img src="" alt="" />
				<button>Оновити фото профілю</button>
			</div>

			<div>
				<h2>Видалити акаунт</h2>
				<div>
					Щоб повністю видалити свій обліковий запис, включаючи всі створені вами інтелект-карти, натисніть кнопку
					нижче.
				</div>
				<button>Видалити акаунт</button>
			</div>
		</div>
	);
};

export default SettingsPage;
