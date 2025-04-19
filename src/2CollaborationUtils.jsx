// CollaborationUtils.js
import { nanoid } from "nanoid";

// Generate a random color for user identification
export const generateRandomColor = () => {
	return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

// Create a user object with a random ID and color
export const createUser = (name) => {
	return {
		id: `user-${nanoid(6)}`,
		name: name || "Anonymous",
		color: generateRandomColor(),
	};
};

// Get current user from localStorage or create a new one
export const getCurrentUser = () => {
	const storedUser = localStorage.getItem("current-flow-user");

	if (storedUser) {
		return JSON.parse(storedUser);
	}

	// Prompt for name or use default
	const name = prompt("Enter your name for collaboration") || "Anonymous";
	const user = createUser(name);

	// Store user in localStorage
	localStorage.setItem("current-flow-user", JSON.stringify(user));

	return user;
};

// Store user in localStorage
export const storeUser = (user) => {
	localStorage.setItem("current-flow-user", JSON.stringify(user));
};
