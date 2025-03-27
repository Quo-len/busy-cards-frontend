import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import Cursor from './Cursor';

const generateRandomColor = () =>
  "#" + Math.floor(Math.random() * 16777215).toString(16);

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
  const [cursors, setCursors] = useState(new Map());
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const ydoc = useRef();
  const provider = useRef();
  const flowRef = useRef(null);
  const userColor = useRef(generateRandomColor());

  useEffect(() => {
    const doc = new Y.Doc();
    const wsProvider = new WebsocketProvider(
      "ws://25.13.98.39:5000",
      "flow-room",
      doc
    );
    const nodesMap = doc.getMap("nodes");
    const edgesMap = doc.getMap("edges");

    ydoc.current = doc;
    provider.current = wsProvider;

    wsProvider.awareness.setLocalState({
      cursor: null,
      color: userColor.current,
      clientId: wsProvider.awareness.clientID
    });

    wsProvider.awareness.on("change", () => {
      const states = new Map(
        wsProvider.awareness.getStates()
      );
      setCursors(states);
    });

    if (nodesMap.size === 0) {
      initialNodes.forEach((node) => {
        nodesMap.set(node.id, JSON.parse(JSON.stringify(node)));
      });
    }

    nodesMap.observe(() => {
      const yNodes = Array.from(nodesMap.values());
      const validNodes = yNodes.map((node) => ({
        id: node.id,
        type: node.type || "default",
        data: node.data,
        position: {
          x: node.position.x,
          y: node.position.y,
        },
      }));
      setNodes(validNodes);
    });

    edgesMap.observe(() => {
      const yEdges = Array.from(edgesMap.values());
      setEdges(yEdges);
    });

    const initialYNodes = Array.from(nodesMap.values());
    const validNodes = initialYNodes.map((node) => ({
      id: node.id,
      type: node.type || "default",
      data: node.data,
      position: {
        x: node.position.x,
        y: node.position.y,
      },
    }));
    setNodes(validNodes);
    setEdges(Array.from(edgesMap.values()));

    return () => {
      wsProvider.destroy();
      doc.destroy();
    };
  }, []);

  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);

      if (!ydoc.current) return;

      changes.forEach((change) => {
        if (change.type === "position" ) {
          const node = nodes.find((n) => n.id === change.id);
          if (node) {
            const updatedNode = {
              ...node,
              position: change.position || node.position,
            //  style: {
                width: change.width,
                height: change.height,
           //  }
            };
            ydoc.current
              ?.getMap("nodes")
              .set(change.id, JSON.parse(JSON.stringify(updatedNode)));
          }
        }
      });
    },
    [nodes, onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);

      if (!ydoc.current) return;

      changes.forEach((change) => {
        if (change.type === "remove") {
          ydoc.current?.getMap("edges").delete(change.id);
        }
      });
    },
    [onEdgesChange]
  );

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

  const addNewNode = () => {
    const id = `node-${Date.now()}`;
    const newNode = {
      id,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 400 + 100 
      },
      data: { 
        label: `Node ${id.slice(-4)}`,
      },
      type: 'custom',
    };
    if (ydoc.current) {
      ydoc.current.getMap("nodes").set(newNode.id, newNode);
    }
    setNodes((nds) => nds.concat(newNode));
  };

  const onReconnect = useCallback(
    (oldEdge, newConnection) =>
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els)),
    [],
  );

  const onConnect = useCallback((connection) => {
    if (!connection.source || !connection.target) return;

    const newEdge = {
      id: `e${connection.source}-${connection.target}`,
      type: "custom",
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle || undefined,
      targetHandle: connection.targetHandle || undefined,
    }

    if (ydoc.current) {
      ydoc.current.getMap("edges").set(newEdge.id, newEdge);
    }

    setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  const handleMouseMove = useCallback((e) => {
    if (!provider.current?.awareness || !flowRef.current) return;

    const bounds = flowRef.current.getBoundingClientRect();
    const cursor = {
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    };

    provider.current.awareness.setLocalState({
      cursor,
      color: userColor.current,
      clientId: provider.current.awareness.clientID,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!provider.current?.awareness) return;

    provider.current.awareness.setLocalState({
      cursor: null,
      color: userColor.current,
      clientId: provider.current.awareness.clientID,
    });
  }, []);

  const handleNodeClick = useCallback((event, node) => {
    // Prevent default selection behavior
    event.stopPropagation();
    
    // Toggle node selection
    setSelectedNodeId(prevSelectedId => 
      prevSelectedId === node.id ? null : node.id
    );
  }, []);

  return (
    <div 
      style={{ flex: 1, 
        position: 'relative', 
        overflow: 'hidden'  }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={flowRef}
    >
        <button 
            onClick={addNewNode} 
            style={{ 
              padding: "8px 12px", 
              backgroundColor: "#3498db", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Add Node
          </button>
      <ReactFlow
        nodes={nodes.map(node => ({
          ...node,
          selected: node.id === selectedNodeId
        }))}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeDrag={handleMouseMove}
        onNodeClick={handleNodeClick}
        fitView
        snapToGrid={true}
        onReconnect={onReconnect}
        isValidConnection={isValidConnection}
        connectionMode={ConnectionMode.Loose}
        minZoom={0.2}
        maxZoom={4}
      >
        <Background  id="1" gap={10} color="#ccc" variant={BackgroundVariant.Dots} />
        <Controls position="top-left" style={{
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)'
          }
        } />
        <MiniMap 
          position="bottom-left"
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
      {Array.from(cursors.entries()).map(([clientId, state]) => {
        if (
          !state.cursor ||
          clientId === provider.current?.awareness?.clientID
        ) {
          return null;
        }
        return (
          <Cursor
            key={clientId}
            x={state.cursor.x}
            y={state.cursor.y}
            color={state.color}
          />
        );
      })}
    </div>
  );
}