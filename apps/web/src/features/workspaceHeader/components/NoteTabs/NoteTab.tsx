// import { FileText, X } from "lucide-react";
// import type { OpenTab } from "../../types";

// interface Props { tab: OpenTab; active: boolean; onSelect: () => void; onClose: () => void; }

// export function NoteTab({ tab, active, onSelect, onClose }: Props) {
//   return (
//     <div className={`group flex h-full min-w-0 max-w-52 items-center border-r border-border ${active ? "bg-bg" : "bg-bg-subtle"}`}>
//       <button
//         type="button"
//         onClick={onSelect}
//         className={`flex min-w-0 flex-1 items-center gap-1.5 px-3 text-sm ${active ? "text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
//       >
//         <FileText size={13} className="shrink-0" strokeWidth={1.7} />
//         <span className="truncate">{tab.title || "Untitled"}</span>
//       </button>
//       <button
//         type="button"
//         title="Close tab"
//         aria-label={`Close ${tab.title || "Untitled"}`}
//         onClick={onClose}
//         className="mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-text-muted opacity-0 hover:bg-bg-hover hover:text-text-primary group-hover:opacity-100"
//       >
//         <X size={13} strokeWidth={1.8} />
//       </button>
//     </div>
//   );
// }


import { FileText, X } from "lucide-react";
import type { OpenTab } from "../../types";

interface Props {
  tab: OpenTab;
  active: boolean;
  onSelect: () => void;
  onClose: () => void;
}

export function NoteTab({
  tab,
  active,
  onSelect,
  onClose,
}: Props) {
  return (
    <div
      className={`
        group
        flex
        h-full
        min-w-0
        max-w-52
        items-center
        border-r
        border-border
        ${
          active
            ? "bg-bg"
            : "bg-bg-subtle"
        }
      `}
    >
      <button
        type="button"
        onClick={onSelect}
        className={`
          flex
          min-w-0
          flex-1
          items-center
          gap-1.5
          px-3
          text-sm
          ${
            active
              ? "text-text-primary"
              : "text-text-secondary hover:text-text-primary"
          }
        `}
      >
        <FileText
          size={13}
          className="shrink-0"
          strokeWidth={1.7}
        />

        <span className="truncate">
          {tab.title || "Untitled"}
        </span>
      </button>

      <button
        type="button"
        title="Close tab"
        aria-label={`Close ${
          tab.title || "Untitled"
        }`}
        onClick={onClose}
        className="
          mr-1
          flex
          h-6
          w-6
          shrink-0
          items-center
          justify-center
          rounded-sm
          text-text-muted
          opacity-0
          hover:bg-bg-hover
          hover:text-text-primary
          group-hover:opacity-100
        "
      >
        <X
          size={13}
          strokeWidth={1.8}
        />
      </button>
    </div>
  );
}