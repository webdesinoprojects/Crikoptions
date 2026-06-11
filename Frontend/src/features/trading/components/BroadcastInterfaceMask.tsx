import React from 'react';

export const BroadcastInterfaceMask: React.FC = () => (
  <div className="absolute inset-0 bg-[#071024]/20 border border-slate-800/40 flex items-center justify-center overflow-hidden">
    {/* Ambient Underlying Glow Layer */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-sky-500/10 rounded-full blur-[64px] pointer-events-none" />

    {/* Digital Calibration & Bounding Reticles */}
    <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d="M4 4h8M4 4v8M96 4h-8M96 4v8M4 96h8M4 96v-8M96 96h-8M96 96v-8" fill="none" stroke="#0ea5e9" strokeWidth="0.25" />
      <line x1="50" y1="4" x2="50" y2="8" stroke="#0ea5e9" strokeWidth="0.15" />
      <line x1="50" y1="92" x2="50" y2="96" stroke="#0ea5e9" strokeWidth="0.15" />
      <line x1="4" y1="50" x2="8" y2="50" stroke="#0ea5e9" strokeWidth="0.15" />
      <line x1="92" y1="50" x2="96" y2="50" stroke="#0ea5e9" strokeWidth="0.15" />
    </svg>
    
    {/* Infinite Scanning Sweep (Tailwind Arbitrary Animation) */}
    <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-transparent via-sky-500/10 to-transparent h-12 w-full animate-[ping_3s_ease-in-out_infinite]" />
    
    {/* Monospace System Metadata String */}
    <div className="absolute bottom-3 left-4 font-mono text-[9px] tracking-[0.25em] text-[#0ea5e9]/50 select-none">
      TRK-A_DNA // LIVE_FEED_INITIALIZING
    </div>
  </div>
);
