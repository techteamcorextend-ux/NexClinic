"use client";

import { useId } from "react";
import { useTheme } from "./ThemeProvider";
import styles from "./ThemeToggle.module.css";

/**
 * The site-wide light/dark switch.
 *
 * It's a real checkbox under the chrome, so it is focusable, toggles with
 * Space, and reports its on/off state to assistive tech for free — no
 * role="switch" plumbing and no key handlers of our own.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const id = useId();
  const isDark = theme === "dark";

  return (
    <div className={`${styles.wrapper}${className ? ` ${className}` : ""}`}>
      <label className={styles.outer} htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={isDark}
          onChange={(event) => setTheme(event.target.checked ? "dark" : "light")}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        />
        <span className={styles.track}>
          <span className={styles.knob} aria-hidden="true" />
          <span className={styles.indicator} aria-hidden="true" />
        </span>
      </label>
    </div>
  );
}

export { ThemeToggle };
