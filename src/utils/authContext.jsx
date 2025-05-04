import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { getAuthTokenFromCookies, getUserIdFromToken, isTokenExpired, logout } from "./utils";
import * as api from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		const token = getAuthTokenFromCookies();
		if (token && !isTokenExpired()) {
			const userId = getUserIdFromToken();
			if (userId) {
				const fetchUser = async () => {
					try {
						const response = await api.getUser(userId, true);
						setUser(response);
						setIsLoggedIn(true);
					} catch (error) {
						// logout();
						// setIsLoggedIn(false);
					}
				};
				fetchUser();
			}
		} else {
			setIsLoggedIn(false);
			setUser(null);
			logout();
		}
	}, [isLoggedIn]);

	const login = () => {
		setIsLoggedIn(true);
	};

	const logoutUser = () => {
		logout();
		setIsLoggedIn(false);
	};

	return (
		<AuthContext.Provider value={{ user, setUser, isLoggedIn, login, logoutUser }}>{children}</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContext);
};
