import React, { useState } from "react";
import { X, Menu } from "lucide-react";
import Toasts from "../../components/ui/Toast";

type Props = {
  children: React.ReactNode;
  /** Optional sidebar content (keeps layout reusable) */
  sidebar?: React.ReactNode;
};

/**
 * AppLayout
 * - Desktop: Fixed-width left sidebar
 * - Mobile: Hamburger menu with slide-out sidebar overlay
 * - Main content area (scrollable)
 * - Full screen height
 * - Soft pastel background and calm spacing
 * - No business logic — purely presentational
 */
const AppLayout: React.FC<Props> = ({ children, sidebar = null }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 text-slate-900">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside
        className="hidden lg:flex w-64 flex-shrink-0 p-6 border-r border-slate-100 sticky top-0 h-screen flex-col"
        aria-label="Sidebar"
      >
        {sidebar}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar (slide-out) */}
      <aside
        className={`fixed lg:hidden left-0 top-0 z-50 w-64 h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 border-r border-slate-100 p-6 transform transition-transform duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile Sidebar"
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/40 lg:hidden focus:outline-none"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>
        <div className="mt-8 flex flex-col h-full">
          {sidebar}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full overflow-auto">
        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden p-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/40 focus:outline-none"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          <div className="text-sm font-medium text-slate-700">Mental Health App</div>
          <div className="w-10" />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
          <Toasts />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
