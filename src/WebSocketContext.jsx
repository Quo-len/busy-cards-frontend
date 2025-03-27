import React, { createContext, useContext, useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// Create a context for WebSocket and Yjs document
const WebSocketContext = createContext(null);

// WebSocket Provider Component
export function WebSocketProvider({ children }) {
  const ydoc = useRef(new Y.Doc());
  const provider = useRef(null);

  useEffect(() => {
    // Create WebSocket connection
    provider.current = new WebsocketProvider(
      "ws://25.13.98.39:5000",
      "flow-room",
      ydoc.current
    );

    // Cleanup function
    return () => {
      if (provider.current) {
        provider.current.destroy();
      }
      ydoc.current.destroy();
    };
  }, []);

  // Value to be provided to consumers
  const contextValue = {
    ydoc: ydoc.current,
    provider: provider.current
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Custom hook to use WebSocket context
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}