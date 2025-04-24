// import React, { createContext, useContext, useEffect, useState, useParams } from "react";
// import * as Y from "yjs";
// import { WebsocketProvider } from "y-websocket";

// // Create a context for the WebSocket and Yjs document
// const WebSocketContext = createContext({
// 	ydoc: null,
// 	provider: null,
// });

// // Custom hook to use the WebSocket context
// export const useWebSocket = () => {
// 	return useContext(WebSocketContext);
// };

// // WebSocket Provider Component
// export const WebSocketProvider = ({ children, mindmapId }) => {
// 	const [ydoc, setYdoc] = useState(null);
// 	const [provider, setProvider] = useState(null);

// 	useEffect(() => {
// 		if (!mindmapId) return;
// 		// Create Yjs document
// 		const doc = new Y.Doc();

// 		console.log("Websocket: " + mindmapId);

// 		// Create WebSocket provider
// 		const wsProvider = new WebsocketProvider("ws://localhost:5000", `mindmap-${mindmapId}`, doc);

// 		// Store references
// 		setYdoc(doc);
// 		setProvider(wsProvider);

// 		// Cleanup function
// 		return () => {
// 			console.log("destroy socket: " + mindmapId);
// 			wsProvider.destroy();
// 			doc.destroy();
// 		};
// 	}, [mindmapId]);

// 	// Context value to be shared
// 	const contextValue = {
// 		ydoc,
// 		provider,
// 	};

// 	return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
// };

import React, { createContext, useContext, useEffect, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const WS_HOST =
	import.meta.env.VITE_NODE_ENV === "development" ? import.meta.env.VITE_DEV_IP : import.meta.env.VITE_PROD_IP;
const WS_PORT = import.meta.env.VITE_WS_PORT;

// Create a context for the WebSocket and Yjs document
const WebSocketContext = createContext({
	ydoc: null,
	provider: null,
	connectionStatus: "disconnected",
	printState: () => {},
});

// Custom hook to use the WebSocket context
export const useWebSocket = () => {
	return useContext(WebSocketContext);
};

// WebSocket Provider Component
export const WebSocketProvider = ({ children, mindmapId }) => {
	const [ydoc, setYdoc] = useState(null);
	const [provider, setProvider] = useState(null);
	const [connectionStatus, setConnectionStatus] = useState("disconnected");

	useEffect(() => {
		if (!mindmapId) return;

		// Create Yjs document
		const doc = new Y.Doc();
		console.log(`Creating WebSocket connection for mindmap: ${mindmapId}`);

		// Create WebSocket provider
		const wsUrl = `ws://${WS_HOST}:${WS_PORT}`;
		const wsProvider = new WebsocketProvider(wsUrl, `mindmap-${mindmapId}`, doc, { connect: true });

		// Set up connection status listeners
		wsProvider.on("status", (event) => {
			console.log("WebSocket status:", event.status);
			setConnectionStatus(event.status);
		});

		wsProvider.on("connection-close", () => {
			console.log("WebSocket connection closed");
			setConnectionStatus("disconnected");
		});

		wsProvider.on("connection-error", (e) => {
			console.error("WebSocket connection error:", e);
			setConnectionStatus("error");
		});

		wsProvider.on("sync", (isSynced) => {
			console.log(`WebSocket sync state: ${isSynced ? "synced" : "not synced"}`);
			if (isSynced) {
				console.log("Initial document state:");
				printDocumentState(doc);
			}
		});

		// Store references
		setYdoc(doc);
		setProvider(wsProvider);
		setConnectionStatus("connecting");

		// Cleanup function
		return () => {
			console.log(`Destroying WebSocket connection: mindmap-${mindmapId}`);
			wsProvider.disconnect();
			wsProvider.destroy();
			doc.destroy();
			setConnectionStatus("disconnected");
		};
	}, [mindmapId]);

	// Print document state helper
	const printDocumentState = (doc) => {
		if (!doc) return;

		const nodesMap = doc.getMap("nodes");
		const edgesMap = doc.getMap("edges");

		console.log("--- Document State ---");
		console.log("Nodes:", Array.from(nodesMap.entries()));
		console.log("Edges:", Array.from(edgesMap.entries()));
		console.log("---------------------");
	};

	// Function to request state from server or print local state
	const printState = () => {
		if (!ydoc) {
			console.log("No active document");
			return;
		}

		// Print local state
		printDocumentState(ydoc);

		// Request state from server if connected
		if (provider && provider.wsconnected) {
			provider.ws.send(JSON.stringify({ type: "print_state" }));
		}
	};

	// Context value to be shared
	const contextValue = {
		ydoc,
		provider,
		connectionStatus,
		printState,
	};

	return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
};

export default WebSocketProvider;
