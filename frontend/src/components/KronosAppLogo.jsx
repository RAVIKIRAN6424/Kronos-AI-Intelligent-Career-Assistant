import React from 'react';

export const KronosAppLogo = ({ size = 44, animated = true }) => {
  const scale = size / 30;
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        display: 'inline-flex',
        width: '30px',
        height: '30px',
        margin: `${(size - 30) / 2}px`,
        filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))'
      }}
    >
      <div className="brand-mark"></div>
    </div>
  );
};
