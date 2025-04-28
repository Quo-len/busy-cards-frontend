import Cookies from "js-cookie";

export function getAuthTokenFromCookies() {
	const cookieString = document.cookie;
	const cookies = cookieString.split("; ");
	const authTokenCookie = cookies.find((row) => row.startsWith("authToken="));
	return authTokenCookie ? authTokenCookie.split("=")[1] : null;
}

export const logout = () => {
	Cookies.remove("authToken", { path: "/" });

	// window.location.href = "/signin";
};

export const isTokenExpired = () => {
	const token = getAuthTokenFromCookies();

	if (!token || token === "undefined") {
		console.error("Token is missing.");
		return true;
	}

	const base64Url = token.split(".")[1];
	const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
	const decoded = JSON.parse(atob(base64));

	const currentTime = Math.floor(Date.now() / 1000);

	if (decoded.exp < currentTime) {
		return true;
	}

	return false;
};

export const getUserIdFromToken = () => {
	const token = getAuthTokenFromCookies();

	if (!token) {
		console.log("Token is missing.");
		return null;
	}

	const parts = token.split(".");

	if (parts.length !== 3) {
		console.log("Invalid JWT token format.");
		return null;
	}

	const base64Url = parts[1];
	const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

	try {
		const decoded = JSON.parse(atob(base64));
		const userId = decoded.user.id;

		if (userId) {
			return userId;
		} else {
			console.error("User ID (sub) not found in token.");
			return null;
		}
	} catch (error) {
		console.error("Error decoding JWT:", error);
		return null;
	}
};
