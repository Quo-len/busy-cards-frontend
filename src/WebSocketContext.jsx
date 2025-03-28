import React, { createContext, useContext, useEffect, useState, useParams } from 'react';
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

// Create a context for the WebSocket and Yjs document
const WebSocketContext = createContext({
  ydoc: null,
  provider: null,
});

// Custom hook to use the WebSocket context
export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

// WebSocket Provider Component
export const WebSocketProvider = ({ children, mindmapId  }) => {
  const [ydoc, setYdoc] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {

    if (!mindmapId) return;
    // Create Yjs document
    const doc = new Y.Doc();
    
    console.log('Websocket: ' + mindmapId);

    // Create WebSocket provider
    const wsProvider = new WebsocketProvider(
      "ws://localhost:5000", 
      `mindmap-${mindmapId}`, 
      doc
    );

    // Store references
    setYdoc(doc);
    setProvider(wsProvider);

    // Cleanup function
    return () => {
        console.log('destroy socket: ' + mindmapId);
        wsProvider.destroy();
        doc.destroy();
    };
  }, [mindmapId]);

  // Context value to be shared
  const contextValue = {
    ydoc,
    provider,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};