// CollaborativeCursors.js
import { proxy, useSnapshot } from "valtio";

// Separate state for cursors to avoid unnecessary renders
export const cursorState = proxy({
	cursors: new Map(),
});

export const updateCursor = (clientId, data) => {
	cursorState.cursors.set(clientId, data);
};

export const removeCursor = (clientId) => {
	cursorState.cursors.delete(clientId);
};

export const useCursors = () => {
	return useSnapshot(cursorState).cursors;
};
