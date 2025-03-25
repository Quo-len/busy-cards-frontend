import React, { useEffect, useState, useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState, 
  useEdgesState,
  reconnectEdge,
  addEdge,
  getOutgoers,
  getIncomers,
  MiniMap,
  BackgroundVariant,
  ConnectionMode,
  useReactFlow
} from "reactflow";
import "reactflow/dist/style.css";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import './propertiespanel.css';

// Initialize Yjs
const ydoc = new Y.Doc();
//const wsProvider = new WebsocketProvider("ws://localhost:5000", "diagram-room", ydoc);
const yNodes = ydoc.getMap("nodes");
const yEdges = ydoc.getArray("edges");
const yTags = ydoc.getArray("tags");

import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';

import { connect } from "socket.io-client";

const isNodeDescendant = (node, targetNode, nodes, edges) => {
  const visited = new Set();

  const checkDescendants = (currentNode) => {
    if (visited.has(currentNode.id)) return false;
    visited.add(currentNode.id);

    const relatives = [
      ...getIncomers(currentNode, nodes, edges),
      ...getOutgoers(currentNode, nodes, edges)
    ];

    for (const relative of relatives) {
      if (relative.id === targetNode.id) return true;
      if (checkDescendants(relative)) return true;
    }

    return false;
  };

  return checkDescendants(node);
}

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const initialNodes = [
  { id: '1',  type: 'custom', data: { label: 'Node 1' }, position: { x: 100, y: 200 } },
  { id: '2',  type: 'custom', data: { label: 'Node 2' }, position: { x: 100, y: 300 } },
  { id: '3',  type: 'custom', data: { label: 'Node 3' }, position: { x: 100, y: 400 } },
  { id: '4',  type: 'custom', data: { label: 'Node 4' }, position: { x: 100, y: 500 } }
];

// const initialEdges = [{ id: '1-2', type: 'custom', source: '1', target: '2' }];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { getNodes, getEdges } = useReactFlow();

  const isValidConnection = useCallback(
    (connection) => {
      // we are using getNodes and getEdges helpers here
      // to make sure we create isValidConnection function only once
      const nodes = getNodes();
      const edges = getEdges();
      
      const sourceNode = nodes.find(node => node.id === connection.source);
      const targetNode = nodes.find(node => node.id === connection.target);
      
      // Prevent connecting a node to itself
      if (connection.source === connection.target) return false;
      
      // Prevent multiple connections between same nodes
      const existingEdge = edges.some(
        edge => 
          (edge.source === connection.source && edge.target === connection.target) ||
          (edge.source === connection.target && edge.target === connection.source)
      );
      if (existingEdge) return false;

      // Prevent cycles
      if (isNodeDescendant(sourceNode, targetNode, nodes, edges) ||
          isNodeDescendant(targetNode, sourceNode, nodes, edges)) return false;

      const incomers = getIncomers(targetNode, nodes, edges);
      if (incomers > 0) return false;
      
      return true
    },
    [getNodes, getEdges],
  );

  const onReconnect = useCallback(
    (oldEdge, newConnection) =>
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els)),
    [],
  );

  const onConnect = useCallback((params) => {
    if (params.source !== params.target) {
      setEdges((eds) => addEdge({
        ...params, 
       // id: `${params.source}-${params.target}`,
        source: `${params.source}`,
        target: `${params.target}`,
        type: 'custom',
        data: { label: 'New Edge' }
      }, eds));
    }
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid={true}
        onReconnect={onReconnect}
        isValidConnection={isValidConnection}
        connectionMode={ConnectionMode.Loose}
        minZoom={0.2}
        maxZoom={4}
      >
        <Background  id="1" gap={10} color="#ccc" variant={BackgroundVariant.Dots} />
        <Controls />
        <MiniMap zoomStep={1} pannable zoomable nodeStrokeColor={(n) => {
            if (n.style?.background) return `${n.style.background}`;
            if (n.type === "custom") return "#0041d0";

            return "#eee";
          }}
          nodeColor={(n) => {
            if (n.style?.background) return `${n.style.background}`;

            return "#fff";
          }}
          nodeBorderRadius={2}
          style={{
            width: 300, 
            height: 200,
            border: "1px solid black"
          }}
          maskColor="rgb(0,0,0, 0.1)"
        />
      </ReactFlow>
      <div className="propertiespanel__controls">
        <label>label:</label>
        <input />

        <label className="propertiespanel__bglabel">background:</label>
        <input  />

        <div className="propertiespane__checkboxwrapper">
          <label>hidden:</label>
          <input
            type="checkbox"
          />
        </div>
      </div>
    </div>
  );
}