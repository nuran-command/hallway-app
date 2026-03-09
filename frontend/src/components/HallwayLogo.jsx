import React from 'react';

export const HallwayLogo = ({ size = 40, className = "" }) => (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`app-logo-svg ${className}`} style={{ display: 'block' }}>
        {/* Perspective Walls - Using currentColor for flexibility */}
        <path d="M5 5 L40 38 L40 62 L5 95 Z" fill="currentColor" opacity="0.25" />
        <path d="M95 5 L60 38 L60 62 L95 95 Z" fill="currentColor" opacity="0.25" />

        {/* Ceiling and Floor */}
        <path d="M5 5 L95 5 L62 38 L38 38 Z" fill="currentColor" opacity="0.1" />
        <path d="M5 95 L95 95 L62 62 L38 62 Z" fill="currentColor" opacity="0.15" />

        {/* Central Gateway */}
        <rect x="42" y="38" width="16" height="32" rx="2" fill="currentColor" />
        <circle cx="53" cy="56" r="1.5" fill="var(--card-bg, #fff)" />

        {/* Decorative Side Elements for Depth */}
        <path d="M15 25 L32 38 L32 75 L15 85 Z" fill="currentColor" opacity="0.4" />
        <path d="M85 25 L68 38 L68 75 L85 85 Z" fill="currentColor" opacity="0.4" />

        {/* Ambient Light Source */}
        <ellipse cx="50" cy="18" rx="10" ry="5" fill="#fbbf24" opacity="0.9" />
    </svg>
);

export default HallwayLogo;
