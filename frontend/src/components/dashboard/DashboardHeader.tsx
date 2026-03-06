import React from "react";
import { Search } from "lucide-react";
import { PageTitle, SubtleText } from "../ui/Typography";
import Badge from "../ui/Badge";

type Props = {
  /** Optional small subtitle under the greeting */
  subtitle?: string;
  /** Optional custom title node (e.g. SmartGreeting) to replace the static PageTitle */
  titleNode?: React.ReactNode;
};

/**
 * DashboardHeader (presentational)
 */
const DashboardHeader: React.FC<Props> = ({ subtitle, titleNode }) => {
  return (
    <header className="w-full flex items-center justify-between gap-2 sm:gap-6 p-2 sm:p-4 md:p-6">
      <div className="min-w-0 flex-1 sm:flex-none">
        {titleNode ? (
          titleNode
        ) : (
          <>
            <PageTitle className="text-lg sm:text-2xl">How are you feeling today?</PageTitle>
            {subtitle && <SubtleText className="text-xs sm:text-base">{subtitle}</SubtleText>}
          </>
        )}
        {/** If titleNode provides its own subtitle, DashboardPage may omit `subtitle` prop. */}
      </div>

      <div className="flex-1 max-w-lg hidden md:block">
        <div className="w-full bg-[var(--theme-card-bg)] backdrop-blur-sm rounded-full px-3 py-2 shadow-sm ring-1 ring-[var(--theme-card-ring)] flex items-center gap-3">
          <Search className="w-4 h-4 text-[var(--theme-text-subtle)]" />
          <input
            aria-label="Search"
            placeholder="Search..."
            className="w-full bg-transparent text-sm text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-subtle)] focus:outline-none"
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
