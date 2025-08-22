import React from 'react';

export function SparkIcon(props: React.SVGProps<SVGSVGElement>): React.ReactNode {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      aria-hidden="true" 
      {...props}
    >
      {/* Crystal Ball */}
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity="0.3" />
      <circle cx="12" cy="12" r="6" opacity="0.5" />
      <path d="M12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" opacity="0.8" />
      {/* Base for crystal ball */}
      <path d="M7 22h10c.55 0 1-.45 1-1v-1H6v1c0 .55.45 1 1 1z" />
      
      {/* Floating Rupee Notes */}
      <text x="4" y="9" fontSize="5" fontWeight="bold" transform="rotate(-20 5 8)">₹</text>
      <text x="17" y="8" fontSize="5" fontWeight="bold" transform="rotate(15 17 7)">₹</text>
      <text x="4" y="17" fontSize="5" fontWeight="bold" transform="rotate(10 5 16)">₹</text>
      <text x="18" y="16" fontSize="5" fontWeight="bold" transform="rotate(-15 18 15)">₹</text>
    </svg>
  );
}
