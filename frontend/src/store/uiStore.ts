import create from "zustand";

/**
 * UI-focused Zustand store (frontend cache only)
 * - Keeps minimal UI state for sidebar and active dashboard tab
 */

interface UIState {
  isSidebarCollapsed: boolean;
  activeDashboardTab: string;

  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  activeDashboardTab: "overview",

  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),

  setActiveTab: (tab: string) => set(() => ({ activeDashboardTab: tab })),
}));

export default useUIStore;
