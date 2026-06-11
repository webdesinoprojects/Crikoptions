import React from 'react';

export const AssetHeatmapMask: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-overlay opacity-25">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="micro-dot-grid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.75" fill="#334155" />
        </pattern>
        <radialGradient id="radial-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <mask id="center-mask">
          <rect width="100%" height="100%" fill="url(#radial-fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#micro-dot-grid)" mask="url(#center-mask)" />
    </svg>
  </div>
);
