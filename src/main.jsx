import React from "react";
import { createRoot } from "react-dom/client";
import { ReactFlowProvider } from "reactflow";
import App from "./App";
import "reactflow/dist/style.css";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
	// comment strict mode to prevent double socket connection
	//<React.StrictMode>
	<ReactFlowProvider>
		<App />
	</ReactFlowProvider>
	//</React.StrictMode>
);
