import React, { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
    useNodes,
    useReactFlow
} from "reactflow";
import "reactflow/dist/style.css";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

// Node shapes
const nodeShapes = {
    rectangle: { width: 150, height: 40, borderRadius: 3 },
    circle: { width: 70, height: 70, borderRadius: 50 },
    hexagon: { width: 100, height: 80, clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" },
};
  
// Node colors
const nodeColors = {
    blue: "#3498db",
    green: "#2ecc71",
    red: "#e74c3c",
    purple: "#9b59b6",
    orange: "#e67e22",
    yellow: "#f1c40f",
    gray: "#95a5a6",
};

function Sidebar() {
    const { setNodes } = useReactFlow();
    const nodes = useNodes();
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
        const nodesMap = doc.getMap("nodes");

        ydoc.current = doc;
        provider.current = wsProvider;

        // Observe changes in the shared nodes map
        nodesMap.observe((event) => {
            // Update local nodes based on Yjs map changes
            const updatedNodes = Array.from(nodesMap.values());
            setNodes((currentNodes) => 
                currentNodes.map(node => {
                    const updatedNode = updatedNodes.find(n => n.id === node.id);
                    return updatedNode ? { ...node, ...updatedNode } : node;
                })
            );
        });

        return () => {
            wsProvider.destroy();
            doc.destroy();
        };
    }, [setNodes]);

    // Get only the first selected node
    const selectedNode = nodes.find(node => node.selected);

    // Update node properties with Yjs synchronization
    const updateNodeProperty = useCallback((nodeId, propertyName, value) => {
        if (!ydoc.current) return;

        const nodesMap = ydoc.current.getMap("nodes");
        const nodeData = nodesMap.get(nodeId) || {};

        // Update node data in Yjs map
        const updatedNodeData = {
            ...nodeData,
            data: {
                ...nodeData.data,
                [propertyName]: value
            }
        };

        // Apply shape and style changes separately
        if (propertyName === 'shape') {
            updatedNodeData.style = {
                ...(nodeData.style || {}),
                ...nodeShapes[value]
            };
        }

        nodesMap.set(nodeId, updatedNodeData);
    }, []);

    const handleChangeName = useCallback((nodeId, newLabel) => {
        updateNodeProperty(nodeId, 'label', newLabel);
    }, [updateNodeProperty]);
    
    const handleChangeDescription = useCallback((nodeId, newDescription) => {
        updateNodeProperty(nodeId, 'description', newDescription);
    }, [updateNodeProperty]);
    
    const handleChangeShape = useCallback((nodeId, newShape) => {
        updateNodeProperty(nodeId, 'shape', newShape);
    }, [updateNodeProperty]);
    
    const handleChangeColor = useCallback((nodeId, newColor) => {
        updateNodeProperty(nodeId, 'color', newColor);
    }, [updateNodeProperty]);

    // If no nodes are selected, show a message
    if (!selectedNode) {
        return (
            <aside 
              style={{
                width: '300px',
                height: '100%',
                overflowY: 'auto',
                backgroundColor: '#f0f0f0',
                padding: '16px',
                boxSizing: 'border-box'
              }}
            >
                <div style={{ 
                  padding: '16px', 
                  textAlign: 'center', 
                  color: '#666',
                  backgroundColor: 'white',
                  borderRadius: '8px'
                }}>
                    Select a node to edit its properties
                </div>
            </aside>
        );
    }

    return (
      <aside 
        style={{
          width: '300px',
          height: '100%',
          overflowY: 'auto',
          backgroundColor: '#f0f0f0',
          padding: '16px',
          boxSizing: 'border-box',
          scrollbarWidth: 'thin',
          scrollbarColor: '#888 #f1f1f1'
        }}
      >
        <div 
          style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <div 
            key={selectedNode.id} 
            style={{ 
              marginBottom: '16px', 
              padding: '12px', 
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              backgroundColor: '#f9f9f9'
            }}
          >
            <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Node ID: {selectedNode.id} - 
              x: {selectedNode.position.x.toFixed(2)}, 
              y: {selectedNode.position.y.toFixed(2)}
            </div>
            
            <div style={{ marginBottom: "8px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: '600' }}>Name:</label>
              <input 
                value={selectedNode.data.label || ""} 
                onChange={(e) => handleChangeName(selectedNode.id, e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "8px", 
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: "8px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: '600' }}>Description:</label>
              <textarea
                value={selectedNode.data.description || ""}
                onChange={(e) => handleChangeDescription(selectedNode.id, e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "8px", 
                  minHeight: "60px",
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: "8px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: '600' }}>Shape:</label>
              <select 
                value={selectedNode.data.shape || "rectangle"} 
                onChange={(e) => handleChangeShape(selectedNode.id, e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "8px",
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                {Object.keys(nodeShapes).map(shape => (
                  <option key={shape} value={shape}>
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: "8px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: '600' }}>Color:</label>
              <select 
                value={selectedNode.data.color || "blue"} 
                onChange={(e) => handleChangeColor(selectedNode.id, e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "8px",
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                {Object.keys(nodeColors).map(color => (
                  <option key={color} value={color}>
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </aside>
    );
}

export default Sidebar;