import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: '#f0f0f0',
      borderTop: '1px solid #e0e0e0',
      height: '50px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div>
        © 2025 Busy-Cards
      </div>
      <div style={{ display: 'flex', gap: '15px' }}>
        <a href="#" style={{ textDecoration: 'none', color: '#333' }}>Privacy</a>
        <a href="#" style={{ textDecoration: 'none', color: '#333' }}>Terms</a>
        <a href="#" style={{ textDecoration: 'none', color: '#333' }}>Contact</a>
      </div>
    </footer>
  );
};

export default Footer;