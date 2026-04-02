import type { User } from "../types/user";

export function canUseFeature(featureKey: string, user?: User | null): boolean {
  if (!featureKey) return false;
  const inventory = user?.inventory;
  if (!Array.isArray(inventory) || inventory.length === 0) return false;
  return inventory.includes(featureKey);
}
