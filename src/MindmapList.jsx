import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MindmapList = () => {
  const [mindmaps, setMindmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalMindmaps, setTotalMindmaps] = useState(0);
  
  // Sorting state
  const [sortBy, setSortBy] = useState('lastModified');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchMindmaps();
  }, [currentPage, itemsPerPage, sortBy, sortOrder]);

  const fetchMindmaps = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/mindmaps', {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          sortBy: sortBy,
          order: sortOrder
        }
      });
      
      setMindmaps(response.data.mindmaps);
      setTotalPages(response.data.pagination.totalPages);
      setTotalMindmaps(response.data.pagination.totalMindmaps);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch mindmaps');
      setLoading(false);
    }
  };

  const handleMindmapClick = (mindmapId) => {
    navigate(`/mindmap/${mindmapId}`);
  };

  const handleCreateMindmap = async () => {
    try {
      const response = await axios.post('/api/mindmaps', {
        title: `Mindmap ${new Date().toLocaleString()}`,
        description: 'New mindmap'
      });

      navigate(`/mindmap/${response.data._id}`);
    } catch (err) {
      setError('Failed to create mindmap');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSortChange = (column) => {
    if (sortBy === column) {
      // Toggle order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for a new column
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (loading && mindmaps.length === 0) return <div>Loading mindmaps...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '20px',
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      overflow: 'auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1>My Mindmaps</h1>
        <button 
          onClick={handleCreateMindmap}
          style={{
            padding: '10px 15px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Create New Mindmap
        </button>
      </div>

      {/* Sorting controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <div>
          <span>Sort by: </span>
          <select 
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            style={{
              padding: '5px',
              borderRadius: '4px',
              marginRight: '10px'
            }}
          >
            <option value="lastModified-desc">Latest modified</option>
            <option value="lastModified-asc">Oldest modified</option>
            <option value="createdAt-desc">Recently created</option>
            <option value="createdAt-asc">Oldest created</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
          </select>
        </div>
        
        <div>
          <span>Items per page: </span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            style={{
              padding: '5px',
              borderRadius: '4px'
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {mindmaps.length === 0 ? (
        <div>No mindmaps found. Create your first mindmap!</div>
      ) : (
        <>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {mindmaps.map((mindmap) => (
              <div 
                key={mindmap._id}
                onClick={() => handleMindmapClick(mindmap._id)}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  e.currentTarget.style.backgroundColor = '#f9f9f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>{mindmap.title || 'Untitled Mindmap'}</h3>
                  
                  <div style={{ 
                    display: 'flex',
                    fontSize: '0.8rem', 
                    color: '#888',
                    flexDirection: 'column',
                    alignItems: 'flex-end'
                  }}>
                    <div>Created: {new Date(mindmap.createdAt).toLocaleDateString()}</div>
                    {mindmap.lastModified && (
                      <div>Modified: {new Date(mindmap.lastModified).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
                
                <p style={{ margin: '0 0 10px 0', color: '#555' }}>
                  {mindmap.description || 'No description'}
                </p>
                
                {mindmap.participants && mindmap.participants.length > 0 && (
                  <div style={{ 
                    marginTop: '8px', 
                    fontSize: '0.85rem', 
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{ marginRight: '5px' }}>Shared with:</span>
                    {mindmap.participants.slice(0, 3).map((participant, index) => (
                      <span key={index} style={{ marginRight: '5px' }}>
                        {participant.user?.username || 'Unknown user'}
                        {index < Math.min(mindmap.participants.length, 3) - 1 ? ',' : ''}
                      </span>
                    ))}
                    {mindmap.participants.length > 3 && (
                      <span>and {mindmap.participants.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderRadius: '5px'
          }}>
            <div>
              Showing {mindmaps.length} of {totalMindmaps} mindmaps
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                style={{
                  padding: '5px 10px',
                  margin: '0 5px',
                  backgroundColor: currentPage === 1 ? '#f0f0f0' : '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '3px',
                  cursor: currentPage === 1 ? 'default' : 'pointer',
                  opacity: currentPage === 1 ? 0.6 : 1
                }}
              >
                &laquo;
              </button>
              
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '5px 10px',
                  margin: '0 5px',
                  backgroundColor: currentPage === 1 ? '#f0f0f0' : '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '3px',
                  cursor: currentPage === 1 ? 'default' : 'pointer',
                  opacity: currentPage === 1 ? 0.6 : 1
                }}
              >
                &lsaquo;
              </button>
              
              <span style={{ margin: '0 10px' }}>
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '5px 10px',
                  margin: '0 5px',
                  backgroundColor: currentPage === totalPages ? '#f0f0f0' : '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '3px',
                  cursor: currentPage === totalPages ? 'default' : 'pointer',
                  opacity: currentPage === totalPages ? 0.6 : 1
                }}
              >
                &rsaquo;
              </button>
              
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '5px 10px',
                  margin: '0 5px',
                  backgroundColor: currentPage === totalPages ? '#f0f0f0' : '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '3px',
                  cursor: currentPage === totalPages ? 'default' : 'pointer',
                  opacity: currentPage === totalPages ? 0.6 : 1
                }}
              >
                &raquo;
              </button>
            </div>
          </div>
        </>
      )}

      {loading && mindmaps.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '20px',
          borderRadius: '5px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          Loading...
        </div>
      )}
    </div>
  );
};

export default MindmapList;