"use client";

import classNames from "classnames";
import useTheme from "./hooks/useTheme";
import styles from "./Theme.module.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const label =
    theme === null
      ? "Switch colour theme"
      : theme === "dark"
        ? "Switch to light mode"
        : "Switch to dark mode";

  return (
    <button
      type="button"
      className={classNames(styles.toggle, {
        [styles.toggleDark]: theme === "dark",
      })}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {/* A circle with one half filled in: the half moon. */}
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
      </svg>
    </button>
  );
}