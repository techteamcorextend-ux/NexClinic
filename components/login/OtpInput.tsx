"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const LENGTH = 6;

/**
 * Six-box one-time-code input. Behaves the way people expect: typing advances,
 * Backspace on an empty box steps back, arrow keys move, and pasting a whole
 * code fills every box at once. `autoComplete="one-time-code"` lets iOS and
 * Android offer the SMS code directly.
 */
export function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(LENGTH, " ").slice(0, LENGTH).split("");

  const setDigit = (index: number, digit: string) => {
    const next = digits.map((entry, position) =>
      position === index ? digit : entry,
    );
    onChange(next.join("").trimEnd());
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) {
      setDigit(index, " ");
      return;
    }
    setDigit(index, digit);
    if (index < LENGTH - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index].trim() && index > 0) {
      event.preventDefault();
      setDigit(index - 1, " ");
      refs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < LENGTH - 1) {
      event.preventDefault();
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted.slice(0, LENGTH));
    refs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  };

  return (
    <div
      role="group"
      aria-label="Six digit one-time code"
      className="flex items-center justify-between gap-2 sm:gap-3"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${LENGTH}`}
          value={digit.trim()}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className={cn(
            "h-14 w-full min-w-0 rounded-2xl border border-line bg-white dark:bg-p-card text-center text-xl font-semibold text-ink transition-all duration-200 ease-out-soft",
            "hover:-translate-y-0.5 hover:border-ink/25 focus:-translate-y-0.5 focus:border-blue-500 focus:shadow-lift focus:outline-none",
            "motion-reduce:transform-none disabled:opacity-50",
          )}
        />
      ))}
    </div>
  );
}

export default OtpInput;
