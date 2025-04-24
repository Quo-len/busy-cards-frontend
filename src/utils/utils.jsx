import { v4 as uuidv4 } from "uuid";
import { getOutgoers, getIncomers } from "reactflow";
import Cookies from "js-cookie";

export function createNodesAndEdges(xNodes = 10, yNodes = 10) {
	const nodes = [];
	const edges = [];
	let nodeId = 1;
	let recentNodeId = null;

	for (let y = 0; y < yNodes; y++) {
		for (let x = 0; x < xNodes; x++) {
			const position = { x: x * 150, y: y * 100 };
			const data = { label: `Node ${nodeId}` };
			const node = {
				id: `stress-${nodeId.toString()}`,
				style: { width: 100, fontSize: 15 },
				data,
				position,
				type: "default",
			};
			nodes.push(node);

			if (recentNodeId && nodeId <= xNodes * yNodes) {
				edges.push({
					id: `${x}-${y}`,
					source: `stress-${recentNodeId.toString()}`,
					target: `stress-${nodeId.toString()}`,
					type: "default",
				});
			}

			recentNodeId = nodeId;
			nodeId++;
		}
	}

	return { nodes, edges };
}

export function generateRandomColor() {
	"#" + Math.floor(Math.random() * 16777215).toString(16);
}

export const isNodeDescendant = (node, targetNode, nodes, edges) => {
	const visited = new Set();

	const checkDescendants = (currentNode) => {
		if (visited.has(currentNode.id)) return false;
		visited.add(currentNode.id);

		const relatives = [...getIncomers(currentNode, nodes, edges), ...getOutgoers(currentNode, nodes, edges)];

		for (const relative of relatives) {
			if (relative.id === targetNode.id) return true;
			if (checkDescendants(relative)) return true;
		}

		return false;
	};

	return checkDescendants(node);
};

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
