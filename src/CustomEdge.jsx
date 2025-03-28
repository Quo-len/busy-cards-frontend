import React, { memo } from 'react';
import {   
  BaseEdge,   
  EdgeLabelRenderer,   
  getBezierPath,   
  useReactFlow, 
} from 'reactflow'; 
import { useWebSocket } from './WebSocketContext';  
import './buttonedge.css';  

const CustomEdge = ({   
  id,   
  sourceX,   
  sourceY,   
  targetX,   
  targetY,   
  sourcePosition,   
  targetPosition,   
  style = {},   
  markerEnd, 
}) => {   
  const { setEdges } = useReactFlow();    
  const { ydoc } = useWebSocket();    

  const onEdgeClick = () => {     
    if (!ydoc) return;      
    // Remove edge from Yjs shared map     
    const edgesMap = ydoc.getMap("edges");     
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
          className="nodrag"         
        >           
          <button             
            className="edgebutton"             
            onClick={onEdgeClick}           
          >             
            ×           
          </button>         
        </div>       
      </EdgeLabelRenderer>     
    </>   
  ); 
}

export default memo(CustomEdge);
