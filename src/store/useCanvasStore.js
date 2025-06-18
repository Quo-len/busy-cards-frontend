import { create } from 'zustand';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { userPermissions } from '../diagram/components';

const useCanvasStore = create((set, get) => ({
	nodes: new Map(),
	edges: new Map(),
	ydoc: null,
	provider: null,
	connectionStatus: 'disconnected',
	role: 'Глядач',

	initializeYjs: (mindmapId, role) => {
		const doc = new Y.Doc();
		const isDev = import.meta.env.VITE_NODE_ENV === 'development';
		const wsProtocol = isDev ? 'ws' : 'wss';
		const wsHost = isDev ? import.meta.env.VITE_DEV_IP : import.meta.env.VITE_PROD_IP;
		const wsPort = import.meta.env.VITE_WS_PORT;
		const wsUrl = `${'ws'}://${wsHost}:${wsPort}`;
		const provider = new WebsocketProvider(wsUrl, `mindmap-${mindmapId}`, doc, { connect: true });
		const nodesMap = doc.getMap('nodes');
		const edgesMap = doc.getMap('edges');
		nodesMap.observe(() => {
			const nodes = new Map(nodesMap.entries());
			set({ nodes });
		});
		edgesMap.observe(() => {
			const edges = new Map(edgesMap.entries());
			set({ edges });
		});
		provider.on('status', ({ status }) => {
			set({ connectionStatus: status });
		});
		set({
			ydoc: doc,
			provider,
			nodes: new Map(nodesMap.entries()),
			edges: new Map(edgesMap.entries()),
			role: role,
		});
	},

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
	},

	addNode: (node) => {
		const { role } = get();
		if (!userPermissions[role].canEdit) return;

		const { ydoc } = get();
		if (!ydoc) {
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
		const { role } = get();
		if (!userPermissions[role].canEdit && !userPermissions[role].canComment) return;

		const { ydoc } = get();
		if (!ydoc) {
			const { nodes } = get();
			const node = nodes.get(nodeId);
			if (node) {
				let updatedNode;
				if (userPermissions[role].canComment) {
					updatedNode = {
						...node,
						data: {
							...node.data,
							comments: updates.data.comments,
						},
					};
				} else {
					updatedNode = {
						...node,
						position: updates.position
							? {
									...node.position,
									...updates.position,
							  }
							: node.position,
						style: updates.style
							? {
									...node.style,
									...updates.style,
							  }
							: node.style,
						data: updates.data
							? {
									...node.data,
									...updates.data,
							  }
							: node.data,
						...Object.entries(updates)
							.filter(([key]) => !['position', 'style', 'data'].includes(key))
							.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
					};
				}
				nodes.set(nodeId, updatedNode);
				set({ nodes: new Map(nodes) });
			}
			return;
		}

		const nodesMap = ydoc.getMap('nodes');
		const node = nodesMap.get(nodeId);
		if (node) {
			const updatedNode = {
				...node,
				...updates,
				position: updates.position ? { ...node.position, ...updates.position } : node.position,
				style: updates.style ? { ...node.style, ...updates.style } : node.style,
				data: updates.data ? { ...node.data, ...updates.data } : node.data,
			};

			nodesMap.set(nodeId, updatedNode);
		}
	},

	removeNode: (nodeId) => {
		const { role } = get();
		if (!userPermissions[role].canEdit) return;

		const { ydoc } = get();
		if (!ydoc) {
			const { nodes } = get();
			nodes.delete(nodeId);
			set({ nodes: new Map(nodes) });
			return;
		}
		const nodesMap = ydoc.getMap('nodes');
		nodesMap.delete(nodeId);
	},

	addEdge: (edge) => {
		const { role } = get();
		if (!userPermissions[role].canEdit) return;

		const { ydoc } = get();
		if (!ydoc) {
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
		const { role } = get();
		if (!userPermissions[role].canEdit) return;

		const { ydoc } = get();
		if (!ydoc) {
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
		const { role } = get();
		if (!userPermissions[role].canEdit) return;

		const { ydoc } = get();
		if (!ydoc) {
			const { edges } = get();
			edges.delete(edgeId);
			set({ edges: new Map(edges) });
			return;
		}
		const edgesMap = ydoc.getMap('edges');
		edgesMap.delete(edgeId);
	},

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
