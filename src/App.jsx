import React from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import Canvas from "./layout/pages/Canvas";
import Header from "./layout/pages/Header";
import Footer from "./layout/pages/Footer";
import { WebSocketProvider } from "./utils/WebSocketContext";
import MindmapList from "./components/components/MindmapList";
import NotFoundPage from "./layout/pages/NotFoundPage";

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
						<Route path="/" element={<MindmapList />} />
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
