import { cn } from "@/lib/utils";

/**
 * A QR code drawn as a deterministic grid.
 *
 * Decorative stand-in for the real code — it is not scannable, which is why it
 * carries `role="img"` and a label that says so rather than pretending to be a
 * working code.
 */
export function QrPlaceholder({
  seed = 7,
  label,
  className,
}: {
  seed?: number;
  label: string;
  className?: string;
}) {
  const cells: boolean[] = [];
  let state = seed;
  for (let index = 0; index < 441; index += 1) {
    state = (state * 1103515245 + 12345) % 2147483648;
    cells.push(state % 100 > 47);
  }

  const isFinder = (row: number, col: number) =>
    (row < 7 && col < 7) || (row < 7 && col > 13) || (row > 13 && col < 7);

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "grid aspect-square w-full max-w-[220px] grid-cols-[repeat(21,1fr)] gap-[2px] rounded-2xl bg-white p-3 shadow-[0_4px_24px_rgba(16,24,40,0.08)]",
        className,
      )}
    >
      {cells.map((on, index) => {
        const row = Math.floor(index / 21);
        const col = index % 21;
        const filled = isFinder(row, col)
          ? row % 6 === 0 || col % 6 === 0 || (row > 1 && row < 5 && col > 1 && col < 5)
          : on;
        return (
          <span
            key={index}
            className={cn("aspect-square rounded-[1px]", filled ? "bg-p-ink" : "bg-transparent")}
          />
        );
      })}
    </div>
  );
}

export default QrPlaceholder;
