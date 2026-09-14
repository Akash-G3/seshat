import { memo, useState } from "react";
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
  isFavourite?: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onFavourite?: (id: string, isFavourite: boolean) => void;
  onShare?: (id: string) => void;
  onCopy?: (id: string) => void;
  onExport?: (id: string) => void;
}

export const NoteItem = memo(function NoteItem({
  note,
  active,
  isFavourite = false,
  onSelect,
  onRename,
  onDelete,
  onFavourite,
  onShare,
  onCopy,
  onExport,
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
        onClick={editing ? undefined : () => onSelect(note.id)}
        className="flex min-w-0 flex-1 items-center gap-1.5 px-2 text-left"
      >
        <FileText size={13} className="shrink-0" strokeWidth={1.7} />

        {editing ? (
          <input
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onBlur={commitRename}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Enter") commitRename();
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
          menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <DropdownMenu
          open={menuOpen}
          onOpenChange={setMenuOpen}
          trigger={
            <IconButton title="Note actions" aria-label="Note actions">
              <MoreHorizontal size={14} />
            </IconButton>
          }
        >
          <DropdownMenuItem onClick={beginRename}>Rename</DropdownMenuItem>
          {onShare && (
            <DropdownMenuItem onClick={() => onShare(note.id)}>Share</DropdownMenuItem>
          )}
          {onCopy && (
            <DropdownMenuItem onClick={() => onCopy(note.id)}>
              Make a copy
            </DropdownMenuItem>
          )}
          {onExport && (
            <DropdownMenuItem onClick={() => onExport(note.id)}>Export</DropdownMenuItem>
          )}
          {onFavourite && (
            <DropdownMenuItem
              onClick={() => onFavourite(note.id, isFavourite)}
            >
              {isFavourite ? "Remove from favourites" : "Add to favourites"}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem danger onClick={() => onDelete(note.id)}>
            Move to trash
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </div>
  );
});
