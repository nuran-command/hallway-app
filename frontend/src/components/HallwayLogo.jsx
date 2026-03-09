import React from 'react';

export const HallwayLogo = ({ size = 40, className = "" }) => (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`app-logo-svg ${className}`}>
        <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
        </defs>
        {/* Perspective Perspective Hallway */}
        <path d="M5 5 L40 38 L40 62 L5 95 Z" fill="url(#logoGrad)" opacity="0.3" />
        <path d="M95 5 L60 38 L60 62 L95 95 Z" fill="url(#logoGrad)" opacity="0.3" />
        <path d="M5 5 L95 5 L65 35 L35 35 Z" fill="url(#logoGrad)" opacity="0.1" />
        <path d="M5 95 L95 95 L65 65 L35 65 Z" fill="url(#logoGrad)" opacity="0.2" />

        {/* Central Doorway */}
        <rect x="42" y="38" width="16" height="32" rx="1.5" fill="url(#logoGrad)" />
        <circle cx="53" cy="56" r="1.2" fill="white" />

        {/* Side Doors with Depth */}
        <path d="M12 25 L32 38 L32 75 L12 85 Z" fill="url(#logoGrad)" opacity="0.5" />
        <path d="M88 25 L68 38 L68 75 L88 85 Z" fill="url(#logoGrad)" opacity="0.5" />

        {/* Ceiling Light Glow */}
        <ellipse cx="50" cy="18" rx="8" ry="4" fill="#fbbf24" opacity="0.8" />
    </svg>
);

export default HallwayLogo;
