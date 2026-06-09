import React from 'react';

export const PrecisionArc: React.FC = () => (
  <div className="absolute top-0 right-0 p-0.5 pointer-events-none opacity-50 select-none">
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28 0 A 28 28 0 0 0 0 28" stroke="#0ea5e9" strokeWidth="0.75" />
      <path d="M28 10 A 18 18 0 0 0 10 28" stroke="#0ea5e9" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.4" />
      <circle cx="24" cy="4" r="1.25" fill="#10b981" />
    </svg>
  </div>
);
