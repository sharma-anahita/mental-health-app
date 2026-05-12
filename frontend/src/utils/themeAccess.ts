import type { ThemeName } from "../store/themeStore";
import type { User } from "../types/user";

export function canUseTheme(theme: ThemeName, userOrInventory?: User | string[] | null): boolean {
  // Default themes are always available.
  if (theme === "calm" || theme === "focus") return true;

  const inventory = Array.isArray(userOrInventory)
    ? userOrInventory
    : userOrInventory?.inventory;

  if (!Array.isArray(inventory) || inventory.length === 0) {
    return false;
  }

  return inventory.includes(theme);
}
