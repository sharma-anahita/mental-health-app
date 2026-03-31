import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, Heart, BarChart2, Flag, ShoppingBag, User, LogOut } from "lucide-react";
import authService from "../../services/authService";

type ItemId = "dashboard" | "mood" | "insights" | "goals" | "stores" | "profile";

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
  { id: "stores", label: "Stores", Icon: ShoppingBag },
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
      className={`w-full bg-transparent p-2 flex flex-col h-full ${className}`}
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
                    ? "bg-[var(--theme-card-bg)] text-[var(--theme-text-primary)] ring-1 ring-[var(--theme-accent)] shadow-sm"
                    : "text-[var(--theme-text-secondary)] hover:bg-[var(--theme-card-bg)] hover:opacity-80"
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[var(--theme-accent)]" : "text-[var(--theme-text-subtle)]"}`} />
                <span className="truncate">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-4 border-t border-[var(--theme-card-ring)]">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-sm px-3 py-2 rounded-lg transition-colors duration-150 text-[var(--theme-text-secondary)] hover:bg-rose-100/30 hover:text-rose-600 focus:outline-none"
        >
          <LogOut className="w-5 h-5 text-[var(--theme-text-subtle)]" />
          <span>Log out</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
