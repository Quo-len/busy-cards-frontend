import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import * as api from "./../../api";
import Cookies from "js-cookie";
import { useAuth } from "./../../utils/authContext";
import "./../styles/SignInPage.css";

const SignInPage = () => {
	const navigator = useNavigate();
	const { login } = useAuth();

	const [passwordVisible, setPasswordVisible] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	useEffect(() => {
		document.title = "Авторизація - Busy-cards";
	}, []);

	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const isActivated = queryParams.get("activated") === "true";

	const onSubmit = async (data) => {
		const { email, password } = data;
		try {
			const token = await api.login(email, password);
			if (token) {
				Cookies.set("authToken", token, {
					expires: 7,
					path: "/",
				});
				login();
				navigator("/");
			} else {
				console.error("Login failed. No token received.");
			}
		} catch (error) {
			console.error("Error during login:", error);
		}
	};

	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible);
	};

	return (
		<div className="signin-container">
			<div className="signin-card">
				<h1 className="signin-title">Увійдіть</h1>

				{isActivated && (
					<div className="activation-message">
						Ваш обліковий запис активовано. Увійдіть, щоб почати серйозну роботу над мапуванням.
					</div>
				)}

				<div className="signin-subtitle">
					<p>З поверненням!</p>
					<p className="secondary-text">Зареєструйтеся та станьте частиною нашої спільноти.</p>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="signin-form">
					<div className="form-group">
						<input
							type="email"
							className={`form-input ${errors.email ? "input-error" : ""}`}
							placeholder="example@example.com"
							{...register("email", {
								required: "Поле пошти обов'язкове",
							})}
						/>
						{errors.email && <span className="error-message">{errors.email.message}</span>}
					</div>

					<div className="form-group password-group">
						<input
							type={passwordVisible ? "text" : "password"}
							className={`form-input ${errors.password ? "input-error" : ""}`}
							placeholder="Пароль"
							{...register("password", {
								required: "Пароль обов'язковий",
								minLength: {
									value: 5,
									message: "Пароль повинен містити щонайменше 6 символів",
								},
							})}
						/>
						<button type="button" onClick={togglePasswordVisibility} className="password-toggle">
							{passwordVisible ? "Приховати" : "Показати"}
						</button>
						{errors.password && <span className="error-message">{errors.password.message}</span>}
					</div>

					<button type="submit" className="signin-button">
						Увійти
					</button>
				</form>

				<div className="signup-prompt">
					<span className="signup-text">Ще не маєте облікового запису?</span>
					<p className="signup-link" onClick={() => navigator("/signup")}>
						Зареєструйтеся зараз!
					</p>
				</div>
			</div>
		</div>
	);
};

export default SignInPage;

/*

Subject: 
Busy-cards Підтвердження електронної пошти

Message: 
Привіт,

Ви нещодавно змінили свою електронну адресу на ${email} на Busy-cards. Щоб підтвердити нову адресу електронної пошти, перейдіть за посиланням нижче.

https://localhost:5137/confirmEmail?code=hCynzNaDSDvz4C2AcjGy4zhATmpoRZj%2BqjgFpEXrZXri5LFboQO5qPJM1Yb%2Bn2Hs

З повагою,
Busy-cards

---
Це одноразове повідомлення

*/

/*

Subject: 
Busy-cards Відновлення паролю

Message: 
Привіт,

Створено тимчасовий пароль для відновлення вашого облікового запису Mind42. Наведений нижче пароль буде діяти лише один раз і не замінить ваш поточний пароль. Використовуйте його для входу в Mind42, щоб відновити свій обліковий запис і встановити новий пароль.

Ваше ім'я користувача Mind42: ${username}
Ваш тимчасовий пароль: ${tempPassword}

Ви можете використовувати ці дані для входу на:
https://localhost:5137/signin

Якщо ви не запитували відновлення облікового запису, ви можете проігнорувати цей лист. Ваш звичайний пароль все ще активний.

З повагою
Busy-cards

---
Це одноразове повідомлення



*/
