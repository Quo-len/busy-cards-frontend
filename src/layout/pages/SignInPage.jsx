import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import * as api from "./../../api";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const SignInPage = () => {
	const navigator = useNavigate();

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
		const token = await api.login(email, password);
		Cookies.set("authToken", token, {
			expires: 7,
			path: "/",
		});
	};

	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible);
	};

	return (
		<div>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div>Увійдіть</div>
				{isActivated && <div>Ваш обліковий запис активовано. Увійдіть, щоб почати серйозну роботу над мапуванням.</div>}
				<div>Зареєструйтеся та станьте частиною нашої спільноти.</div>
				<div>З поверненням!</div>
				<input
					type="email"
					className="email-input"
					placeholder="example@example.com"
					{...register("email", {
						required: "Поле пошти - обов'якове",
					})}
				/>
				{errors.email && <span className="error-message">{errors.email.message}</span>}
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
					})}
				/>
				<button type="button" onClick={togglePasswordVisibility} className="password-toggle">
					{passwordVisible ? "Приховати" : "Показати"}
				</button>
				<div>
					<div
						onClick={() => {
							navigator("/signup");
						}}
					>
						Ще не маєте облікового запису?
					</div>
					<div>Зареєструйтеся зараз!</div>
				</div>
				<button>Увійти</button>
			</form>
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
