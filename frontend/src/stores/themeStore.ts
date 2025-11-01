import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "system",

      setTheme: (theme) => {
        set({ theme });
        const effectiveTheme = theme === "system" ? getSystemTheme() : theme;
        const root = document.documentElement;
        if (effectiveTheme === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        if (currentTheme === "system") {
          get().setTheme("dark");
        } else if (currentTheme === "dark") {
          get().setTheme("light");
        } else {
          get().setTheme("dark");
        }
      },
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const effectiveTheme =
            state.theme === "system" ? getSystemTheme() : state.theme;
          const root = document.documentElement;
          if (effectiveTheme === "dark") {
            root.classList.add("dark");
          } else {
            root.classList.remove("dark");
          }

          if (typeof window !== "undefined") {
            const media = window.matchMedia("(prefers-color-scheme: dark)");
            const handler = () => {
              if (state.theme === "system") {
                const newTheme = media.matches ? "dark" : "light";
                const root = document.documentElement;
                if (newTheme === "dark") {
                  root.classList.add("dark");
                } else {
                  root.classList.remove("dark");
                }
              }
            };
            media.addEventListener("change", handler);
          }
        }
      },
    }
  )
);
