import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import Canvas from './Canvas';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { WebSocketProvider } from './WebSocketContext';


function App() {
  return (
    <div style={{ 
      display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        width: '100vw',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    }}>
      <Header />
      <div style={{ 
        display: 'flex', 
        flex: 1, 
        overflow: 'hidden',
        position: 'relative'
      }}>
        <WebSocketProvider>
          <ReactFlowProvider>
            <Canvas />
            <Sidebar />
          </ReactFlowProvider>
        </WebSocketProvider>
      </div>
      <Footer />
    </div>
  );
}

export default App;