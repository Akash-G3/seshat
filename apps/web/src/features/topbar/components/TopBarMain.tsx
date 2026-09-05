import { Breadcrumbs } from "./Breadcrumbs";
import { NavHistoryControls } from "./NavHistoryControls";
import { SidebarToggleButton } from "./SidebarToggleButton";
import { SearchButton } from "./SearchButton";
import { TabStrip } from "./TabStrip";
import type { BreadcrumbSegment, OpenTab } from "../types";

interface Props {
  breadcrumbs: BreadcrumbSegment[];
  onBreadcrumbClick: (segment: BreadcrumbSegment) => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  tabs: OpenTab[];
  activeTabId: string | null;
  onSelectTab: (noteId: string) => void;
  onCloseTab: (noteId: string) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
}

export function TopBarMain(props: Props) {
  const {
    breadcrumbs, onBreadcrumbClick, sidebarCollapsed, onToggleSidebar,
    onOpenSearch, tabs, activeTabId, onSelectTab, onCloseTab,
    canGoBack, canGoForward, onBack, onForward,
  } = props;

  return (
    <div className="flex flex-col overflow-hidden bg-bg border-b border-border">
      <div className="h-12 flex items-center gap-3 px-3 min-w-0">
        <SidebarToggleButton collapsed={sidebarCollapsed} onToggle={onToggleSidebar} />
        <NavHistoryControls
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onBack={onBack}
          onForward={onForward}
        />
        <Breadcrumbs segments={breadcrumbs} onNavigate={onBreadcrumbClick} />
        <div className="flex-1" />
        <SearchButton onClick={onOpenSearch} />
      </div>
      {tabs.length > 0 && (
        <div className="px-3 pb-1 min-w-0 overflow-x-auto">
          <TabStrip tabs={tabs} activeTabId={activeTabId} onSelect={onSelectTab} onClose={onCloseTab} />
        </div>
      )}
    </div>
  );
}