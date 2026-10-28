"use client";

import { useCallback, useEffect, useState } from "react";
import { THEME_STORAGE_KEY, type Theme } from "../Theme.utils";

const useTheme = () => {
  // null until the page has loaded: the server can't know which theme the browser picked.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked (private windows, strict settings). The theme still
      // switches for this visit, it just won't be remembered.
    }
  }, []);

  return { theme, toggleTheme };
};

export default useTheme;