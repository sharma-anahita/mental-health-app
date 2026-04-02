import { create } from "zustand";
import apiClient from "../services/apiClient.ts";
import { useUIStore } from "./uiStore";
import { canUseTheme } from "../utils/themeAccess";

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

function normalizeOwnedThemes(keys: string[] = []): ThemeName[] {
  const allowed: ThemeName[] = ["calm", "focus", "sunset", "midnight"];
  const next = new Set<ThemeName>(["calm"]);

  for (const key of keys) {
    if (allowed.includes(key as ThemeName)) {
      next.add(key as ThemeName);
    }
  }

  return Array.from(next);
}

interface ThemeState {
  theme: ThemeName;
  ownedThemes: ThemeName[];
  setOwnedThemes: (keys: string[]) => void;
  grantTheme: (key: string) => void;
  isThemeOwned: (theme: ThemeName) => boolean;
  setTheme: (theme: ThemeName, syncToBackend?: boolean) => void;
  initTheme: (serverTheme?: ThemeName) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readStoredTheme(),
  ownedThemes: ["calm"],

  setOwnedThemes: (keys) => {
    const normalized = normalizeOwnedThemes(keys);
    const currentTheme = get().theme;

    // Keep UI valid if ownership changed and current theme is no longer allowed.
    if (!canUseTheme(currentTheme, normalized)) {
      applyThemeToDOM("calm");
      persistThemeLocally("calm");
      set({ ownedThemes: normalized, theme: "calm" });
      return;
    }

    set({ ownedThemes: normalized });
  },

  grantTheme: (key) => {
    const normalized = normalizeOwnedThemes([...get().ownedThemes, key]);
    set({ ownedThemes: normalized });
  },

  isThemeOwned: (theme) => canUseTheme(theme, get().ownedThemes),

  setTheme: (theme, syncToBackend = true) => {
    if (!canUseTheme(theme, get().ownedThemes)) {
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
    const preferredTheme: ThemeName =
      serverTheme && ["calm", "focus", "sunset", "midnight"].includes(serverTheme)
        ? serverTheme
        : readStoredTheme();

    const resolved = canUseTheme(preferredTheme, get().ownedThemes) ? preferredTheme : "calm";

    applyThemeToDOM(resolved);
    persistThemeLocally(resolved);
    set({ theme: resolved });
  },
}));

export default useThemeStore;