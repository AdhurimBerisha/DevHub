import { useCallback, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem("theme");
    if (value === "light" || value === "dark") return value;
    return null;
  } catch {
    return null;
  }
}

function writeStoredTheme(theme: Theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // ignore
  }
}

export function useTheme() {
  const initialTheme: Theme = useMemo(() => {
    const stored = readStoredTheme();
    if (stored) return stored;
    return getSystemPrefersDark() ? "dark" : "light";
  }, []);

  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    writeStoredTheme(theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const stored = readStoredTheme();
      if (!stored) {
        setTheme(media.matches ? "dark" : "light");
      }
    };
    media.addEventListener?.("change", handler);
    return () => media.removeEventListener?.("change", handler);
  }, []);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return { theme, isDark: theme === "dark", setTheme, toggle } as const;
}
