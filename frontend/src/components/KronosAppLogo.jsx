import React from 'react';

/**
 * Kronos AI Advanced Cybernetic Gear-Core Logo Symbol
 * Crafted directly based on user image: Smooth Rounded Gradient App Shield + 8-Notch Tech Gear + Sweeping Quantum Loop Arc + Tri-Color Intelligence Nodes.
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
        filter: 'drop-shadow(0 0 14px rgba(0, 242, 254, 0.6))',
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
          {/* Rich App Background Gradient (Indigo Top-Left -> Dark Teal Bottom-Right) */}
          <linearGradient id="kronosAppBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#434185" />
            <stop offset="45%" stopColor="#2c3a6b" />
            <stop offset="100%" stopColor="#0d5257" />
          </linearGradient>

          {/* Glowing Border Accent */}
          <linearGradient id="kronosAppBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.35)" />
            <stop offset="50%" stopColor="rgba(0, 242, 254, 0.4)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0.35)" />
          </linearGradient>

          {/* Gear Ring Gradient */}
          <linearGradient id="kronosGearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>

          {/* Dark Inner Core */}
          <linearGradient id="kronosDarkCore" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1c43" />
            <stop offset="100%" stopColor="#10132b" />
          </linearGradient>

          <filter id="kronosSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Smooth Rounded Square App Icon Shield Container */}
        <rect
          x="3"
          y="3"
          width="94"
          height="94"
          rx="24"
          fill="url(#kronosAppBg)"
          stroke="url(#kronosAppBorder)"
          strokeWidth="1.8"
        />

        {/* 2. Outer 8-Notch Tech Gear Wheel */}
        <g>
          {/* Gear Body Ring */}
          <circle cx="50" cy="50" r="26" fill="url(#kronosGearGrad)" />

          {/* 8 Outer Rectangular Gear Teeth/Notches */}
          {/* Top & Bottom */}
          <rect x="46" y="17" width="8" height="7" rx="2" fill="#f3f4f6" />
          <rect x="46" y="76" width="8" height="7" rx="2" fill="#f3f4f6" />
          {/* Left & Right */}
          <rect x="17" y="46" width="7" height="8" rx="2" fill="#f3f4f6" />
          <rect x="76" y="46" width="7" height="8" rx="2" fill="#f3f4f6" />

          {/* 4 Diagonal Notches */}
          <rect x="24" y="24" width="7" height="7" rx="2" fill="#f3f4f6" transform="rotate(45 27.5 27.5)" />
          <rect x="68" y="24" width="7" height="7" rx="2" fill="#f3f4f6" transform="rotate(45 71.5 27.5)" />
          <rect x="24" y="68" width="7" height="7" rx="2" fill="#f3f4f6" transform="rotate(45 27.5 71.5)" />
          <rect x="68" y="68" width="7" height="7" rx="2" fill="#f3f4f6" transform="rotate(45 71.5 71.5)" />
        </g>

        {/* 3. Dark Navy Core Circle Interior */}
        <circle cx="50" cy="50" r="20" fill="url(#kronosDarkCore)" />

        {/* 4. Sweeping White Crescent Arc / Quantum Loop */}
        <path
          d="M 60,34 C 42,30 31,44 33,60 C 35,70 45,74 54,68"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4.5"
          strokeLinecap="round"
          filter="url(#kronosSoftGlow)"
        />

        {/* 5. Three Tri-Color Intelligence Core Nodes (Cyan, Pink, Gold) */}
        {/* Left: Cyan/Teal Dot */}
        <circle cx="44" cy="53" r="3.2" fill="#38d9a9" filter="url(#kronosSoftGlow)" />

        {/* Right: Magenta/Pink Dot */}
        <circle cx="56" cy="53" r="3.2" fill="#ff6b81" filter="url(#kronosSoftGlow)" />

        {/* Bottom: Gold/Orange Dot */}
        <circle cx="50" cy="62" r="3.2" fill="#fcc419" filter="url(#kronosSoftGlow)" />
      </svg>
    </div>
  );
};
