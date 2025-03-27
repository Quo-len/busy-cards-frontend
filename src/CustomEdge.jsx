import React, { useRef, useEffect } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
} from 'reactflow';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

import './buttonedge.css';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) {
  const { setEdges, getEdges } = useReactFlow();
  const ydoc = useRef(null);
  const provider = useRef(null);

  // Initialize Yjs document and WebSocket provider
  useEffect(() => {
    const doc = new Y.Doc();
    const wsProvider = new WebsocketProvider(
      "ws://25.13.98.39:5000", 
      "flow-room", 
      doc
    );
    const edgesMap = doc.getMap("edges");

    ydoc.current = doc;
    provider.current = wsProvider;

    return () => {
      wsProvider.destroy();
      doc.destroy();
    };
  }, []);

  const onEdgeClick = () => {
    if (!ydoc.current) return;

    // Remove edge from Yjs shared map
    const edgesMap = ydoc.current.getMap("edges");
    edgesMap.delete(id);

    // Remove edge from local state
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button className="edgebutton" onClick={onEdgeClick}>
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}