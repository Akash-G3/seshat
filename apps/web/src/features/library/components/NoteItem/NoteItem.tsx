
// import { useState } from "react";
// import { FileText, MoreHorizontal } from "lucide-react";

// import {
//   DropdownMenu,
//   DropdownMenuItem,
// } from "@components/ui/DropdownMenu";

// import { IconButton } from "@components/ui/IconButton";

// import type { NoteSummary } from "@features/workspace/types/workspace.types";

// interface Props {
//   note: NoteSummary;
//   active: boolean;

//   /**
//    * Server-backed favourite state.
//    */
//   isFavourite?: boolean;

//   onSelect: () => void;

//   onRename: (
//     id: string,
//     title: string,
//   ) => void;

//   onDelete: () => void;

//   /**
//    * Called when the user chooses
//    * Add/Remove from favourites.
//    */
//   onFavourite?: () => void;

//   onMove?: () => void;
//   onShare?: () => void;
//   onCopy?: () => void;
//   onExport?: () => void;
// }

// export function NoteItem({
//   note,
//   active,
//   isFavourite = false,
//   onSelect,
//   onRename,
//   onDelete,
//   onFavourite = () => {},
//   onMove = () => {},
//   onShare = () => {},
//   onCopy = () => {},
//   onExport = () => {},
// }: Props) {
//   const [editing, setEditing] = useState(false);
//   const [value, setValue] = useState(note.title);
//   const [menuOpen, setMenuOpen] = useState(false);

//   function beginRename() {
//     setValue(note.title);
//     setEditing(true);
//   }

//   function commitRename() {
//     const next = value.trim();

//     setEditing(false);

//     if (!next || next === note.title) {
//       setValue(note.title);
//       return;
//     }

//     onRename(note.id, next);
//   }

//   return (
//     <div
//       className={`group flex h-8 items-center rounded-sm text-sm ${
//         active
//           ? "bg-accent-subtle text-accent"
//           : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
//       }`}
//       onDoubleClick={(event) => {
//         event.stopPropagation();
//         setMenuOpen(true);
//       }}
//     >
//       <button
//         type="button"
//         onClick={editing ? undefined : onSelect}
//         className="flex min-w-0 flex-1 items-center gap-1.5 px-2 text-left"
//       >
//         <FileText
//           size={13}
//           className="shrink-0"
//           strokeWidth={1.7}
//         />

//         {editing ? (
//           <input
//             autoFocus
//             value={value}
//             onChange={(event) =>
//               setValue(event.target.value)
//             }
//             onBlur={commitRename}
//             onClick={(event) =>
//               event.stopPropagation()
//             }
//             onKeyDown={(event) => {
//               if (event.key === "Enter") {
//                 commitRename();
//               }

//               if (event.key === "Escape") {
//                 setValue(note.title);
//                 setEditing(false);
//               }
//             }}
//             className="min-w-0 flex-1 rounded-sm border border-accent bg-bg px-1 text-sm text-text-primary outline-none"
//           />
//         ) : (
//           <span className="min-w-0 flex-1 truncate">
//             {note.title || "Untitled"}
//           </span>
//         )}
//       </button>

//       <div
//         className={`mr-1 ${
//           menuOpen
//             ? "opacity-100"
//             : "opacity-0 group-hover:opacity-100"
//         }`}
//       >
//         <DropdownMenu
//           open={menuOpen}
//           onOpenChange={setMenuOpen}
//           trigger={
//             <IconButton
//               title="Note actions"
//               aria-label="Note actions"
//             >
//               <MoreHorizontal size={14} />
//             </IconButton>
//           }
//         >
//           <DropdownMenuItem onClick={beginRename}>
//             Rename
//           </DropdownMenuItem>

//           <DropdownMenuItem onClick={onShare}>Share</DropdownMenuItem>
//           <DropdownMenuItem onClick={onCopy}>Make a copy</DropdownMenuItem>
//           <DropdownMenuItem onClick={onExport}>Export</DropdownMenuItem>

//           <DropdownMenuItem onClick={onFavourite}>
//             {isFavourite
//               ? "Remove from favourites"
//               : "Add to favourites"}
//           </DropdownMenuItem>

//           <DropdownMenuItem danger onClick={onDelete}>
//             Move to trash
//           </DropdownMenuItem>
//         </DropdownMenu>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { FileText, MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuItem,
} from "@components/ui/DropdownMenu";

import { IconButton } from "@components/ui/IconButton";

import type { NoteSummary } from "@features/workspace/types/workspace.types";

interface Props {
  note: NoteSummary;
  active: boolean;

  /**
   * Server-backed favourite state.
   */
  isFavourite?: boolean;

  onSelect: () => void;

  onRename: (
    id: string,
    title: string,
  ) => void;

  onDelete: () => void;

  /**
   * Called when the user chooses
   * Add/Remove from favourites.
   */
  onFavourite?: () => void;

  onMove?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  onExport?: () => void;
}

export function NoteItem({
  note,
  active,
  isFavourite = false,
  onSelect,
  onRename,
  onDelete,
  onFavourite = () => {},
  onMove = () => {},
  onShare = () => {},
  onCopy = () => {},
  onExport = () => {},
}: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(note.title);
  const [menuOpen, setMenuOpen] = useState(false);

  function beginRename() {
    setValue(note.title);
    setEditing(true);
  }

  function commitRename() {
    const next = value.trim();

    setEditing(false);

    if (!next || next === note.title) {
      setValue(note.title);
      return;
    }

    onRename(note.id, next);
  }

  return (
    <div
      className={`group flex h-8 items-center rounded-md text-sm transition-colors duration-150 ${
        active
          ? "bg-accent-subtle text-accent"
          : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
      }`}
      onDoubleClick={(event) => {
        event.stopPropagation();
        setMenuOpen(true);
      }}
    >
      <button
        type="button"
        onClick={editing ? undefined : onSelect}
        className="flex min-w-0 flex-1 items-center gap-1.5 px-2 text-left"
      >
        <FileText
          size={13}
          className="shrink-0"
          strokeWidth={1.7}
        />

        {editing ? (
          <input
            autoFocus
            value={value}
            onChange={(event) =>
              setValue(event.target.value)
            }
            onBlur={commitRename}
            onClick={(event) =>
              event.stopPropagation()
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commitRename();
              }

              if (event.key === "Escape") {
                setValue(note.title);
                setEditing(false);
              }
            }}
            className="min-w-0 flex-1 rounded-md border border-accent bg-bg px-1.5 py-0.5 text-sm text-text-primary outline-none"
          />
        ) : (
          <span className="min-w-0 flex-1 truncate">
            {note.title || "Untitled"}
          </span>
        )}
      </button>

      <div
        className={`mr-1 ${
          menuOpen
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <DropdownMenu
          open={menuOpen}
          onOpenChange={setMenuOpen}
          trigger={
            <IconButton
              title="Note actions"
              aria-label="Note actions"
            >
              <MoreHorizontal size={14} />
            </IconButton>
          }
        >
          <DropdownMenuItem onClick={beginRename}>
            Rename
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onShare}>Share</DropdownMenuItem>
          <DropdownMenuItem onClick={onCopy}>Make a copy</DropdownMenuItem>
          <DropdownMenuItem onClick={onExport}>Export</DropdownMenuItem>

          <DropdownMenuItem onClick={onFavourite}>
            {isFavourite
              ? "Remove from favourites"
              : "Add to favourites"}
          </DropdownMenuItem>

          <DropdownMenuItem danger onClick={onDelete}>
            Move to trash
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </div>
  );
}