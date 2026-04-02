import type { ThemeName } from "../store/themeStore";
import type { User } from "../types/user";

export function canUseTheme(theme: ThemeName, user?: User | null): boolean {
  // Default theme is always available.
  if (theme === "calm") return true;

  const inventory = user?.inventory;
  if (!Array.isArray(inventory) || inventory.length === 0) {
    return false;
  }

  return inventory.includes(theme);
}
