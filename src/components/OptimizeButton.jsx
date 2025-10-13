import React from 'react';

function OptimizeButton({ onClick }) {
  return (
    <div style={{ marginTop: '20px', marginBottom: '30px' }}>
      <button
        onClick={onClick}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        最適化する
      </button>
    </div>
  );
}

export default OptimizeButton;
