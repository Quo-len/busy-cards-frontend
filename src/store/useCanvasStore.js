import { create } from 'zustand';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { createNodesAndEdges } from '../diagram/utils/utils';

const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdges(0, 0);

const useCanvasStore = create((set, get) => ({
	nodes: new Map(
		initialNodes.map((node) => [
			node.id,
			{
				id: node.id,
				type: node.type || 'default',
				position: node.position || { x: 0, y: 0 },
				data: node.data || { label: 'Node' },
			},
		])
	),
	edges: new Map(
		initialEdges.map((edge) => [
			edge.id,
			{
				id: edge.id,
				source: edge.source,
				target: edge.target,
				type: edge.type || 'default',
			},
		])
	),
	ydoc: null,
	provider: null,
	connectionStatus: 'disconnected',
	role: 'Глядач',

	// Initialize Yjs document and provider
	initializeYjs: (mindmapId) => {
		const doc = new Y.Doc();
		const isDev = import.meta.env.VITE_NODE_ENV === 'development';
		const wsProtocol = isDev ? 'ws' : 'wss';
		const wsHost = isDev ? import.meta.env.VITE_DEV_IP : import.meta.env.VITE_PROD_IP;
		const wsPort = import.meta.env.VITE_WS_PORT;
		const wsUrl = `${'ws'}://${wsHost}:${wsPort}`;

		const provider = new WebsocketProvider(wsUrl, `mindmap-${mindmapId}`, doc, { connect: true });

		// Set up Yjs maps for nodes and edges
		const nodesMap = doc.getMap('nodes');
		const edgesMap = doc.getMap('edges');

		// Initialize with default nodes and edges if empty
		if (nodesMap.size === 0) {
			initialNodes.forEach((node) => {
				nodesMap.set(node.id, {
					id: node.id,
					type: node.type || 'default',
					position: node.position || { x: 0, y: 0 },
					data: node.data || { label: 'Node' },
				});
			});
		}

		if (edgesMap.size === 0) {
			initialEdges.forEach((edge) => {
				edgesMap.set(edge.id, {
					id: edge.id,
					source: edge.source,
					target: edge.target,
					type: edge.type || 'default',
				});
			});
		}

		// Observe changes in Yjs maps
		nodesMap.observe(() => {
			const nodes = new Map(nodesMap.entries());
			set({ nodes });
		});

		edgesMap.observe(() => {
			const edges = new Map(edgesMap.entries());
			set({ edges });
		});

		// Set up connection status listeners
		provider.on('status', ({ status }) => {
			set({ connectionStatus: status });
		});

		// Set initial state
		set({
			ydoc: doc,
			provider,
			nodes: new Map(nodesMap.entries()),
			edges: new Map(edgesMap.entries()),
		});
	},

	// Manual refresh of store data from YDoc maps
	refreshFromYDoc: () => {
		const { ydoc } = get();
		if (ydoc) {
			const nodesMap = ydoc.getMap('nodes');
			const edgesMap = ydoc.getMap('edges');

			nodesMap.observe((event, transaction) => {
				console.log('Nodes map changed:', event.changes.keys);
				const nodes = new Map(nodesMap.entries());
				set({ nodes });
			});

			edgesMap.observe((event, transaction) => {
				console.log('Edges map changed:', event.changes.keys);
				const edges = new Map(edgesMap.entries());
				set({ edges });
			});

			set({
				nodes: new Map(nodesMap.entries()),
				edges: new Map(edgesMap.entries()),
			});

			console.log('Store manually refreshed from YDoc');
			console.log('Nodes count:', nodesMap.size);
			console.log('Edges count:', edgesMap.size);
		}
	},

	// Cleanup Yjs resources
	cleanupYjs: () => {
		const { provider, ydoc } = get();
		if (provider) {
			provider.disconnect();
			provider.destroy();
		}
		if (ydoc) {
			ydoc.destroy();
		}
		set({ ydoc: null, provider: null, connectionStatus: 'disconnected' });
		console.log('disconnectyusg');
	},

	// Node operations
	addNode: (node) => {
		const { ydoc } = get();
		if (!ydoc) {
			// If Yjs is not initialized, update local state
			const { nodes } = get();
			nodes.set(node.id, {
				...node,
			});
			set({ nodes: new Map(nodes) });
			return;
		}
		const nodesMap = ydoc.getMap('nodes');
		nodesMap.set(node.id, {
			...node,
		});
	},

	updateNode: (nodeId, updates) => {
		const { ydoc } = get();
		if (!ydoc) {
			// If Yjs is not initialized, update local state
			const { nodes } = get();
			const node = nodes.get(nodeId);
			if (node) {
				// Carefully merge updates with existing node data
				const updatedNode = {
					...node,
					// If updates contains position, merge it with existing position
					position: updates.position
						? {
								...node.position,
								...updates.position,
						  }
						: node.position,
					// If updates contains style, merge it with existing style
					style: updates.style
						? {
								...node.style,
								...updates.style,
						  }
						: node.style,
					// If updates contains data, merge it with existing data
					data: updates.data
						? {
								...node.data,
								...updates.data,
						  }
						: node.data,
					// Add any other direct properties
					...Object.entries(updates)
						.filter(([key]) => !['position', 'style', 'data'].includes(key))
						.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
				};

				nodes.set(nodeId, updatedNode);
				set({ nodes: new Map(nodes) });
			}
			return;
		}

		const nodesMap = ydoc.getMap('nodes');
		const node = nodesMap.get(nodeId);
		if (node) {
			// Carefully merge updates with existing node data for Yjs as well
			const updatedNode = {
				...node,
				...updates,
				// Re-merge nested objects to avoid complete replacement
				position: updates.position ? { ...node.position, ...updates.position } : node.position,
				style: updates.style ? { ...node.style, ...updates.style } : node.style,
				data: updates.data ? { ...node.data, ...updates.data } : node.data,
			};

			nodesMap.set(nodeId, updatedNode);
		}
	},

	removeNode: (nodeId) => {
		const { ydoc } = get();
		if (!ydoc) {
			// If Yjs is not initialized, update local state
			const { nodes } = get();
			nodes.delete(nodeId);
			set({ nodes: new Map(nodes) });
			return;
		}
		const nodesMap = ydoc.getMap('nodes');
		nodesMap.delete(nodeId);
	},

	// Edge operations
	addEdge: (edge) => {
		const { ydoc } = get();
		if (!ydoc) {
			// If Yjs is not initialized, update local state
			const { edges } = get();
			edges.set(edge.id, {
				...edge,
			});
			set({ edges: new Map(edges) });
			return;
		}
		const edgesMap = ydoc.getMap('edges');
		edgesMap.set(edge.id, {
			...edge,
		});
	},

	updateEdge: (edgeId, updates) => {
		const { ydoc } = get();
		if (!ydoc) {
			// If Yjs is not initialized, update local state
			const { edges } = get();
			const edge = edges.get(edgeId);
			if (edge) {
				edges.set(edgeId, { ...edge, ...updates });
				set({ edges: new Map(edges) });
			}
			return;
		}
		const edgesMap = ydoc.getMap('edges');
		const edge = edgesMap.get(edgeId);
		if (edge) {
			edgesMap.set(edgeId, { ...edge, ...updates });
		}
	},

	removeEdge: (edgeId) => {
		const { ydoc } = get();
		if (!ydoc) {
			// If Yjs is not initialized, update local state
			const { edges } = get();
			edges.delete(edgeId);
			set({ edges: new Map(edges) });
			return;
		}
		const edgesMap = ydoc.getMap('edges');
		edgesMap.delete(edgeId);
	},

	// Get nodes and edges as arrays for ReactFlow
	getNodesArray: () => {
		const nodes = get().nodes;
		return Array.from(nodes.values()).map((node) => ({
			...node,
			id: node.id,
		}));
	},
	getEdgesArray: () => {
		const edges = get().edges;
		return Array.from(edges.values()).map((edge) => ({
			...edge,
			id: edge.id,
		}));
	},
}));

export default useCanvasStore;
