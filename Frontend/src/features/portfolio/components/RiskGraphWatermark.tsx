import React from 'react';

export const RiskGraphWatermark: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.12] overflow-hidden">
    <svg className="w-full h-full min-w-[500px]" viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMidSlice">
      {/* Structural Crosshair Grid */}
      <path d="M0 160h500M40 0v200" stroke="#0ea5e9" strokeWidth="0.5" strokeDasharray="3 6" />
      
      {/* Implied Volatility Tail Risk Curve */}
      <path 
        d="M40 140 Q 180 140 260 90 T 460 10" 
        stroke="#ef4444" 
        strokeWidth="1.25" 
        strokeDasharray="4 3"
      />
      <circle cx="260" cy="90" r="3.5" fill="#ef4444" className="animate-pulse" />
      
      <text x="272" y="86" className="font-mono text-[8px] fill-red-500 font-medium tracking-wider">
        VAR_EXCEED_99.6%
      </text>
    </svg>
  </div>
);
