import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, Heart, BarChart2, Flag, User, LogOut } from "lucide-react";
import authService from "../../services/authService";

type ItemId = "dashboard" | "mood" | "insights" | "goals" | "profile";

type SidebarProps = {
  active?: ItemId;
  onNavigate?: (id: ItemId) => void;
  className?: string;
};

const items: { id: ItemId; label: string; Icon: React.ComponentType<any> }[] = [
  { id: "dashboard", label: "Dashboard", Icon: Home },
  { id: "mood", label: "Mood Log", Icon: Heart },
  { id: "insights", label: "Insights", Icon: BarChart2 },
  { id: "goals", label: "Goals", Icon: Flag },
  { id: "profile", label: "Profile", Icon: User },
];

/**
 * Desktop Sidebar navigation — presentational and reusable.
 * - Soft hover states, rounded UI
 * - Active item style
 * - Calm/pastel-friendly design (uses Tailwind classes)
 * - No business logic: parent controls `active` and navigation handling
 */
const Sidebar: React.FC<SidebarProps> = ({ active, onNavigate, className = "" }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav
      className={`w-64 bg-transparent p-2 flex flex-col h-full ${className}`}
      aria-label="Primary"
    >
      <ul className="space-y-2 flex-1">
        {items.map(({ id, label, Icon }) => {
          const isActive = id === active;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onNavigate?.(id)}
                aria-current={isActive ? "page" : undefined}
                className={`w-full flex items-center gap-3 text-sm px-3 py-2 rounded-lg transition-colors duration-150 focus:outline-none
                  ${isActive
                    ? "bg-white/80 text-slate-900 ring-1 ring-indigo-200 shadow-sm"
                    : "text-slate-700 hover:bg-white/40 hover:text-slate-900"
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-500"}`} />
                <span className="truncate">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-sm px-3 py-2 rounded-lg transition-colors duration-150 text-slate-700 hover:bg-rose-50 hover:text-rose-600 focus:outline-none"
        >
          <LogOut className="w-5 h-5 text-slate-500" />
          <span>Log out</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
