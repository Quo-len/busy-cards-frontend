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

//////
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";







////

import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';

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
  { id: '1',  type: 'custom', data: { label: 'Node 1', description: 'First node'  }, position: { x: 100, y: 200 } },
  { id: '2',  type: 'custom', data: { label: 'Node 2', description: 'Second  node' }, position: { x: 100, y: 300 } },
  { id: '3',  type: 'custom', data: { label: 'Node 3', description: 'Thr node' }, position: { x: 100, y: 400 } },
  { id: '4',  type: 'custom', data: { label: 'Node 4', description: 'Fo node' }, position: { x: 100, y: 500 } }
];

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { getNodes, getEdges } = useReactFlow();

  const isValidConnection = useCallback(
    (connection) => {
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
        source: `${params.source}`,
        target: `${params.target}`,
        type: 'custom',
        data: { label: 'New Edge' }
      }, eds));
    }
  }, []);

  return (
    <div style={{ flex: 1, 
      position: 'relative', 
      overflow: 'hidden'  }}>
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
        <MiniMap 
          zoomStep={1} 
          pannable 
          zoomable 
          nodeStrokeColor={(n) => {
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
    </div>
  );
}