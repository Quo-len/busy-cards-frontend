import React from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import Canvas from "./layout/pages/Canvas";
import Header from "./layout/pages/Header";
import Footer from "./layout/pages/Footer";
import { WebSocketProvider } from "./utils/WebSocketContext";
import NotFoundPage from "./layout/pages/NotFoundPage";
import HomePage from "./layout/pages/HomePage";
import ProfilePage from "./layout/pages/ProfilePage";
import SignInPage from "./layout/pages/SignInPage";
import SignUpPage from "./layout/pages/SignUpPage";
import SettingsPage from "./layout/pages/SettingsPage";

function App() {
	return (
		<Router>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					height: "100vh",
					width: "100vw",
					overflow: "hidden",
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
				}}
			>
				<Header />
				<div
					style={{
						display: "flex",
						flex: 1,
						overflow: "hidden",
						position: "relative",
					}}
				>
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/signin/" element={<SignInPage />} />
						<Route path="/signup/" element={<SignUpPage />} />
						<Route path="/profile/:userId" element={<ProfilePage />} />
						<Route path="/settings/" element={<SettingsPage />} />
						<Route path="/mindmap/:mindmapId" element={<MindmapCanvasWrapper />} />
						<Route path="*" element={<NotFoundPage />} />
					</Routes>
				</div>
				<Footer />
			</div>
		</Router>
	);
}

function MindmapCanvasWrapper() {
	const { mindmapId } = useParams();

	return (
		<WebSocketProvider mindmapId={mindmapId}>
			<ReactFlowProvider>
				<Canvas />
			</ReactFlowProvider>
		</WebSocketProvider>
	);
}

export default App;

// App.js - Example usage
// import React from "react";
// import { useParams } from "react-router-dom";
// import { ReactFlowProvider } from "reactflow";
// import { WebSocketProvider } from "./2WebSocketContext";
// import CollaborativeFlow from "./2CollaborativeFlow";

// const initialNodes = [
// 	{ id: "1", type: "custom", data: { label: "Node 1", description: "First node" }, position: { x: 100, y: 200 } },
// 	{ id: "2", type: "custom", data: { label: "Node 2", description: "Second node" }, position: { x: 100, y: 400 } },
// ];

// const initialEdges = [{ id: "e1-2", type: "custom", source: "1", target: "2" }];

// const FlowPage = () => {
// 	const { roomId } = useParams();

// 	return (
// 		<div style={{ width: "100vw", height: "100vh" }}>
// 			<ReactFlowProvider>
// 				<WebSocketProvider roomId={roomId}>
// 					<CollaborativeFlow initialNodes={initialNodes} initialEdges={initialEdges} />
// 				</WebSocketProvider>
// 			</ReactFlowProvider>
// 		</div>
// 	);
// };

// export default FlowPage;
