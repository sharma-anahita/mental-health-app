import React from "react";
import Toasts from "../../components/ui/Toast";

type Props = {
  children: React.ReactNode;
  /** Optional sidebar content (keeps layout reusable) */
  sidebar?: React.ReactNode;
};

/**
 * AppLayout
 * - Fixed-width left sidebar
 * - Main content area (scrollable)
 * - Full screen height
 * - Soft pastel background and calm spacing
 * - No business logic — purely presentational
 */
const AppLayout: React.FC<Props> = ({ children, sidebar = null }) => {
  return (
    <div className="min-h-screen flex bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 text-slate-900">
      <aside
        className="w-64 flex-shrink-0 p-6 border-r border-slate-100 sticky top-0 h-screen"
        aria-label="Sidebar"
      >
        <div className="h-full flex flex-col">
          {sidebar}
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto w-full">{children}</div>
        <Toasts />
      </main>
    </div>
  );
};

export default AppLayout;
