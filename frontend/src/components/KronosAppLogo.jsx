import React from 'react';

export const KronosAppLogo = ({ size = 44, animated = true }) => {
  const scale = size / 30;
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '30px',
        height: '30px',
        margin: `${(size - 30) / 2}px`,
        filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))'
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
        <rect x="3" y="3" width="94" height="94" rx="24" fill="#434185"/>
        <circle cx="50" cy="50" r="26" fill="#f3f4f6"/>
        <circle cx="50" cy="50" r="20" fill="#1a1c43"/>
        <path d="M 60,34 C 42,30 31,44 33,60 C 35,70 45,74 54,68" fill="none" stroke="#ffffff" strokeWidth="4.5"/>
        <circle cx="44" cy="53" r="3" fill="#38d9a9"/>
        <circle cx="56" cy="53" r="3" fill="#ff6b81"/>
        <circle cx="50" cy="62" r="3" fill="#fcc419"/>
      </svg>
    </div>
  );
};
