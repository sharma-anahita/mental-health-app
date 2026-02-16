import React from "react";
import { Search } from "lucide-react";
import { PageTitle, SubtleText } from "../ui/Typography";
import Badge from "../ui/Badge";

type Props = {
  /** Optional small subtitle under the greeting */
  subtitle?: string;
};

/**
 * DashboardHeader (presentational)
 */
const DashboardHeader: React.FC<Props> = ({ subtitle }) => {
  return (
    <header className="w-full flex items-center justify-between gap-6 p-4 md:p-6">
      <div className="min-w-0">
        <PageTitle>How are you feeling today?</PageTitle>
        {subtitle && <SubtleText>{subtitle}</SubtleText>}
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
        <Badge variant="calm" className="w-10 h-10 inline-flex items-center justify-center rounded-full text-sm">U</Badge>
      </div>
    </header>
  );
};

export default DashboardHeader;
