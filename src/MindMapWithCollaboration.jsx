// frontend/src/components/MindMapWithCollaboration.js
import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'react-flow-renderer';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import axios from 'axios';

const MindMapWithCollaboration = () => {
  const [elements, setElements] = useState([]);
  const ydoc = new Y.Doc();
  
  // Create Yjs document and WebSocket provider for syncing
  const provider = new WebsocketProvider('ws://localhost:1234', 'mind-map-room', ydoc);
  const yNodes = ydoc.getArray('nodes');
  const yEdges = ydoc.getArray('edges');
  
  useEffect(() => {
    const initialElements = [
      { id: '1', type: 'input', data: { label: 'Mind Map Start' }, position: { x: 250, y: 5 } },
      { id: '2', data: { label: 'Node 1' }, position: { x: 100, y: 100 } },
      { id: '3', data: { label: 'Node 2' }, position: { x: 400, y: 100 } },
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e1-3', source: '1', target: '3', animated: true }
    ];

    yNodes.push(initialElements.filter((el) => el.id.startsWith('1')));
    yEdges.push(initialElements.filter((el) => el.id.startsWith('e')));

    const handleChanges = () => {
      const nodes = yNodes.toArray();
      const edges = yEdges.toArray();
      setElements([...nodes, ...edges]);
    };
    
    yNodes.observe(handleChanges);
    yEdges.observe(handleChanges);
    
    return () => {
      yNodes.unobserve(handleChanges);
      yEdges.unobserve(handleChanges);
    };
  }, []);

  const onElementsChange = useCallback((changes) => {
    changes.forEach((change) => {
      if (change.type === 'add') {
        yNodes.push([change.item]);
      } else if (change.type === 'remove') {
        yNodes.delete(0, 1);
      }
    });
  }, [yNodes]);

  const saveMindMap = async () => {
    try {
      const nodes = yNodes.toArray();
      const edges = yEdges.toArray();
      await axios.post('http://localhost:3000/save', { nodes, edges });
      alert('Mind map saved');
    } catch (err) {
      console.error('Error saving mind map:', err);
    }
  };

  return (
    <div style={{ height: '100vh' }}>
      <ReactFlow elements={elements} onElementsChange={onElementsChange}>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
      <button onClick={saveMindMap}>Save Mind Map</button>
    </div>
  );
};

export default MindMapWithCollaboration;
