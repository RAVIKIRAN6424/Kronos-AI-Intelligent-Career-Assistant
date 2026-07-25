import React from 'react';

export const KronosAppLogo = ({ size = 44, animated = true }) => {
  return (
    <div
      className="kronos-logo-wrapper"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        filter: 'drop-shadow(0 0 12px rgba(0, 242, 254, 0.6))'
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <defs>
          {/* Cyber gradients */}
          <linearGradient id="kronosBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#090d16" />
            <stop offset="50%" stopColor="#111827" />
            <stop offset="100%" stopColor="#040711" />
          </linearGradient>

          <linearGradient id="kronosStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="50%" stopColor="#9d4ede" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          <linearGradient id="kronosCoreGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="100%" stopColor="#4facfe" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Tech Hexagon Shield */}
        <polygon
          points="50,5 90,26 90,74 50,95 10,74 10,26"
          fill="url(#kronosBgGrad)"
          stroke="url(#kronosStrokeGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner Tech Accent Corners */}
        <polygon
          points="50,14 82,31 82,69 50,86 18,69 18,31"
          fill="none"
          stroke="rgba(0, 242, 254, 0.25)"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />

        {/* Rotating Tech Orbital Ring */}
        <circle
          cx="50"
          cy="50"
          r="26"
          fill="none"
          stroke="url(#kronosStrokeGrad)"
          strokeWidth="2.5"
          strokeDasharray="18 10 35 10"
        />

        {/* Core AI Tech Node Diamond */}
        <polygon
          points="50,28 68,50 50,72 32,50"
          fill="url(#kronosCoreGrad)"
          filter="url(#neonGlow)"
        />

        {/* Futuristic Eye/Neural Core */}
        <circle cx="50" cy="50" r="7" fill="#ffffff" />
        <circle cx="50" cy="50" r="3.5" fill="#060a12" />

        {/* Orbit Dots */}
        <circle cx="50" cy="18" r="2.5" fill="#00f2fe" />
        <circle cx="78" cy="50" r="2.5" fill="#9d4ede" />
        <circle cx="50" cy="82" r="2.5" fill="#10b981" />
        <circle cx="22" cy="50" r="2.5" fill="#00f2fe" />
      </svg>
    </div>
  );
};
