import React, { useEffect, useMemo, useState } from "react";
import { PageTitle, SubtleText } from "../../components/ui/Typography";
import PageTransition from "../../components/ui/PageTransition";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import useUIStore from "../../store/uiStore";
import useThemeStore, { type ThemeName } from "../../store/themeStore";
import useUserStore from "../../store/userStore";
import {
  getStoreItems,
  purchaseItem,
  type StoreItem,
  type GetStoreItemsResponse,
} from "../../services/storeService";

const THEME_KEYS: ThemeName[] = ["calm", "focus", "sunset", "midnight"];

function isThemeItem(item: StoreItem): item is StoreItem & { itemKey: ThemeName } {
  return item.type === "theme" && THEME_KEYS.includes(item.itemKey as ThemeName);
}

function getTypeBadgeLabel(type: StoreItem["type"]): string {
  switch (type) {
    case "theme":
      return "Theme";
    case "fontColor":
      return "Color";
    case "fontStyle":
      return "Font";
    default:
      return type;
  }
}

const StoresPage: React.FC = () => {
  const showToast = useUIStore((s) => s.showToast);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setOwnedThemes = useThemeStore((s) => s.setOwnedThemes);
  const grantTheme = useThemeStore((s) => s.grantTheme);
  const activeTheme = useThemeStore((s) => s.theme);
  const setUserProgress = useUserStore((s) => s.setUserProgress);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [coins, setCoins] = useState(0);
  const [items, setItems] = useState<StoreItem[]>([]);
  const [ownedItemKeys, setOwnedItemKeys] = useState<string[]>([]);
  const [purchaseLoadingKey, setPurchaseLoadingKey] = useState<string | null>(null);

  const ownedSet = useMemo(() => new Set(ownedItemKeys), [ownedItemKeys]);

  const loadStore = async (silent = false): Promise<void> => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const payload: GetStoreItemsResponse = await getStoreItems();
      setItems(payload.items);
      setCoins(payload.user?.coins ?? 0);
      const nextOwned = payload.ownedItemKeys ?? payload.items.filter((i) => i.owned).map((i) => i.itemKey);
      setOwnedItemKeys(nextOwned);
      setOwnedThemes(nextOwned);
      setUserProgress({ coins: payload.user?.coins ?? 0 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load store";
      showToast(message, { type: "error", duration: 3000 });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, []);

  const handlePurchase = async (item: StoreItem): Promise<void> => {
    if (ownedSet.has(item.itemKey)) return;

    const optimisticCoins = coins - item.price;
    const fallbackCoins = coins;
    const fallbackOwned = ownedItemKeys;
    const fallbackItems = items;

    // Optimistic UI update.
    setCoins(optimisticCoins);
    setOwnedItemKeys((prev) => (prev.includes(item.itemKey) ? prev : [...prev, item.itemKey]));
    grantTheme(item.itemKey);
    setItems((prev) => prev.map((it) => (it.itemKey === item.itemKey ? { ...it, owned: true } : it)));
    setUserProgress({ coins: optimisticCoins });
    setPurchaseLoadingKey(item.itemKey);

    try {
      const res = await purchaseItem(item.itemKey);
      const updatedCoins = res.user?.coins ?? optimisticCoins;
      setCoins(updatedCoins);
      setUserProgress({ coins: updatedCoins });
      showToast(`${item.name} purchased`, { type: "success", duration: 2200 });
    } catch (err) {
      // Roll back optimistic update on failure.
      setCoins(fallbackCoins);
      setOwnedItemKeys(fallbackOwned);
      setOwnedThemes(fallbackOwned);
      setItems(fallbackItems);
      setUserProgress({ coins: fallbackCoins });

      const message = err instanceof Error ? err.message : "Purchase failed";
      showToast(message, { type: "error", duration: 3200 });
      await loadStore(true);
    } finally {
      setPurchaseLoadingKey(null);
    }
  };

  const handleApplyTheme = (item: StoreItem): void => {
    if (!isThemeItem(item)) return;
    if (!ownedSet.has(item.itemKey) && item.itemKey !== "calm") {
      showToast("Purchase this theme from the store", { type: "error", duration: 2500 });
      return;
    }

    setTheme(item.itemKey, true);
    showToast(`${item.name} theme applied`, { type: "success", duration: 2000 });
  };

  return (
    <PageTransition className="max-w-5xl mx-auto px-8 py-12">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageTitle className="text-2xl">Stores</PageTitle>
          <SubtleText>Unlock themes with coins earned from your progress.</SubtleText>
        </div>

        <Card className="min-w-[180px]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-[var(--theme-text-secondary)]">Your Coins</span>
            <span className="text-xl font-semibold text-[var(--theme-accent-text)]">{coins}</span>
          </div>
        </Card>
      </header>

      {isLoading ? (
        <Card>
          <div className="py-8 text-center text-sm text-[var(--theme-text-secondary)]">Loading store items...</div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const isOwned = ownedSet.has(item.itemKey) || item.owned;
            const isBuying = purchaseLoadingKey === item.itemKey;
            const canAfford = coins >= item.price;
            const isTheme = isThemeItem(item);
            const isAppliedTheme = isTheme && activeTheme === item.itemKey;

            return (
              <Card
                key={item.id}
                className="h-full"
                header={
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-[var(--theme-text-primary)]">{item.name}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--theme-text-subtle)]">{getTypeBadgeLabel(item.type)}</div>
                    </div>
                    <div className="rounded-full bg-[var(--theme-accent-subtle)] px-3 py-1 text-xs font-medium text-[var(--theme-accent-text)]">
                      {item.price} coins
                    </div>
                  </div>
                }
                footer={
                  <div className="flex items-center gap-2">
                    {isOwned ? (
                      <Button variant="secondary" className="w-full" disabled>
                        Owned
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={() => handlePurchase(item)}
                        disabled={isBuying || !canAfford}
                        title={!canAfford ? "Not enough coins" : undefined}
                      >
                        {isBuying ? "Buying..." : "Buy"}
                      </Button>
                    )}

                    {isTheme && isOwned && (
                      <Button
                        variant={isAppliedTheme ? "secondary" : "ghost"}
                        className="w-full"
                        onClick={() => handleApplyTheme(item)}
                        disabled={isAppliedTheme}
                      >
                        {isAppliedTheme ? "Applied" : "Apply Theme"}
                      </Button>
                    )}
                  </div>
                }
              >
                <p className="min-h-[48px] text-sm text-[var(--theme-text-secondary)]">
                  {item.description || "Personalize your experience with this unlock."}
                </p>
                {!isOwned && !canAfford && (
                  <p className="mt-3 text-xs text-rose-600">Not enough coins to purchase this item.</p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <Card className="mt-4">
          <div className="py-6 text-center text-sm text-[var(--theme-text-secondary)]">
            No store items available right now.
          </div>
        </Card>
      )}

      {isRefreshing && (
        <p className="mt-4 text-center text-xs text-[var(--theme-text-subtle)]">Refreshing store data...</p>
      )}
    </PageTransition>
  );
};

export default StoresPage;
