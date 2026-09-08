/**
 * Themed background artwork. Drawn as inline SVG rather than fetched imagery,
 * so it scales to any viewport, inherits the active theme's tokens and costs
 * no network request. Decorative only.
 */
export function Backdrop({
  variant = "soft",
}: {
  variant?: "soft" | "leaf" | "grid" | "aurora";
}) {
  if (variant === "leaf") {
    // The plant motif behind the patient-profile sidebar.
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 260 420"
        preserveAspectRatio="xMidYMax meet"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] w-full opacity-90"
      >
        <defs>
          <linearGradient id="leafA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E9D8FD" />
            <stop offset="100%" stopColor="#C4B5FD" />
          </linearGradient>
          <linearGradient id="vase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#DDD3F7" />
          </linearGradient>
        </defs>

        {[
          { x: 130, y: 250, r: -38, s: 1 },
          { x: 130, y: 250, r: -14, s: 1.15 },
          { x: 130, y: 250, r: 10, s: 1.05 },
          { x: 130, y: 250, r: 34, s: 0.92 },
          { x: 130, y: 250, r: -60, s: 0.8 },
          { x: 130, y: 250, r: 56, s: 0.78 },
        ].map((leaf, index) => (
          <ellipse
            key={index}
            cx={leaf.x}
            cy={leaf.y - 78 * leaf.s}
            rx={17 * leaf.s}
            ry={62 * leaf.s}
            fill="url(#leafA)"
            opacity={0.55 + (index % 3) * 0.15}
            transform={`rotate(${leaf.r} ${leaf.x} ${leaf.y})`}
          />
        ))}

        <path
          d="M92 268 h76 c8 0 14 7 13 15 l-9 92 c-1 22 -18 39 -40 39 h-4 c-22 0 -39 -17 -40 -39 l-9 -92 c-1 -8 5 -15 13 -15 z"
          fill="url(#vase)"
        />
      </svg>
    );
  }

  if (variant === "grid") {
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.55]"
      >
        <defs>
          <pattern id="pgrid" width="34" height="34" patternUnits="userSpaceOnUse">
            <path
              d="M34 0 L0 0 0 34"
              fill="none"
              stroke="rgb(var(--p-line))"
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="pfade" cx="50%" cy="0%" r="85%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="100%" stopColor="#fff" stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#pgrid)" />
        <rect width="100%" height="100%" fill="url(#pfade)" opacity="0.75" />
      </svg>
    );
  }

  if (variant === "aurora") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-p-accent/25 blur-[110px]" />
        <div className="absolute -right-20 top-1/3 h-[22rem] w-[22rem] rounded-full bg-p-accent2/25 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 h-[20rem] w-[20rem] rounded-full bg-p-accent/15 blur-[110px]" />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-p-accent/12 blur-[100px]" />
      <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-p-accent2/12 blur-[100px]" />
    </div>
  );
}

export default Backdrop;
