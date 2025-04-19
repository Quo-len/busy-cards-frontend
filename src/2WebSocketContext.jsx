// WebSocketContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

// Create a context for the WebSocket and Yjs document
const WebSocketContext = createContext({
	ydoc: null,
	provider: null,
});

// Custom hook to use the WebSocket context
export const useWebSocket = () => {
	return useContext(WebSocketContext);
};

// WebSocket Provider Component
export const WebSocketProvider = ({ children, roomId = 1 }) => {
	const [ydoc, setYdoc] = useState(null);
	const [provider, setProvider] = useState(null);

	useEffect(() => {
		if (!roomId) return;

		// Create Yjs document
		const doc = new Y.Doc();
		console.log("Connecting to WebSocket room:", roomId);

		// Create WebSocket provider
		const wsProvider = new WebsocketProvider("ws://localhost:5000", `flow-${roomId}`, doc);

		// Store references
		setYdoc(doc);
		setProvider(wsProvider);

		// Cleanup function
		return () => {
			console.log("Destroying WebSocket connection for room:", roomId);
			wsProvider.destroy();
			doc.destroy();
		};
	}, [roomId]);

	// Context value to be shared
	const contextValue = {
		ydoc,
		provider,
	};

	return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
};

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
