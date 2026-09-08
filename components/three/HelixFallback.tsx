"use client";

/**
 * Static fallback for the hero visual: a large soft-gradient blob with pulse-line
 * overlays. Rendered instead of the Three.js helix when the user prefers reduced
 * motion (or while the 3D bundle is still loading).
 */
export function HelixFallback({ animated = false }: { animated?: boolean }) {
  return (
    <div className="relative h-[420px] w-full md:h-[520px]" aria-hidden="true">
      <svg
        viewBox="0 0 520 520"
        className="h-full w-full"
        role="presentation"
        focusable="false"
      >
        <defs>
          <linearGradient id="helix-fallback-blob" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="50%" stopColor="#7C6FF0" />
            <stop offset="100%" stopColor="#5B4FE0" />
          </linearGradient>
          <filter id="helix-fallback-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="26" />
          </filter>
        </defs>

        <g filter="url(#helix-fallback-blur)" opacity="0.55">
          <ellipse cx="260" cy="250" rx="150" ry="185" fill="url(#helix-fallback-blob)" />
          <circle cx="340" cy="170" r="80" fill="#A78BFA" opacity="0.7" />
        </g>

        {/* Pulse lines standing in for the helix strands */}
        <path
          d="M180 90 C 300 150, 220 250, 330 300 C 420 342, 300 400, 190 430"
          fill="none"
          stroke="#5B4FE0"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
          className={animated ? "animate-pulse" : undefined}
        />
        <path
          d="M330 90 C 210 150, 300 250, 190 300 C 100 342, 220 400, 330 430"
          fill="none"
          stroke="#7C6FF0"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}

export default HelixFallback;
