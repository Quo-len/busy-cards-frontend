import React from "react";
import { createRoot } from "react-dom/client";
import { ReactFlowProvider } from "reactflow";
import App from "./App";
import "reactflow/dist/style.css";
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
	//<React.StrictMode>
	<ReactFlowProvider>
		<App />
	</ReactFlowProvider>
	//</React.StrictMode>
);
