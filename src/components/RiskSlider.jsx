import React from 'react';

function RiskSlider({ value, onChange }) {
  const handleChange = (e) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px' }}>
        目標リスク（年率）: {Math.round(value * 100)}%
      </label>
      <input
        type="range"
        min="0.05"
        max="0.30"
        step="0.01"
        value={value}
        onChange={handleChange}
        style={{ width: '300px' }}
      />
    </div>
  );
}

export default RiskSlider;
