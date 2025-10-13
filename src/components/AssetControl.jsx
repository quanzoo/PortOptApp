import React from 'react';

function AssetControl({ name, index, bounds, expectedReturn, onBoundChange, onReturnChange }) {
  const isActive = bounds[index][1] > 0;

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    const newBounds = checked ? [0, 1] : [0, 0];
    onBoundChange(index, 'lower', newBounds[0]);
    onBoundChange(index, 'upper', newBounds[1]);
  };

  const handleLowerChange = (e) => {
    onBoundChange(index, 'lower', e.target.value);
  };

  const handleUpperChange = (e) => {
    onBoundChange(index, 'upper', e.target.value);
  };

  const handleReturnChange = (e) => {
    onReturnChange(index, e.target.value);
  };

  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
      <label>
        <input type="checkbox" checked={isActive} onChange={handleCheckboxChange} />
        {name}
      </label>
      <input
        type="number"
        value={expectedReturn[index]}
        onChange={handleReturnChange}
        step="0.01"
        placeholder="期待リターン"
      />
      <input
        type="number"
        value={bounds[index][0]}
        onChange={handleLowerChange}
        step="0.01"
        placeholder="下限"
      />
      <input
        type="number"
        value={bounds[index][1]}
        onChange={handleUpperChange}
        step="0.01"
        placeholder="上限"
      />
    </div>
  );
}

export default AssetControl;
