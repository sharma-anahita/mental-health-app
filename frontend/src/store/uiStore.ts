import { create } from "zustand";

/**
 * UI-focused Zustand store (frontend cache only)
 * - Keeps minimal UI state for sidebar and active dashboard tab
 */

interface UIState {
  isSidebarCollapsed: boolean;
  activeDashboardTab: string;

  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
  // Toasts
  toasts: Array<{ id: string; message: string; type?: 'info' | 'success' | 'error' }>;
  showToast: (message: string, opts?: { type?: 'info' | 'success' | 'error'; duration?: number }) => void;
  removeToast: (id: string) => void;
  reset: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  activeDashboardTab: "overview",
  toasts: [],

  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),

  setActiveTab: (tab: string) => set(() => ({ activeDashboardTab: tab })),

  showToast: (message: string, opts = { type: 'info' as const, duration: 3000 }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, type: opts.type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, opts.duration ?? 3000);
  },

  removeToast: (id: string) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // Reset store to initial state (used on logout)
  reset: () => set(() => ({
    isSidebarCollapsed: false,
    activeDashboardTab: "overview",
    toasts: [],
  })),
}));

export default useUIStore;
