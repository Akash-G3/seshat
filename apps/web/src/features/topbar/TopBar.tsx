
import { TopBarLeft } from "./components/TopBarLeft";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { NavHistoryControls } from "./components/NavHistoryControls";
import { SidebarToggleButton } from "./components/SidebarToggleButton";
import { SearchButton } from "./components/SearchButton";
import { TabStrip } from "./components/TabStrip";
import type { BreadcrumbSegment, OpenTab } from "./types";

interface TopBarProps {
  workspaceName: string;
  onNewNotebook: () => void;
  onNewNote: () => void;
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

export function TopBar(props: TopBarProps) {
  const {
    workspaceName, onNewNotebook, onNewNote,
    breadcrumbs, onBreadcrumbClick, sidebarCollapsed, onToggleSidebar,
    onOpenSearch, tabs, activeTabId, onSelectTab, onCloseTab,
    canGoBack, canGoForward, onBack, onForward,
  } = props;

  return (
    <header className="flex bg-bg border-b border-border shrink-0">
      <TopBarLeft workspaceName={workspaceName} onNewNotebook={onNewNotebook} onNewNote={onNewNote} />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-12 flex items-center gap-3 px-3">
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
          <div className="px-3 pb-1">
            <TabStrip tabs={tabs} activeTabId={activeTabId} onSelect={onSelectTab} onClose={onCloseTab} />
          </div>
        )}
      </div>
    </header>
  );
}