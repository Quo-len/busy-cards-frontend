import { useState, useCallback, useRef, useEffect } from "react";

export const useNodeSearch = (nodes, reactFlowInstance) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

	const localHighlightsRef = useRef(new Map());

	useEffect(() => {
		return () => {
			localHighlightsRef.current.clear();
		};
	}, []);

	const searchNodes = (searchText, nodes) => {
		if (!searchText || searchText.trim() === "") {
			return [];
		}

		const normalizedSearchText = searchText.toLowerCase().trim();
		const containsSearchText = (obj) => {
			if (typeof obj === "string") {
				return obj.toLowerCase().includes(normalizedSearchText);
			}

			if (typeof obj === "number") {
				return obj.toString().includes(normalizedSearchText);
			}

			if (obj === null || obj === undefined) {
				return false;
			}

			if (Array.isArray(obj)) {
				return obj.some((item) => containsSearchText(item));
			}

			if (typeof obj === "object") {
				return Object.values(obj).some((value) => containsSearchText(value));
			}

			return false;
		};

		return nodes.filter((node) => {
			return containsSearchText(node);
		});
	};

	const handleSearch = () => {
		if (searchQuery === "") return;

		const matchingNodes = searchNodes(searchQuery, nodes);
		setSearchResults(matchingNodes);

		localHighlightsRef.current.clear();

		if (matchingNodes.length > 0) {
			setCurrentSearchIndex(0);

			matchingNodes.forEach((node) => {
				localHighlightsRef.current.set(node.id, {
					type: "search-result",
					boxShadow: "0 0 10px #ff9900",
					border: "2px solid #ff9900",
				});
			});

			navigateSearchResults(0);
		}
	};

	const clearSearch = useCallback(() => {
		setSearchQuery("");
		setSearchResults([]);
		setCurrentSearchIndex(0);

		localHighlightsRef.current.clear();
	}, []);

	const navigateToNode = useCallback(
		(targetNode) => {
			if (targetNode) {
				reactFlowInstance.setCenter(
					targetNode.position.x + (targetNode.width || 0) / 2,
					targetNode.position.y + (targetNode.height || 0) / 2,
					{ zoom: 1.5, duration: 800 }
				);
			}
		},
		[reactFlowInstance]
	);

	const navigateSearchResults = useCallback(
		(direction) => {
			if (searchResults.length === 0) return;

			let newIndex;
			if (direction > 0) {
				newIndex = currentSearchIndex >= searchResults.length - 1 ? 0 : currentSearchIndex + 1;
			} else if (direction < 0) {
				newIndex = currentSearchIndex <= 0 ? searchResults.length - 1 : currentSearchIndex - 1;
			} else {
				newIndex = 0;
			}

			setCurrentSearchIndex(newIndex);

			const targetNode = searchResults[newIndex];
			if (targetNode) {
				navigateToNode(targetNode);

				searchResults.forEach((node) => {
					localHighlightsRef.current.set(node.id, {
						type: "search-result",
						boxShadow: "0 0 10px #ff9900",
						border: "2px solid #ff9900",
					});
				});

				localHighlightsRef.current.set(targetNode.id, {
					type: "current-result",
					boxShadow: "0 0 15px #ff5500",
					border: "3px solid #ff5500",
					zIndex: 1000,
				});
			}
		},
		[searchResults, currentSearchIndex, navigateToNode]
	);

	const getLocalNodeStyle = useCallback((nodeId) => {
		return localHighlightsRef.current.get(nodeId) || null;
	}, []);

	return {
		searchQuery,
		setSearchQuery,
		searchResults,
		currentSearchIndex,
		handleSearch,
		clearSearch,
		navigateSearchResults,
		navigateToNode,
		getLocalNodeStyle,
	};
};
