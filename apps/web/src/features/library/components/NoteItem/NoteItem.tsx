import { useState } from "react";
import { FileText, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "@components/ui/DropdownMenu";
import { IconButton } from "@components/ui/IconButton";
import type { NoteSummary } from "@features/workspace/types/workspace.types";

interface Props {
  note: NoteSummary;
  active: boolean;
  onSelect: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: () => void;
  onFavourite?: () => void;
  onMove?: () => void;
}

export function NoteItem({ note, active, onSelect, onRename, onDelete, onFavourite = () => {}, onMove = () => {} }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(note.title);
  const [menuOpen, setMenuOpen] = useState(false);

  function beginRename() { setValue(note.title); setEditing(true); }
  function commitRename() {
    const next = value.trim();
    setEditing(false);
    if (!next || next === note.title) { setValue(note.title); return; }
    onRename(note.id, next);
  }

  return (
    <div className={`group flex h-8 items-center rounded-sm text-sm ${active ? "bg-accent-subtle text-accent" : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"}`} onDoubleClick={(e) => { e.stopPropagation(); setMenuOpen(true); }}>
      <button type="button" onClick={editing ? undefined : onSelect} className="flex min-w-0 flex-1 items-center gap-1.5 px-2 text-left">
        <FileText size={13} className="shrink-0" strokeWidth={1.7} />
        {editing ? (
          <input autoFocus value={value} onChange={(e) => setValue(e.target.value)} onBlur={commitRename} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") { setValue(note.title); setEditing(false); } }} className="min-w-0 flex-1 rounded-sm border border-accent bg-bg px-1 text-sm text-text-primary outline-none" />
        ) : <span className="min-w-0 flex-1 truncate">{note.title || "Untitled"}</span>}
      </button>

      <div className={`mr-1 ${menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} trigger={<IconButton title="Note actions" aria-label="Note actions"><MoreHorizontal size={14} /></IconButton>}>
          <DropdownMenuItem onClick={beginRename}>Rename</DropdownMenuItem>
          <DropdownMenuItem onClick={onMove}>Move</DropdownMenuItem>
          <DropdownMenuItem onClick={onFavourite}>Add to favourites</DropdownMenuItem>
          <DropdownMenuItem danger onClick={onDelete}>Delete</DropdownMenuItem>
        </DropdownMenu>
      </div>
    </div>
  );
}
