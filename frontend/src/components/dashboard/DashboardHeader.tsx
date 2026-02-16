import React from "react";
import { Search } from "lucide-react";

type Props = {
  /** Optional small subtitle under the greeting */
  subtitle?: string;
};

/**
 * DashboardHeader
 * - Desktop-first horizontal layout
 * - Greeting text, search placeholder area, avatar placeholder
 * - Soft spacing and calm styling (Tailwind utilities)
 * - Purely presentational / reusable
 */
const DashboardHeader: React.FC<Props> = ({ subtitle }) => {
  return (
    <header className="w-full flex items-center justify-between gap-6 p-4 md:p-6">
      <div className="min-w-0">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
          How are you feeling today?
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-600 truncate">{subtitle}</p>
        )}
      </div>

      <div className="flex-1 max-w-lg">
        <div className="w-full bg-white/70 backdrop-blur-sm rounded-full px-3 py-2 shadow-sm ring-1 ring-slate-100 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            aria-label="Search"
            placeholder="Search..."
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-50 to-pink-50 flex items-center justify-center text-indigo-700 font-medium shadow-sm">
          U
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
