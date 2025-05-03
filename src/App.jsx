import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import CanvasPage from "./layout/pages/Canvas";
import Header from "./layout/pages/Header";
import Footer from "./layout/pages/Footer";
import NotFoundPage from "./layout/pages/NotFoundPage";
import HomePage from "./layout/pages/HomePage";
import ProfilePage from "./layout/pages/ProfilePage";
import SignInPage from "./layout/pages/SignInPage";
import SignUpPage from "./layout/pages/SignUpPage";
import SettingsPage from "./layout/pages/SettingsPage";
import InvitationsPage from "./layout/pages/InvitationsPage";
import { AuthProvider } from "./utils/authContext";
import { ToastContainer, Slide } from "react-toastify";

function AppContent() {
	const location = useLocation();

	const noFooterPaths = ["/mindmap"];

	const shouldShowFooter = !noFooterPaths.some((path) => location.pathname.startsWith(path));

	return (
		<>
			<Header />
			<div>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/signin/" element={<SignInPage />} />
					<Route path="/signup/" element={<SignUpPage />} />
					<Route path="/profile/:userId" element={<ProfilePage />} />
					<Route path="/settings/" element={<SettingsPage />} />
					<Route path="/mindmap/:mindmapId" element={<CanvasPage />} />
					<Route path="/invitations/" element={<InvitationsPage />} />
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
				<ToastContainer
					position="bottom-right"
					autoClose={1000}
					limit={3}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="light"
					transition={Slide}
				/>
				{shouldShowFooter && <Footer />}
			</div>
		</>
	);
}

function App() {
	return (
		<AuthProvider>
			<Router>
				<AppContent />
			</Router>
		</AuthProvider>
	);
}

export default App;

// import React, { useState, useEffect, useCallback } from "react";
// import ReactFlow, { Background, Controls, MiniMap, addEdge, applyEdgeChanges, applyNodeChanges } from "reactflow";
// import "reactflow/dist/style.css";
// import { io } from "socket.io-client";

// // Initialize socket connection
// const socket = io("http://localhost:5000");

// function App() {
// 	const [nodes, setNodes] = useState([]);
// 	const [edges, setEdges] = useState([]);
// 	const [username, setUsername] = useState("");
// 	const [isConnected, setIsConnected] = useState(false);
// 	const [usersOnline, setUsersOnline] = useState([]);

// 	// Connect to socket when component mounts
// 	useEffect(() => {
// 		socket.on("connect", () => {
// 			setIsConnected(true);
// 			console.log("Connected to server");
// 		});

// 		socket.on("disconnect", () => {
// 			setIsConnected(false);
// 			console.log("Disconnected from server");
// 		});

// 		socket.on("initialState", (flowData) => {
// 			setNodes(flowData.nodes || []);
// 			setEdges(flowData.edges || []);
// 		});

// 		socket.on("nodesUpdate", (updatedNodes) => {
// 			setNodes(updatedNodes);
// 		});

// 		socket.on("edgesUpdate", (updatedEdges) => {
// 			setEdges(updatedEdges);
// 		});

// 		socket.on("usersUpdate", (users) => {
// 			setUsersOnline(users);
// 		});

// 		// Clean up event listeners
// 		return () => {
// 			socket.off("connect");
// 			socket.off("disconnect");
// 			socket.off("initialState");
// 			socket.off("nodesUpdate");
// 			socket.off("edgesUpdate");
// 			socket.off("usersUpdate");
// 		};
// 	}, []);

// 	// Handle user login
// 	const handleLogin = () => {
// 		if (username.trim()) {
// 			socket.emit("userLogin", username);
// 		}
// 	};

// 	// Handle node changes and emit to server
// 	const onNodesChange = useCallback(
// 		(changes) => {
// 			const updatedNodes = applyNodeChanges(changes, nodes);
// 			setNodes(updatedNodes);
// 			socket.emit("updateNodes", updatedNodes);
// 		},
// 		[nodes]
// 	);

// 	// Handle edge changes and emit to server
// 	const onEdgesChange = useCallback(
// 		(changes) => {
// 			const updatedEdges = applyEdgeChanges(changes, edges);
// 			setEdges(updatedEdges);
// 			socket.emit("updateEdges", updatedEdges);
// 		},
// 		[edges]
// 	);

// 	// Handle edge connections and emit to server
// 	const onConnect = useCallback(
// 		(connection) => {
// 			const updatedEdges = addEdge(connection, edges);
// 			setEdges(updatedEdges);
// 			socket.emit("updateEdges", updatedEdges);
// 		},
// 		[edges]
// 	);

// 	// Add a new node to the canvas
// 	const addNode = () => {
// 		const newNode = {
// 			id: `node_${Date.now()}`,
// 			data: { label: `node_${Date.now()}` },
// 			position: { x: Math.random() * 400, y: Math.random() * 400 },
// 		};

// 		const updatedNodes = [...nodes, newNode];
// 		setNodes(updatedNodes);
// 		socket.emit("updateNodes", updatedNodes);
// 	};

// 	// Clear the canvas
// 	const clearCanvas = () => {
// 		setNodes([]);
// 		setEdges([]);
// 		socket.emit("updateNodes", []);
// 		socket.emit("updateEdges", []);
// 	};

// 	// Render login form if not connected with username
// 	if (!username || !isConnected) {
// 		return (
// 			<div
// 				className="login-container"
// 				style={{
// 					maxWidth: "400px",
// 					margin: "100px auto",
// 					padding: "20px",
// 					textAlign: "center",
// 					boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
// 					borderRadius: "8px",
// 				}}
// 			>
// 				<h2>Collaborative Flow Editor</h2>
// 				<p>Enter your name to join</p>
// 				<input
// 					type="text"
// 					value={username}
// 					onChange={(e) => setUsername(e.target.value)}
// 					placeholder="Enter your name"
// 					style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
// 				/>
// 				<button
// 					onClick={handleLogin}
// 					style={{
// 						padding: "8px 16px",
// 						backgroundColor: "#4CAF50",
// 						color: "white",
// 						border: "none",
// 						borderRadius: "4px",
// 						cursor: "pointer",
// 					}}
// 				>
// 					Join Collaboration
// 				</button>
// 				{!isConnected && <p style={{ color: "red" }}>Connecting to server...</p>}
// 			</div>
// 		);
// 	}

// 	return (
// 		<div style={{ width: "100vw", height: "100vh" }}>
// 			<div
// 				style={{
// 					position: "absolute",
// 					top: "10px",
// 					left: "10px",
// 					zIndex: 10,
// 					backgroundColor: "white",
// 					padding: "10px",
// 					borderRadius: "5px",
// 					boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
// 				}}
// 			>
// 				<button onClick={addNode} style={{ marginRight: "10px" }}>
// 					Add Node
// 				</button>
// 				<button onClick={clearCanvas}>Clear Canvas</button>
// 				<div style={{ marginTop: "10px" }}>
// 					<strong>Users Online ({usersOnline.length}):</strong>
// 					<ul style={{ paddingLeft: "20px", margin: "5px 0" }}>
// 						{usersOnline.map((user, index) => (
// 							<li key={index}>{user}</li>
// 						))}
// 					</ul>
// 				</div>
// 			</div>
// 			<ReactFlow
// 				nodes={nodes}
// 				edges={edges}
// 				onNodesChange={onNodesChange}
// 				onEdgesChange={onEdgesChange}
// 				onConnect={onConnect}
// 				fitView
// 			>
// 				<Background />
// 				<Controls />
// 				<MiniMap />
// 			</ReactFlow>
// 		</div>
// 	);
// }

// export default App;
