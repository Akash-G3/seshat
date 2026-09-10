
import type { OpenTab } from "./types";
import { SidebarToggle } from "./components/SidebarToggle/SidebarToggle";
import { WorkspaceName } from "./components/WorkspaceName/WorkspaceName";
import { NoteTabs } from "./components/NoteTabs/NoteTabs";

interface Props {
  workspaceName: string;
  tabs: OpenTab[];
  activeTabId: string | null;

  onToggleLibrary: () => void;
  onRenameWorkspace: (name: string) => void;

  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
}

export function WorkspaceHeader({
  workspaceName,
  tabs,
  activeTabId,
  onToggleLibrary,
  onRenameWorkspace,
  onSelectTab,
  onCloseTab,
}: Props) {
  return (
    <header className="flex h-10 shrink-0 items-center border-b border-border bg-bg">
      <div className="flex h-full shrink-0 items-center">
        <SidebarToggle onClick={onToggleLibrary} />

        <WorkspaceName
          name={workspaceName}
          onRename={onRenameWorkspace}
        />
      </div>

      {/*
       * Document tabs take all remaining horizontal space.
       *
       * Keeping this as flex-1 means the workspace controls never
       * compete with the tab strip for a fixed width.
       */}
      <NoteTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onSelect={onSelectTab}
        onClose={onCloseTab}
      />
    </header>
  );
}