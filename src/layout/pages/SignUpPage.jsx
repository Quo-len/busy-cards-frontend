import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as api from "./../../api";
import "./../styles/SignUpPage.css";
import { toast } from "react-toastify";

const SignInPage = () => {
	const navigate = useNavigate();
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [passwordStrength, setPasswordStrength] = useState("");
	const [passwordStrengthClass, setPasswordStrengthClass] = useState("");

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
		const result = await api.registration(email, username, password);

		if (result.success) {
			navigate("/signin?activated=true");
			toast.success("Успішна реєстрація!");
		} else {
			toast.error(result.error);
		}
	};

	const checkPasswordStrength = (password) => {
		if (!password) {
			setPasswordStrength("");
			setPasswordStrengthClass("");
			return;
		}

		if (password.length < 5) {
			setPasswordStrength("слабкий");
			setPasswordStrengthClass("weak");
		} else if (password.length < 10) {
			setPasswordStrength("середній");
			setPasswordStrengthClass("medium");
		} else {
			setPasswordStrength("сильний");
			setPasswordStrengthClass("strong");
		}
	};

	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible);
	};

	return (
		<div className="signup-container">
			<div className="signup-card">
				<h1 className="signup-title">Зареєструватися</h1>

				<form onSubmit={handleSubmit(onSubmit)} className="signup-form">
					<div className="form-group">
						<label className="form-label">Виберіть ім&apos;я користувача</label>
						<div className="form-hint">використовується для входу у ваш обліковий запис</div>
						<input
							className={`form-input ${errors.username ? "input-error" : ""}`}
							placeholder="Ім'я користувача"
							{...register("username", {
								required: "Ім'я користувача обов'язкове",
								minLength: {
									value: 5,
									message: "Ім'я повинно містити щонайменше 5 символів",
								},
								maxLength: {
									value: 30,
									message: "Ім'я користувача не повинно перевищувати 30 символів",
								},
							})}
						/>
						{errors.username && <span className="error-message">{errors.username.message}</span>}
					</div>

					<div className="form-group">
						<label className="form-label">Ваша електронна адреса</label>
						<input
							type="email"
							className={`form-input ${errors.email ? "input-error" : ""}`}
							placeholder="example@example.com"
							{...register("email", {
								required: "Поле пошти обов'язкове",
								pattern: {
									value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
									message: "Невірний формат електронної пошти",
								},
							})}
						/>
						{errors.email && <span className="error-message">{errors.email.message}</span>}
					</div>

					<div className="form-group">
						<label className="form-label">Пароль</label>
						<div className="form-hint">Для вашої безпеки введіть 5 символів або більше</div>
						<div className="password-container">
							<input
								type={passwordVisible ? "text" : "password"}
								className={`form-input ${errors.password ? "input-error" : ""}`}
								placeholder="Пароль"
								{...register("password", {
									required: "Пароль обов'язковий",
									minLength: {
										value: 5,
										message: "Пароль повинен містити щонайменше 5 символів",
									},
									maxLength: {
										value: 128,
										message: "Пароль не повинен перевищувати 128 символів",
									},
									onChange: (e) => checkPasswordStrength(e.target.value),
								})}
							/>
							<button type="button" onClick={togglePasswordVisibility} className="password-toggle">
								{passwordVisible ? "Приховати" : "Показати"}
							</button>
						</div>
						{errors.password && <span className="error-message">{errors.password.message}</span>}
						{passwordStrength && (
							<div className={`strength-indicator ${passwordStrengthClass}`}>
								Надійність паролю: <span className="strength-text">{passwordStrength}</span>
							</div>
						)}
					</div>

					<div className="terms-container">
						<div className="checkbox-wrapper">
							<input
								type="checkbox"
								id="agreeToTerms"
								className="checkbox"
								{...register("agreeToTerms", {
									required: "Ви повинні погодитися з умовами, щоб продовжити",
								})}
							/>
							<label htmlFor="agreeToTerms" className="terms-label">
								Я погоджуюсь, що сайт зберігає та обробляє введені вище дані для надання цієї послуги. Ваші дані
								використовуються тільки для надання послуги і не передаються третім особам. Ваші дані будуть повністю
								видалені, коли ви скасуєте свій обліковий запис - що ви можете зробити в будь-який час. Детальну
								інформацію про те, які дані ми зберігаємо і для чого ми їх використовуємо, ви знайдете в нашій Політиці
								конфіденційності.
							</label>
						</div>
						{errors.agreeToTerms && <span className="error-message terms-error">{errors.agreeToTerms.message}</span>}
					</div>

					<div className="consent-notice">
						Натискаючи кнопку «Зареєструватися», ви також погоджуєтеся з нашими умовами використання.
					</div>

					<button type="submit" className="signup-button">
						Зареєструватись
					</button>
				</form>

				<div className="signin-prompt">
					<span onClick={() => navigate("/signin")} className="signin-link">
						Вже маєте обліковий запис? Увійти
					</span>
				</div>
			</div>
		</div>
	);
};

export default SignInPage;
