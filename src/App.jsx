import React, { useEffect, useState, useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Panel,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  useReactFlow,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

// Initialize Yjs
const ydoc = new Y.Doc();
const wsProvider = new WebsocketProvider("ws://localhost:5000", "diagram-room", ydoc);
const yNodes = ydoc.getMap("nodes");
const yEdges = ydoc.getArray("edges");
const yTags = ydoc.getArray("tags");

// Node shapes
const nodeShapes = {
  rectangle: { width: 150, height: 40, borderRadius: 3 },
  circle: { width: 70, height: 70, borderRadius: 50 },
  diamond: { width: 80, height: 80, transform: "rotate(45deg)", borderRadius: 2 },
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

// Custom Node Component
const CustomNode = ({ id, data }) => {
  const { shape = "rectangle", color = "blue", tags = [] } = data;
  const { setNodes } = useReactFlow();

  const [menuOpen, setMenuOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newComment, setNewComment] = useState("");

  const shapeStyle = {
    ...nodeShapes[shape],
    backgroundColor: nodeColors[color],
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px",
    position: "relative",
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      ydoc.transact(() => {
        const node = yNodes.get(id);
        const updatedNode = {
          ...node,
          data: {
            ...node.data,
            tags: [...(node.data.tags || []), newTag.trim()],
          },
        };
        yNodes.set(id, updatedNode);
        
        // Add to global tags list if not exists
        if (!yTags.toArray().includes(newTag.trim())) {
          yTags.push([newTag.trim()]);
        }
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    ydoc.transact(() => {
      const node = yNodes.get(id);
      const updatedNode = {
        ...node,
        data: {
          ...node.data,
          tags: (node.data.tags || []).filter(tag => tag !== tagToRemove),
        },
      };
      yNodes.set(id, updatedNode);
    });
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      ydoc.transact(() => {
        const node = yNodes.get(id);
        const updatedNode = {
          ...node,
          data: {
            ...node.data,
            comments: [...(node.data.comments || []), {
              id: Date.now(),
              text: newComment.trim(),
              date: new Date().toISOString(),
            }],
          },
        };
        yNodes.set(id, updatedNode);
      });
      setNewComment("");
    }
  };

  const handleRemoveComment = (commentId) => {
    ydoc.transact(() => {
      const node = yNodes.get(id);
      const updatedNode = {
        ...node,
        data: {
          ...node.data,
          comments: (node.data.comments || []).filter(comment => comment.id !== commentId),
        },
      };
      yNodes.set(id, updatedNode);
    });
  };

  const handleChangeShape = (newShape) => {
    ydoc.transact(() => {
      const node = yNodes.get(id);
      const updatedNode = {
        ...node,
        data: {
          ...node.data,
          shape: newShape,
        },
      };
      yNodes.set(id, updatedNode);
    });
  };

  const handleChangeColor = (newColor) => {
    ydoc.transact(() => {
      const node = yNodes.get(id);
      const updatedNode = {
        ...node,
        data: {
          ...node.data,
          color: newColor,
        },
      };
      yNodes.set(id, updatedNode);
    });
  };

  const handleChangeName = (e) => {
    const newName = e.target.value;
    ydoc.transact(() => {
      const node = yNodes.get(id);
      const updatedNode = {
        ...node,
        data: {
          ...node.data,
          label: newName,
        },
      };
      yNodes.set(id, updatedNode);
    });
  };

  const handleChangeDescription = (e) => {
    const newDesc = e.target.value;
    ydoc.transact(() => {
      const node = yNodes.get(id);
      const updatedNode = {
        ...node,
        data: {
          ...node.data,
          description: newDesc,
        },
      };
      yNodes.set(id, updatedNode);
    });
  };

  return (
    <div className="custom-node">
      <div style={shapeStyle} onClick={() => setMenuOpen(!menuOpen)}>
        <div>{data.label || "Node"}</div>
        {tags && tags.length > 0 && (
          <div style={{ position: "absolute", top: "-25px", left: 0, display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {tags.map(tag => (
              <span key={tag} style={{ 
                padding: "2px 4px", 
                backgroundColor: "rgba(0,0,0,0.5)", 
                color: "white", 
                borderRadius: "3px", 
                fontSize: "10px" 
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {menuOpen && (
        <div style={{ 
          position: "absolute", 
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "8px",
          zIndex: 10,
          minWidth: "200px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        }}>
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>Name:</label>
            <input 
              value={data.label || ""} 
              onChange={handleChangeName}
              style={{ width: "100%", padding: "4px" }}
            />
          </div>
          
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>Description:</label>
            <textarea
              value={data.description || ""}
              onChange={handleChangeDescription}
              style={{ width: "100%", padding: "4px", minHeight: "60px" }}
            />
          </div>
          
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>Shape:</label>
            <select 
              value={shape} 
              onChange={(e) => handleChangeShape(e.target.value)}
              style={{ width: "100%", padding: "4px" }}
            >
              {Object.keys(nodeShapes).map(shape => (
                <option key={shape} value={shape}>{shape.charAt(0).toUpperCase() + shape.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>Color:</label>
            <select 
              value={color} 
              onChange={(e) => handleChangeColor(e.target.value)}
              style={{ width: "100%", padding: "4px" }}
            >
              {Object.keys(nodeColors).map(color => (
                <option key={color} value={color}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
            <button onClick={() => setTagOpen(!tagOpen)} style={{ flex: 1, padding: "4px" }}>
              Manage Tags
            </button>
            <button onClick={() => setCommentOpen(!commentOpen)} style={{ flex: 1, padding: "4px" }}>
              Comments
            </button>
            <button onClick={() => setMenuOpen(false)} style={{ padding: "4px" }}>
              Close
            </button>
          </div>
        </div>
      )}

      {tagOpen && (
        <div style={{ 
          position: "absolute", 
          left: "220px", 
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "8px",
          zIndex: 10,
          minWidth: "200px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        }}>
          <h4 style={{ margin: "0 0 8px 0" }}>Tags</h4>
          
          <div style={{ marginBottom: "8px", display: "flex" }}>
            <input 
              value={newTag} 
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="New tag..."
              style={{ flex: 1, padding: "4px" }}
            />
            <button onClick={handleAddTag} style={{ marginLeft: "4px" }}>Add</button>
          </div>
          
          {tags && tags.length > 0 ? (
            <div style={{ maxHeight: "150px", overflowY: "auto" }}>
              {tags.map(tag => (
                <div key={tag} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  padding: "4px 0",
                  borderBottom: "1px solid #eee"
                }}>
                  <span>{tag}</span>
                  <button onClick={() => handleRemoveTag(tag)} style={{ padding: "2px 6px" }}>×</button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#666", fontSize: "12px" }}>No tags added yet</p>
          )}
          
          <button onClick={() => setTagOpen(false)} style={{ marginTop: "8px", width: "100%", padding: "4px" }}>
            Close
          </button>
        </div>
      )}

      {commentOpen && (
        <div style={{ 
          position: "absolute", 
          left: "220px", 
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "8px",
          zIndex: 10,
          minWidth: "250px",
          maxWidth: "300px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        }}>
          <h4 style={{ margin: "0 0 8px 0" }}>Comments</h4>
          
          <div style={{ marginBottom: "8px" }}>
            <textarea 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              style={{ width: "100%", padding: "4px", minHeight: "60px" }}
            />
            <button onClick={handleAddComment} style={{ marginTop: "4px", width: "100%", padding: "4px" }}>
              Add Comment
            </button>
          </div>
          
          {data.comments && data.comments.length > 0 ? (
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {data.comments.map(comment => (
                <div key={comment.id} style={{ 
                  padding: "8px", 
                  marginBottom: "8px", 
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                  position: "relative"
                }}>
                  <button 
                    onClick={() => handleRemoveComment(comment.id)} 
                    style={{ 
                      position: "absolute", 
                      right: "4px", 
                      top: "4px",
                      background: "none",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    ×
                  </button>
                  <p style={{ margin: "0 0 4px 0" }}>{comment.text}</p>
                  <small style={{ color: "#666" }}>
                    {new Date(comment.date).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#666", fontSize: "12px" }}>No comments yet</p>
          )}
          
          <button onClick={() => setCommentOpen(false)} style={{ marginTop: "8px", width: "100%", padding: "4px" }}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

// Node types
const nodeTypes = {
  custom: CustomNode,
};


export default function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [tags, setTags] = useState([]);
  const [highlightedTags, setHighlightedTags] = useState([]);
  const [nodeType, setNodeType] = useState("main"); // 'main' or 'leaf'
  const reactFlowInstance = useReactFlow();

  // Sync tags from Yjs
  useEffect(() => {
    const updateTags = () => {
      setTags([...yTags]);
    };

    yTags.observe(updateTags);
    updateTags();
    return () => yTags.unobserve(updateTags);
  }, []);

  // Sync nodes from Yjs
  useEffect(() => {
    const updateNodes = () => {
      setNodes(
        Array.from(yNodes.values()).map((node) => ({
          ...node,
          position: node.position || { x: 100, y: 100 },
          type: 'custom',
          // Apply highlighting based on tags
          style: {
            opacity: highlightedTags.length > 0 
              ? (node.data.tags && node.data.tags.some(tag => highlightedTags.includes(tag)) ? 1 : 0.3) 
              : 1,
            transition: 'opacity 0.3s',
          },
          // Apply node type style
          data: {
            ...node.data,
            nodeType: node.data.nodeType || "main",
          }
        }))
      );
    };

    yNodes.observe(updateNodes);
    updateNodes();
    return () => yNodes.unobserve(updateNodes);
  }, [highlightedTags]);

  // Sync edges from Yjs
  useEffect(() => {
    const updateEdges = () => {
      setEdges([...yEdges].map(edge => ({
        ...edge,
        style: {
          strokeWidth: 2,
          stroke: '#888',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#888',
        },
      })));
    };

    yEdges.observe(updateEdges);
    updateEdges();
    return () => yEdges.unobserve(updateEdges);
  }, []);

  // Add a new node
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
        nodeType: nodeType,
        shape: nodeType === "main" ? "rectangle" : "circle",
        color: nodeType === "main" ? "blue" : "green",
        tags: [],
        comments: [],
      },
      type: 'custom',
    };

    ydoc.transact(() => {
      yNodes.set(id, newNode);
    });
  };

  // Handle node drag
  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));

      ydoc.transact(() => {
        changes.forEach((change) => {
          if (change.type === "position" && yNodes.has(change.id)) {
            // ✅ Fix: Update position *only when dropped*
            yNodes.set(change.id, { ...yNodes.get(change.id), position: change.position });
          }
        });
      });
    },
    []
  );

  // Handle node drag stop
  const onNodeDragStop = useCallback((event, node) => {
    if (yNodes.has(node.id)) {
      ydoc.transact(() => {
        const existingNode = yNodes.get(node.id);
        if (existingNode) {
          yNodes.set(node.id, { ...existingNode, position: node.position });
        }
      });
    }
  }, []);

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes) => {
      // Handle edge deletion
      changes.forEach((change) => {
        if (change.type === "remove") {
          const edgeIndex = yEdges.toArray().findIndex(edge => edge.id === change.id);
          if (edgeIndex !== -1) {
            ydoc.transact(() => {
              yEdges.delete(edgeIndex, 1);
            });
          }
        }
      });
      
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  // Handle edge connections
  const onConnect = useCallback(
    (params) => {
      // Validate connection based on node types
      const sourceNode = yNodes.get(params.source);
      const targetNode = yNodes.get(params.target);
      
      if (!sourceNode || !targetNode) return;
      
      const sourceType = sourceNode.data.nodeType || "main";
      const targetType = targetNode.data.nodeType || "main";
      
      // Validate leaf node connection limit
      if (targetType === "leaf") {
        // Check if target node already has 2 connections
        const existingConnections = yEdges.toArray().filter(edge => 
          edge.target === params.target || edge.source === params.target
        );
        
        if (existingConnections.length >= 2) {
          console.warn("Leaf nodes can only have two connections");
          return;
        }
      }
      
      const newEdge = { 
        ...params, 
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        style: {
          strokeWidth: 2,
          stroke: '#888',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#888',
        },
      };
      
      ydoc.transact(() => {
        yEdges.push([newEdge]);
      });
    },
    []
  );

  // Toggle tag highlighting
  const toggleTagHighlight = (tag) => {
    setHighlightedTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter(t => t !== tag);
      }
      return [...prevTags, tag];
    });
  };

  // Delete a node
  const deleteNode = (nodeId) => {
    if (yNodes.has(nodeId)) {
      // Delete all edges connected to this node
      const connectedEdges = yEdges.toArray().filter(edge => 
        edge.source === nodeId || edge.target === nodeId
      );
      
      ydoc.transact(() => {
        // Delete edges
        connectedEdges.forEach(edge => {
          const edgeIndex = yEdges.toArray().findIndex(e => e.id === edge.id);
          if (edgeIndex !== -1) {
            yEdges.delete(edgeIndex, 1);
          }
        });
        
        // Delete node
        yNodes.delete(nodeId);
      });
    }
  };

  // Add context menu for nodes
  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    deleteNode(node.id);
  }, []);

  useEffect(() => {
  document.body.style.overflow = "hidden"; // Disable scrolling

  return () => {
    document.body.style.overflow = "auto"; // Enable scrolling when unmounting
  };
}, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Panel position="top-left" style={{ padding: "10px", backgroundColor: "white", borderRadius: "5px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div>
            <label style={{ marginRight: "10px" }}>Node Type:</label>
            <select 
              value={nodeType} 
              onChange={(e) => setNodeType(e.target.value)}
              style={{ padding: "5px" }}
            >
              <option value="main">Main Node</option>
              <option value="leaf">Leaf Node (max 2 connections)</option>
            </select>
          </div>
          
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
        </div>
      </Panel>
      
      {tags.length > 0 && (
        <Panel position="top-right" style={{ padding: "10px", backgroundColor: "white", borderRadius: "5px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <div>
            <h4 style={{ margin: "0 0 10px 0" }}>Filter by Tags</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {tags.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => toggleTagHighlight(tag)}
                  style={{ 
                    padding: "5px 8px", 
                    backgroundColor: highlightedTags.includes(tag) ? "#3498db" : "#f0f0f0", 
                    color: highlightedTags.includes(tag) ? "white" : "black",
                    border: "none", 
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  {tag}
                </button>
              ))}
              {highlightedTags.length > 0 && (
                <button 
                  onClick={() => setHighlightedTags([])}
                  style={{ 
                    padding: "5px 8px", 
                    backgroundColor: "#e74c3c", 
                    color: "white",
                    border: "none", 
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </Panel>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeContextMenu={onNodeContextMenu}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode="Delete"
        minZoom={0.2}
        maxZoom={4}
      >
        <Background />
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
    </div>
  );
}