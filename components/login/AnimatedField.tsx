"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type AnimatedFieldProps = {
  label: string;
  /** Rendered inside the field on the right — an icon, a "Resend" link, etc. */
  adornment?: ReactNode;
  hint?: string;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "placeholder">;

/**
 * Text field with a floating label.
 *
 * Three layers of motion, all CSS-driven so they cost nothing at runtime:
 *  · the whole field lifts 2px on hover
 *  · a soft gradient glow fades in behind the border on focus
 *  · the label rises into the top of the field and picks up the accent colour
 *
 * The label animates off `:placeholder-shown`, so it stays raised whenever the
 * field has a value — including on autofill.
 */
export function AnimatedField({
  label,
  adornment,
  hint,
  className,
  id,
  type = "text",
  ...props
}: AnimatedFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = `${fieldId}-hint`;
  const [revealed, setRevealed] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && revealed ? "text" : type;

  return (
    <div className={cn("group relative", className)}>
      <div className="relative transition-transform duration-300 ease-out-soft group-hover:-translate-y-0.5 motion-reduce:transform-none">
        {/* Gradient glow behind the border, revealed on focus */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[1.5px] rounded-2xl bg-gradient-to-r from-rose-500 to-blue-600 opacity-0 blur-[3px] transition-opacity duration-300 group-focus-within:opacity-70"
        />

        <div className="relative rounded-2xl border border-line bg-white transition-colors duration-300 group-hover:border-ink/25 group-focus-within:border-blue-500">
          <input
            {...props}
            id={fieldId}
            type={inputType}
            /* A single space keeps :placeholder-shown meaningful while showing
               nothing to the user — that is what drives the label animation. */
            placeholder=" "
            aria-describedby={hint ? hintId : undefined}
            className={cn(
              "peer h-[3.75rem] w-full rounded-2xl bg-transparent px-4 pb-2 pt-7 text-base text-ink outline-none placeholder:text-transparent",
              (adornment || isPassword) && "pr-12",
            )}
          />

          <label
            htmlFor={fieldId}
            className={cn(
              "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink-muted transition-all duration-200 ease-out-soft",
              "peer-focus:top-[0.6rem] peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.12em] peer-focus:text-blue-700",
              "peer-[:not(:placeholder-shown)]:top-[0.6rem] peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.12em]",
            )}
          >
            {label}
          </label>

          {/* Accent line that sweeps out from the centre on focus */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-4 bottom-0 h-[2px] origin-center scale-x-0 rounded-full bg-gradient-to-r from-rose-500 to-blue-600 transition-transform duration-300 ease-out-soft group-focus-within:scale-x-100 motion-reduce:transition-none"
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setRevealed((value) => !value)}
              aria-label={revealed ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink-muted transition-colors duration-200 hover:bg-surface hover:text-ink"
            >
              {revealed ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          ) : adornment ? (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">{adornment}</span>
          ) : null}
        </div>
      </div>

      {hint ? (
        <p id={hintId} className="mt-1.5 pl-1 text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default AnimatedField;
