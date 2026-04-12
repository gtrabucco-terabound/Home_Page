import React from 'react';

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src="/logo.png" 
        alt="Terabound Logo" 
        className="h-16 w-auto object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
