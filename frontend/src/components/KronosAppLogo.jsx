import React from 'react';

/**
 * Kronos AI Pure Cybernetic Neural Engine Logo Symbol (No letters/numbers)
 * Futuristic geometric AI shield with ascending career growth trajectory arcs & central neural core node.
 */
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
        filter: 'drop-shadow(0 0 16px rgba(0, 242, 254, 0.75))',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Multi-Stop High-Tech Cyber Gradients */}
          <linearGradient id="kronosBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0b1329" />
            <stop offset="50%" stopColor="#131c38" />
            <stop offset="100%" stopColor="#040814" />
          </linearGradient>

          <linearGradient id="kronosCyberBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="35%" stopColor="#38bdf8" />
            <stop offset="70%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          <linearGradient id="kronosCoreGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00c6ff" />
            <stop offset="50%" stopColor="#0072ff" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          <linearGradient id="kronosStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#00f2fe" />
          </linearGradient>

          <filter id="kronosGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Outer Tech Hexagon Shield */}
        <polygon
          points="50,4 92,25 92,75 50,96 8,75 8,25"
          fill="url(#kronosBgGrad)"
          stroke="url(#kronosCyberBorder)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* 2. Inner Tech Circuit Boundary */}
        <polygon
          points="50,12 84,29 84,71 50,88 16,71 16,29"
          fill="none"
          stroke="rgba(56, 189, 248, 0.25)"
          strokeWidth="1.5"
          strokeDasharray="5 3"
        />

        {/* 3. Concentric Rotating Orbital Quantum Rings */}
        <circle
          cx="50"
          cy="50"
          r="26"
          fill="none"
          stroke="url(#kronosCyberBorder)"
          strokeWidth="2.2"
          strokeDasharray="18 8 28 8"
        />

        {/* 4. Ascending Quantum Career Core Diamond */}
        <polygon
          points="50,22 72,50 50,78 28,50"
          fill="url(#kronosCoreGrad)"
          filter="url(#kronosGlow)"
        />

        {/* 5. Four Corner Interlocking Neural Star Blades (Zero Text/Letters) */}
        <polygon
          points="50,18 56,30 68,36 56,42 50,54 44,42 32,36 44,30"
          fill="url(#kronosStarGrad)"
          filter="url(#kronosGlow)"
          opacity="0.95"
        />

        {/* 6. Glowing Central Intelligence Nucleus */}
        <circle cx="50" cy="50" r="5" fill="#ffffff" filter="url(#kronosGlow)" />
        <circle cx="50" cy="50" r="2.5" fill="#00f2fe" />

        {/* 7. Orbital Cyber Vertex Nodes */}
        <circle cx="50" cy="8" r="2.5" fill="#00f2fe" />
        <circle cx="88" cy="30" r="2.5" fill="#a855f7" />
        <circle cx="88" cy="70" r="2.5" fill="#10b981" />
        <circle cx="50" cy="92" r="2.5" fill="#38bdf8" />
        <circle cx="12" cy="70" r="2.5" fill="#a855f7" />
        <circle cx="12" cy="30" r="2.5" fill="#00f2fe" />
      </svg>
    </div>
  );
};
