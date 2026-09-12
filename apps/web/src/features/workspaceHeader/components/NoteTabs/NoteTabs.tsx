
import type { OpenTab } from "../../types";
import { NoteTab } from "./NoteTab";

interface Props {
  tabs: OpenTab[];
  activeTabId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

export function NoteTabs({
  tabs,
  activeTabId,
  onSelect,
  onClose,
}: Props) {
  return (
    <div className="scrollbar-none flex h-full min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1">
      {tabs.map((tab) => (
        <NoteTab
          key={tab.noteId}
          tab={tab}
          active={tab.noteId === activeTabId}
          onSelect={() => onSelect(tab.noteId)}
          onClose={() => onClose(tab.noteId)}
        />
      ))}
    </div>
  );
}