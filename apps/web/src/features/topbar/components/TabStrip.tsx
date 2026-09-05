// import { X } from "lucide-react";
// import type { OpenTab } from "../types";

// interface Props {
//   tabs: OpenTab[];
//   activeTabId: string | null;
//   onSelect: (noteId: string) => void;
//   onClose: (noteId: string) => void;
// }

// export function TabStrip({ tabs, activeTabId, onSelect, onClose }: Props) {
//   if (tabs.length === 0) return null;

//   return (
//     <div className="flex items-center gap-0.5 overflow-x-auto">
//       {tabs.map((tab) => {
//         const isActive = tab.noteId === activeTabId;
//         return (
//           <div
//             key={tab.noteId}
//             onClick={() => onSelect(tab.noteId)}
//             className={`group flex items-center gap-2 px-3 h-[28px] rounded-t-sm text-sm cursor-pointer max-w-[160px] shrink-0 transition-colors ${
//               isActive
//                 ? "bg-bg text-text-primary border-t border-x border-border"
//                 : "text-text-secondary hover:bg-bg-hover"
//             }`}
//           >
//             <span className="truncate">{tab.title || "Untitled"}</span>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onClose(tab.noteId);
//               }}
//               className="opacity-0 group-hover:opacity-100 hover:text-danger shrink-0"
//               aria-label="Close tab"
//             >
//               <X size={12} />
//             </button>
//           </div>
//         );
//       })}
//     </div>
//   );
// }


import { X } from "lucide-react";
import type { OpenTab } from "../types";

interface Props {
  tabs: OpenTab[];
  activeTabId: string | null;
  onSelect: (noteId: string) => void;
  onClose: (noteId: string) => void;
}

export function TabStrip({ tabs, activeTabId, onSelect, onClose }: Props) {
  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center gap-0.5 w-max">
      {tabs.map((tab) => {
        const isActive = tab.noteId === activeTabId;
        return (
          <div
            key={tab.noteId}
            onClick={() => onSelect(tab.noteId)}
            className={`group flex items-center gap-2 px-3 h-[28px] rounded-t-sm text-sm cursor-pointer max-w-[160px] shrink-0 transition-colors ${
              isActive
                ? "bg-bg text-text-primary border-t border-x border-border"
                : "text-text-secondary hover:bg-bg-hover"
            }`}
          >
            <span className="truncate">{tab.title || "Untitled"}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(tab.noteId);
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-danger shrink-0"
              aria-label="Close tab"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}