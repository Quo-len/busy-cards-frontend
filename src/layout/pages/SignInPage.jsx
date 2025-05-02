import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import * as api from "./../../api";
import Cookies from "js-cookie";
import { useAuth } from "./../../utils/authContext";
import { toast } from "react-toastify";

import {
	Box,
	Typography,
	TextField,
	Button,
	Paper,
	InputAdornment,
	IconButton,
	Container,
	Alert,
	Link,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const SignInPage = () => {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [passwordVisible, setPasswordVisible] = useState(false);

	const {
		control,
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

		const result = await api.login(email, password);

		if (result.token) {
			Cookies.set("authToken", result.token, {
				expires: 7,
				path: "/",
			});
			login();
			navigate("/");
			toast.success("Успішний вхід!");
		} else {
			toast.error(result.error);
		}
	};

	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible);
	};

	return (
		<Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
			<Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
				<Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
					Увійдіть
				</Typography>

				{isActivated && (
					<Alert severity="success" sx={{ mb: 3 }}>
						Ваш обліковий запис активовано. Увійдіть, щоб почати серйозну роботу над мапуванням.
					</Alert>
				)}

				<Box mb={3}>
					<Typography variant="body1">З поверненням!</Typography>
					<Typography variant="body2" color="text.secondary">
						Зареєструйтеся та станьте частиною нашої спільноти.
					</Typography>
				</Box>

				<Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
					<Controller
						name="email"
						control={control}
						defaultValue=""
						rules={{
							required: "Поле пошти обов'язкове",
							pattern: {
								value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
								message: "Невірний формат електронної пошти",
							},
						}}
						render={({ field }) => (
							<TextField
								{...field}
								margin="normal"
								fullWidth
								id="email"
								label="Електронна пошта"
								placeholder="example@example.com"
								autoComplete="email"
								error={!!errors.email}
								helperText={errors.email ? errors.email.message : ""}
							/>
						)}
					/>

					<Controller
						name="password"
						control={control}
						defaultValue=""
						rules={{
							required: "Пароль обов'язковий",
							minLength: {
								value: 5,
								message: "Пароль повинен містити щонайменше 6 символів",
							},
						}}
						render={({ field }) => (
							<TextField
								{...field}
								margin="normal"
								fullWidth
								label="Пароль"
								type={passwordVisible ? "text" : "password"}
								id="password"
								autoComplete="current-password"
								error={!!errors.password}
								helperText={errors.password ? errors.password.message : ""}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton aria-label="toggle password visibility" onClick={togglePasswordVisibility} edge="end">
												{passwordVisible ? <VisibilityOff /> : <Visibility />}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>
						)}
					/>

					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						size="large"
						sx={{ mt: 3, mb: 2, py: 1.5 }}
					>
						Увійти
					</Button>
				</Box>

				<Box mt={2} textAlign="center">
					<Typography variant="body2" display="inline" mr={1}>
						Ще не маєте облікового запису?
					</Typography>
					<Link component="button" variant="body2" color="primary" onClick={() => navigate("/signup")}>
						Зареєструйтеся зараз!
					</Link>
				</Box>
			</Paper>
		</Container>
	);
};

export default SignInPage;
