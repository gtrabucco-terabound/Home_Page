import React from 'react';

export function BackgroundLines() {
  return (
    <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none overflow-hidden">
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 1000 1000" 
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-[40vh]"
      >
        <path 
          d="M0,1000 Q250,800 500,1000 T1000,1000" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1" 
          className="text-[var(--accent)]" 
        />
        <path 
          d="M0,950 Q300,750 600,950 T1000,950" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="0.5" 
          className="text-[var(--accent)]" 
        />
      </svg>
    </div>
  );
}
