/**
 * The layered "paper cut" edge from the reference design: three stacked white
 * waves that step out from the form panel over the photograph, so the card
 * reads as cut paper laid on the image rather than a hard seam.
 *
 * Each layer carries its own soft drop shadow — that is what separates the
 * sheets visually; without it three whites at different opacities just read as
 * one soft gradient.
 *
 * Purely decorative — hidden from assistive tech.
 */

/** Offset from the panel's left edge, and how opaque that sheet is. */
const LAYERS = [
  { x: 68, opacity: 0.34 },
  { x: 36, opacity: 0.62 },
  { x: 0, opacity: 1 },
];

const WAVE =
  "M0,0 C72,124 -2,252 62,376 C126,500 8,606 68,724 C96,780 58,790 46,800 L-70,800 L-70,0 Z";

export function PaperCutEdge() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 190 800"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-y-0 left-0 h-full w-[54%]"
    >
      <defs>
        <filter id="paper-cut-shadow" x="-60%" y="-10%" width="220%" height="120%">
          <feDropShadow
            dx="10"
            dy="0"
            stdDeviation="12"
            floodColor="#241E33"
            floodOpacity="0.16"
          />
        </filter>
      </defs>

      {LAYERS.map((layer) => (
        <path
          key={layer.x}
          transform={`translate(${layer.x} 0)`}
          d={WAVE}
          fill="#ffffff"
          opacity={layer.opacity}
          filter="url(#paper-cut-shadow)"
        />
      ))}
    </svg>
  );
}

export default PaperCutEdge;
