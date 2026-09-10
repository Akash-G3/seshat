// import type { OpenTab } from "../../types";
// import { NoteTab } from "./NoteTab";

// interface Props { tabs: OpenTab[]; activeTabId: string | null; onSelect: (id: string) => void; onClose: (id: string) => void; }

// export function NoteTabs({ tabs, activeTabId, onSelect, onClose }: Props) {
//   return (
//     <div className="flex min-w-0 flex-1 self-stretch overflow-x-auto">
//       {tabs.map((tab) => (
//         <NoteTab key={tab.noteId} tab={tab} active={tab.noteId === activeTabId} onSelect={() => onSelect(tab.noteId)} onClose={() => onClose(tab.noteId)} />
//       ))}
//     </div>
//   );
// }

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
    <div className="flex h-full min-w-0 flex-1 items-stretch overflow-x-auto">
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