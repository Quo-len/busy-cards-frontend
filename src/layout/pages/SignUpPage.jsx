import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as api from "./../../api";

const SignInPage = () => {
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [passwordStrength, setPasswordStrength] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	useEffect(() => {
		document.title = "Реєстрація - Busy-cards";
	}, []);

	const onSubmit = async (data) => {
		const { email, username, password } = data;
		await api.registration(email, username, password);
	};

	const checkPasswordStrength = (password) => {
		if (password.length < 6) {
			setPasswordStrength("слабкий");
		} else if (password.length < 10) {
			setPasswordStrength("середній");
		} else {
			setPasswordStrength("сильний");
		}
	};

	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible);
	};

	return (
		<div>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div>Зареєструватися</div>

				<div>Виберіть ім&apos;я користувача (використовується для входу у ваш обліковий запис)</div>
				<input
					placeholder="Ім'я користувача"
					{...register("username", {
						required: "Ім'я користувача обов'язкове",
					})}
				/>
				{errors.username && <span className="error-message">{errors.username.message}</span>}

				<div>Ваша електронна адреса</div>
				<input
					type="email"
					className="email-input"
					placeholder="example@example.com"
					{...register("email", {
						required: "Поле пошти - обов'якове",
					})}
				/>
				{errors.email && <span className="error-message">{errors.email.message}</span>}

				<div>Для вашої безпеки введіть 6 символів або більше</div>
				<div className="password-container">
					<input
						type={passwordVisible ? "text" : "password"}
						className="password-input"
						placeholder="Пароль"
						{...register("password", {
							required: "Пароль обов'язковий",
							minLength: {
								value: 6,
								message: "Пароль повинен містити щонайменше 6 символів",
							},
							onChange: (e) => checkPasswordStrength(e.target.value),
						})}
					/>
					<button type="button" onClick={togglePasswordVisibility} className="password-toggle">
						{passwordVisible ? "Приховати" : "Показати"}
					</button>
				</div>
				{errors.password && <span className="error-message">{errors.password.message}</span>}
				{passwordStrength && <div className="strength-indicator">Надійність паролю: {passwordStrength}</div>}

				<div className="terms-container">
					<input
						type="checkbox"
						id="agreeToTerms"
						className="checkbox"
						{...register("agreeToTerms", {
							required: "Ви повинні погодитися з умовами, щоб продовжити",
						})}
					/>
					<label htmlFor="agreeToTerms">
						Я погоджуюсь, що сайт зберігає та обробляє введені вище дані для надання цієї послуги. Ваші дані
						використовуються тільки для надання послуги і не передаються третім особам. Ваші дані будуть повністю
						видалені, коли ви скасуєте свій обліковий запис - що ви можете зробити в будь-який час. Детальну інформацію
						про те, які дані ми зберігаємо і для чого ми їх використовуємо, ви знайдете в нашій Політиці
						конфіденційності.
					</label>
				</div>
				{errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms.message}</span>}

				<div>Натискаючи кнопку «Зареєструватися», ви також погоджуєтеся з нашими умовами використання.</div>
				<button type="submit">Зареєструватись</button>
			</form>
		</div>
	);
};

export default SignInPage;
