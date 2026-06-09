import React from 'react';

export const DNAHelixFrame: React.FC = () => (
  <div className="absolute inset-y-0 right-0 w-16 border-l border-slate-800/30 bg-[#020617]/40 backdrop-blur-md overflow-hidden pointer-events-none select-none">
    {/* Contextual Color Blur Block */}
    <div className="absolute top-1/4 -right-8 w-16 h-32 bg-emerald-500/10 rounded-full blur-3xl" />

    <svg className="w-full h-full opacity-25" viewBox="0 0 64 400" preserveAspectRatio="none">
      <defs>
        <linearGradient id="helix-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      
      {/* Strands */}
      <path d="M32 0 Q 60 50 32 100 T 32 200 T 32 300 T 32 400" fill="none" stroke="url(#helix-grad)" strokeWidth="0.75" />
      <path d="M32 0 Q 4 50 32 100 T 32 200 T 32 300 T 32 400" fill="none" stroke="url(#helix-grad)" strokeWidth="0.75" strokeOpacity="0.4" />
      
      {/* Algorithmic Sequential Milestones */}
      {Array.from({ length: 20 }).map((_, i) => (
        <rect 
          key={i} 
          x={i % 2 === 0 ? "16" : "24"} 
          y={i * 22 + 12} 
          width={i % 3 === 0 ? "24" : "16"} 
          height="0.75" 
          fill="#0ea5e9" 
          opacity={i % 4 === 0 ? 0.7 : 0.2} 
        />
      ))}
    </svg>
  </div>
);
