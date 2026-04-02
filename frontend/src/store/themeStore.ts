import { create } from "zustand";
import apiClient from "../services/apiClient.ts";
import { useUIStore } from "./uiStore";
import { canUseTheme } from "../utils/themeAccess";
import type { User } from "../types/user";

export type ThemeName = "calm" | "focus" | "sunset" | "midnight";

const STORAGE_KEY = "app-theme";
const CLASS_PREFIX = "theme-";

// All valid theme class names (for cleanup)
const ALL_THEME_CLASSES: string[] = ["theme-calm", "theme-focus", "theme-sunset", "theme-midnight"];

function applyThemeToDOM(theme: ThemeName): void {
  const root = document.documentElement;
  root.classList.remove(...ALL_THEME_CLASSES);
  root.classList.add(`${CLASS_PREFIX}${theme}`);
}

function readStoredTheme(): ThemeName {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ["calm", "focus", "sunset", "midnight"].includes(stored)) {
      return stored as ThemeName;
    }
  } catch {
    // localStorage unavailable (SSR / private browsing edge case)
  }
  return "calm";
}

function persistThemeLocally(theme: ThemeName): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}

interface ThemeState {
  theme: ThemeName;
  setTheme: (theme: ThemeName, syncToBackend?: boolean, user?: User | null) => void;
  initTheme: (serverTheme?: ThemeName) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: readStoredTheme(),

  setTheme: (theme, syncToBackend = true, user) => {
    if (!canUseTheme(theme, user)) {
      useUIStore.getState().showToast("Purchase this theme from the store", {
        type: "error",
        duration: 2500,
      });
      return;
    }

    applyThemeToDOM(theme);
    persistThemeLocally(theme);
    set({ theme });

    if (syncToBackend) {
      // Fire-and-forget — don't block UI on backend round-trip
      apiClient
        .patch("/user/preferences", { theme })
        .catch(() => {
          // Silently ignore: theme is still applied locally
        });
    }
  },

  initTheme: (serverTheme) => {
    // Server preference wins over localStorage; falls back to stored value
    const resolved: ThemeName =
      serverTheme && ["calm", "focus", "sunset", "midnight"].includes(serverTheme)
        ? serverTheme
        : readStoredTheme();

    applyThemeToDOM(resolved);
    persistThemeLocally(resolved);
    set({ theme: resolved });
  },
}));

export default useThemeStore;