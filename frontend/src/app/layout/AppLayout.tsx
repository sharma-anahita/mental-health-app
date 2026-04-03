import React, { useState } from "react";
import { X, Menu } from "lucide-react";
import Toasts from "../../components/ui/Toast";
import AIChatWidget from "../../components/ui/AIChatWidget";

type Props = {
  children: React.ReactNode;
  /** Optional sidebar content (keeps layout reusable) */
  sidebar?: React.ReactNode;
};

const AppLayout: React.FC<Props> = ({ children, sidebar = null }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-[var(--theme-bg-from)] via-[var(--theme-bg-via)] to-[var(--theme-bg-to)] text-[var(--theme-text-primary)]">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside
        className="hidden lg:flex w-64 flex-shrink-0 p-6 border-r border-[var(--theme-card-ring)] sticky top-0 h-screen flex-col"
        style={{ background: "var(--theme-sidebar-bg)" }}
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
        className={`fixed lg:hidden left-0 top-0 z-50 w-64 h-screen border-r border-[var(--theme-card-ring)] p-6 transform transition-transform duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--theme-sidebar-bg)" }}
        aria-label="Mobile Sidebar"
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[var(--theme-card-bg)] lg:hidden focus:outline-none"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5 text-[var(--theme-text-secondary)]" />
        </button>
        <div className="mt-8 flex flex-col h-full">
          {sidebar}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full overflow-auto">
        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden p-4 border-b border-[var(--theme-card-ring)] bg-[var(--theme-card-bg)] backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-[var(--theme-accent-subtle)] focus:outline-none"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6 text-[var(--theme-text-secondary)]" />
          </button>
          <div className="text-sm font-medium text-[var(--theme-text-primary)]">Mental Health App</div>
          <div className="w-10" />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="w-full">{children}</div>
          <Toasts />
          <AIChatWidget />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;